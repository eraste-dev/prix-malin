import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { setReducedMotion } from "./motionEnv";

/** Écran Résultat (docs/15 E06) : barre de composition (4) et « Pourquoi ce prix ? » (5). RG-05. */
type User = ReturnType<typeof userEvent.setup>;

async function fillBissap(user: User) {
  await user.type(screen.getByLabelText(/ce que ça vous coûte/i), "210");
  await user.type(screen.getByLabelText(/charges du mois/i), "220000");
  await user.type(screen.getByLabelText(/ventes par mois/i), "2000");
}

const composition = () => screen.getByTestId("composition");
const legend = () => within(screen.getByRole("list", { name: /composition du prix/i }));

describe("Carte résultat : fond blanc, couleur réservée à la marge", () => {
  it("est sur la surface blanche des cartes, prix en encre, textes secondaires par jeton et non par opacité", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    // La section de l'étape s'appelle « Résultat » : la carte a un nom distinct (pas deux repères identiques).
    const card = screen.getByRole("region", { name: "Prix conseillé" });
    expect(card.className).toContain("bg-card");
    expect(card.className).not.toContain("bg-muted");
    expect(card.className).not.toContain("bg-secondary");
    expect(screen.getByTestId("price").className).not.toContain("text-positive");
    // Pas d'opacité posée à la main sur un texte (les variantes comme `disabled:opacity-50` de shadcn ne comptent pas).
    const plainOpacity = Array.from(card.querySelectorAll("[class]")).filter((element) =>
      (element.getAttribute("class") ?? "").split(/\s+/).some((token) => /^opacity-\d+$/.test(token)),
    );
    expect(plainOpacity).toHaveLength(0);
  });

  it("arcs : encre, atténué, encre à 50 %, et « positive » pour la marge seulement", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const stroke = (key: string) => composition().querySelector(`[data-part="${key}"]`)?.getAttribute("class") ?? "";
    expect(stroke("direct")).toContain("stroke-foreground");
    expect(stroke("direct")).not.toContain("stroke-foreground/");
    expect(stroke("fixed")).toContain("stroke-muted-foreground");
    expect(stroke("fee")).toContain("stroke-foreground/50");
    expect(stroke("margin")).toContain("stroke-positive");
  });
});

describe("Demi-cercle de composition", () => {
  const arcs = () => Array.from(composition().querySelectorAll<SVGElement>("[data-part]"));
  const num = (element: Element, attribute: string) => Number.parseFloat(element.getAttribute(attribute) ?? "NaN");

  it("est un demi-cercle SVG : un seul tracé en arc de 180° partagé par tous les segments", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(composition().querySelector("svg")).not.toBeNull();
    const paths = new Set(arcs().map((arc) => arc.getAttribute("d")));
    expect(paths.size).toBe(1);
    // Arc de cercle demi-tour : rayon identique à l'arrivée, drapeau « grand arc » à 0 (180°).
    expect([...paths][0]).toMatch(/^M [\d.]+ [\d.]+ A ([\d.]+) \1 0 0 1 [\d.]+ [\d.]+$/);
  });

  it("dimensionne chaque arc selon sa part du prix, les arcs se suivant sans se chevaucher", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const shares = arcs().map((arc) => num(arc, "data-share"));
    expect(shares).toHaveLength(4);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(100, 4);
    expect(shares[0]).toBeCloseTo((210 / 450) * 100, 4);

    let start = 0;
    arcs().forEach((arc, index) => {
      const share = shares[index]!;
      // Longueur dessinée : la part moins un petit espace ; départ : somme des parts précédentes.
      expect(num(arc, "stroke-dasharray")).toBeLessThan(share);
      expect(num(arc, "stroke-dasharray")).toBeGreaterThan(share - 3);
      expect(num(arc, "stroke-dashoffset")).toBeCloseTo(-start, 4);
      start += share;
    });
  });

  it("affiche la part de marge au centre", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    // 125,5 ÷ 450 = 27,9 % du prix.
    expect(screen.getByTestId("composition-center")).toHaveTextContent("27,9 %");
    expect(screen.getByTestId("composition-center")).toHaveTextContent(/de marge/i);
  });

  it("met à jour le centre et les arcs quand la marge change (375 F : 13,7 %)", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    const before = num(arcs()[3]!, "data-share");

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    expect(screen.getByTestId("composition-center")).toHaveTextContent("13,7 %");
    expect(num(arcs()[3]!, "data-share")).toBeLessThan(before);
  });

  it("GSAP : les arcs se dessinent l'un après l'autre (retards de 120 ms), de longueur nulle à leur longueur finale", async () => {
    setReducedMotion(false);
    const from = vi.spyOn(gsap, "from");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const draws = arcs().map((arc) => from.mock.calls.filter(([target]) => target === arc).at(-1)!);
    expect(draws.map(([, vars]) => (vars as gsap.TweenVars).delay)).toEqual([0, 0.12, 0.24, 0.36]);
    for (const [, vars] of draws) {
      expect((vars as gsap.TweenVars).attr).toMatchObject({ "stroke-dasharray": "0 100" });
    }
  });

  it("GSAP : quand la marge change, chaque arc glisse de son ancienne longueur à la nouvelle", async () => {
    setReducedMotion(false);
    // Tweens neutralisés : le DOM garde les valeurs finales, qu'on peut alors comparer avant / après.
    const noTween = () => ({}) as gsap.core.Tween;
    vi.spyOn(gsap, "from").mockImplementation(noTween);
    const fromTo = vi.spyOn(gsap, "fromTo").mockImplementation(noTween);
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    const before = arcs().map((arc) => arc.getAttribute("stroke-dasharray"));
    fromTo.mockClear();

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    const slides = arcs().map((arc) => fromTo.mock.calls.filter(([target]) => target === arc).at(-1));
    slides.forEach((call, index) => {
      expect(call).toBeDefined();
      const [, fromVars, toVars] = call as unknown as [unknown, gsap.TweenVars, gsap.TweenVars];
      expect(fromVars.attr).toMatchObject({ "stroke-dasharray": before[index] });
      expect(toVars.attr).toMatchObject({ "stroke-dasharray": arcs()[index]!.getAttribute("stroke-dasharray") });
    });
  });

  it("réduire les animations : les arcs sont posés à leur longueur finale, sans tween", async () => {
    setReducedMotion(true);
    const from = vi.spyOn(gsap, "from");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(from.mock.calls.some(([target]) => arcs().includes(target as SVGElement))).toBe(false);
    expect(arcs()[0]!.getAttribute("stroke-dasharray")).not.toBe("0 100");
  });
});

