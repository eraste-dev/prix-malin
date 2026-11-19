/** Mots lus par minute pour estimer un temps de lecture. */
const WORDS_PER_MINUTE = 200;

/**
 * Les six articles qui forment la formule du prix, dans l'ordre : coût direct + charges + frais + marge donnent le
 * prix, et le seuil dit combien de ventes il faut (DESIGN.md « Comprendre »).
 */
export const PATH_SLUGS = ["cout-direct", "charges-fixes", "cout-de-revient", "marge", "prix", "seuil"] as const;

/** Place d'un article dans le chemin (1 à 6), ou `null` s'il n'en fait pas partie. */
export function pathPosition(slug: string): number | null {
  const index = (PATH_SLUGS as readonly string[]).indexOf(slug);
  return index === -1 ? null : index + 1;
}

/** Temps de lecture en minutes, arrondi au-dessus, une minute au moins. */
export function readingMinutes(article: { readonly paragraphs: readonly string[] }): number {
  const words = article.paragraphs.join(" ").split(/\s+/).filter((word) => word !== "").length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
