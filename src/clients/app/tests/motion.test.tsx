import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import {
  MAX_STAGGER,
  MAX_SUB,
  STAGGER_MS,
  SUB_STAGGER_MS,
  motionAllowed,
  revealDelayMs,
} from "../src/lib/motion";
import { setReducedMotion } from "./motionEnv";

/** Retard d'entrée d'un élément, en ms (attribut posé par `Reveal`, lu quelle que soit la préférence de mouvement). */
const delayOf = (element: Element | null): number => {
  if (!(element instanceof HTMLElement)) throw new Error("élément introuvable");
  return Number(element.dataset.revealDelay);
};

const increasing = (values: readonly number[]): boolean =>
  values.every((value, index) => index === 0 || value > values[index - 1]!);

async function fillBissap(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

describe("Chorégraphie : calcul des retards (docs/16 §3, ADR-0011)", () => {
  it("décale les temps forts de 40 ms (6 au plus) et les éléments d'un même temps de 20 ms", () => {
    expect(STAGGER_MS).toBe(40);
    expect(SUB_STAGGER_MS).toBe(20);
    expect(revealDelayMs(0)).toBe(0);
    expect(revealDelayMs(2)).toBe(80);
    expect(revealDelayMs(2, 1)).toBe(100);
    expect(revealDelayMs(50, 50)).toBe(MAX_STAGGER * STAGGER_MS + MAX_SUB * SUB_STAGGER_MS);
  });

  it("le retard maximal reste sous la durée de base (240 ms) : la cascade ne traîne jamais", () => {
    expect(MAX_STAGGER * STAGGER_MS + MAX_SUB * SUB_STAGGER_MS).toBeLessThanOrEqual(240);
  });
});

describe("Préférence de mouvement (MOV-01)", () => {
  it("interdit le mouvement quand matchMedia est absent (jsdom, vieux navigateurs)", () => {
    expect(motionAllowed()).toBe(false);
  });

  it("interdit le mouvement quand l'utilisateur demande de réduire les animations", () => {
    setReducedMotion(true);
    expect(motionAllowed()).toBe(false);
  });

  it("autorise le mouvement sinon", () => {
    setReducedMotion(false);
    expect(motionAllowed()).toBe(true);
  });

  it("réduire les animations : GSAP ne pose aucun tween et rien n'est masqué en ligne", async () => {
    setReducedMotion(true);
    const from = vi.spyOn(gsap, "from");
    const fromTo = vi.spyOn(gsap, "fromTo");
    const to = vi.spyOn(gsap, "to");
    const user = userEvent.setup();
    const { container } = render(<App />);
    await fillBissap(user);

    expect(from).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
    expect(to).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[style*="opacity"]')).toHaveLength(0);
    expect(screen.getByTestId("price")).toBeVisible();
  });
});

describe("Entrée des éléments avec GSAP (mouvement autorisé)", () => {
  it("Reveal pose une entrée GSAP : fondu et montée, retard du temps fort, styles nettoyés ensuite", () => {
    setReducedMotion(false);
    const from = vi.spyOn(gsap, "from");
    render(<App />);

    const title = screen.getByRole("heading", { level: 1 });
    const call = from.mock.calls.find(([target]) => target === title);
    expect(call).toBeDefined();
    const vars = call![1] as gsap.TweenVars;
    expect(vars.opacity).toBe(0);
    expect(vars.y).toBe(16);
    expect(vars.delay).toBeCloseTo(0.04, 5); // temps fort « titre » : 40 ms
    expect(String(vars.clearProps)).toContain("opacity");
  });

  it("annule ses tweens au démontage (pas de fuite)", () => {
    setReducedMotion(false);
    const { unmount } = render(<App />);
    expect(gsap.globalTimeline.getChildren(false, true, false).length).toBeGreaterThan(0);

    unmount();

    expect(gsap.globalTimeline.getChildren(false, true, false)).toHaveLength(0);
  });

  it("bascule du thème : l'icône refait une petite rotation", async () => {
    setReducedMotion(false);
    const from = vi.spyOn(gsap, "from");
    const user = userEvent.setup();
    render(<App />);
    from.mockClear();

    await user.click(screen.getByRole("button", { name: /passer en mode/i }));

    const spin = from.mock.calls.find(([, vars]) => (vars as gsap.TweenVars).rotation === -90);
    expect(spin).toBeDefined();
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

  it("résultat : intitulé, prix, chaque ligne, composition puis « pourquoi », chacun à son tour", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const order = [
      screen.getByText("Votre prix conseillé"),
      screen.getByTestId("price"),
      screen.getByTestId("full-cost").parentElement,
      screen.getByTestId("break-even").parentElement,
      screen.getByTestId("composition-block"),
      screen.getByRole("button", { name: /pourquoi ce prix/i }).closest("[data-slot=collapsible]")?.parentElement ?? null,
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
