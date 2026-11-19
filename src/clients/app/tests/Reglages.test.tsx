import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { CONTENT_VERSION } from "../src/content/comprendre";
import { STORAGE_KEYS } from "../src/lib/storage";
import { bissap, seedDraft, seedPrices } from "./helpers";

/** Réglages (E13) : thème, présentation, aides, sauvegarde (EXG-44), confidentialité, à propos, effacement renforcé. */
beforeEach(() => {
  window.location.hash = "#/reglages";
});
afterEach(() => vi.restoreAllMocks());

const settings = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) ?? "{}").state;

describe("sections", () => {
  it("présente thème, présentation et aides, sauvegarde, confidentialité, à propos, données", () => {
    render(<App />);
    for (const name of [/thème/i, /présentation et aides/i, /sauvegarde/i, /confidentialité/i, /à propos/i, /vos données/i]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("dit que tout reste sur le téléphone", () => {
    render(<App />);
    expect(screen.getByText(/tout reste sur votre téléphone/i)).toBeInTheDocument();
  });

  it("donne la version de l'application et celle du contenu", () => {
    render(<App />);
    const about = screen.getByRole("region", { name: /à propos/i });
    expect(about).toHaveTextContent(/version de l'application\s*:?\s*\d+\.\d+\.\d+/i);
    expect(about).toHaveTextContent(new RegExp(`version du contenu\\s*:?\\s*${CONTENT_VERSION}`, "i"));
  });
});

describe("présentation et aides", () => {
  it("« Revoir la présentation » rouvre l'onboarding sans toucher aux données", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    render(<App />);

    await user.click(screen.getByRole("link", { name: /revoir la présentation/i }));

    expect(window.location.hash).toBe("#/bienvenue");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) as string).state.calcul.coutDirect.total).toBe(210);
  });

  it("« Réinitialiser les aides » les fait réapparaître", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ state: { onboardingSeen: 1, tipsSeen: ["q2", "q3"], lastActivity: null }, version: 1 }),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: /réinitialiser les aides/i }));

    expect(settings().tipsSeen).toEqual([]);
    expect((await screen.findAllByText(/aides réinitialisées/i)).length).toBeGreaterThan(0);
  });
});

describe("sauvegarde (EXG-44)", () => {
  it("l'export est désactivé tant qu'il n'y a aucun prix", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /exporter mes prix/i })).toBeDisabled();
  });

  it("exporte les prix dans un fichier daté, sans rien envoyer", async () => {
    const user = userEvent.setup();
    seedPrices(["Jus de bissap"]);
    let blob: Blob | null = null;
    URL.createObjectURL = vi.fn((b: Blob | MediaSource) => {
      blob = b as Blob;
      return "blob:prix";
    });
    URL.revokeObjectURL = vi.fn();
    let downloaded = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      downloaded = this.download;
    });
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    render(<App />);

    await user.click(screen.getByRole("button", { name: /exporter mes prix/i }));

    expect(downloaded).toMatch(/^prix-malin-\d{4}-\d{2}-\d{2}\.json$/);
    const content = JSON.parse(await (blob as unknown as Blob).text());
    expect(content).toMatchObject({ app: "prix-malin", schema: 1 });
    expect(content.prices).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("importe un fichier : ajoute les prix absents et le dit", async () => {
    const user = userEvent.setup();
    const [id] = seedPrices(["Importé"]);
    const backup = JSON.stringify({
      app: "prix-malin",
      schema: 1,
      exportedAt: "2026-11-19T00:00:00.000Z",
      prices: JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string).state.prices,
    });
    localStorage.removeItem(STORAGE_KEYS.prices);
    render(<App />);

    await user.upload(
      screen.getByLabelText(/importer un fichier/i),
      new File([backup], "sauvegarde.json", { type: "application/json" }),
    );

    expect((await screen.findAllByText(/1 prix importé/i)).length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string).state.prices[0].id).toBe(id);
  });

  it("refuse un fichier qui n'est pas une sauvegarde, sans rien modifier", async () => {
    const user = userEvent.setup();
    seedPrices(["Existant"]);
    render(<App />);

    await user.upload(screen.getByLabelText(/importer un fichier/i), new File(["bonjour"], "x.json", { type: "application/json" }));

    expect((await screen.findAllByText(/n'est pas une sauvegarde/i)).length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string).state.prices).toHaveLength(1);
  });

  it("signale les prix déjà présents", async () => {
    const user = userEvent.setup();
    seedPrices(["Déjà là"]);
    const stored = localStorage.getItem(STORAGE_KEYS.prices) as string;
    const backup = JSON.stringify({ app: "prix-malin", schema: 1, exportedAt: "x", prices: JSON.parse(stored).state.prices });
    render(<App />);

    await user.upload(screen.getByLabelText(/importer un fichier/i), new File([backup], "s.json", { type: "application/json" }));

    expect((await screen.findAllByText(/0 prix importé.*1 déjà présent/i)).length).toBeGreaterThan(0);
  });
});

describe("effacer toutes mes données (confirmation renforcée)", () => {
  async function openDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: /effacer toutes mes données/i }));
    return screen.findByRole("alertdialog");
  }

  it("demande de taper « EFFACER » : le bouton reste inactif sinon", async () => {
    const user = userEvent.setup();
    seedPrices(["A"]);
    render(<App />);
    const dialog = await openDialog(user);
    const confirm = within(dialog).getByRole("button", { name: /effacer définitivement/i });
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByLabelText(/tapez effacer/i), "efface");
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByLabelText(/tapez effacer/i), "R");
    expect(confirm).toBeEnabled();
  });

  it("annuler ne supprime rien", async () => {
    const user = userEvent.setup();
    seedPrices(["A"]);
    render(<App />);
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole("button", { name: /annuler/i }));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string).state.prices).toHaveLength(1);
  });

  it("efface prix, brouillon et réglages, puis rejoue la présentation", async () => {
    const user = userEvent.setup();
    seedPrices(["A"]);
    seedDraft(bissap());
    render(<App />);
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByLabelText(/tapez effacer/i), "EFFACER");

    await user.click(within(dialog).getByRole("button", { name: /effacer définitivement/i }));

    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) as string).state.prices).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) as string).state.calcul.coutDirect.total).toBeNull();
    expect(settings().onboardingSeen).toBe(0);
    expect(screen.getByRole("heading", { level: 1, name: /le bon prix/i })).toBeInTheDocument();
  });
});
