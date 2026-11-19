import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { SETTINGS } from "../src/lib/motion";
import { seedPrices } from "./helpers";
import { setReducedMotion } from "./motionEnv";

/**
 * Réglages vivant (E13, DESIGN.md « Réglages ») : cartes de lignes à icône et chevron, « À propos » replié,
 * « Vos données » en pied, rebond du thème choisi (GSAP, ADR-0011). Sous « réduire les animations » rien ne bouge.
 */
const open = () => {
  window.location.hash = "#/reglages";
};
const section = (name: RegExp) => screen.getByRole("region", { name });

describe("lignes de réglage", () => {
  it("Mon activité et la présentation sont des lignes entières qui ouvrent un écran", () => {
    open();
    render(<App />);
    expect(within(section(/mon activité/i)).getByRole("link", { name: /mon activité/i })).toHaveAttribute(
      "href",
      "#/activite",
    );
    expect(within(section(/présentation et aides/i)).getByRole("link", { name: /revoir la présentation/i })).toHaveAttribute(
      "href",
      "#/bienvenue",
    );
  });

  it("l'export dit combien de prix il sauvegarde", () => {
    seedPrices(["A", "B"]);
    open();
    render(<App />);
    expect(screen.getByRole("button", { name: /exporter mes prix/i })).toHaveTextContent(/2 prix/);
  });

  it("la confidentialité tient en une phrase à côté d'un cadenas", () => {
    open();
    render(<App />);
    const privacy = section(/confidentialité/i);
    expect(privacy).toHaveTextContent(/tout reste sur votre téléphone/i);
    expect(privacy.querySelector("svg")).not.toBeNull();
  });

  it("« Vos données » vient après toutes les autres sections et dit ce qui disparaît", () => {
    open();
    render(<App />);
    const data = section(/vos données/i);
    for (const name of [/thème/i, /mon activité/i, /sauvegarde/i, /confidentialité/i, /^à propos/i]) {
      expect(section(name).compareDocumentPosition(data) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(data).toHaveTextContent(/impossible à annuler/i);
    expect(within(data).getByRole("button", { name: /effacer/i })).toBeInTheDocument();
  });
});

describe("« À propos » replié", () => {
  it("annonce qu'il se déplie, et montre les versions une fois ouvert", async () => {
    const user = userEvent.setup();
    open();
    render(<App />);
    const toggle = screen.getByRole("button", { name: /voir les versions/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/version de l'application/i)).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByRole("button", { name: /masquer les versions/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/version de l'application/i)).toBeInTheDocument();
  });
});

describe("mouvement de Réglages", () => {
  it("les sections arrivent vite : la dernière démarre avant 0,5 s", () => {
    expect(SETTINGS.stagger * 6 + SETTINGS.duration).toBeLessThanOrEqual(0.9);
    expect(SETTINGS.stagger * 6).toBeLessThanOrEqual(0.5);
  });

  it("réduire les animations : aucun tween, aucun style en ligne", async () => {
    setReducedMotion(true);
    const timeline = vi.spyOn(gsap, "timeline");
    const fromTo = vi.spyOn(gsap, "fromTo");
    const user = userEvent.setup();
    open();
    const { container } = render(<App />);
    await user.click(screen.getByRole("radio", { name: /sombre/i }));
    expect(timeline).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
    expect(container.querySelector("[style]")).toBeNull();
  });

  it("mouvement autorisé : les sections jouent une timeline", () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, "timeline");
    open();
    render(<App />);
    expect(timeline).toHaveBeenCalledTimes(1);
  });

  it("choisir un thème fait rebondir sa carte, mais pas au premier affichage", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    open();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");
    expect(fromTo).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: /sombre/i }));

    expect(fromTo).toHaveBeenCalledTimes(1);
    expect(fromTo.mock.calls[0]?.[1]).toMatchObject({ scale: SETTINGS.popFrom });
  });
});
