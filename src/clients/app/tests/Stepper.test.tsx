import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { setReducedMotion } from "./motionEnv";
import { App } from "../src/App";
import { computeStepStatuses, describeSteps } from "../src/lib/steps";

/** Stepper vertical : Type · Vos chiffres · Résultat · Ajuster. Une étape se débloque quand la précédente est faite. */
type User = ReturnType<typeof userEvent.setup>;

async function fillBissap(user: User) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const steps = () => within(screen.getByRole("list", { name: /étapes/i }));
const step = (key: string) => {
  const element = document.querySelector(`[data-step="${key}"]`);
  if (element === null) throw new Error(`étape ${key} introuvable`);
  return element as HTMLElement;
};
const node = (index: number) => steps().getByRole("button", { name: new RegExp(`étape ${index}\\b`, "i") });

describe("computeStepStatuses (logique de déblocage)", () => {
  it("au départ : le type est en cours, les chiffres disponibles, le reste verrouillé", () => {
    expect(computeStepStatuses({ hasCost: false, hasResult: false })).toEqual({
      type: "current",
      numbers: "available",
      result: "locked",
      adjust: "locked",
    });
  });

  it("dès le coût saisi, le type est fait et les chiffres sont en cours", () => {
    expect(computeStepStatuses({ hasCost: true, hasResult: false })).toEqual({
      type: "done",
      numbers: "current",
      result: "locked",
      adjust: "locked",
    });
  });

  it("avec un prix : tout est fait sauf Ajuster, qui est en cours", () => {
    expect(computeStepStatuses({ hasCost: true, hasResult: true })).toEqual({
      type: "done",
      numbers: "done",
      result: "done",
      adjust: "current",
    });
  });

  it("une seule étape est en cours à la fois", () => {
    for (const hasCost of [false, true]) {
      for (const hasResult of hasCost ? [false, true] : [false]) {
        const current = Object.values(computeStepStatuses({ hasCost, hasResult })).filter((s) => s === "current");
        expect(current).toHaveLength(1);
      }
    }
  });
});

describe("describeSteps (résumés des info-bulles)", () => {
  const base = {
    activityLabel: "Je fabrique",
    cost: null,
    fixed: null,
    volume: null,
    price: null,
    marginPct: 25,
    feePct: 1,
  } as const;

  it("au départ : activité par défaut, 0 valeur renseignée, suite indisponible", () => {
    const text = describeSteps(base);
    expect(text.type).toContain("Je fabrique");
    expect(text.type).toMatch(/par défaut/i);
    expect(text.numbers).toMatch(/0 sur 3/);
    expect(text.result).toMatch(/disponible/i);
    expect(text.adjust).toMatch(/disponible/i);
  });

  it("n'emploie pas de formules « fait » / « à faire »", () => {
    const states = [base, { ...base, cost: 210 }, { ...base, cost: 210, fixed: 1, volume: 1, price: 450 }];
    for (const state of states) {
      for (const sentence of Object.values(describeSteps(state))) {
        expect(sentence).not.toMatch(/\b(fait|à faire)\b/i);
      }
    }
  });

  it("compte les nombres remplis", () => {
    expect(describeSteps({ ...base, cost: 210 }).numbers).toMatch(/1 sur 3/);
    expect(describeSteps({ ...base, cost: 210, fixed: 220000 }).numbers).toMatch(/2 sur 3/);
  });

  it("avec un prix : résume l'activité, les nombres, le prix, la marge et les frais", () => {
    const text = describeSteps({ ...base, cost: 210, fixed: 220000, volume: 2000, price: 450 });
    expect(text.type).toContain("Je fabrique");
    expect(text.type).not.toMatch(/par défaut/i);
    expect(text.numbers).toMatch(/210/);
    expect(text.numbers).toMatch(/220\D000/);
    expect(text.result).toContain("450");
    expect(text.adjust).toContain("25 %");
    expect(text.adjust).toContain("1 %");
  });
});

/** Teintes du rond d'une étape : neutres, sauf l'étape en cours (primary). */
const nodeClass = (index: number): string => node(index).firstElementChild?.getAttribute("class") ?? "";

