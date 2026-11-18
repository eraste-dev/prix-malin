/** « mercredi 18 novembre », en français. */
export function formatToday(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);
}
