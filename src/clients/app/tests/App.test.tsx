import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

const costField = () => screen.getByLabelText(/ce que ça vous coûte/i);
const fixedField = () => screen.getByLabelText(/charges du mois/i);
const volumeField = () => screen.getByLabelText(/ventes par mois/i);

describe("App — premier prix en trois nombres", () => {
  it("n'affiche aucun prix tant que rien n'est saisi", () => {
    render(<App />);
    expect(screen.queryByTestId("price")).not.toBeInTheDocument();
    expect(screen.getByText(/trois nombres/i)).toBeInTheDocument();
  });

  it("calcule le prix conseillé du bissap : 450 F (vecteur de référence)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(costField(), "210");
    await user.type(fixedField(), "220000");
    await user.type(volumeField(), "2000");

    expect(screen.getByTestId("price")).toHaveTextContent("450");
    expect(screen.getByTestId("full-cost")).toHaveTextContent("320");
    expect(screen.getByTestId("break-even")).toHaveTextContent("935");
  });

  it("met à jour le prix en direct quand une valeur change", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "210");
    await user.type(fixedField(), "220000");
    await user.type(volumeField(), "2000");
    expect(screen.getByTestId("price")).toHaveTextContent("450");

    await user.clear(volumeField());
    await user.type(volumeField(), "1000");

    expect(screen.getByTestId("price")).not.toHaveTextContent("450");
  });

  it("demande le volume au lieu d'afficher un prix faux (RG-08)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "210");
    await user.type(fixedField(), "220000");

    expect(screen.getByRole("status")).toHaveTextContent(
      /combien en vendez-vous par mois/i,
    );
    expect(screen.queryByTestId("price")).not.toBeInTheDocument();
  });

  it("n'accepte que des chiffres dans les champs numériques", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "2a1b0");
    expect(costField()).toHaveValue("210");
  });

  it("ignore la saisie au-delà de 12 chiffres sans vider le champ", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "9999999999999");
    expect((costField() as HTMLInputElement).value.replace(/\D/g, "")).toBe(
      "999999999999",
    );
  });

  it("ne recharge pas la page quand on valide avec Entrée", () => {
    render(<App />);
    const form = screen.getByRole("form", { name: /trois questions/i });
    // fireEvent renvoie false quand preventDefault a été appelé.
    expect(fireEvent.submit(form)).toBe(false);
  });

  it("demande le prix de revient quand le coût par vente est nul", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(costField(), "0");
    await user.type(fixedField(), "0");
    await user.type(volumeField(), "10");
    expect(screen.getByRole("status")).toHaveTextContent(/combien vous coûte une vente/i);
  });

  it("sépare les milliers dans la saisie", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(fixedField(), "220000");
    expect((fixedField() as HTMLInputElement).value.replace(/\s/g, " ")).toBe(
      "220 000",
    );
  });
});
