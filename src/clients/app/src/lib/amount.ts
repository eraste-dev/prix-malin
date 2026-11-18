/** Plus grand nombre de chiffres accepté (le moteur borne les montants à 10^12). */
const MAX_DIGITS = 12;

const formatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/**
 * Extrait un entier d'une saisie libre : seuls les chiffres comptent.
 * `null` si la saisie est vide ou démesurée.
 */
export function parseAmount(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits === "" || digits.length > MAX_DIGITS) return null;
  return Number(digits);
}

/** Seuil de rentabilité : `null` quand aucun volume ne couvre les charges. */
export function formatBreakEven(units: number | null): string {
  return units === null ? "Impossible" : formatter.format(units);
}

/** Affichage avec séparateur de milliers ; chaîne vide si la valeur est absente. */
export function formatAmount(value: number | null): string {
  return value === null ? "" : formatter.format(value);
}