describe("Barre de composition du prix", () => {
  it("n'existe pas tant qu'il n'y a pas de prix", () => {
    render(<App />);
    expect(screen.queryByTestId("composition")).not.toBeInTheDocument();
  });

  it("se décrit en toutes lettres (pas seulement par les couleurs) : coût, charges, frais, marge", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    const description = composition().getAttribute("aria-label") ?? "";
    expect(description).toMatch(/coût direct/i);
    expect(description).toMatch(/charges/i);
    expect(description).toMatch(/frais/i);
    expect(description).toMatch(/marge/i);
  });

  it("liste chaque part avec son montant : 210, 110, 4,5 et 125,5 F pour 450 F", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    expect(legend().getByText(/coût direct/i).closest("li")).toHaveTextContent("210 F");
    expect(legend().getByText(/charges/i).closest("li")).toHaveTextContent("110 F");
    expect(legend().getByText(/frais/i).closest("li")).toHaveTextContent("4,5 F");
    expect(legend().getByText(/marge/i).closest("li")).toHaveTextContent("125,5 F");
  });

  it("se met à jour avec la marge choisie", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(within(screen.getByRole("radiogroup", { name: /marge/i })).getByRole("radio", { name: "10 %" }));

    // 375 F : coût direct 210 + charges 110 + frais 3,75 + marge 51,25.
    expect(legend().getByText(/marge/i).closest("li")).toHaveTextContent("51,25");
  });
});

describe("Pourquoi ce prix ? : animation GSAP", () => {
  it("à l'ouverture, le détail se déploie en hauteur et le chevron pivote", async () => {
    setReducedMotion(false);
    const from = vi.spyOn(gsap, "from");
    const to = vi.spyOn(gsap, "to");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    from.mockClear();
    to.mockClear();

    await user.click(screen.getByRole("button", { name: /pourquoi ce prix/i }));

    const details = screen.getByTestId("why");
    const grow = from.mock.calls.find(([target]) => target === details);
    expect(grow).toBeDefined();
    expect(grow![1]).toMatchObject({ height: 0, opacity: 0 });
    const chevron = screen.getByRole("button", { name: /pourquoi ce prix/i }).querySelector("svg");
    const turn = to.mock.calls.find(([target]) => target === chevron);
    expect(turn![1]).toMatchObject({ rotation: 180 });
  });

  it("réduire les animations : le chevron reflète l'état sans tween", async () => {
    setReducedMotion(true);
    const to = vi.spyOn(gsap, "to");
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);

    await user.click(screen.getByRole("button", { name: /pourquoi ce prix/i }));

    expect(to).not.toHaveBeenCalled();
    const chevron = screen.getByRole("button", { name: /pourquoi ce prix/i }).querySelector("svg");
    expect(chevron).toHaveAttribute("data-open", "true");
  });
});

describe("Pourquoi ce prix ?", () => {
  it("est replié au départ, et s'ouvre d'un appui", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    const trigger = screen.getByRole("button", { name: /pourquoi ce prix/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Replié : Radix retire le détail du DOM (rien d'inutile pour les lecteurs d'écran).
    expect(screen.queryByText(/part des charges par vente/i)).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/part des charges par vente/i)).toBeVisible();
  });

  it("détaille les lignes chiffrées, la formule et l'arrondi", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: /pourquoi ce prix/i }));

    const details = screen.getByTestId("why");
    expect(details).toHaveTextContent(/220\D000 F ÷ 2\D000 ventes/); // charges réparties sur le volume
    expect(details).toHaveTextContent(/coût de revient/i);
    expect(details).toHaveTextContent("320 F");
    expect(details).toHaveTextContent(/prix = coût direct \+ part des charges \+ frais \+ marge/i);
    expect(details).toHaveTextContent("432,4"); // prix avant arrondi
    expect(details).toHaveTextContent(/arrondi/i);
    expect(details).toHaveTextContent("450");
  });

  it("explique que la marge réelle dépasse la marge visée à cause de l'arrondi", async () => {
    const user = userEvent.setup();
    render(<App />);
    await fillBissap(user);
    await user.click(screen.getByRole("button", { name: /pourquoi ce prix/i }));

    // 125,5 ÷ 450 = 27,9 % du prix, pour 25 % visés.
    expect(screen.getByTestId("why")).toHaveTextContent(/27,9 %/);
    expect(screen.getByTestId("why")).toHaveTextContent(/25 %/);
  });
});
