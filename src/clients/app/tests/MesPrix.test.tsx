import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";
import { bissap, seedPrices } from "./helpers";

/** Mes prix (E09, MP-01, MP-02) : retrouver, rouvrir, dupliquer, supprimer avec annulation. */
const open = () => {
  window.location.hash = "#/prix";
};
const rows = () => screen.queryAllByRole("listitem").filter((li) => li.hasAttribute("data-price-id"));
const names = () => rows().map((row) => within(row).getByRole("heading", { level: 2 }).textContent);
const storedPrices = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) ?? '{"state":{"prices":[]}}').state.prices;

async function openMenu(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: `Actions pour ${name}` }));
}

describe("liste vide", () => {
  it("invite à calculer le premier prix, sans bloc cassé", () => {
    open();
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/mes prix/i);
    expect(rows()).toHaveLength(0);
    expect(screen.getByRole("link", { name: /calculer mon premier prix/i })).toHaveAttribute("href", "#/calculer");
  });
});

describe("liste", () => {
  it("montre le plus récent en premier, avec nom, prix, type et marge", () => {
    seedPrices(["Ancien", "Récent"]);
    open();
    render(<App />);
    expect(names()).toEqual(["Récent", "Ancien"]);
    const first = rows()[0] as HTMLElement;
    expect(first).toHaveTextContent("450");
    expect(first).toHaveTextContent(/je fabrique/i);
    expect(first).toHaveTextContent(/27,9 %/);
  });

  it("accepte deux produits de même nom : deux lignes distinctes (MP-02)", () => {
    seedPrices(["Jus", "Jus"]);
    open();
    render(<App />);
    expect(names()).toEqual(["Jus", "Jus"]);
    expect(new Set(rows().map((row) => row.getAttribute("data-price-id"))).size).toBe(2);
  });

  it("un seul prix : un mot d'encouragement", () => {
    seedPrices(["Seul"]);
    open();
    render(<App />);
    expect(screen.getByText(/un premier prix/i)).toBeInTheDocument();
  });

  it("la recherche n'apparaît qu'à partir de 6 prix", async () => {
    const user = userEvent.setup();
    seedPrices(["a1", "b2", "c3", "d4", "e5"]);
    open();
    const first = render(<App />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    first.unmount();

    seedPrices(["Bissap", "Gingembre"]);
    render(<App />);
    const search = screen.getByRole("searchbox", { name: /rechercher/i });
    await user.type(search, "gin");
    expect(names()).toEqual(["Gingembre"]);
  });
});

describe("rouvrir un prix", () => {
  it("charge ses valeurs dans Calculer ; « Enregistrer » propose alors « Mettre à jour »", async () => {
    const user = userEvent.setup();
    seedPrices(["Jus de bissap"]);
    open();
    render(<App />);

    await user.click(within(rows()[0] as HTMLElement).getByRole("link", { name: /jus de bissap/i }));

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
    expect(screen.getByTestId("price")).toHaveTextContent("450");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(await screen.findByRole("button", { name: "Mettre à jour" })).toBeInTheDocument();
  });
});

describe("actions", () => {
  it("duplique un prix : « (copie) » au-dessus de l'original", async () => {
    const user = userEvent.setup();
    seedPrices(["Jus"]);
    open();
    render(<App />);

    await openMenu(user, "Jus");
    await user.click(await screen.findByRole("menuitem", { name: /dupliquer/i }));

    expect(names()).toEqual(["Jus (copie)", "Jus"]);
    expect(storedPrices()).toHaveLength(2);
  });

  it("supprime avec un bandeau « Annuler » : le prix revient à sa place (MP-01)", async () => {
    const user = userEvent.setup();
    seedPrices(["A", "B", "C"]);
    open();
    render(<App />);
    expect(names()).toEqual(["C", "B", "A"]);

    await openMenu(user, "B");
    await user.click(await screen.findByRole("menuitem", { name: /supprimer/i }));
    expect(names()).toEqual(["C", "A"]);
    expect((await screen.findAllByText(/prix supprimé/i)).length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Annuler" }));

    expect(names()).toEqual(["C", "B", "A"]);
  });

  it("« Nouveau calcul » repart d'un brouillon vierge", async () => {
    const user = userEvent.setup();
    seedPrices(["Jus"]);
    open();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /nouveau calcul/i }));

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("");
  });
});

it("n'accepte que des données valides : un prix abîmé est écarté et signalé (E14)", () => {
  seedPrices(["Bon"]);
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string);
  raw.state.prices.push({ id: "x", nom: 5 });
  localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify(raw));
  open();
  render(<App />);
  expect(names()).toEqual(["Bon"]);
  expect(screen.getByRole("alert")).toHaveTextContent(/1 prix n'a pas pu être relu/i);
  expect(bissap().nom).toBe("Jus de bissap");
});
