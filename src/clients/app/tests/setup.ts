import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, vi } from "vitest";
import { STORAGE_KEYS } from "../src/lib/storage";
import { ONBOARDING_VERSION } from "../src/lib/stores";

/**
 * Chaque test repart d'une app « déjà lancée une fois » (sans onboarding), sur l'écran Calculer, sans données.
 * Les tests qui portent sur le premier lancement ou l'accueil vident ou changent ce point de départ.
 */
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({ state: { onboardingSeen: ONBOARDING_VERSION, tipsSeen: [], lastActivity: null }, version: 1 }),
  );
  window.location.hash = "#/calculer";
});

/*
 * jsdom n'a pas de mise en page : `offsetParent` y vaut toujours null. Pour mesurer une transformation, GSAP
 * retire alors l'élément du DOM, le mesure, puis le remet : un champ en cours de saisie perdrait son focus et
 * des chiffres. Un vrai navigateur ne le fait pas. On donne donc à jsdom un `offsetParent` plausible.
 */
Object.defineProperty(HTMLElement.prototype, "offsetParent", {
  configurable: true,
  get(this: HTMLElement) {
    return this.parentElement;
  },
});

// jsdom n'a pas ResizeObserver, que Radix (tooltip, popper) utilise pour se positionner.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

afterEach(() => {
  cleanup();
  // L'état des messages (sonner) est global : on le vide pour que les tests restent indépendants.
  toast.dismiss();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
