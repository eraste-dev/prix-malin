import type gsap from "gsap";

/*
 * Mouvement de l'app (ADR-0011 : GSAP). Une seule source de vérité pour tous les temps et les préférences.
 *
 * Chorégraphie d'entrée (docs/16 §3) :
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
  /** Demi-cercle de composition, puis « Pourquoi ce prix ? » (rang 1 de ce temps fort). */
  composition: 5,
} as const;

/** Retard d'entrée d'un élément, en ms : temps fort × 40 + rang × 20, plafonné à 240 ms. */
export function revealDelayMs(beat: number, sub = 0): number {
  return Math.min(beat, MAX_STAGGER) * STAGGER_MS + Math.min(sub, MAX_SUB) * SUB_STAGGER_MS;
}

export type RevealVariant = "rise" | "fade" | "emphasis";

/**
 * Entrées : `rise` (fondu + montée) pour les éléments ; `fade` (fondu seul) pour les surfaces, afin de ne pas
 * doubler le mouvement de leur contenu ; `emphasis` (fondu + léger zoom, plus lent) pour la carte résultat.
 */
export const REVEAL: Readonly<
  Record<RevealVariant, { readonly from: gsap.TweenVars; readonly duration: number; readonly ease: string }>
> = {
  rise: { from: { opacity: 0, y: 16 }, duration: 0.3, ease: "power2.out" },
  fade: { from: { opacity: 0 }, duration: 0.3, ease: "power2.out" },
  emphasis: { from: { opacity: 0, scale: 0.95 }, duration: 0.5, ease: "power3.out" },
};

/** Après une entrée, on retire les styles posés par GSAP : l'état final vit dans le DOM, pas dans l'animation. */
export const REVEAL_CLEAR_PROPS = "opacity,transform";

/** Demi-cercle de composition : arcs dessinés l'un après l'autre, puis glissants quand les valeurs changent (s). */
export const ARC = { drawDuration: 0.7, stagger: 0.12, slideDuration: 0.5 } as const;

/** Rond du stepper qui apparaît ; trait qui se remplit ; bascule d'icône ; ouverture d'un bloc repliable (s). */
export const STEP = { popDuration: 0.3, lineDuration: 0.5 } as const;
export const SWAP = { duration: 0.3, fromRotation: -90 } as const;
export const DISCLOSURE = { openDuration: 0.3, chevronDuration: 0.2 } as const;

/**
 * Onboarding illustré (DESIGN.md « Scènes »), en secondes sauf mention : chaque scène a sa chorégraphie, ces
 * valeurs en sont la seule source. Titre mot à mot, glissement de scène, tirets de progression.
 */
export const ONBOARD = {
  sceneSlidePx: 48,
  sceneDuration: 0.45,
  textDelay: 0.15,
  wordStagger: 0.04,
  wordDuration: 0.4,
  messageDelay: 0.5,
  dashDuration: 0.3,
  awningDuration: 0.45,
  bottleStagger: 0.08,
  bottleDuration: 0.4,
  tagStartAngle: 28,
  tagTapAngle: 18,
  tagSwingDuration: 1.4,
  priceCountDelay: 0.5,
  priceCountDuration: 0.9,
  rowStagger: 0.14,
  rowDuration: 0.4,
  checkDuration: 0.3,
  checkStagger: 0.18,
  shackleLift: 14,
  shackleDuration: 0.5,
  slashDuration: 0.4,
} as const;

/** Accueil (DESIGN.md « Accueil »), en secondes : segments de « Reprendre », cartes du carrousel. */
export const HOME = {
  segmentDuration: 0.15,
  segmentStagger: 0.15,
  cardSlidePx: 40,
  cardDuration: 0.4,
  cardStagger: 0.08,
} as const;

/** Carrousel de conseils de l'accueil : un conseil toutes les 7 s, glissement de 32 px (durées en s). */
export const TIP = { intervalMs: 7000, slidePx: 32, duration: 0.4 } as const;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Le mouvement est-il autorisé (MOV-01) ? Non si l'utilisateur a demandé de réduire les animations, ni si le
 * navigateur ne sait pas le dire : dans le doute, rien ne bouge et tout reste visible.
 */
export function motionAllowed(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return !window.matchMedia(REDUCE_QUERY).matches;
}
