import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";
import { bissap, seedDraft, seedPrices } from "./helpers";

/** Accueil (E01, ACC-01, ACC-02) : en un appui vers un calcul, retrouver son travail. */
const home = () => {
  window.location.hash = "#/";
};
const draft = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) ?? "{}").state?.calcul;

describe("accueil vide", () => {
  it("propose de calculer, sans bloc cassé (ACC-02)", () => {
    home();
    render(<App />);
    expect(screen.getByRole("button", { name: "Calculer un prix" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tester mon prix actuel" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /reprendre/i })).not.toBeInTheDocument();
    expect(screen.getByText(/aucun prix enregistré pour l'instant/i)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /derniers prix/i })).not.toBeInTheDocument();
  });

  it("est la page active de la barre de navigation", () => {
    home();
    render(<App />);
    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("aria-current", "page");
  });

  it("montre « le conseil du moment », avec un lien vers l'article", () => {
    home();
    render(<App />);
    const tip = screen.getByRole("region", { name: /conseil du moment/i });
    expect(within(tip).getByRole("link", { name: /en savoir plus/i }).getAttribute("href")).toMatch(/^#\/comprendre\//);
  });
});

describe("reprendre le brouillon (ACC-01)", () => {
  it("« Reprendre » est le premier élément, au-dessus de « Calculer »", () => {
    seedDraft(bissap({ nom: "Jus de bissap" }));
    home();
    render(<App />);
    const resume = screen.getByRole("region", { name: /reprendre/i });
    const calculate = screen.getByRole("button", { name: "Calculer un prix" });
    expect(resume.compareDocumentPosition(calculate) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(resume).toHaveTextContent("Jus de bissap");
    expect(resume).toHaveTextContent(/3 sur 3/);
  });

  it("rouvre le calcul là où on l'avait laissé", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    home();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Reprendre" }));

    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });

  it("« Calculer un prix » repart d'un calcul vierge", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    home();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Calculer un prix" }));

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("");
  });

  it("« Tester mon prix actuel » ouvre un calcul en mode « Mon prix »", async () => {
    const user = userEvent.setup();
    home();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Tester mon prix actuel" }));
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await user.type(screen.getByLabelText(/ventes par mois/i), "2000");

    expect(draft().modeResultat).toBe("monPrix");
    expect(within(screen.getByRole("radiogroup", { name: /prix à afficher/i })).getByRole("radio", { name: "Mon prix" })).toBeChecked();
  });
});

describe("derniers prix", () => {
  it("en montre trois au plus, le plus récent d'abord", () => {
    seedPrices(["Un", "Deux", "Trois", "Quatre"]);
    home();
    render(<App />);
    const list = screen.getByRole("list", { name: /derniers prix/i });
    const names = within(list).getAllByRole("link").map((link) => link.textContent);
    expect(names.map((name) => name?.replace(/\s+\d.*$/, ""))).toEqual(["Quatre", "Trois", "Deux"]);
    expect(screen.queryByText(/aucun prix enregistré/i)).not.toBeInTheDocument();
  });

  it("ouvre un prix d'un appui", async () => {
    const user = userEvent.setup();
    seedPrices(["Jus de bissap"]);
    home();
    render(<App />);

    await user.click(within(screen.getByRole("list", { name: /derniers prix/i })).getAllByRole("link")[0] as HTMLElement);

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });
});
