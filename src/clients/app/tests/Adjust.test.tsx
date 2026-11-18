import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

/** Panneau « Ajuster » de l'écran Résultat (docs/15 E06, niveau 2). Marge : RG-04. Frais : Q-07. */
async function fillBissap(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const marginGroup = () => screen.getByRole("radiogroup", { name: /marge/i });
const feeGroup = () => screen.getByRole("radiogroup", { name: /frais de paiement/i });

describe("Ajuster le prix (résultat)", () => {
  it("n'affiche pas le panneau tant qu'il n'y a pas de prix", () => {
    render(<App />);
    expect(screen.queryByRole("radiogroup", { name: /marge/i })).not.toBeInTheDocument();
  });

  it("propose 10, 20, 30 et 40 % de marge, et indique la marge actuelle (25 %)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const group = within(marginGroup());
    for (const pct of ["10 %", "20 %", "30 %", "40 %"]) {
      expect(group.getByRole("radio", { name: pct })).toBeInTheDocument();
    }
    expect(screen.getByTestId("margin-current")).toHaveTextContent("25 %");
  });

  it("recalcule le prix quand on choisit une marge plus faible", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(screen.getByTestId("price")).toHaveTextContent("450");

    await user.click(within(marginGroup()).getByRole("radio", { name: "10 %" }));

    expect(screen.getByTestId("price")).toHaveTextContent("375");
    expect(within(marginGroup()).getByRole("radio", { name: "10 %" })).toBeChecked();
  });

  it("choisit Mobile Money (1 %) par défaut et recalcule avec des frais nuls en espèces", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    const fees = within(feeGroup());
    expect(fees.getByRole("radio", { name: /mobile money/i })).toBeChecked();
    expect(screen.getByTestId("break-even")).toHaveTextContent("935");

    await user.click(fees.getByRole("radio", { name: /espèces/i }));

    expect(fees.getByRole("radio", { name: /espèces/i })).toBeChecked();
    expect(screen.getByTestId("break-even")).toHaveTextContent("917");
  });

  it("garde les réglages quand une saisie change", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(within(marginGroup()).getByRole("radio", { name: "10 %" }));

    await user.clear(screen.getByLabelText(/ventes par mois/i));
    await user.type(screen.getByLabelText(/ventes par mois/i), "4000");

    expect(within(marginGroup()).getByRole("radio", { name: "10 %" })).toBeChecked();
  });
});
