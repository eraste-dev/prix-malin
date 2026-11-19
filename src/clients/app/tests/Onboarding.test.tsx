import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";
import { bissap, seedDraft } from "./helpers";

/** Onboarding (docs/14, ONB-01 à ONB-06) et exemple guidé. Aucune demande de compte, de notification ni de position. */
function firstLaunch(hash = "#/") {
  localStorage.clear();
  window.location.hash = hash;
}
const card = (title: RegExp) => screen.getByRole("heading", { level: 1, name: title });
const settings = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) ?? "{}").state;

describe("premier lancement", () => {
  it("ONB-01 : ouvre la carte 1, avec « Passer » visible, sans barre de navigation", () => {
    firstLaunch();
    render(<App />);
    expect(card(/le bon prix, en une minute/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Passer" })).toBeVisible();
    expect(screen.queryByRole("navigation", { name: /principale/i })).not.toBeInTheDocument();
  });

  it("un drapeau illisible est traité comme un premier lancement, sans erreur", () => {
    localStorage.setItem(STORAGE_KEYS.settings, "n'importe quoi");
    window.location.hash = "#/";
    render(<App />);
    expect(card(/le bon prix/i)).toBeInTheDocument();
  });

  it("ne s'affiche plus aux lancements suivants", async () => {
    const user = userEvent.setup();
    firstLaunch();
    const first = render(<App />);
    await user.click(screen.getByRole("button", { name: "Passer" }));
    first.unmount();

    window.location.hash = "#/";
    render(<App />);

    expect(screen.getByRole("button", { name: "Calculer un prix" })).toBeInTheDocument();
  });
});

describe("les trois cartes", () => {
  it("avancent et reculent en gardant l'état", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(card(/trois questions, c'est tout/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(card(/vos chiffres restent chez vous/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retour" }));

    expect(card(/trois questions, c'est tout/i)).toBeInTheDocument();
  });

  it("« Passer » est atteignable sur chaque carte", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    for (let i = 0; i < 2; i += 1) {
      expect(screen.getByRole("button", { name: "Passer" })).toBeVisible();
      await user.click(screen.getByRole("button", { name: "Suivant" }));
    }
    expect(screen.getByRole("button", { name: "Passer" })).toBeVisible();
  });

  it("ONB-02 : « Passer » mène à l'Accueil et ne revient pas", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    await user.click(screen.getByRole("button", { name: "Passer" }));

    expect(screen.getByRole("button", { name: "Calculer un prix" })).toBeInTheDocument();
    expect(settings().onboardingSeen).toBeGreaterThanOrEqual(1);
  });

  it("la dernière carte propose deux issues : calculer, ou voir un exemple", async () => {
    const user = userEvent.setup();
    firstLaunch();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    expect(screen.getByRole("button", { name: "Calculer mon prix" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voir un exemple d'abord" })).toBeInTheDocument();
  });

  it("ne demande ni compte, ni notification, ni position", () => {
    firstLaunch();
    render(<App />);
    expect(screen.queryByText(/compte|notification|position|e-mail|email/i)).not.toBeInTheDocument();
  });

  it("ONB-03 : « Calculer mon prix » ouvre Q1 avec tous les champs vides", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    firstLaunch("#/bienvenue");
    seedDraft(bissap());
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));

    await user.click(screen.getByRole("button", { name: "Calculer mon prix" }));

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("");
    expect(settings().onboardingSeen).toBeGreaterThanOrEqual(1);
  });
});

describe("exemple guidé", () => {
  async function openExample(user: ReturnType<typeof userEvent.setup>) {
    firstLaunch();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    await user.click(screen.getByRole("button", { name: "Voir un exemple d'abord" }));
  }

  it("montre un calcul déjà rempli (bissap, 450 F), clairement étiqueté « Exemple »", async () => {
    const user = userEvent.setup();
    await openExample(user);

    expect(window.location.hash).toBe("#/exemple");
    expect(screen.getByTestId("example-banner")).toHaveTextContent(/exemple/i);
    expect(screen.getByTestId("price")).toHaveTextContent("450");
  });

  it("guide en quatre bulles passables, puis propose « Faire le mien »", async () => {
    const user = userEvent.setup();
    await openExample(user);
    const coach = screen.getByRole("region", { name: /visite de l'exemple/i });

    expect(coach).toHaveTextContent(/voici le prix à viser : 450 F/i);
    await user.click(within(coach).getByRole("button", { name: "Suivant" }));
    expect(coach).toHaveTextContent(/d'où vient ce prix/i);
    await user.click(within(coach).getByRole("button", { name: "Suivant" }));
    expect(coach).toHaveTextContent(/changez la marge/i);
    await user.click(within(coach).getByRole("button", { name: "Suivant" }));
    expect(coach).toHaveTextContent(/gardez vos prix/i);
    expect(within(coach).getByRole("button", { name: "Faire le mien" })).toBeInTheDocument();
  });

  it("« Faire le mien » ouvre Q1 avec les champs vides", async () => {
    const user = userEvent.setup();
    await openExample(user);

    const coach = screen.getByRole("region", { name: /visite de l'exemple/i });
    for (let i = 0; i < 3; i += 1) await user.click(within(coach).getByRole("button", { name: "Suivant" }));
    await user.click(within(coach).getByRole("button", { name: "Faire le mien" }));

    expect(window.location.hash).toBe("#/calculer");
    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("");
  });

  it("l'exemple est essayable : changer la marge change le prix", async () => {
    const user = userEvent.setup();
    await openExample(user);

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    expect(screen.getByTestId("price")).toHaveTextContent("375");
  });

  it("ONB-04 : rien n'est ajouté à « Mes prix », même en enregistrant dans l'exemple", async () => {
    const user = userEvent.setup();
    await openExample(user);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));

    await user.click(screen.getByRole("button", { name: /quitter l'exemple/i }));
    await user.click(screen.getByRole("link", { name: "Mes prix" }));

    expect(localStorage.getItem(STORAGE_KEYS.prices)).toBeNull();
    expect(screen.getByText(/aucun prix enregistré/i)).toBeInTheDocument();
  });

  it("n'écrit pas non plus sur le brouillon de l'utilisateur", async () => {
    const user = userEvent.setup();
    await openExample(user);
    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBeNull();
  });
});

describe("revoir la présentation (ONB-05)", () => {
  it("rejoue l'onboarding sans modifier les données", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    window.location.hash = "#/bienvenue";
    render(<App />);
    expect(card(/le bon prix/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Passer" }));
    await user.click(screen.getByRole("link", { name: "Reprendre" }));

    expect(screen.getByLabelText(/ce que ça vous coûte/i)).toHaveValue("210");
  });
});
