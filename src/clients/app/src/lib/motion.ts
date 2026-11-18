import type { CSSProperties } from "react";

/*
 * Chorégraphie d'entrée (docs/16 §3). Une seule source de vérité pour tous les temps.
 *
 * - Un « temps fort » (beat) est une étape de la cascade : 40 ms d'écart, 6 au plus (0 à 5).
 * - Dans un même temps fort, chaque élément a son propre décalage (sub) de 20 ms, sur 3 au plus.
 *   Chaque élément s'anime donc séparément, mais l'ensemble se lit comme un seul geste.
 * - Retard maximal : 5 × 40 + 2 × 20 = 240 ms (la durée « base »), la cascade ne traîne jamais.
 */

export const STAGGER_MS = 40;
export const MAX_STAGGER = 5;
export const SUB_STAGGER_MS = 20;
export const MAX_SUB = 2;

/** Temps forts de l'écran Calculer, de haut en bas. */
export const BEAT = {
  top: 0,
  title: 1,
  field1: 2,
  field2: 3,
  field3: 4,
  footer: 5,
} as const;

/** Temps forts de la révélation du résultat (jouée une fois, à l'apparition de la carte). */
export const RESULT_BEAT = {
  caption: 1,
  price: 2,
  firstRow: 3,
  secondRow: 4,
} as const;

/**
 * Tout est sous `motion-safe:` : avec « réduire les animations », rien ne bouge (MOV-01).
 * `fill-mode-backwards` garde l'élément invisible pendant son retard.
 */
export const REVEAL_CLASS =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300 motion-safe:fill-mode-backwards";

/** Surface seule (carte, barre) : fondu sans déplacement, pour ne pas doubler le mouvement de son contenu. */
export const FADE_CLASS =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 motion-safe:fill-mode-backwards";

/** Révélation du résultat : plus ample et plus lente (« emphase », 500 ms, une seule fois). */
export const EMPHASIS_CLASS =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 motion-safe:fill-mode-backwards";

/** Rotation de l'icône du thème à chaque bascule. */
export const SWAP_CLASS =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:spin-in-90 motion-safe:duration-300";

export function revealDelay(beat: number, sub = 0): CSSProperties {
  const ms = Math.min(beat, MAX_STAGGER) * STAGGER_MS + Math.min(sub, MAX_SUB) * SUB_STAGGER_MS;
  return { animationDelay: `${ms}ms` };
}
