/**
 * Turns text into lowercase words joined by single hyphens: "Café & crème!" becomes "cafe-creme". Accents are
 * dropped, and anything that isn't a letter or a number separates words. Returns "" when nothing is left.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
