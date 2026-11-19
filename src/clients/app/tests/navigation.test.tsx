import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

describe("Navigation basse", () => {
  it("affiche le calcul, avec « Calculer » actif", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: "Calculer" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toBeVisible();
  });

  it("propose les cinq pages : Accueil, Calculer, Mes prix, Comprendre, Réglages", () => {
    render(<App />);
    const nav = screen.getByRole("navigation", { name: /principale/i });
    expect(Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("aria-label"))).toEqual([
      "Accueil",
      "Calculer",
      "Mes prix",
      "Comprendre",
      "Réglages",
    ]);
  });

  it("ouvre les réglages (thème) et revient au calcul sans perdre la saisie", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");

    await user.click(screen.getByRole("link", { name: "Réglages" }));
    expect(screen.getByRole("radiogroup", { name: "Thème" })).toBeVisible();
    expect(screen.queryByLabelText(/ce que ça vous coûte/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Réglages" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("link", { name: "Calculer" }));
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });

  it("le bouton retour du navigateur ramène à la page précédente", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Réglages" }));
    expect(screen.getByRole("radiogroup", { name: "Thème" })).toBeVisible();

    window.history.back();

    expect(await screen.findByLabelText(/ce que ça vous coûte/i)).toBeVisible();
  });

  it("nomme l'écran sans prénom et donne la date du jour en français", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/calculer un prix/i);
    expect(screen.getByTestId("today")).toHaveTextContent(/\d{1,2}/);
  });

  it("propose un lien d'évitement : première étape du clavier, il donne le focus au contenu", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(screen.getByRole("button", { name: /aller au contenu/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("une adresse inconnue retombe sur une page valide", () => {
    window.location.hash = "#/n-importe-quoi";
    render(<App />);
    expect(screen.getByRole("navigation", { name: /principale/i })).toBeInTheDocument();
  });
});
