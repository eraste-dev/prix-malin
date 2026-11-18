import { z } from "zod";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { createStore, type StoreApi } from "zustand/vanilla";
import type { PriceVerdict } from "@prix-malin/domain";
import { findActivity, type ActivityId } from "./activity";
import {
  applyType,
  calculSchema,
  newCalcul,
  newId,
  type Calcul,
  type ChargeLineItem,
  type CostLineItem,
  type InputMode,
  type ResultMode,
} from "./model";
import { STORAGE_KEYS, type StorageAdapter } from "./storage";

/*
 * Stores de l'app (ADR-0012) : zustand + persistance versionnée. Chaque lecture est validée par zod (NFR-09) :
 * un contenu abîmé ne fait jamais planter l'app, on repart d'un état sain et on dit ce qui a été perdu (E14).
 */

const PERSIST_VERSION = 1;

/** Version de l'onboarding : l'augmenter le fait rejouer à tout le monde (docs/14, `onboarding_vu`). */
export const ONBOARDING_VERSION = 1;

interface ReadFlags {
  /** Le stockage contenait quelque chose d'illisible (JSON cassé). */
  unreadable: boolean;
}

/** Persistance JSON qui ne lève jamais : lecture cassée = signal, écriture refusée = silence. */
function jsonStorage<S>(adapter: StorageAdapter, flags: ReadFlags): PersistStorage<S> {
  return {
    getItem: (name) => {
      let raw: string | null = null;
      try {
        raw = adapter.getItem(name);
      } catch {
        return null;
      }
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as StorageValue<S>;
      } catch {
        flags.unreadable = true;
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        adapter.setItem(name, JSON.stringify(value));
      } catch {
        /* quota, navigation privée : l'état reste en mémoire */
      }
    },
    removeItem: (name) => {
      try {
        adapter.removeItem(name);
      } catch {
        /* rien à faire */
      }
    },
  };
}

const nowIso = (): string => new Date().toISOString();

/* ------------------------------------------------------------------ brouillon */

