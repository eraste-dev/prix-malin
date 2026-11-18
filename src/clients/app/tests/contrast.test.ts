import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Contrôle automatique des contrastes (L-22, WCAG 2.2) lu directement dans styles.css :
 * texte ≥ 4,5 ; éléments graphiques ≥ 3 (critère 1.4.11).
 */
const CSS = readFileSync(resolve(__dirname, "../src/styles.css"), "utf8");

function tokens(blockStart: string): Record<string, string> {
  const start = CSS.indexOf(blockStart);
  if (start === -1) throw new Error(`bloc introuvable : ${blockStart}`);
  const body = CSS.slice(CSS.indexOf("{", start) + 1, CSS.indexOf("}", start));
  return Object.fromEntries(
    Array.from(body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)).map((m) => [m[1]!, m[2]!]),
  );
}

const LIGHT = tokens(":root {");
const DARK = tokens(':root[data-theme="dark"]');

type Rgb = readonly [number, number, number];
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb;
const mix = (top: Rgb, bottom: Rgb, alpha: number): Rgb =>
  top.map((channel, i) => channel * alpha + bottom[i]! * (1 - alpha)) as unknown as Rgb;
const linear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb): number => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
function ratio(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

const THEMES = [
  ["clair", LIGHT],
  ["sombre", DARK],
] as const;

describe.each(THEMES)("Carte résultat (surface blanche), thème %s", (_name, theme) => {
  const card = rgb(theme.card!);

  it("le jeton « positive » (sauge ciblée) existe", () => {
    expect(theme.positive).toBeDefined();
  });

  it.each(["foreground", "muted-foreground", "positive"])("texte « %s » sur la carte : ≥ 4,5", (token) => {
    expect(ratio(rgb(theme[token]!), card)).toBeGreaterThanOrEqual(4.5);
  });

  it("segments du graphique (encre, atténué, encre à 50 %, positive) : ≥ 3 contre la carte", () => {
    const ink = rgb(theme.foreground!);
    const segments = {
      direct: ink,
      fixed: rgb(theme["muted-foreground"]!),
      fee: mix(ink, card, 0.5),
      margin: rgb(theme.positive!),
    };
    for (const [part, color] of Object.entries(segments)) {
      expect(ratio(color, card), part).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("styles.css : plus d'animation maison (ADR-0011, GSAP)", () => {
  it("ne définit ni @keyframes ni animation personnalisée : le mouvement vient de GSAP", () => {
    expect(CSS).not.toMatch(/@keyframes/);
    expect(CSS).not.toMatch(/gauge-arc/);
  });
});

describe("styles.css : curseur des éléments cliquables (Tailwind v4 ne met plus pointer sur les boutons)", () => {
  it("donne cursor: pointer aux boutons actifs et not-allowed aux boutons désactivés", () => {
    expect(CSS).toMatch(/button:not\(:disabled\)[^{]*\{[^}]*cursor:\s*pointer/);
    expect(CSS).toMatch(/button:disabled[^{]*\{[^}]*cursor:\s*not-allowed/);
  });
});
