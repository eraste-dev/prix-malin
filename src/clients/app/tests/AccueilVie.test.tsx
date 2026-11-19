import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { HOME, ONBOARD } from "../src/lib/motion";
import { bissap, seedDraft, seedPrices } from "./helpers";
import { setReducedMotion } from "./motionEnv";

/**
 * Accueil vivant (E01, DESIGN.md « Accueil ») : l'étal avec l'étiquette du dernier prix, « Reprendre » à trois
 * segments, les derniers prix en carrousel. Les gestes sont en GSAP (ADR-0011) ; sous « réduire les animations »
 * rien ne bouge (MOV-01).
 */
const home = () => {
  window.location.hash = "#/";
};

describe("l'étal de l'accueil", () => {
  it("l'étiquette affiche le dernier prix enregistré", () => {
    seedPrices(["Jus de bissap"]);
    home();
    render(<App />);
    expect(screen.getByTestId("home-price")).toHaveTextContent("450");
    expect(screen.getByRole("img", { name: /étal.*450 F/i })).toBeInTheDocument();
  });

  it("sans prix enregistré, l'étiquette porte un point d'interrogation, sans bloc cassé", () => {
    home();
    render(<App />);
    expect(screen.getByTestId("home-price")).toHaveTextContent("?");
    expect(screen.getByRole("img", { name: /étal.*pas encore de prix/i })).toBeInTheDocument();
  });

  it("garde les deux actions, compactes, sous l'auvent", () => {
    home();
    render(<App />);
    const calculate = screen.getByRole("button", { name: "Calculer un prix" });
    const test = screen.getByRole("button", { name: "Tester mon prix actuel" });
    expect(calculate.className).not.toMatch(/\bh-14\b/);
    expect(test.className).not.toMatch(/\bh-14\b/);
  });
});

describe("« Reprendre » à trois segments", () => {
  it("allume autant de segments que de nombres renseignés", () => {
    seedDraft(bissap({ chargesFixes: { mode: "total", total: null, lignes: [], source: "propre" }, volume: null }));
    home();
    render(<App />);
    const resume = screen.getByRole("region", { name: /reprendre/i });
    const segments = within(resume).getAllByTestId("resume-segment");
    expect(segments).toHaveLength(3);
    expect(segments.filter((segment) => segment.dataset.done === "true")).toHaveLength(1);
  });

  it("allume les trois segments pour un calcul complet", () => {
    seedDraft(bissap());
    home();
    render(<App />);
    const segments = within(screen.getByRole("region", { name: /reprendre/i })).getAllByTestId("resume-segment");
    expect(segments.every((segment) => segment.dataset.done === "true")).toBe(true);
  });
});

describe("carrousel des derniers prix", () => {
  it("garde une liste nommée de trois cartes au plus, la carte porte nom, prix et type", () => {
    seedPrices(["Un", "Deux", "Trois", "Quatre"]);
    home();
    render(<App />);
    const list = screen.getByRole("list", { name: /derniers prix/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(within(list).getAllByRole("link")[0]).toHaveTextContent(/quatre.*450.*fabrique/i);
  });
});

describe("mouvement de l'accueil", () => {
  it("réduire les animations : aucun tween, aucun style en ligne", () => {
    setReducedMotion(true);
    seedPrices(["Jus de bissap"]);
    seedDraft(bissap());
    const timeline = vi.spyOn(gsap, "timeline");
    const from = vi.spyOn(gsap, "from");
    home();
    const { container } = render(<App />);
    expect(timeline).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
    expect(container.querySelector("[style]")).toBeNull();
  });

  it("mouvement autorisé : l'étal, « Reprendre » et le carrousel jouent chacun leur geste", () => {
    setReducedMotion(false);
    seedPrices(["Jus de bissap"]);
    seedDraft(bissap());
    const timeline = vi.spyOn(gsap, "timeline");
    home();
    render(<App />);
    // l'étal, les segments de « Reprendre », le carrousel
    expect(timeline.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("toucher l'étiquette la balance de nouveau", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    home();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");
    await user.click(screen.getByTestId("home-tag"));
    expect(fromTo).toHaveBeenCalledTimes(1);
    expect(fromTo.mock.calls[0]?.[1]).toMatchObject({ rotation: ONBOARD.tagTapAngle });
  });

  it("toucher l'étiquette sans mouvement autorisé ne fait rien", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    home();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");
    await user.click(screen.getByTestId("home-tag"));
    expect(fromTo).not.toHaveBeenCalled();
  });

  it("les gestes de l'accueil restent courts : cartes décalées de 80 ms au plus, segments sous une demi-seconde", () => {
    expect(HOME.cardStagger).toBeLessThanOrEqual(0.08);
    expect(HOME.segmentDuration * 3).toBeLessThanOrEqual(0.5);
  });
});
