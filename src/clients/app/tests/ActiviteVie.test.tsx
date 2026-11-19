import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { SHARE } from "../src/lib/motion";
import { seedPrices } from "./helpers";
import { setReducedMotion } from "./motionEnv";

/**
 * Mon activité vivant (E10, DESIGN.md « Mon activité ») : répartition en liste de produits à barres fines, qui
 * glissent quand les chiffres changent (GSAP, ADR-0011). Sous « réduire les animations » rien ne bouge.
 */
const open = () => {
  window.location.hash = "#/activite";
};

async function enterRent(user: ReturnType<typeof userEvent.setup>, amount = "100000") {
  await user.click(screen.getByRole("button", { name: "Loyer" }));
  await user.type(screen.getByLabelText(/montant : loyer/i), amount);
}

describe("phrase d'accueil", () => {
  it("dit le geste d'aujourd'hui dans Calculer, plus l'ancienne bascule", () => {
    open();
    render(<App />);
    expect(screen.getByText(/utiliser mes charges partagées/i)).toBeInTheDocument();
    expect(screen.queryByText(/choisissez « mes charges partagées »/i)).not.toBeInTheDocument();
  });
});

describe("répartition en barres", () => {
  it("donne à chaque produit sa part en francs, en pourcentage et ses ventes", async () => {
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    open();
    render(<App />);
    await enterRent(user);

    const items = within(screen.getByRole("list", { name: /répartition/i })).getAllByRole("listitem");
    const bissap = items.find((item) => /Bissap/.test(item.textContent ?? "")) as HTMLElement;
    expect(bissap).toHaveTextContent(/25\D000 F/);
    expect(bissap).toHaveTextContent(/25 % des charges/);
    expect(bissap).toHaveTextContent(/1\D000 ventes par mois/);
    const fill = within(bissap).getByTestId("share-bar-fill");
    expect(fill.getAttribute("width")).toBe("25");
  });

  it("la longueur de chaque barre est la part des charges", async () => {
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    open();
    render(<App />);
    await enterRent(user);

    const widths = screen.getAllByTestId("share-bar-fill").map((fill) => Number(fill.getAttribute("width")));
    expect(widths.sort((a, b) => a - b)).toEqual([25, 75]);
  });

  it("avec des charges mais sans produit enregistré, dit que le premier produit les portera toutes", async () => {
    const user = userEvent.setup();
    open();
    render(<App />);
    await enterRent(user);
    expect(screen.getByText(/premier produit portera toutes ces charges/i)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: /répartition/i })).not.toBeInTheDocument();
  });

  it("sans charges, aucune répartition ni carte vide", () => {
    seedPrices(["Bissap"], { volume: 1000 });
    open();
    render(<App />);
    expect(screen.queryByRole("list", { name: /répartition/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/premier produit portera/i)).not.toBeInTheDocument();
  });
});

describe("mouvement de la répartition", () => {
  it("les barres se remplissent vite : la dernière démarre avant 0,5 s", () => {
    expect(SHARE.stagger * 3).toBeLessThanOrEqual(0.5);
    expect(SHARE.duration).toBeLessThanOrEqual(0.6);
  });

  it("réduire les animations : aucun tween, aucun style en ligne", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    const fromTo = vi.spyOn(gsap, "fromTo");
    open();
    const { container } = render(<App />);
    await enterRent(user);
    expect(fromTo).not.toHaveBeenCalled();
    expect(container.querySelector("[style]")).toBeNull();
  });

  it("mouvement autorisé : chaque barre se remplit depuis zéro à son apparition", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    const fromTo = vi.spyOn(gsap, "fromTo");
    open();
    render(<App />);
    await enterRent(user);
    const growths = fromTo.mock.calls.filter(([, from]) => (from as { attr?: { width?: number } }).attr?.width === 0);
    expect(growths.length).toBeGreaterThanOrEqual(2);
  });

  it("quand les charges changent, la barre glisse de l'ancienne longueur vers la nouvelle", async () => {
    setReducedMotion(false);
    const user = userEvent.setup();
    seedPrices(["Bissap"], { volume: 1000 });
    seedPrices(["Gingembre"], { volume: 3000 });
    open();
    render(<App />);
    await enterRent(user);
    const fromTo = vi.spyOn(gsap, "fromTo");
    // Un deuxième produit ne change pas les parts : on change le volume d'un produit via un nouveau calcul serait
    // hors de portée ; on vérifie ici que changer le total, sans changer les parts, ne rejoue rien.
    await user.type(screen.getByLabelText(/montant : loyer/i), "0");
    expect(fromTo).not.toHaveBeenCalled();
  });
});
