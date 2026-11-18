import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { MAX_STAGGER, MAX_SUB, STAGGER_MS, SUB_STAGGER_MS, revealDelay } from "../src/lib/motion";

/** Retard d'animation d'un élément, en millisecondes. */
const delayOf = (element: Element | null): number => {
  if (!(element instanceof HTMLElement)) throw new Error("élément introuvable");
  return Number.parseInt(element.style.animationDelay, 10);
};

const increasing = (values: readonly number[]): boolean =>
  values.every((value, index) => index === 0 || value > values[index - 1]!);

describe("Chorégraphie : calcul des retards (docs/16 §3)", () => {
  it("décale les temps forts de 40 ms (6 au plus) et les éléments d'un même temps de 20 ms", () => {
    expect(STAGGER_MS).toBe(40);
    expect(SUB_STAGGER_MS).toBe(20);
    expect(revealDelay(0).animationDelay).toBe("0ms");
    expect(revealDelay(2).animationDelay).toBe("80ms");
    expect(revealDelay(2, 1).animationDelay).toBe("100ms");
    expect(revealDelay(50, 50).animationDelay).toBe(`${MAX_STAGGER * STAGGER_MS + MAX_SUB * SUB_STAGGER_MS}ms`);
  });

  it("le retard maximal reste sous la durée de base (240 ms) : la cascade ne traîne jamais", () => {
    expect(MAX_STAGGER * STAGGER_MS + MAX_SUB * SUB_STAGGER_MS).toBeLessThanOrEqual(240);
  });
});

describe("Chorégraphie : accessibilité", () => {
  it("MOV-01 : aucune animation d'entrée hors du préfixe motion-safe (réduire les animations)", () => {
    const { container } = render(<App />);
    const animated = container.querySelectorAll('[class*="animate-in"]');
    expect(animated.length).toBeGreaterThan(0);
    for (const element of animated) {
      const classes = (element.getAttribute("class") ?? "").split(/\s+/);
      expect(classes).toContain("motion-safe:animate-in");
      expect(classes).not.toContain("animate-in");
    }
  });
});

describe("Chorégraphie : chaque élément s'anime séparément, dans un ordre cohérent", () => {
  it("en-tête : date, puis bouton de thème, puis titre", () => {
    render(<App />);
    const date = delayOf(screen.getByTestId("today"));
    const button = delayOf(screen.getByRole("button", { name: /passer en mode/i }).parentElement);
    const title = delayOf(screen.getByRole("heading", { level: 1 }));
    expect(increasing([date, button, title])).toBe(true);
  });

  it("formulaire : libellé puis champ, question après question, de haut en bas", () => {
    render(<App />);
    const order = [
      screen.getByText(/ce que ça vous coûte/i),
      screen.getByLabelText(/ce que ça vous coûte/i).parentElement,
      screen.getByText(/charges du mois/i),
      screen.getByLabelText(/charges du mois/i).parentElement,
      screen.getByText(/ventes par mois/i),
      screen.getByLabelText(/ventes par mois/i).parentElement,
    ];
    expect(increasing(order.map(delayOf))).toBe(true);
  });

  it("résultat : intitulé, prix puis chaque ligne, chacun à son tour", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await user.type(screen.getByLabelText(/ventes par mois/i), "2000");

    const order = [
      screen.getByText("Votre prix conseillé"),
      screen.getByTestId("price"),
      screen.getByTestId("full-cost").parentElement,
      screen.getByTestId("break-even").parentElement,
    ];
    expect(increasing(order.map(delayOf))).toBe(true);
  });

  it("navigation basse : chaque onglet apparaît à son tour", () => {
    render(<App />);
    const tabs = ["Calculer", "Réglages"].map((name) =>
      delayOf(screen.getByRole("button", { name }).closest("li")),
    );
    expect(increasing(tabs)).toBe(true);
  });

  it("réglages : titre puis chaque carte de thème, une à une", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Réglages" }));
    const order = [
      screen.getByRole("heading", { name: "Thème" }),
      ...["Système", "Clair", "Sombre"].map((name) => screen.getByRole("radio", { name }).closest("label")),
    ];
    expect(increasing(order.map(delayOf))).toBe(true);
  });
});
