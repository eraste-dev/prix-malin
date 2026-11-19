import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { ONBOARD } from "../src/lib/motion";
import { setReducedMotion } from "./motionEnv";

/**
 * Onboarding illustré (docs/14, DESIGN.md « Onboarding ») : une scène par carte, dessinée en SVG avec les jetons,
 * et des gestes propres à chaque scène (GSAP, ADR-0011). Sous « réduire les animations » : rien ne bouge (MOV-01).
 */
function firstLaunch() {
  localStorage.clear();
  window.location.hash = "#/";
}
const next = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: "Suivant" }));

describe("scènes illustrées", () => {
  it("chaque carte montre une illustration décrite aux lecteurs d'écran", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);

    expect(screen.getByRole("img", { name: /étal.*450 F/i })).toBeInTheDocument();
    await next(user);
    expect(screen.getByRole("img", { name: /trois questions/i })).toBeInTheDocument();
    await next(user);
    expect(screen.getByRole("img", { name: /téléphone.*cadenas/i })).toBeInTheDocument();
  });

  it("une seule scène est dans la page à la fois", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await next(user);
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("l'étiquette de l'étal porte le prix final dans le DOM, sans animation", () => {
    firstLaunch();
    render(<App />);
    expect(screen.getByTestId("scene-price")).toHaveTextContent("450");
  });

  it("le titre reste un seul titre lisible, même découpé mot à mot", () => {
    firstLaunch();
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Le bon prix, en une minute" })).toBeInTheDocument();
  });

  it("la dernière carte n'a qu'une issue : « Commencer »", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await next(user);
    await next(user);
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Calculer mon prix" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /exemple/i })).not.toBeInTheDocument();
  });
});

describe("progression et navigation", () => {
  it("les tirets de progression se touchent pour aller à une carte", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /aller à la carte 3/i }));
    expect(screen.getByRole("heading", { level: 1, name: /vos chiffres restent chez vous/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /aller à la carte 1/i }));
    expect(screen.getByRole("heading", { level: 1, name: /le bon prix/i })).toBeInTheDocument();
  });

  it("le tiret de la carte affichée est marqué comme étape courante", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    expect(screen.getByRole("button", { name: /aller à la carte 1/i })).toHaveAttribute("aria-current", "step");

    await next(user);

    expect(screen.getByRole("button", { name: /aller à la carte 2/i })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /aller à la carte 1/i })).not.toHaveAttribute("aria-current");
  });

  it("« Retour » et « Suivant » sont deux boutons compacts d'une même rangée, un de chaque côté", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await next(user);

    const row = screen.getByRole("group", { name: /navigation de la présentation/i });
    const back = within(row).getByRole("button", { name: "Retour" });
    const forward = within(row).getByRole("button", { name: "Suivant" });

    expect(back.compareDocumentPosition(forward) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(back.className).not.toMatch(/\bw-full\b/);
    expect(forward.className).not.toMatch(/\bw-full\b/);
  });

  it("sur la première carte, seul « Suivant » est proposé", () => {
    firstLaunch();
    render(<App />);
    const row = screen.getByRole("group", { name: /navigation de la présentation/i });
    expect(within(row).queryByRole("button", { name: "Retour" })).not.toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Suivant" })).toBeInTheDocument();
  });

  it("sur la dernière carte, « Commencer » prend la place de « Suivant », dans la même rangée", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /aller à la carte 3/i }));

    const row = screen.getByRole("group", { name: /navigation de la présentation/i });
    expect(within(row).getByRole("button", { name: "Retour" })).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Commencer" })).toBeInTheDocument();
    expect(within(row).queryByRole("button", { name: "Suivant" })).not.toBeInTheDocument();
  });
});

describe("mouvement des scènes", () => {
  it("réduire les animations : aucun tween, aucun style en ligne, tout est déjà visible", async () => {
    setReducedMotion(true);
    const timeline = vi.spyOn(gsap, "timeline");
    const from = vi.spyOn(gsap, "from");
    const fromTo = vi.spyOn(gsap, "fromTo");
    const to = vi.spyOn(gsap, "to");
    const user = userEvent.setup();
    firstLaunch();
    const { container } = render(<App />);
    await next(user);

    expect(timeline).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
    expect(to).not.toHaveBeenCalled();
    expect(container.querySelector("[style]")).toBeNull();
  });

  it("mouvement autorisé : la scène joue sa chorégraphie à chaque carte", async () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, "timeline");
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    const afterFirst = timeline.mock.calls.length;
    expect(afterFirst).toBeGreaterThan(0);

    await next(user);

    expect(timeline.mock.calls.length).toBeGreaterThan(afterFirst);
  });

  it("toucher l'étiquette la fait se balancer de nouveau", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");

    await user.click(screen.getByTestId("scene-tag"));

    expect(fromTo).toHaveBeenCalledTimes(1);
    expect(fromTo.mock.calls[0]?.[1]).toMatchObject({ rotation: ONBOARD.tagTapAngle });
  });

  it("toucher l'étiquette sans mouvement autorisé ne fait rien", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    const fromTo = vi.spyOn(gsap, "fromTo");

    await user.click(screen.getByTestId("scene-tag"));

    expect(fromTo).not.toHaveBeenCalled();
  });

  it("le compte du prix et le balancier tiennent en moins de deux secondes", () => {
    expect(ONBOARD.priceCountDuration + ONBOARD.priceCountDelay).toBeLessThanOrEqual(2);
    expect(ONBOARD.tagSwingDuration).toBeLessThanOrEqual(1.6);
  });

  it("le dernier mot du plus long titre démarre avant 0,7 s : le texte ne se fait pas attendre", () => {
    const words = 6;
    expect(ONBOARD.textDelay + (words - 1) * ONBOARD.wordStagger).toBeLessThanOrEqual(0.7);
  });
});
