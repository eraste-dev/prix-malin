import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

/** Résultat : mode « mon prix » (E05, RG-09), verdict (RES-04), concurrent (RG-10), arrondi (RG-06), TVA (RG-06). */
type User = ReturnType<typeof userEvent.setup>;

async function fillBissap(user: User) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const modeGroup = () => within(screen.getByRole("radiogroup", { name: /prix à afficher/i }));
const price = () => screen.getByTestId("price");

async function ownPrice(user: User, value: string) {
  await user.click(modeGroup().getByRole("radio", { name: "Mon prix" }));
  await user.type(screen.getByLabelText(/votre prix actuel/i), value);
}

describe("bascule « Prix conseillé ⇄ Mon prix »", () => {
  it("affiche le prix conseillé par défaut", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(modeGroup().getByRole("radio", { name: "Prix conseillé" })).toBeChecked();
    expect(price()).toHaveTextContent("450");
    expect(screen.queryByLabelText(/votre prix actuel/i)).not.toBeInTheDocument();
  });

  it("« Mon prix » demande le prix actuel avant d'afficher un verdict", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(modeGroup().getByRole("radio", { name: "Mon prix" }));

    expect(screen.getByLabelText(/votre prix actuel/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/à quel prix vendez-vous/i);
    expect(screen.queryByTestId("price")).not.toBeInTheDocument();
  });

  it("retient le mode choisi après un rechargement", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    await fillBissap(user);
    await user.click(modeGroup().getByRole("radio", { name: "Mon prix" }));
    first.unmount();

    render(<App />);
    expect(modeGroup().getByRole("radio", { name: "Mon prix" })).toBeChecked();
  });
});

describe("verdict du prix actuel (RES-04 : icône et texte)", () => {
  it.each([
    ["200", "LOSS_PER_SALE", /perdez de l'argent à chaque vente/i],
    ["300", "FIXED_COSTS_NOT_COVERED", /charges ne sont pas couvertes/i],
    ["450", "PROFITABLE", /gagner de l'argent/i],
  ])("prix %s F : %s", async (value, kind, title) => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await ownPrice(user, value);

    const verdict = screen.getByRole("region", { name: /verdict/i });
    expect(verdict).toHaveAttribute("data-verdict", kind);
    expect(within(verdict).getByTestId("verdict-title")).toHaveTextContent(title);
    expect(verdict.querySelector("svg")).not.toBeNull(); // jamais la couleur seule
    expect(price()).toHaveTextContent(value);
  });

  it("le prix actuel remplace « Votre prix conseillé » dans l'intitulé, et le conseillé reste en comparaison", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await ownPrice(user, "300");

    expect(screen.getByText("Votre prix actuel", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByTestId("recommended")).toHaveTextContent("450");
  });

  it("n'affiche aucun verdict pour le prix conseillé", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(screen.queryByRole("region", { name: /verdict/i })).not.toBeInTheDocument();
  });
});

describe("prix du concurrent (RG-10)", () => {
  const competitor = () => screen.getByLabelText(/prix du concurrent/i);

  it("est facultatif : aucune comparaison tant qu'il n'est pas saisi", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(screen.queryByTestId("competitor-note")).not.toBeInTheDocument();
  });

  it.each([
    ["380", /plus cher/i],
    ["300", /moins cher que son coût/i],
    ["450", /au niveau/i],
    ["300000", /moins cher/i],
  ])("concurrent à %s F", async (value, expected) => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.type(competitor(), value);

    expect(screen.getByTestId("competitor-note")).toHaveTextContent(expected);
  });
});

describe("arrondi (RG-06) : toujours vers le haut, jamais sous le prix brut", () => {
  const roundingSwitch = () => screen.getByRole("switch", { name: /arrondir/i });

  it("est activé par défaut, au pas du type d'activité (25 F)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(roundingSwitch()).toBeChecked();
    expect(within(screen.getByRole("radiogroup", { name: /pas d'arrondi/i })).getByRole("radio", { name: "25 F" })).toBeChecked();
  });

  it("désactivé : arrondi au franc supérieur (432,43 → 433 F)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(roundingSwitch());

    expect(price()).toHaveTextContent("433");
    expect(screen.queryByRole("radiogroup", { name: /pas d'arrondi/i })).not.toBeInTheDocument();
  });

  it("un pas de 100 F donne 500 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(within(screen.getByRole("radiogroup", { name: /pas d'arrondi/i })).getByRole("radio", { name: "100 F" }));

    expect(price()).toHaveTextContent("500");
  });
});

describe("TVA (RG-06) : facultative, désactivée par défaut", () => {
  const vatSwitch = () => screen.getByRole("switch", { name: /tva/i });

  it("est désactivée par défaut et sans choix HT / TTC", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    expect(vatSwitch()).not.toBeChecked();
    expect(screen.queryByRole("radiogroup", { name: /prix affiché/i })).not.toBeInTheDocument();
  });

  it("activée en HT : le prix reste 450 F HT, le TTC est donné à côté", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(vatSwitch());

    expect(price()).toHaveTextContent("450");
    expect(screen.getByTestId("price-other")).toHaveTextContent(/TTC/);
    expect(screen.getByTestId("price-other")).toHaveTextContent("531");
  });

  it("en TTC, le prix TTC est arrondi : 525 F (RES-03)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(vatSwitch());

    await user.click(within(screen.getByRole("radiogroup", { name: /prix affiché/i })).getByRole("radio", { name: "TTC" }));

    expect(price()).toHaveTextContent("525");
    expect(screen.getByTestId("price-other")).toHaveTextContent(/HT/);
  });
});
