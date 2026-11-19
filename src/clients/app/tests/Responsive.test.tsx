import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

/**
 * Petits écrans (360 px, docs/16). jsdom n'a pas de mise en page : on garde ici les causes connues d'un
 * débordement horizontal, vues sur un Galaxy A55 (L-40).
 */
describe("largeur sur petit écran", () => {
  it("la colonne principale est bornée à la largeur de l'écran (minmax(0,1fr)), pas à celle de son contenu", () => {
    window.location.hash = "#/";
    render(<App />);
    const main = document.getElementById("contenu");
    expect(main?.className).toMatch(/grid-cols-\[minmax\(0,1fr\)\]/);
  });

  it("les libellés des tuiles d'activité peuvent se couper (césure, mot long) au lieu d'élargir la rangée", () => {
    window.location.hash = "#/calculer";
    render(<App />);
    for (const name of ["Achat-revente", "Je fabrique", "Prestation"]) {
      const label = screen.getByText(name);
      expect(label.className).toMatch(/\bhyphens-auto\b/);
      expect(label.className).toMatch(/\bbreak-words\b/);
    }
  });
});
