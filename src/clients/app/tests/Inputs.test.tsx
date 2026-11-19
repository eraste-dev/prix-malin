import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

/** Q1 (nom, unité), Q2 (coût direct, Total ou Détail), Q3 (charges, pastilles, rémunération) — docs/15 E02 à E04. */
type User = ReturnType<typeof userEvent.setup>;

const costMode = () => within(screen.getByRole("radiogroup", { name: /saisie du coût/i }));
const chargesMode = () => within(screen.getByRole("radiogroup", { name: /saisie des charges/i }));
const price = () => screen.queryByTestId("price");

async function fillVolume(user: User, value = "2000") {
  await user.type(screen.getByLabelText(/ventes par mois/i), value);
}

describe("Q1 — nom et unité de vente (EXG-02)", () => {
  it("le nom est facultatif et accepte « Jus de bissap »", async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = screen.getByLabelText(/nom/i);
    expect(field).toHaveValue("");
    await user.type(field, "Jus de bissap");
    expect(field).toHaveValue("Jus de bissap");
  });

  it("propose l'unité du type choisi et la garde modifiable", async () => {
    const user = userEvent.setup();
    render(<App />);
    const unit = screen.getByLabelText(/vendu par/i);
    expect(unit).toHaveValue("unité");

    await user.click(screen.getByRole("radio", { name: /achat-revente/i }));
    expect(unit).toHaveValue("pièce");

    await user.clear(unit);
    await user.type(unit, "bouteille");
    await user.click(screen.getByRole("radio", { name: /prestation/i }));
    expect(unit).toHaveValue("bouteille");
  });

  it("aucun texte n'est obligatoire pour obtenir un prix", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await fillVolume(user);
    expect(price()).toHaveTextContent("450");
  });
});

describe("Q2 — coût direct : Total ou Détail", () => {
  it("est en mode Total par défaut", () => {
    render(<App />);
    expect(costMode().getByRole("radio", { name: "Total" })).toBeChecked();
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toBeInTheDocument();
  });

  it("Total → Détail : le total devient la première ligne, sans perte (Q2-02)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");

    await user.click(costMode().getByRole("radio", { name: "Détail" }));

    expect(screen.getByLabelText(/prix unitaire de la ligne 1/i)).toHaveValue("210");
    expect(screen.getByLabelText(/quantité de la ligne 1/i)).toHaveValue("1");
  });

  it("une pastille de suggestion ajoute une ligne nommée et place le curseur sur son montant (Q2-03)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Détail" }));

    await user.click(screen.getByRole("button", { name: "+ Transport" }));

    expect(screen.getByLabelText(/libellé de la ligne 1/i)).toHaveValue("Transport");
    expect(screen.getByLabelText(/prix unitaire de la ligne 1/i)).toHaveFocus();
  });

  it("calcule le total ligne par ligne : quantité décimale admise (0,5 kg)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: /ajouter une ligne/i }));
    await user.clear(screen.getByLabelText(/quantité de la ligne 1/i));
    await user.type(screen.getByLabelText(/quantité de la ligne 1/i), "0,5");
    await user.type(screen.getByLabelText(/prix unitaire de la ligne 1/i), "420");

    expect(screen.getByTestId("cost-total")).toHaveTextContent("210");
  });

  it("le détail alimente le prix comme le total équivalent : 450 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: /ajouter une ligne/i }));
    await user.type(screen.getByLabelText(/prix unitaire de la ligne 1/i), "210");
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await fillVolume(user);
    expect(price()).toHaveTextContent("450");
  });

  it("supprime une ligne par son bouton", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: "+ Emballage" }));
    await user.click(screen.getByRole("button", { name: "+ Pertes" }));

    await user.click(screen.getByRole("button", { name: /supprimer la ligne 1/i }));

    expect(screen.getByLabelText(/libellé de la ligne 1/i)).toHaveValue("Pertes");
    expect(screen.queryByLabelText(/libellé de la ligne 2/i)).not.toBeInTheDocument();
  });

  it("Détail → Total additionne les lignes", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: /ajouter une ligne/i }));
    await user.type(screen.getByLabelText(/prix unitaire de la ligne 1/i), "150");
    await user.click(screen.getByRole("button", { name: /ajouter une ligne/i }));
    await user.type(screen.getByLabelText(/prix unitaire de la ligne 2/i), "60");

    await user.click(costMode().getByRole("radio", { name: "Total" }));

    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });

  it("recliquer le mode actif ne change rien", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(costMode().getByRole("radio", { name: "Total" }));
    expect(costMode().getByRole("radio", { name: "Total" })).toBeChecked();
  });
});

