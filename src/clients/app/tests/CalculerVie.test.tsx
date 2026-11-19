import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { CALC } from "../src/lib/motion";
import { bissap, seedDraft } from "./helpers";
import { setReducedMotion } from "./motionEnv";

/**
 * Calculer vivant (E02 à E08, DESIGN.md « Calculer ») : un titre qui nomme l'écran, un conseil discret, un prix
 * posé sur une étiquette qui se balance et rebondit quand il change, des messages « verrouillé » avec un repère,
 * un rebond du type d'activité choisi. Mouvement en GSAP (ADR-0011) ; rien sous « réduire les animations ».
 */
const open = () => {
  window.location.hash = "#/calculer";
};

describe("titre", () => {
  it("nomme l'écran au lieu de saluer, comme l'Accueil", () => {
    open();
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Calculer un prix");
    expect(screen.queryByText(/bonjour/i)).not.toBeInTheDocument();
  });
});

describe("conseil discret", () => {
  it("se ferme par une icône à droite, sans bouton de texte", () => {
    seedDraft(bissap());
    open();
    render(<App />);
    const note = screen.getAllByRole("note")[0] as HTMLElement;
    const close = within(note).getByRole("button", { name: /compris/i });
    expect(close.textContent).toBe("");
    expect(close.querySelector("svg")).not.toBeNull();
  });
});

describe("le prix sur son étiquette", () => {
  it("pose le prix dans une étiquette à œillet", () => {
    seedDraft(bissap());
    open();
    render(<App />);
    const tag = screen.getByTestId("price-tag");
    expect(within(tag).getByTestId("price")).toHaveTextContent("450");
    expect(tag.querySelector('span[aria-hidden="true"]')).not.toBeNull();
  });
});

describe("messages verrouillés", () => {
  it("le résultat et l'ajustement, pas encore disponibles, ont un repère de cadenas", () => {
    open();
    render(<App />);
    const hints = screen.getAllByTestId("locked-hint");
    expect(hints).toHaveLength(2);
    for (const hint of hints) expect(hint.querySelector("svg")).not.toBeNull();
    // Un seul message est annoncé aux lecteurs d'écran : celui du résultat.
    expect(hints.filter((hint) => hint.getAttribute("role") === "status")).toHaveLength(1);
  });

  it("disparaissent quand le prix est calculable", () => {
    seedDraft(bissap());
    open();
    render(<App />);
    expect(screen.queryByTestId("locked-hint")).not.toBeInTheDocument();
  });
});

describe("mouvement de Calculer", () => {
  it("les durées restent courtes : rebond sous 0,4 s, balancier sous 1,2 s", () => {
    expect(CALC.bumpDuration).toBeLessThanOrEqual(0.4);
    expect(CALC.tagSwingDuration).toBeLessThanOrEqual(1.2);
  });

  it("réduire les animations : aucun tween posé par ces gestes, aucun style en ligne", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    seedDraft(bissap());
    const timeline = vi.spyOn(gsap, "timeline");
    const fromTo = vi.spyOn(gsap, "fromTo");
    open();
    const { container } = render(<App />);
    await user.click(screen.getByRole("radio", { name: /prestation/i }));
    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));
    expect(timeline).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
    // Aucun transform ni opacité posés par un geste (le trait du stepper et le chevron de « Pourquoi ce prix ? » posent leur état final, shadcn son contour).
    expect(container.querySelector('[style*="opacity"], [style*="transform"]:not([data-connector-to]):not(svg)')).toBeNull();
  });

  it("mouvement autorisé : l'étiquette se balance à l'arrivée du prix", () => {
    setReducedMotion(false);
    seedDraft(bissap());
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("sans prix calculable, l'étiquette n'existe pas : rien à balancer", () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    expect(timeline).not.toHaveBeenCalled();
  });

  it("quand le prix change, l'étiquette rebondit", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    seedDraft(bissap());
    open();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    const bump = fromTo.mock.calls.find(([, from]) => (from as { scale?: number }).scale === CALC.bumpFrom);
    expect(bump).toBeDefined();
  });

  it("choisir un type d'activité fait rebondir sa tuile, mais pas au premier affichage", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    open();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");
    expect(fromTo).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: /prestation/i }));

    const pop = fromTo.mock.calls.find(([, from]) => (from as { scale?: number }).scale === CALC.popFrom);
    expect(pop).toBeDefined();
  });
});
