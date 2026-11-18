import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

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
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
