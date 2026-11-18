import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

/** Q1 « Que vendez-vous ? » (docs/15 E02) : EXG-01 (type et défauts), EXG-03 (confirmation). */
type User = ReturnType<typeof userEvent.setup>;

async function fillBissap(user: User) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const typeGroup = () => within(screen.getByRole("radiogroup", { name: /que vendez-vous/i }));
const marginGroup = () => within(screen.getByRole("radiogroup", { name: /marge/i }));
const feeGroup = () => within(screen.getByRole("radiogroup", { name: /frais de paiement/i }));
const currentMargin = () => screen.getByTestId("margin-current");

describe("Q1 — type d'activité", () => {
  it("propose les trois types, « Je fabrique » choisi par défaut", () => {
    render(<App />);
    expect(typeGroup().getByRole("radio", { name: /achat-revente/i })).toBeInTheDocument();
    expect(typeGroup().getByRole("radio", { name: /prestation/i })).toBeInTheDocument();
    expect(typeGroup().getByRole("radio", { name: /je fabrique/i })).toBeChecked();
  });

  it("applique les défauts d'achat-revente : marge 20 %, frais 1 %, arrondi à 500 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(typeGroup().getByRole("radio", { name: /achat-revente/i }));

    expect(typeGroup().getByRole("radio", { name: /achat-revente/i })).toBeChecked();
    expect(currentMargin()).toHaveTextContent("20 %");
    expect(feeGroup().getByRole("radio", { name: /mobile money/i })).toBeChecked();
    expect(screen.getByTestId("price")).toHaveTextContent("500");
  });

  it("applique les défauts de prestation : marge 30 %, frais 0 % (espèces)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(typeGroup().getByRole("radio", { name: /prestation/i }));

    expect(currentMargin()).toHaveTextContent("30 %");
    expect(feeGroup().getByRole("radio", { name: /espèces/i })).toBeChecked();
  });

  it("change de type sans confirmation tant que la marge et les frais n'ont pas été modifiés", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(typeGroup().getByRole("radio", { name: /prestation/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("garde les montants saisis quand le type change", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(typeGroup().getByRole("radio", { name: /prestation/i }));

    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
    // Le séparateur de milliers de fr-FR est une espace fine insécable.
    expect((screen.getByLabelText(/ventes par mois/i) as HTMLInputElement).value).toMatch(/^2\D000$/);
  });

  it("demande confirmation si la marge a été ajustée (EXG-03) ; annuler ne change rien", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(marginGroup().getByRole("radio", { name: "10 %" }));

    await user.click(typeGroup().getByRole("radio", { name: /prestation/i }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: /annuler/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(typeGroup().getByRole("radio", { name: /je fabrique/i })).toBeChecked();
    expect(currentMargin()).toHaveTextContent("10 %");
  });

  it("confirmer applique le nouveau type et ses défauts", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(marginGroup().getByRole("radio", { name: "10 %" }));

    await user.click(typeGroup().getByRole("radio", { name: /prestation/i }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: /changer/i }));

    expect(typeGroup().getByRole("radio", { name: /prestation/i })).toBeChecked();
    expect(currentMargin()).toHaveTextContent("30 %");
  });

  it("recliquer le type déjà choisi ne demande rien", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(marginGroup().getByRole("radio", { name: "10 %" }));

    await user.click(typeGroup().getByRole("radio", { name: /je fabrique/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(currentMargin()).toHaveTextContent("10 %");
  });
});
