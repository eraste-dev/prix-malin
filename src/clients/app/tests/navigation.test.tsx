import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

describe("Navigation basse", () => {
  it("affiche le calcul par défaut, avec « Calculer » actif", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Calculer" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toBeVisible();
  });

  it("ouvre les réglages (thème) et revient au calcul sans perdre la saisie", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");

    await user.click(screen.getByRole("button", { name: "Réglages" }));
    expect(screen.getByRole("radiogroup", { name: "Thème" })).toBeVisible();
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).not.toBeVisible();

    await user.click(screen.getByRole("button", { name: "Calculer" }));
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });

  it("salue sans prénom et donne la date du jour en français", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/votre prix/i);
    expect(screen.getByTestId("today")).toHaveTextContent(/\d{1,2}/);
  });
});
