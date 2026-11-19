import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { STORAGE_KEYS } from "../src/lib/storage";

/** Enregistrer (E07) et Partager (E08). Rien ne quitte l'appareil sans action de l'utilisateur. */
type User = ReturnType<typeof userEvent.setup>;

async function fillBissap(user: User) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const savedPrices = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.prices) ?? '{"state":{"prices":[]}}').state.prices;

describe("Enregistrer (E07)", () => {
  it("n'est proposé qu'avec un prix", () => {
    render(<App />);
    expect(screen.queryByRole("button", { name: "Enregistrer" })).not.toBeInTheDocument();
  });

  it("ouvre une feuille avec un nom suggéré (type · unité) et enregistre d'un appui", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    const sheet = await screen.findByRole("dialog", { name: /enregistrer ce prix/i });
    expect(within(sheet).getByLabelText(/nom/i)).toHaveValue("Je fabrique · unité");
    await user.click(within(sheet).getByRole("button", { name: "Enregistrer" }));

    expect(savedPrices()).toHaveLength(1);
    expect(savedPrices()[0]).toMatchObject({ nom: "Je fabrique · unité", prixConseille: 450, coutDeRevient: 320 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("garde le nom saisi par l'utilisateur", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByLabelText(/nom \(facultatif\)/i), "Jus de bissap");
    await fillBissap(user);

    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByLabelText(/nom/i)).toHaveValue("Jus de bissap");
  });

  it("confirme discrètement, avec un lien « Voir »", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));

    // Le message est annoncé deux fois : affiché, et dans la région aria-live pour les lecteurs d'écran.
    expect((await screen.findAllByText(/prix enregistré/i)).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Voir" })).toBeInTheDocument();
  });

  it("au second enregistrement du même calcul : « Mettre à jour » ou « Enregistrer une copie »", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));

    await user.click(screen.getByRole("button", { name: /^enregistrer$|mettre à jour/i }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByRole("button", { name: "Mettre à jour" })).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: /enregistrer une copie/i }));

    expect(savedPrices()).toHaveLength(2);
  });

  it("« Mettre à jour » remplace sans créer de doublon", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Enregistrer" }));

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));
    await user.click(screen.getByRole("button", { name: /^enregistrer$|mettre à jour/i }));
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Mettre à jour" }));

    expect(savedPrices()).toHaveLength(1);
    expect(savedPrices()[0].prixConseille).toBe(375);
  });

  it("deux enregistrements de même nom sont acceptés (identifiant unique, MP-02)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    for (let i = 0; i < 2; i += 1) {
      await user.click(screen.getByRole("button", { name: /^enregistrer$|mettre à jour/i }));
      const sheet = await screen.findByRole("dialog");
      const copy = within(sheet).queryByRole("button", { name: /enregistrer une copie/i });
      await user.click(copy ?? within(sheet).getByRole("button", { name: "Enregistrer" }));
    }
    expect(savedPrices()).toHaveLength(2);
    expect(savedPrices()[0].id).not.toBe(savedPrices()[1].id);
  });
});

describe("Partager (E08)", () => {
  it("montre l'aperçu du résumé texte avant tout partage", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(screen.getByRole("button", { name: "Partager" }));

    const sheet = await screen.findByRole("dialog", { name: /partager ce prix/i });
    const preview = within(sheet).getByTestId("share-preview");
    expect(preview).toHaveTextContent(/Prix conseillé : 450 F/);
    expect(preview).toHaveTextContent(/Calculé avec Prix Malin/);
  });

  it("copie le résumé dans le presse-papiers", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Partager" }));

    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Copier" }));

    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]?.[0]).toMatch(/Prix conseillé : 450 F/);
    expect(await screen.findByText(/résumé copié/i)).toBeInTheDocument();
  });

  it("utilise le partage natif quand le téléphone le propose", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share });
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Partager" }));

    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Partager" }));

    expect(share).toHaveBeenCalledOnce();
    expect(share.mock.calls[0]?.[0].text).toMatch(/Prix conseillé : 450 F/);
  });

  it("sans partage natif : seul « Copier » est proposé (repli)", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("navigator", { ...navigator, share: undefined });
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Partager" }));

    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByRole("button", { name: "Copier" })).toBeInTheDocument();
    expect(within(sheet).queryByRole("button", { name: "Partager" })).not.toBeInTheDocument();
  });

  it("annuler le partage natif n'affiche aucune erreur", async () => {
    const user = userEvent.setup();
    const share = vi.fn().mockRejectedValue(new DOMException("annulé", "AbortError"));
    vi.stubGlobal("navigator", { ...navigator, share });
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: "Partager" }));

    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Partager" }));

    expect(screen.queryByText(/erreur|impossible/i)).not.toBeInTheDocument();
  });
});
