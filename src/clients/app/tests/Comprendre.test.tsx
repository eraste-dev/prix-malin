import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { ARTICLES } from "../src/content/comprendre";
import { bissap, seedDraft } from "./helpers";

/** Comprendre (E11) et aide contextuelle (E12). Lecture hors ligne : le contenu est embarqué. */
describe("liste des articles", () => {
  it("affiche chaque article en carte : titre et résumé, avec son adresse", () => {
    window.location.hash = "#/comprendre";
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/comprendre/i);
    for (const article of ARTICLES) {
      const link = screen.getByRole("link", { name: new RegExp(article.title, "i") });
      expect(link).toHaveAttribute("href", `#/comprendre/${article.slug}`);
      expect(link).toHaveTextContent(article.summary);
    }
  });

  it("est la page active de la barre de navigation", () => {
    window.location.hash = "#/comprendre";
    render(<App />);
    expect(screen.getByRole("link", { name: "Comprendre" })).toHaveAttribute("aria-current", "page");
  });
});

describe("un article", () => {
  it("s'ouvre depuis la liste et reste lisible : titre, paragraphes, retour", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/comprendre";
    render(<App />);

    await user.click(screen.getByRole("link", { name: /^la marge/i }));

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("La marge");
    expect(screen.getByText(/pourcentage du prix de vente/i)).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: /tous les articles/i }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/comprendre/i);
  });

  it("donne un exemple générique, étiqueté, quand il n'y a pas encore de calcul", () => {
    window.location.hash = "#/comprendre/cout-de-revient";
    render(<App />);
    expect(screen.getByTestId("article-example")).toHaveTextContent(/^Exemple : .*320 F/);
  });

  it("reprend les chiffres de l'utilisateur quand il a un calcul (« votre activité »)", () => {
    seedDraft(bissap({ coutDirect: { mode: "total", total: 300, lignes: [] } }));
    window.location.hash = "#/comprendre/cout-direct";
    render(<App />);
    expect(screen.getByTestId("article-example")).toHaveTextContent(/Dans votre calcul : 300 F/);
  });

  it("n'a pas d'exemple pour un article de liste", () => {
    window.location.hash = "#/comprendre/cinq-erreurs";
    render(<App />);
    expect(screen.queryByTestId("article-example")).not.toBeInTheDocument();
  });

  it("une adresse inconnue dit que l'article n'existe pas, avec un retour", () => {
    window.location.hash = "#/comprendre/n-importe-quoi";
    render(<App />);
    expect(screen.getByText(/cet article n'existe pas/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tous les articles/i })).toBeInTheDocument();
  });
});

describe("aide contextuelle « ? » (E12)", () => {
  it.each([
    ["Aide : coût direct", "Coût direct", "cout-direct"],
    ["Aide : charges fixes", "Charges fixes", "charges-fixes"],
    ["Aide : volume des ventes", "Volume des ventes", "volume"],
  ])("« %s » ouvre une définition courte avec « En savoir plus »", async (button, title, slug) => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: button }));

    const sheet = await screen.findByRole("dialog", { name: title });
    expect(within(sheet).getByRole("link", { name: /en savoir plus/i })).toHaveAttribute(
      "href",
      expect.stringContaining(slug === "volume" ? "cinq-erreurs" : slug),
    );
  });

  it("ne déplace pas la mise en page et se ferme sans perdre la saisie", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");

    await user.click(screen.getByRole("button", { name: "Aide : coût direct" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });

  it("« En savoir plus » mène à l'article", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Aide : coût direct" }));

    await user.click(within(await screen.findByRole("dialog")).getByRole("link", { name: /en savoir plus/i }));

    expect(window.location.hash).toBe("#/comprendre/cout-direct");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Le coût direct");
  });

  it("le résultat explique ses chiffres : coût de revient, ventes minimum et marge", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    render(<App />);

    expect(screen.getByRole("button", { name: "Aide : coût de revient" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aide : ventes minimum" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aide : marge" }));
    expect(await screen.findByRole("dialog", { name: "Marge" })).toBeInTheDocument();
  });
});
