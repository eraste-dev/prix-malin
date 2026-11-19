import { z } from "zod";
import { savedPriceSchema, type AppStores, type SavedPrice } from "./stores";

/*
 * Sauvegarde et import (EXG-44). Le fichier ne contient que les prix : lisible, versionné, sans donnée personnelle.
 * L'import valide tout (NFR-09) et ne remplace jamais ce qui existe déjà.
 */

export const BACKUP_APP = "prix-malin";
export const BACKUP_SCHEMA = 1;

const envelopeSchema = z.object({
  app: z.literal(BACKUP_APP),
  schema: z.number().int(),
  exportedAt: z.string(),
  prices: z.array(z.unknown()),
});

export function backupFileName(now: Date = new Date()): string {
  return `prix-malin-${now.toISOString().slice(0, 10)}.json`;
}

export function buildBackup(prices: readonly SavedPrice[], now: Date = new Date()): string {
  return JSON.stringify({ app: BACKUP_APP, schema: BACKUP_SCHEMA, exportedAt: now.toISOString(), prices }, null, 2);
}

export type BackupFailure = "UNREADABLE" | "NOT_A_BACKUP" | "NEWER_VERSION";

export type BackupRead =
  | { readonly ok: true; readonly prices: readonly SavedPrice[]; readonly rejected: number }
  | { readonly ok: false; readonly reason: BackupFailure };

export function readBackup(text: string): BackupRead {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, reason: "UNREADABLE" };
  }
  const envelope = envelopeSchema.safeParse(json);
  if (!envelope.success) return { ok: false, reason: "NOT_A_BACKUP" };
  if (envelope.data.schema > BACKUP_SCHEMA) return { ok: false, reason: "NEWER_VERSION" };

  const prices = envelope.data.prices.flatMap((entry) => {
    const parsed = savedPriceSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  });
  return { ok: true, prices, rejected: envelope.data.prices.length - prices.length };
}

export type ImportReport =
  | { readonly ok: true; readonly added: number; readonly skipped: number; readonly rejected: number }
  | { readonly ok: false; readonly reason: BackupFailure };

/** Ajoute les prix absents ; un prix déjà présent (même identifiant) est ignoré : importer deux fois ne duplique rien. */
export function importBackup(stores: AppStores, text: string): ImportReport {
  const read = readBackup(text);
  if (!read.ok) return read;
  const { added, skipped } = stores.prices.getState().merge(read.prices);
  return { ok: true, added, skipped, rejected: read.rejected };
}
