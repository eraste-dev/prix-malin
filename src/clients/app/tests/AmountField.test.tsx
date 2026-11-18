import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AmountField } from "../src/components/AmountField";

const noop = () => undefined;

describe("AmountField — exemple en filigrane et unité dans le champ", () => {
  it("montre l'exemple comme placeholder, pas comme texte sous le libellé", () => {
    render(
      <AmountField id="cost" label="Coût" hint="Comptez tout." example="210" unit="FCFA" value={null} onChange={noop} />,
    );
    expect(screen.getByLabelText("Coût")).toHaveAttribute("placeholder", "ex. 210");
  });

  it("affiche l'unité FCFA à l'intérieur du champ, à droite", () => {
    render(<AmountField id="cost" label="Coût" unit="FCFA" value={null} onChange={noop} />);
    const input = screen.getByLabelText("Coût");
    const unit = screen.getByText("FCFA");
    expect(unit.parentElement).toContainElement(input);
    // Superposée au champ (positionnement relatif), pas à côté dans une rangée.
    expect(unit.parentElement).toHaveClass("relative");
    expect(input).toHaveClass("pr-20");
  });

  it("garde la consigne accessible aux lecteurs d'écran, même sans texte visible", () => {
    render(
      <AmountField id="cost" label="Coût" hint="Comptez tout." example="210" unit="FCFA" value={null} onChange={noop} />,
    );
    expect(screen.getByLabelText("Coût")).toHaveAccessibleDescription(/comptez tout/i);
  });

  it("n'affiche pas d'unité quand il n'y en a pas (nombre de ventes)", () => {
    render(<AmountField id="volume" label="Ventes" example="200" value={null} onChange={noop} />);
    expect(screen.queryByText("FCFA")).not.toBeInTheDocument();
  });
});
