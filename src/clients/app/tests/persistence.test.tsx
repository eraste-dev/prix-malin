import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";

/** Le brouillon survit au rechargement (docs/13 : « Rien n'est perdu »), et un stockage abîmé ne plante jamais l'app. */
const costField = () => screen.getByLabelText(/ce que ça vous coûte/i);

describe("brouillon automatique", () => {
  it("retrouve les montants saisis après un rechargement", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.type(costField(), "210");
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
    expect(screen.getByTestId("price")).toHaveTextContent("450");
    first.unmount();

    render(<App />);

    expect(costField()).toHaveValue("210");
    expect(screen.getByTestId("price")).toHaveTextContent("450");
  });

  it("retrouve le type d'activité et les réglages de marge", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await user.click(screen.getByRole("radio", { name: /prestation/i }));
    first.unmount();

    render(<App />);

    expect(screen.getByRole("radio", { name: /prestation/i })).toBeChecked();
  });

  it("écrit le brouillon dans le stockage local, sous un schéma versionné", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "210");

    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) ?? "{}");
    expect(raw.version).toBe(1);
    expect(raw.state.calcul.schema).toBe(1);
    expect(raw.state.calcul.coutDirect.total).toBe(210);
  });
});

describe("stockage abîmé (E14)", () => {
  it("un brouillon illisible ne plante pas l'app : calcul vierge", () => {
    localStorage.setItem(STORAGE_KEYS.draft, "{pas du json");
    render(<App />);
    expect(costField()).toHaveValue("");
  });

  it("un brouillon hors schéma (marge 99) est écarté", () => {
    localStorage.setItem(
      STORAGE_KEYS.draft,
      JSON.stringify({ state: { calcul: { schema: 1, marge: 99 } }, version: 1 }),
    );
    render(<App />);
    expect(costField()).toHaveValue("");
  });

  it("un navigateur sans stockage disponible reste utilisable", async () => {
    const user = userEvent.setup();
    const failing = { getItem: () => null, setItem: () => { throw new Error("quota"); }, removeItem: () => undefined };
    render(<App storage={failing} />);
    await user.type(costField(), "210");
    expect(costField()).toHaveValue("210");
  });
});