describe("Stepper vertical", () => {
  it("affiche quatre étapes nommées, dans l'ordre", () => {
    render(<App />);
    const titles = ["Que vendez-vous ?", "Vos chiffres", "Résultat", "Ajuster"];
    for (const title of titles) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    const order = Array.from(document.querySelectorAll("[data-step]")).map((el) => el.getAttribute("data-step"));
    expect(order).toEqual(["type", "numbers", "result", "adjust"]);
  });

  it("le rail est fixe et centré à mi-hauteur de l'écran, séparé des sections", () => {
    render(<App />);
    const rail = screen.getByRole("list", { name: /étapes/i }).closest("nav");
    expect(rail).not.toBeNull();
    const classes = (rail?.getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toContain("fixed");
    expect(classes).toContain("top-1/2");
    expect(classes).toContain("-translate-y-1/2");
    // Le rail ne contient que les ronds : les sections (titres, champs) sont à côté, pas dedans.
    expect(within(rail as HTMLElement).queryByRole("heading")).not.toBeInTheDocument();
    expect(rail?.contains(step("numbers"))).toBe(false);
  });

  it("verrouille Résultat et Ajuster au départ : ronds désactivés, consigne visible", () => {
    render(<App />);
    expect(step("result")).toHaveAttribute("data-status", "locked");
    expect(step("adjust")).toHaveAttribute("data-status", "locked");
    expect(node(3)).toBeDisabled();
    expect(node(4)).toBeDisabled();
    expect(node(1)).toBeEnabled();
    expect(node(2)).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent(/trois nombres/i);
    expect(screen.queryByRole("radiogroup", { name: /marge/i })).not.toBeInTheDocument();
  });

  it("débloque Résultat et Ajuster quand le prix est calculé", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(step("type")).toHaveAttribute("data-status", "done");
    expect(step("numbers")).toHaveAttribute("data-status", "done");
    expect(step("result")).toHaveAttribute("data-status", "done");
    expect(step("adjust")).toHaveAttribute("data-status", "current");
    expect(node(3)).toBeEnabled();
    expect(node(4)).toBeEnabled();
    expect(screen.getByTestId("price")).toHaveTextContent("450");
  });

  it("seule l'étape en cours est grande ; les autres sont plus petites", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(nodeClass(1)).toContain("size-9");
    for (const index of [2, 3, 4]) expect(nodeClass(index)).toContain("size-6");

    await fillBissap(user);

    for (const index of [1, 2, 3]) expect(nodeClass(index)).toContain("size-6");
    expect(nodeClass(4)).toContain("size-9");
  });

  it("au survol d'un rond, une info-bulle résume l'étape (fait ou à faire)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.hover(node(3));

    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent(/prix conseillé/i);
    expect(tip).toHaveTextContent("450");
  });

  it("l'info-bulle apparaît aussi au clavier (focus)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    // Le premier élément focalisable de la page est le bouton de thème ; on cible le rond 2 directement.
    node(2).focus();

    expect(await screen.findByRole("tooltip")).toHaveTextContent(/0 sur 3/);
  });

  it("le résumé est aussi lu par les lecteurs d'écran (description du rond)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(node(3)).toHaveAccessibleDescription(/450/);
  });

  it("couleurs neutres (blanc, gris, noir) ; primary seulement pour l'étape en cours", async () => {
    const user = userEvent.setup();
    render(<App />);
    // Départ : étape 1 en cours, étape 2 disponible (blanc), 3 et 4 verrouillées (gris).
    expect(nodeClass(1)).toContain("bg-primary");
    expect(nodeClass(2)).toContain("bg-card");
    expect(nodeClass(3)).toContain("bg-muted");
    expect(nodeClass(4)).toContain("bg-muted");
    expect(node(1)).toHaveAttribute("aria-current", "step");
    expect(node(2)).not.toHaveAttribute("aria-current");

    await fillBissap(user);

    // Prix calculé : 1 à 3 faites (noir), seule l'étape 4 reste en primary.
    for (const index of [1, 2, 3]) {
      expect(nodeClass(index)).toContain("bg-foreground");
      expect(nodeClass(index)).not.toContain("bg-primary");
    }
    expect(nodeClass(4)).toContain("bg-primary");
    expect(node(4)).toHaveAttribute("aria-current", "step");
    expect(steps().getAllByRole("button").filter((b) => b.getAttribute("aria-current") === "step")).toHaveLength(1);
  });

  it("re-verrouille si le prix redevient impossible", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.clear(screen.getByLabelText(/ventes par mois/i));

    expect(step("result")).toHaveAttribute("data-status", "locked");
    expect(node(4)).toBeDisabled();
  });

  it("toucher un rond débloqué fait défiler jusqu'à son étape", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    const scroll = vi.fn();
    step("adjust").scrollIntoView = scroll;

    await user.click(node(4));

    expect(scroll).toHaveBeenCalledTimes(1);
  });

  it("le trait vers une étape débloquée est plein (état porté par le DOM, même sans animation)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const fill = document.querySelector<HTMLElement>('[data-connector-to="result"]');
    expect(fill).toHaveAttribute("data-filled", "true");
    expect(fill?.style.transform).toBe("scaleY(1)");
  });

  it("GSAP : au déblocage, le trait se remplit de haut en bas et le rond rebondit", async () => {
    setReducedMotion(false);
    const fromTo = vi.spyOn(gsap, "fromTo");
    const from = vi.spyOn(gsap, "from");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const fill = document.querySelector('[data-connector-to="result"]');
    const fillCalls = fromTo.mock.calls.filter(([target]) => target === fill);
    expect(fillCalls.length, "tween du trait").toBeGreaterThan(0);
    const last = fillCalls.at(-1)!;
    expect(last[1]).toMatchObject({ scaleY: 0 });
    expect(last[2]).toMatchObject({ scaleY: 1 });

    const pop = from.mock.calls.filter(([target]) => target === node(3).firstElementChild);
    expect(pop.length).toBeGreaterThan(0);
    expect(pop.at(-1)![1]).toMatchObject({ scale: 0.5, opacity: 0 });
  });

  it("réduire les animations : le trait et les ronds sont posés d'emblée, sans tween", async () => {
    setReducedMotion(true);
    const fromTo = vi.spyOn(gsap, "fromTo");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(fromTo).not.toHaveBeenCalled();
    expect(document.querySelector('[data-connector-to="result"]')).toHaveAttribute("data-filled", "true");
  });

  it("le trait vers une étape verrouillée reste vide", () => {
    render(<App />);
    expect(document.querySelector('[data-connector-to="result"]')).toHaveAttribute("data-filled", "false");
  });
});
