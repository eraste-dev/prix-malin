import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { App } from "../src/App";
import { AppErrorBoundary } from "../src/components/AppErrorBoundary";
import { STORAGE_KEYS } from "../src/lib/storage";
import { StoreProvider } from "../src/lib/storeContext";
import { bissap, seedDraft } from "./helpers";

/** Aides contextuelles à usage unique (docs/14) et écran de secours (E14). */
const seenTips = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) ?? "{}").state.tipsSeen as string[];
const notes = () => screen.queryAllByRole("note");

describe("aides contextuelles", () => {
  it("le formulaire n'affiche plus de bannière : le conseil de Q2 et de Q3 est derrière l'icône d'aide, à droite du libellé", () => {
    render(<App />);
    expect(notes()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Aide : coût direct" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aide : charges fixes" })).toBeInTheDocument();
  });

  it("l'aide d'un champ dit de tout compter (coût direct) et de ne pas oublier son salaire (charges)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Aide : coût direct" }));
    expect(within(await screen.findByRole("dialog")).getByText(/comptez tout, même les petits coûts/i)).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Aide : charges fixes" }));
    expect(within(await screen.findByRole("dialog")).getByText(/votre salaire/i)).toBeInTheDocument();
  });

  it("« Compris » ferme une aide pour toujours (drapeau enregistré)", async () => {
    const user = userEvent.setup();
    seedDraft(bissap());
    const first = render(<App />);
    const result = notes().find((note) => /essayez une autre marge/i.test(note.textContent ?? "")) as HTMLElement;

    await user.click(within(result).getByRole("button", { name: /compris/i }));

    expect(seenTips()).toContain("result");
    first.unmount();
    render(<App />);
    expect(notes().some((note) => /essayez une autre marge/i.test(note.textContent ?? ""))).toBe(false);
  });

  it("le premier résultat suggère d'essayer une autre marge", () => {
    seedDraft(bissap());
    render(<App />);
    expect(notes().some((note) => /essayez une autre marge/i.test(note.textContent ?? ""))).toBe(true);
  });

  it("ne propose pas l'aide du résultat tant qu'il n'y a pas de prix", () => {
    render(<App />);
    expect(notes().some((note) => /essayez une autre marge/i.test(note.textContent ?? ""))).toBe(false);
  });

  it("réapparaît après « Réinitialiser les aides »", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify({ state: { onboardingSeen: 1, tipsSeen: ["q2", "q3", "result"], lastActivity: null }, version: 1 }),
    );
    seedDraft(bissap());
    window.location.hash = "#/reglages";
    const first = render(<App />);
    expect(notes()).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: /réinitialiser les aides/i }));
    first.unmount();

    window.location.hash = "#/calculer";
    render(<App />);

    expect(notes().length).toBeGreaterThan(0);
  });
});

describe("écran de secours (E14)", () => {
  function Boom(): never {
    throw new Error("panne");
  }

  function renderBroken() {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    return render(
      <StoreProvider>
        <MemoryRouter>
          <AppErrorBoundary>
            <Boom />
          </AppErrorBoundary>
        </MemoryRouter>
      </StoreProvider>,
    );
  }

  it("remplace l'écran cassé par un message clair, sans jargon ni trace technique", () => {
    renderBroken();
    expect(screen.getByRole("alert")).toHaveTextContent(/quelque chose s'est mal passé/i);
    expect(screen.queryByText(/panne|Error|stack/i)).not.toBeInTheDocument();
  });

  it("rassure sur les données et propose de revenir à l'accueil", () => {
    renderBroken();
    expect(screen.getByRole("alert")).toHaveTextContent(/vos données sont intactes/i);
    expect(screen.getByRole("button", { name: /revenir à l'accueil/i })).toBeInTheDocument();
  });

  it("ne touche pas aux données enregistrées", () => {
    seedDraft(bissap());
    const before = localStorage.getItem(STORAGE_KEYS.draft);
    renderBroken();
    expect(localStorage.getItem(STORAGE_KEYS.draft)).toBe(before);
  });
});
