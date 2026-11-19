import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { pwa } from "./stubs/pwa-register-react";

/** Hors ligne et mises à jour (docs/15 E14) : jamais pendant la saisie, jamais imposées. */
afterEach(() => {
  pwa.needRefresh = false;
  pwa.offlineReady = false;
  pwa.updateServiceWorker = async () => undefined;
});

describe("nouvelle version", () => {
  it("ne dit rien quand il n'y a pas de mise à jour", () => {
    render(<App />);
    expect(screen.queryByText(/nouvelle version/i)).not.toBeInTheDocument();
  });

  it("propose « Mettre à jour » et l'applique à la demande seulement", async () => {
    const user = userEvent.setup();
    const update = vi.fn().mockResolvedValue(undefined);
    pwa.updateServiceWorker = update;
    pwa.needRefresh = true;
    render(<App />);

    expect((await screen.findAllByText(/nouvelle version disponible/i)).length).toBeGreaterThan(0);
    expect(update).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Mettre à jour" }));

    expect(update).toHaveBeenCalledWith(true);
  });

  it("n'apparaît jamais pendant une saisie, mais dès que le champ est quitté", async () => {
    const user = userEvent.setup();
    pwa.needRefresh = true;
    render(<App />);
    await user.click(screen.getByLabelText(/ce que ça vous coûte/i));
    await user.keyboard("21");

    // Le message se retire avec une courte animation de sortie : on attend qu'il ait disparu.
    await waitFor(() => expect(screen.queryByRole("button", { name: "Mettre à jour" })).not.toBeInTheDocument());

    await user.click(document.body);
    expect(await screen.findByRole("button", { name: "Mettre à jour" })).toBeInTheDocument();
  });
});

describe("prêt hors ligne", () => {
  it("le dit une fois, simplement", async () => {
    pwa.offlineReady = true;
    render(<App />);
    expect((await screen.findAllByText(/fonctionne maintenant sans internet/i)).length).toBeGreaterThan(0);
  });
});
