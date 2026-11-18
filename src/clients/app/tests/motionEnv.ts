import { vi } from "vitest";

/**
 * jsdom n'a pas `matchMedia` : sans lui, l'app considère le mouvement interdit (rien n'est animé).
 * Ce simulateur permet de tester les deux préférences : `reduced = true` (réduire les animations) ou non.
 */
export function setReducedMotion(reduced: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduce") ? reduced : false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}
