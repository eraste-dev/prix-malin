import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { sharedShare, withSharedCharges } from "../src/lib/shared";
import { STORAGE_KEYS } from "../src/lib/storage";
import { bissap, seedPrices } from "./helpers";

/** Mon activité (E10, EXG-16) : saisir ses charges une seule fois, les répartir entre produits au prorata des ventes. */
const open = (hash = "#/activite") => {
  window.location.hash = hash;
};
const activityStore = () => JSON.parse(localStorage.getItem("pm:activity") ?? "null")?.state;

describe("sharedShare (répartition au prorata des ventes mensuelles, Q-27)", () => {
  it("un seul produit porte toutes les charges", () => {
    expect(sharedShare(220000, 2000, [])).toBe(220000);
  });

  it("deux produits de même volume se partagent les charges par moitié", () => {
    expect(sharedShare(220000, 2000, [2000])).toBe(110000);
  });

  it("répartit selon les ventes : 1 000 contre 3 000 → un quart des charges", () => {
    expect(sharedShare(100000, 1000, [3000])).toBe(25000);
  });

  it("sans volume, pas de part calculable", () => {
    expect(sharedShare(220000, null, [2000])).toBeNull();
  });
});

describe("withSharedCharges", () => {
  const shared = { ...bissap(), chargesFixes: { mode: "total" as const, total: 1, lignes: [], source: "activite" as const } };

  it("remplace les charges propres par la part des charges partagées", () => {
    const calcul = withSharedCharges(shared, 220000, [2000]);
    expect(calcul.chargesFixes).toMatchObject({ mode: "total", total: 110000, source: "activite" });
  });

  it("ne touche pas un calcul qui garde ses charges propres", () => {
    const own = bissap();
    expect(withSharedCharges(own, 220000, [2000])).toBe(own);
  });

  it("sans charges partagées saisies, garde le calcul tel quel", () => {
    expect(withSharedCharges(shared, 0, [2000])).toBe(shared);
  });
});

describe("page Mon activité", () => {
  it("explique le principe et propose les charges courantes", () => {
    open();
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/mon activité/i);
    expect(screen.getByText(/une seule fois/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Loyer", pressed: false })).toBeInTheDocument();
  });

  it("enregistre les charges partagées et garde le total", async () => {
    const user = userEvent.setup();
    open();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: "Loyer" }));
    await user.type(screen.getByLabelText(/montant : loyer/i), "100000");
    await user.click(screen.getByRole("button", { name: "Ma rémunération" }));
    await user.type(screen.getByLabelText(/montant : ma rémunération/i), "120000");
    expect(screen.getByTestId("charges-total")).toHaveTextContent("220");
    first.unmount();

    render(<App />);

    // Le séparateur de milliers de fr-FR est une espace fine insécable.
    expect((screen.getByLabelText(/montant : loyer/i) as HTMLInputElement).value).toMatch(/^100\D000$/);
    expect(activityStore().charges).toHaveLength(2);
  });

  it("montre la part de chaque produit enregistré, au prorata de ses ventes", async () => {
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    open();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Loyer" }));
    await user.type(screen.getByLabelText(/montant : loyer/i), "100000");

    const table = screen.getByRole("table", { name: /répartition/i });
    const rows = within(table).getAllByRole("row");
    expect(rows.some((r) => /Bissap/.test(r.textContent ?? "") && /25\s?000/.test(r.textContent ?? ""))).toBe(true);
    expect(rows.some((r) => /Gingembre/.test(r.textContent ?? "") && /75\s?000/.test(r.textContent ?? ""))).toBe(true);
  });
});

describe("dans Calculer", () => {
  async function shareCharges(user: ReturnType<typeof userEvent.setup>) {
    open();
    const view = render(<App />);
    await user.click(screen.getByRole("button", { name: "Loyer" }));
    await user.type(screen.getByLabelText(/montant : loyer/i), "220000");
    view.unmount();
  }

  it("ne propose le choix que lorsque des charges partagées existent", () => {
    open("#/calculer");
    render(<App />);
    expect(screen.queryByRole("radiogroup", { name: /origine des charges/i })).not.toBeInTheDocument();
  });

  it("« Mes charges partagées » remplace le champ par la part du produit (ici 100 % : 450 F)", async () => {
    const user = userEvent.setup();
    await shareCharges(user);
    open("#/calculer");
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.type(screen.getByLabelText(/ventes par mois/i), "2000");

    await user.click(within(screen.getByRole("radiogroup", { name: /origine des charges/i })).getByRole("radio", { name: /mes charges partagées/i }));

    expect(screen.queryByLabelText(/vos charges du mois/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("shared-share")).toHaveTextContent(/220\D000 F/);
    expect(screen.getByTestId("price")).toHaveTextContent("450");
  });

  it("la part baisse quand un autre produit existe : 375 F au lieu de 450 F", async () => {
    const user = userEvent.setup();
    await shareCharges(user);
    seedPrices(["Autre produit"], { volume: 2000 });
    open("#/calculer");
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.type(screen.getByLabelText(/ventes par mois/i), "2000");

    await user.click(within(screen.getByRole("radiogroup", { name: /origine des charges/i })).getByRole("radio", { name: /mes charges partagées/i }));

    expect(screen.getByTestId("shared-share")).toHaveTextContent(/110\D000 F/);
    expect(screen.getByTestId("price")).toHaveTextContent("375");
  });

  it("« Charges propres » rend la saisie libre", async () => {
    const user = userEvent.setup();
    await shareCharges(user);
    open("#/calculer");
    render(<App />);
    const group = () => within(screen.getByRole("radiogroup", { name: /origine des charges/i }));
    await user.click(group().getByRole("radio", { name: /mes charges partagées/i }));

    await user.click(group().getByRole("radio", { name: /charges propres/i }));

    expect(screen.getByLabelText(/vos charges du mois/i)).toBeInTheDocument();
  });
});

describe("invitation au deuxième produit (E10)", () => {
  it("n'apparaît pas avec un seul produit", () => {
    seedPrices(["A"]);
    open("#/prix");
    render(<App />);
    expect(screen.queryByRole("region", { name: /plusieurs produits/i })).not.toBeInTheDocument();
  });

  it("apparaît dès le deuxième produit et mène à Mon activité", async () => {
    const user = userEvent.setup();
    seedPrices(["A", "B"]);
    open("#/prix");
    render(<App />);

    const invite = screen.getByRole("region", { name: /plusieurs produits/i });
    await user.click(within(invite).getByRole("link", { name: /saisir mes charges/i }));

    expect(window.location.hash).toBe("#/activite");
  });

  it("« Plus tard » la ferme pour de bon", async () => {
    const user = userEvent.setup();
    seedPrices(["A", "B"]);
    open("#/prix");
    const view = render(<App />);
    await user.click(within(screen.getByRole("region", { name: /plusieurs produits/i })).getByRole("button", { name: /plus tard/i }));
    view.unmount();

    open("#/prix");
    render(<App />);

    expect(screen.queryByRole("region", { name: /plusieurs produits/i })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) as string).state.tipsSeen).toContain("activite-invite");
  });
});
