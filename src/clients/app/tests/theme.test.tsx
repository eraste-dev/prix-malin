import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { THEME_STORAGE_KEY, parseTheme, resolveTheme } from "../src/lib/theme";

/** jsdom n'a pas matchMedia : on simule la préférence du système. */
function mockSystemPrefersDark(prefersDark: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: prefersDark,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

const toggle = () => screen.getByRole("button", { name: /passer en mode/i });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  mockSystemPrefersDark(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseTheme et resolveTheme", () => {
  it("accepte les trois choix et ignore le reste (retour au système)", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBe("system");
    expect(parseTheme("pourpre")).toBe("system");
    expect(parseTheme(null)).toBe("system");
  });

  it("résout « système » selon la préférence du système", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("Thème (EXG-51) — un clic bascule clair ↔ sombre", () => {
  it("affiche le bouton dès l'ouverture, sans forcer de thème", () => {
    render(<App />);
    expect(toggle()).toBeVisible();
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("système clair : un clic passe en sombre, un second revient en clair, et le choix est mémorisé", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(toggle()).toHaveAccessibleName("Passer en mode sombre");

    await user.click(toggle());
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(toggle()).toHaveAccessibleName("Passer en mode clair");

    await user.click(toggle());
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("système sombre : le premier clic passe en clair", async () => {
    mockSystemPrefersDark(true);
    const user = userEvent.setup();
    render(<App />);
    expect(toggle()).toHaveAccessibleName("Passer en mode clair");

    await user.click(toggle());
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("restaure le choix enregistré au chargement", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<App />);
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(toggle()).toHaveAccessibleName("Passer en mode clair");
  });
});

describe("Thème — cartes de l'onglet Réglages", () => {
  it("permettent de revenir au système et restent synchronisées avec le bouton", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(toggle());
    await user.click(screen.getByRole("button", { name: "Réglages" }));
    expect(screen.getByRole("radio", { name: "Sombre" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Système" }));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(toggle()).toHaveAccessibleName("Passer en mode sombre");
  });
});