describe("Q3 — charges du mois : Total ou Détail en pastilles", () => {
  it("est en mode Total par défaut", () => {
    render(<App />);
    expect(chargesMode().getByRole("radio", { name: "Total" })).toBeChecked();
  });

  it("propose les charges courantes en pastilles, « Ma rémunération » en tête", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(chargesMode().getByRole("radio", { name: "Détail" }));

    const names = ["Ma rémunération", "Loyer", "Électricité", "Eau", "Téléphone", "Transport", "Aide ou salarié"];
    for (const name of names) {
      expect(screen.getByRole("button", { name, pressed: false })).toBeInTheDocument();
    }
    const first = screen.getAllByRole("button", { pressed: false }).find((b) => names.includes(b.textContent ?? ""));
    expect(first).toHaveTextContent("Ma rémunération");
  });

  it("cocher une pastille ouvre son montant ; la décocher le retire", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(chargesMode().getByRole("radio", { name: "Détail" }));

    await user.click(screen.getByRole("button", { name: "Loyer" }));
    const amount = screen.getByLabelText(/montant : loyer/i);
    expect(screen.getByRole("button", { name: "Loyer", pressed: true })).toBeInTheDocument();
    await user.type(amount, "100000");
    expect(screen.getByTestId("charges-total")).toHaveTextContent("100");

    await user.click(screen.getByRole("button", { name: "Loyer", pressed: true }));
    expect(screen.queryByLabelText(/montant : loyer/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("charges-total")).not.toBeInTheDocument();
  });

  it("le total des charges cochées donne le même prix que le total équivalent : 450 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
    await user.click(chargesMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: "Loyer" }));
    await user.type(screen.getByLabelText(/montant : loyer/i), "100000");
    await user.click(screen.getByRole("button", { name: "Ma rémunération" }));
    await user.type(screen.getByLabelText(/montant : ma rémunération/i), "120000");
    await fillVolume(user);

    expect(price()).toHaveTextContent("450");
  });

  it("une autre charge se nomme librement", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(chargesMode().getByRole("radio", { name: "Détail" }));

    await user.click(screen.getByRole("button", { name: /autre charge/i }));
    await user.type(screen.getByLabelText(/nom de la charge 1/i), "Assurance");
    await user.type(screen.getByLabelText(/montant : assurance/i), "5000");

    expect(screen.getByTestId("charges-total")).toHaveTextContent("5");
  });

  it("affiche la part de charges par vente en direct (Q3-03) : 110 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByTestId("fixed-per-unit")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");
    await fillVolume(user);
    expect(screen.getByTestId("fixed-per-unit")).toHaveTextContent("110");
  });
});

describe("rappel « Avez-vous compté votre salaire ? » (docs/13, Q-28)", () => {
  const reminder = () => screen.queryByRole("group", { name: /compté votre salaire/i });

  it("n'apparaît pas tant que les charges ne sont pas saisies", () => {
    render(<App />);
    expect(reminder()).not.toBeInTheDocument();
  });

  it("apparaît, non bloquant, quand un total de charges est saisi sans rémunération", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");

    const box = reminder();
    expect(box).toBeInTheDocument();
    expect(within(box as HTMLElement).getByRole("button", { name: /l'ajouter/i })).toBeInTheDocument();
    expect(within(box as HTMLElement).getByRole("button", { name: /continuer/i })).toBeInTheDocument();
  });

  it("« Continuer » le ferme, et il ne revient pas pour ce calcul", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");

    await user.click(screen.getByRole("button", { name: /continuer/i }));
    await user.type(screen.getByLabelText(/charges du mois/i), "0");

    expect(reminder()).not.toBeInTheDocument();
  });

  it("« L'ajouter » passe en détail avec « Ma rémunération » et place le curseur sur son montant", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/charges du mois/i), "220000");

    await user.click(screen.getByRole("button", { name: /l'ajouter/i }));

    expect(chargesMode().getByRole("radio", { name: "Détail" })).toBeChecked();
    expect(screen.getByRole("button", { name: "Ma rémunération", pressed: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/montant : ma rémunération/i)).toHaveFocus();
    expect(reminder()).not.toBeInTheDocument();
  });

  it("n'apparaît pas quand « Ma rémunération » est déjà cochée", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(chargesMode().getByRole("radio", { name: "Détail" }));
    await user.click(screen.getByRole("button", { name: "Loyer" }));
    await user.type(screen.getByLabelText(/montant : loyer/i), "100000");
    await user.click(screen.getByRole("button", { name: "Ma rémunération" }));
    expect(reminder()).not.toBeInTheDocument();
  });
});
