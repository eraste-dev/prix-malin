import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { LIST, listDelay } from "../src/lib/motion";
import { seedPrices } from "./helpers";
import { setReducedMotion } from "./motionEnv";

/**
 * Mes prix vivant (E09, DESIGN.md « Mes prix ») : cartes à étiquette de prix, étal vide, étiquettes qui
 * s'accrochent à l'arrivée (GSAP, ADR-0011). Sous « réduire les animations » rien ne bouge (MOV-01).
 */
const open = () => {
  window.location.hash = "#/prix";
};
const rows = () => screen.queryAllByRole("listitem").filter((li) => li.hasAttribute("data-price-id"));

describe("liste vide : l'étal", () => {
  it("montre l'étal à l'étiquette vide, avec l'invitation à calculer", () => {
    open();
    render(<App />);
    expect(screen.getByRole("img", { name: /étal.*pas encore de prix/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calculer mon premier prix/i })).toHaveAttribute("href", "#/calculer");
  });
});

describe("cartes à étiquette", () => {
  it("chaque carte porte son prix dans une étiquette", () => {
    seedPrices(["Jus de bissap"]);
    open();
    render(<App />);
    const tag = within(rows()[0] as HTMLElement).getByTestId("price-tag");
    expect(tag).toHaveTextContent("450");
    expect(tag).toHaveTextContent("F CFA");
  });

  it("le nom et le menu d'actions sont sur la même ligne, en tête de carte", () => {
    seedPrices(["Jus de bissap"]);
    open();
    render(<App />);
    const row = rows()[0] as HTMLElement;
    const heading = within(row).getByRole("heading", { level: 2 });
    const menu = within(row).getByRole("button", { name: "Actions pour Jus de bissap" });
    expect(heading.parentElement).toContainElement(menu);
  });

  it("garde nom, type, marge et date lisibles sur la carte", () => {
    seedPrices(["Jus de bissap"]);
    open();
    render(<App />);
    const row = rows()[0] as HTMLElement;
    expect(row).toHaveTextContent(/je fabrique/i);
    expect(row).toHaveTextContent(/27,9 %/);
  });
});

describe("mouvement de la liste", () => {
  it("le décalage des étiquettes est plafonné : la 6e et toutes les suivantes arrivent ensemble", () => {
    expect(listDelay(0)).toBe(0);
    expect(listDelay(1)).toBeCloseTo(LIST.stagger);
    expect(listDelay(5)).toBeCloseTo(5 * LIST.stagger);
    expect(listDelay(40)).toBeCloseTo(5 * LIST.stagger);
    expect(listDelay(40)).toBeLessThanOrEqual(0.4);
  });

  it("réduire les animations : aucun tween, aucun style en ligne", () => {
    setReducedMotion(true);
    seedPrices(["Un", "Deux"]);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    const { container } = render(<App />);
    expect(timeline).not.toHaveBeenCalled();
    expect(container.querySelector("[style]")).toBeNull();
  });

  it("mouvement autorisé : les étiquettes s'accrochent (une timeline pour la liste)", () => {
    setReducedMotion(false);
    seedPrices(["Un", "Deux"]);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("mouvement autorisé, liste vide : l'étal joue sa propre entrée", () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("filtrer par la recherche ne rejoue pas l'animation", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    seedPrices(["Bissap", "Gingembre", "c3", "d4", "e5", "f6"]);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    const before = timeline.mock.calls.length;
    await user.type(screen.getByRole("searchbox", { name: /rechercher/i }), "gin");
    expect(timeline.mock.calls.length).toBe(before);
  });
});
