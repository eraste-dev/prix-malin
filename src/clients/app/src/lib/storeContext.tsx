import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { browserStorage, type StorageAdapter } from "./storage";
import {
  createAppStores,
  type AppStores,
  type CalcState,
  type PricesState,
  type SettingsState,
} from "./stores";

const StoresContext = createContext<AppStores | null>(null);

interface StoreProviderProps {
  readonly children: ReactNode;
  /** Le stockage à utiliser ; par défaut `localStorage` (tests : un stockage en mémoire). */
  readonly storage?: StorageAdapter | undefined;
  /** Prépare les stores à leur création (ex. l'exemple guidé y charge son calcul). */
  readonly seed?: ((stores: AppStores) => void) | undefined;
}

/** Crée les stores une seule fois, au premier rendu (lecture validée du stockage, ADR-0012). */
export function StoreProvider({ children, storage, seed }: StoreProviderProps) {
  const [stores] = useState(() => {
    const created = createAppStores(storage ?? browserStorage());
    seed?.(created);
    return created;
  });
  return <StoresContext value={stores}>{children}</StoresContext>;
}

export function useStores(): AppStores {
  const stores = useContext(StoresContext);
  if (stores === null) throw new Error("StoreProvider manquant autour de l'application");
  return stores;
}

export function useCalc<T>(selector: (state: CalcState) => T): T {
  return useStore(useStores().calc, selector);
}

export function usePrices<T>(selector: (state: PricesState) => T): T {
  return useStore(useStores().prices, selector);
}

export function useSettings<T>(selector: (state: SettingsState) => T): T {
  return useStore(useStores().settings, selector);
}