export interface CalcState {
  readonly calcul: Calcul;
  /** Le brouillon stocké était abîmé : on est reparti d'un calcul vierge. */
  readonly integrity: { readonly draftLost: boolean };
  readonly setType: (type: ActivityId) => void;
  readonly setNom: (nom: string) => void;
  readonly setUnite: (unite: string) => void;
  readonly setCostMode: (mode: InputMode) => void;
  readonly setCostTotal: (total: number | null) => void;
  readonly addCostLine: (line?: Partial<Omit<CostLineItem, "id">>) => string;
  readonly updateCostLine: (id: string, patch: Partial<Omit<CostLineItem, "id">>) => void;
  readonly removeCostLine: (id: string) => void;
  readonly setChargesMode: (mode: InputMode) => void;
  readonly setChargesTotal: (total: number | null) => void;
  readonly addChargeLine: (line?: Partial<Omit<ChargeLineItem, "id">>) => string;
  readonly updateChargeLine: (id: string, patch: Partial<Omit<ChargeLineItem, "id">>) => void;
  readonly removeChargeLine: (id: string) => void;
  readonly setVolume: (volume: number | null) => void;
  readonly setMarge: (marge: number) => void;
  readonly setFrais: (frais: number) => void;
  readonly setArrondi: (patch: Partial<Calcul["arrondi"]>) => void;
  readonly setTva: (patch: Partial<Calcul["tva"]>) => void;
  readonly setConcurrent: (price: number | null) => void;
  readonly setPrixActuel: (price: number | null) => void;
  readonly setModeResultat: (mode: ResultMode) => void;
  readonly reset: () => void;
  readonly load: (calcul: Calcul) => void;
  readonly dismissIntegrity: () => void;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const sumLines = <T>(lines: readonly T[], value: (line: T) => number): number | null =>
  lines.length === 0 ? null : Math.round(lines.reduce((sum, line) => sum + value(line), 0));

export function createCalcStore(adapter: StorageAdapter): StoreApi<CalcState> {
  const flags: ReadFlags = { unreadable: false };
  return createStore<CalcState>()(
    persist<CalcState, [], [], { calcul: Calcul }>(
      (set, get) => {
        const edit = (change: (calcul: Calcul) => Calcul): void => {
          set((state) => ({ calcul: { ...change(state.calcul), modifieLe: nowIso() } }));
        };

        return {
          calcul: newCalcul(),
          integrity: { draftLost: false },
          setType: (type) => edit((c) => applyType(c, type)),
          setNom: (nom) => edit((c) => ({ ...c, nom: nom.slice(0, 80) })),
          setUnite: (unite) => edit((c) => ({ ...c, unite: unite.slice(0, 40) })),

          setCostMode: (mode) =>
            edit((c) => {
              const { coutDirect } = c;
              if (coutDirect.mode === mode) return c;
              if (mode === "detail") {
                const fromTotal: CostLineItem[] =
                  coutDirect.lignes.length === 0 && coutDirect.total !== null
                    ? [{ id: newId(), label: "Total", quantity: 1, unitPrice: coutDirect.total }]
                    : [...coutDirect.lignes];
                return { ...c, coutDirect: { ...coutDirect, mode, lignes: fromTotal } };
              }
              const total = sumLines(coutDirect.lignes, (line) => line.quantity * line.unitPrice);
              return { ...c, coutDirect: { ...coutDirect, mode, total: total ?? coutDirect.total } };
            }),
          setCostTotal: (total) => edit((c) => ({ ...c, coutDirect: { ...c.coutDirect, total } })),
          addCostLine: (line = {}) => {
            const id = newId();
            const item: CostLineItem = { id, label: "", quantity: 1, unitPrice: 0, ...line };
            edit((c) => ({ ...c, coutDirect: { ...c.coutDirect, lignes: [...c.coutDirect.lignes, item] } }));
            return id;
          },
          updateCostLine: (id, patch) =>
            edit((c) => ({
              ...c,
              coutDirect: {
                ...c.coutDirect,
                lignes: c.coutDirect.lignes.map((line) => (line.id === id ? { ...line, ...patch } : line)),
              },
            })),
          removeCostLine: (id) =>
            edit((c) => ({
              ...c,
              coutDirect: { ...c.coutDirect, lignes: c.coutDirect.lignes.filter((line) => line.id !== id) },
            })),

          setChargesMode: (mode) =>
            edit((c) => {
              const { chargesFixes } = c;
              if (chargesFixes.mode === mode) return c;
              if (mode === "detail") {
                const fromTotal: ChargeLineItem[] =
                  chargesFixes.lignes.length === 0 && chargesFixes.total !== null
                    ? [{ id: newId(), label: "Total", amount: chargesFixes.total }]
                    : [...chargesFixes.lignes];
                return { ...c, chargesFixes: { ...chargesFixes, mode, lignes: fromTotal } };
              }
              const total = sumLines(chargesFixes.lignes, (line) => line.amount);
              return { ...c, chargesFixes: { ...chargesFixes, mode, total: total ?? chargesFixes.total } };
            }),
          setChargesTotal: (total) => edit((c) => ({ ...c, chargesFixes: { ...c.chargesFixes, total } })),
          addChargeLine: (line = {}) => {
            const id = newId();
            const item: ChargeLineItem = { id, label: "", amount: 0, ...line };
            edit((c) => ({ ...c, chargesFixes: { ...c.chargesFixes, lignes: [...c.chargesFixes.lignes, item] } }));
            return id;
          },
          updateChargeLine: (id, patch) =>
            edit((c) => ({
              ...c,
              chargesFixes: {
                ...c.chargesFixes,
                lignes: c.chargesFixes.lignes.map((line) => (line.id === id ? { ...line, ...patch } : line)),
              },
            })),
          removeChargeLine: (id) =>
            edit((c) => ({
              ...c,
              chargesFixes: { ...c.chargesFixes, lignes: c.chargesFixes.lignes.filter((line) => line.id !== id) },
            })),

          setVolume: (volume) =>
            edit((c) => {
              const whole = volume === null || !Number.isFinite(volume) ? 0 : Math.floor(volume);
              return { ...c, volume: whole >= 1 ? whole : null };
            }),
          setMarge: (marge) => edit((c) => ({ ...c, marge: Number.isFinite(marge) ? clamp(marge, 0, 70) : c.marge })),
          setFrais: (frais) => edit((c) => ({ ...c, frais: Number.isFinite(frais) ? clamp(frais, 0, 20) : c.frais })),
          setArrondi: (patch) =>
            edit((c) => {
              const merged = { ...c.arrondi, ...patch };
              return { ...c, arrondi: { actif: merged.actif, pas: clamp(Math.round(merged.pas), 1, 100_000) } };
            }),
          setTva: (patch) => edit((c) => ({ ...c, tva: { ...c.tva, ...patch } })),
          setConcurrent: (concurrent) => edit((c) => ({ ...c, concurrent })),
          setPrixActuel: (prixActuel) => edit((c) => ({ ...c, prixActuel })),
          setModeResultat: (modeResultat) => edit((c) => ({ ...c, modeResultat })),

          reset: () => set({ calcul: newCalcul(get().calcul.type) }),
          load: (calcul) => set({ calcul }),
          dismissIntegrity: () => set({ integrity: { draftLost: false } }),
        };
      },
      {
        name: STORAGE_KEYS.draft,
        version: PERSIST_VERSION,
        storage: jsonStorage<{ calcul: Calcul }>(adapter, flags),
        partialize: (state) => ({ calcul: state.calcul }),
        migrate: (persisted) => persisted as { calcul: Calcul },
        merge: (persisted, current) => {
          if (persisted === undefined || persisted === null) {
            return flags.unreadable ? { ...current, integrity: { draftLost: true } } : current;
          }
          const parsed = calculSchema.safeParse((persisted as { calcul?: unknown }).calcul);
          return parsed.success
            ? { ...current, calcul: parsed.data }
            : { ...current, integrity: { draftLost: true } };
        },
      },
    ),
  );
}

/* ------------------------------------------------------------ prix enregistrés */

const verdictSchema = z.enum(["LOSS_PER_SALE", "FIXED_COSTS_NOT_COVERED", "PROFITABLE"]);

export const savedPriceSchema = z.object({
  id: z.string().min(1).max(64),
  nom: z.string().max(80),
  calcul: calculSchema,
  prixConseille: z.number().min(0).max(1e12),
  coutDeRevient: z.number().min(0).max(1e12),
  verdict: verdictSchema.nullable().optional(),
  creeLe: z.string().max(40),
  modifieLe: z.string().max(40),
});

export type SavedPrice = z.infer<typeof savedPriceSchema>;

/** Les chiffres figés au moment de l'enregistrement (docs/15, `PrixEnregistré`). */
export interface PriceSnapshot {
  readonly prixConseille: number;
  readonly coutDeRevient: number;
  readonly verdict?: PriceVerdict | null;
}

export interface RemovedPrice {
  readonly item: SavedPrice;
  readonly index: number;
}

export interface PricesState {
  /** Du plus récent au plus ancien. */
  readonly prices: readonly SavedPrice[];
  /** Nombre d'éléments illisibles écartés au chargement. */
  readonly integrity: { readonly lost: number };
  readonly save: (calcul: Calcul, snapshot: PriceSnapshot, nom: string) => string;
  readonly update: (id: string, calcul: Calcul, snapshot: PriceSnapshot, nom?: string) => void;
  readonly duplicate: (id: string) => string | null;
  readonly remove: (id: string) => RemovedPrice | null;
  readonly restore: (removed: RemovedPrice) => void;
  readonly clear: () => void;
  readonly dismissIntegrity: () => void;
}

export function createPricesStore(adapter: StorageAdapter): StoreApi<PricesState> {
  const flags: ReadFlags = { unreadable: false };
  return createStore<PricesState>()(
    persist<PricesState, [], [], { prices: readonly SavedPrice[] }>(
      (set, get) => ({
        prices: [],
        integrity: { lost: 0 },
        save: (calcul, snapshot, nom) => {
          const id = newId();
          const now = nowIso();
          const item: SavedPrice = { id, nom: nom.slice(0, 80), calcul, ...snapshot, creeLe: now, modifieLe: now };
          set((state) => ({ prices: [item, ...state.prices] }));
          return id;
        },
        update: (id, calcul, snapshot, nom) =>
          set((state) => ({
            prices: state.prices.map((price) =>
              price.id === id
                ? { ...price, calcul, ...snapshot, nom: (nom ?? price.nom).slice(0, 80), modifieLe: nowIso() }
                : price,
            ),
          })),
        duplicate: (id) => {
          const { prices } = get();
          const index = prices.findIndex((price) => price.id === id);
          const original = prices[index];
          if (original === undefined) return null;
          const copyId = newId();
          const now = nowIso();
          const copy: SavedPrice = {
            ...original,
            id: copyId,
            nom: `${original.nom} (copie)`.slice(0, 80),
            calcul: { ...original.calcul, id: newId() },
            creeLe: now,
            modifieLe: now,
          };
          set({ prices: [...prices.slice(0, index), copy, ...prices.slice(index)] });
          return copyId;
        },
        remove: (id) => {
          const { prices } = get();
          const index = prices.findIndex((price) => price.id === id);
          const item = prices[index];
          if (item === undefined) return null;
          set({ prices: prices.filter((price) => price.id !== id) });
          return { item, index };
        },
        restore: ({ item, index }) =>
          set((state) => {
            if (state.prices.some((price) => price.id === item.id)) return state;
            const at = clamp(index, 0, state.prices.length);
            return { prices: [...state.prices.slice(0, at), item, ...state.prices.slice(at)] };
          }),
        clear: () => set({ prices: [] }),
        dismissIntegrity: () => set({ integrity: { lost: 0 } }),
      }),
      {
        name: STORAGE_KEYS.prices,
        version: PERSIST_VERSION,
        storage: jsonStorage<{ prices: readonly SavedPrice[] }>(adapter, flags),
        partialize: (state) => ({ prices: state.prices }),
        migrate: (persisted) => persisted as { prices: readonly SavedPrice[] },
        merge: (persisted, current) => {
          if (persisted === undefined || persisted === null) {
            return flags.unreadable ? { ...current, integrity: { lost: 1 } } : current;
          }
          const raw = (persisted as { prices?: unknown }).prices;
          if (!Array.isArray(raw)) return { ...current, integrity: { lost: 1 } };
          const readable = raw.flatMap((entry) => {
            const parsed = savedPriceSchema.safeParse(entry);
            return parsed.success ? [parsed.data] : [];
          });
          return { ...current, prices: readable, integrity: { lost: raw.length - readable.length } };
        },
      },
    ),
  );
}

/* ---------------------------------------------------------------- réglages */

const settingsSchema = z.object({
  onboardingSeen: z.number().int().min(0).max(1000),
  tipsSeen: z.array(z.string().max(40)).max(100),
  lastActivity: z.enum(["resale", "making", "service"]).nullable(),
});

type SettingsData = z.infer<typeof settingsSchema>;

export interface SettingsState extends SettingsData {
  readonly needsOnboarding: () => boolean;
  readonly markOnboardingSeen: () => void;
  readonly resetOnboarding: () => void;
  readonly hasSeenTip: (key: string) => boolean;
  readonly markTip: (key: string) => void;
  readonly resetTips: () => void;
  readonly setLastActivity: (activity: ActivityId) => void;
  readonly resetAll: () => void;
}

const DEFAULT_SETTINGS: SettingsData = { onboardingSeen: 0, tipsSeen: [], lastActivity: null };

export function createSettingsStore(adapter: StorageAdapter): StoreApi<SettingsState> {
  const flags: ReadFlags = { unreadable: false };
  return createStore<SettingsState>()(
    persist<SettingsState, [], [], SettingsData>(
      (set, get) => ({
        ...DEFAULT_SETTINGS,
        needsOnboarding: () => get().onboardingSeen < ONBOARDING_VERSION,
        markOnboardingSeen: () => set({ onboardingSeen: ONBOARDING_VERSION }),
        resetOnboarding: () => set({ onboardingSeen: 0 }),
        hasSeenTip: (key) => get().tipsSeen.includes(key),
        markTip: (key) => set((state) => (state.tipsSeen.includes(key) ? state : { tipsSeen: [...state.tipsSeen, key] })),
        resetTips: () => set({ tipsSeen: [] }),
        setLastActivity: (lastActivity) => set({ lastActivity }),
        resetAll: () => set({ ...DEFAULT_SETTINGS }),
      }),
      {
        name: STORAGE_KEYS.settings,
        version: PERSIST_VERSION,
        storage: jsonStorage<SettingsData>(adapter, flags),
        partialize: (state) => ({
          onboardingSeen: state.onboardingSeen,
          tipsSeen: state.tipsSeen,
          lastActivity: state.lastActivity,
        }),
        migrate: (persisted) => persisted as SettingsData,
        // Un réglage illisible est traité comme un premier lancement : jamais d'erreur (docs/14).
        merge: (persisted, current) => {
          const parsed = settingsSchema.safeParse(persisted);
          return parsed.success ? { ...current, ...parsed.data } : current;
        },
      },
    ),
  );
}

/* ----------------------------------------------------------------- ensemble */

export interface AppStores {
  readonly calc: StoreApi<CalcState>;
  readonly prices: StoreApi<PricesState>;
  readonly settings: StoreApi<SettingsState>;
}

export function createAppStores(adapter: StorageAdapter): AppStores {
  return {
    calc: createCalcStore(adapter),
    prices: createPricesStore(adapter),
    settings: createSettingsStore(adapter),
  };
}

/** « Effacer toutes mes données » (E13) : prix, brouillon et réglages. */
export function wipeAll(stores: AppStores): void {
  stores.prices.getState().clear();
  stores.calc.getState().reset();
  stores.settings.getState().resetAll();
}

export { findActivity };
