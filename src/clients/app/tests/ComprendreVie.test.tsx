import { render, screen, within } from "@testing-library/react";
import gsap from "gsap";
import { describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { ARTICLES, findArticle } from "../src/content/comprendre";
import { GUIDE } from "../src/lib/motion";
import { PATH_SLUGS, pathPosition, readingMinutes } from "../src/lib/reading";
import { setReducedMotion } from "./motionEnv";

/**
 * Comprendre vivant (E11, DESIGN.md « Comprendre ») : la liste est le chemin du prix (six étapes numérotées), les
 * articles ont une étape, un temps de lecture, un article suivant et une barre de lecture. Mouvement en GSAP
 * (ADR-0011) ; sous « réduire les animations » rien ne bouge (MOV-01).
 */
const list = () => {
  window.location.hash = "#/comprendre";
};
const article = (slug: string) => {
  window.location.hash = `#/comprendre/${slug}`;
};

describe("temps de lecture et place dans le chemin", () => {
  it("compte 200 mots par minute, une minute au moins", () => {
    expect(readingMinutes({ paragraphs: ["mot ".repeat(50)] })).toBe(1);
    expect(readingMinutes({ paragraphs: ["mot ".repeat(250), "mot ".repeat(250)] })).toBe(3);
    expect(readingMinutes({ paragraphs: [] })).toBe(1);
  });

  it("le chemin suit la formule du prix : coût direct, charges, coût de revient, marge, prix, seuil", () => {
    expect(PATH_SLUGS).toEqual(["cout-direct", "charges-fixes", "cout-de-revient", "marge", "prix", "seuil"]);
    expect(pathPosition("marge")).toBe(4);
    expect(pathPosition("cinq-erreurs")).toBeNull();
  });

  it("chaque slug du chemin existe dans le contenu", () => {
    for (const slug of PATH_SLUGS) expect(findArticle(slug)).toBeDefined();
  });
});

describe("la liste : le chemin du prix", () => {
  it("numérote les six étapes de 1 à 6, dans l'ordre", () => {
    list();
    render(<App />);
    const steps = screen.getAllByTestId("path-step").map((step) => step.textContent);
    expect(steps).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("range les deux articles de liste sous « À savoir », sans numéro", () => {
    list();
    render(<App />);
    const extra = screen.getByRole("region", { name: /à savoir/i });
    expect(within(extra).getAllByRole("link")).toHaveLength(ARTICLES.length - PATH_SLUGS.length);
    expect(within(extra).queryByTestId("path-step")).not.toBeInTheDocument();
  });

  it("chaque carte donne le temps de lecture", () => {
    list();
    render(<App />);
    for (const link of screen.getAllByRole("link", { name: /min de lecture/i })) {
      expect(link).toHaveTextContent(/\d+ min de lecture/);
    }
    expect(screen.getAllByRole("link", { name: /min de lecture/i })).toHaveLength(ARTICLES.length);
  });
});

describe("un article", () => {
  it("dit l'étape du chemin et le temps de lecture", () => {
    article("marge");
    render(<App />);
    expect(screen.getByText("Étape 4 sur 6")).toBeInTheDocument();
    expect(screen.getByText(/\d+ min de lecture/)).toBeInTheDocument();
  });

  it("un article hors chemin n'a pas d'étape", () => {
    article("cinq-erreurs");
    render(<App />);
    expect(screen.queryByText(/^Étape/)).not.toBeInTheDocument();
  });

  it("propose l'article suivant, et pas après le dernier", () => {
    article("marge");
    const first = render(<App />);
    const next = screen.getByRole("link", { name: /^suivant/i });
    expect(next).toHaveAttribute("href", "#/comprendre/prix");
    expect(next).toHaveTextContent((findArticle("prix") as { title: string }).title);
    first.unmount();

    const last = ARTICLES[ARTICLES.length - 1] as { slug: string };
    article(last.slug);
    render(<App />);
    expect(screen.queryByRole("link", { name: /^suivant/i })).not.toBeInTheDocument();
  });
});

describe("mouvement", () => {
  it("le chemin se trace en moins de 1,3 s au total", () => {
    expect(GUIDE.lineDuration).toBeLessThanOrEqual(1);
    expect(GUIDE.stepStagger * (ARTICLES.length - 1) + GUIDE.stepDuration).toBeLessThanOrEqual(1.3);
  });

  it("réduire les animations : aucun tween, aucun style en ligne, pas de barre de lecture", () => {
    setReducedMotion(true);
    const timeline = vi.spyOn(gsap, "timeline");
    list();
    const first = render(<App />);
    expect(timeline).not.toHaveBeenCalled();
    expect(first.container.querySelector("[style]")).toBeNull();
    first.unmount();

    article("marge");
    render(<App />);
    expect(screen.queryByTestId("reading-progress")).not.toBeInTheDocument();
  });

  it("mouvement autorisé : la liste joue une timeline et l'article a sa barre de lecture", () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, "timeline");
    list();
    const first = render(<App />);
    expect(timeline).toHaveBeenCalledTimes(1);
    first.unmount();

    article("marge");
    render(<App />);
    expect(screen.getByTestId("reading-progress")).toBeInTheDocument();
  });
});
