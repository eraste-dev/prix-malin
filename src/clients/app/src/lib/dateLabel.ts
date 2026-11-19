/** « mercredi 18 novembre », en français. */
export function formatToday(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}

/** « 18 nov. 2026 », en français ; une date illisible donne une chaîne vide. */
export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
