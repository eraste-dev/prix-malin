import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";
import { buildTourConfig, TOUR_STEP_COUNT } from "../src/lib/tour";
import { setReducedMotion } from "./motionEnv";

/**
 * Visite guidée de l'exemple (docs/14, ADR-0015) : un halo autour des vrais éléments, une bulle ancrée,
 * « n sur 6 », l'essai de la marge, et « Faire le mien » à la fin. Rien n'est écrit dans les données réelles (ONB-04).
 */
type User = ReturnType<typeof userEvent.setup>;

const open = () => {
  window.location.hash = "#/exemple";
  return render(<App />);
};
const popover = () => document.querySelector(".driver-popover") as HTMLElement | null;
const highlighted = () => document.querySelector(".driver-active-element");
const startTour = (user: User) => user.click(screen.getByRole("button", { name: /commencer la visite/i }));
const next = (user: User) =>
  user.click(within(popover() as HTMLElement).getByRole("button", { name: /suivant|faire le mien/i }));

describe("avant la visite", () => {
  it("propose la visite dans une carte, sans rien ouvrir tout seul", () => {
    open();
    const card = screen.getByRole("region", { name: /visite guidée/i });
    expect(within(card).getByRole("button", { name: /commencer la visite/i })).toBeInTheDocument();
    expect(popover()).toBeNull();
    expect(screen.getByTestId("example-banner")).toHaveTextContent(/exemple/i);
  });
});

describe("la visite", () => {
  it("met en évidence, dans l'ordre, les vrais éléments de l'écran", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);

    const expected: Array<() => Element | null> = [
      () => document.querySelector('form[aria-label="Vos trois questions"]'),
      () => screen.getByTestId("price"),
      () => document.querySelector('[data-tour="composition"]'),
      () => screen.getByRole("radiogroup", { name: /marge/i }),
      () => screen.getByRole("button", { name: "Enregistrer" }),
    ];
    for (const find of expected) {
      expect(highlighted()).toBe(find());
      await next(user);
    }
    // Dernière étape : une bulle centrée, sans vrai élément (driver.js pose un élément factice au centre).
    expect(highlighted()?.id).toBe("driver-dummy-element");
    expect(popover()).toHaveTextContent(/à vous/i);
  });

  it("dit où l'on en est : « 1 sur 6 », puis « 2 sur 6 »", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    expect(TOUR_STEP_COUNT).toBe(6);
    expect(popover()).toHaveTextContent("1 sur 6");
    await next(user);
    expect(popover()).toHaveTextContent("2 sur 6");
  });

  it("annonce le prix de l'exemple : 450 F", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    await next(user);
    expect(popover()).toHaveTextContent(/voici le prix à viser : 450 F/i);
  });

  it("« Retour » revient à l'étape précédente", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    await next(user);
    await user.click(within(popover() as HTMLElement).getByRole("button", { name: "Retour" }));
    expect(popover()).toHaveTextContent("1 sur 6");
  });

  it("la marge reste touchable pendant la visite : 10 % donne 375 F", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    for (let i = 0; i < 3; i += 1) await next(user);
    expect(highlighted()).toBe(screen.getByRole("radiogroup", { name: /marge/i }));

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    expect(screen.getByTestId("price")).toHaveTextContent("375");
  });

  it("finit sur « Faire le mien » : Q1 s'ouvre avec les champs vides", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    for (let i = 0; i < TOUR_STEP_COUNT - 1; i += 1) await next(user);
    expect(within(popover() as HTMLElement).getByRole("button", { name: "Faire le mien" })).toBeInTheDocument();

    await next(user);

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("");
    expect(popover()).toBeNull();
  });

  it("se ferme à Échap sans rien perdre, et propose de la relancer", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    await next(user);

    await user.keyboard("{Escape}");

    await waitFor(() => expect(popover()).toBeNull());
    expect(screen.getByTestId("price")).toHaveTextContent("450");
    const card = screen.getByRole("region", { name: /visite guidée/i });
    expect(within(card).getByRole("button", { name: /relancer la visite/i })).toBeInTheDocument();
    expect(within(card).getByRole("button", { name: /faire le mien/i })).toBeInTheDocument();
  });

  it("se relance depuis le début", async () => {
    const user = userEvent.setup();
    open();
    await startTour(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(popover()).toBeNull());

    await user.click(screen.getByRole("button", { name: /relancer la visite/i }));

    expect(popover()).toHaveTextContent("1 sur 6");
  });

  it("n'écrit rien dans les données réelles, même en parcourant toute la visite", async () => {
    const user = userEvent.setup();
    localStorage.removeItem(STORAGE_KEYS.draft);
    open();
    await startTour(user);
    for (let i = 0; i < TOUR_STEP_COUNT - 1; i += 1) await next(user);
    await user.keyboard("{Escape}");

    expect(localStorage.getItem(STORAGE_KEYS.prices)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull();
  });
});

describe("configuration", () => {
  it("coupe le halo animé et le défilement doux quand le mouvement n'est pas autorisé", () => {
    expect(buildTourConfig(false)).toMatchObject({ animate: false, smoothScroll: false });
    expect(buildTourConfig(true)).toMatchObject({ animate: true, smoothScroll: true });
  });

  it("parle français et montre la progression", () => {
    expect(buildTourConfig(true)).toMatchObject({
      showProgress: true,
      progressText: "{{current}} sur {{total}}",
      nextBtnText: "Suivant",
      prevBtnText: "Retour",
      doneBtnText: "Faire le mien",
    });
  });

  it("sans mouvement autorisé, la visite se lance quand même", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    open();
    await startTour(user);
    expect(popover()).toHaveTextContent("1 sur 6");
  });
});

describe("où trouver la visite", () => {
  it("Réglages : une ligne « Visite guidée » mène à l'exemple", () => {
    window.location.hash = "#/reglages";
    render(<App />);
    expect(screen.getByRole("link", { name: /visite guidée/i })).toHaveAttribute("href", "#/exemple");
  });

  it("Accueil, sans prix enregistré : un lien « Voir la visite guidée »", () => {
    window.location.hash = "#/";
    render(<App />);
    expect(screen.getByRole("link", { name: /voir la visite guidée/i })).toHaveAttribute("href", "#/exemple");
  });
});
