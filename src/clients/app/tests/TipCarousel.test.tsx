import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TipCarousel } from "../src/components/TipCarousel";
import { TIP_COUNT, tipsFrom } from "../src/content/comprendre";
import { TIP } from "../src/lib/motion";
import { setReducedMotion } from "./motionEnv";

/** Conseil du moment (E01) en carrousel : un conseil visible, autres masqués, défilement pausable (WCAG 2.2.2). */
const NOW = new Date("2026-11-16T10:00:00");

function mount() {
  render(
    <MemoryRouter>
      <TipCarousel tips={tipsFrom(NOW)} />
    </MemoryRouter>,
  );
}

const visibleLinks = () => screen.getAllByRole("link", { name: /en savoir plus/i });

describe("tipsFrom", () => {
  it("commence par le conseil du jour, sans doublon", () => {
    const tips = tipsFrom(NOW);
    expect(tips).toHaveLength(TIP_COUNT);
    expect(new Set(tips.map((tip) => tip.slug)).size).toBe(TIP_COUNT);
  });
});

describe("carrousel de conseils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("montre un seul conseil à la fois", () => {
    setReducedMotion(true);
    mount();
    expect(visibleLinks()).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /^conseil \d sur/i })).toHaveLength(TIP_COUNT);
  });

  it("passe au conseil choisi par un point", () => {
    setReducedMotion(true);
    mount();
    const second = tipsFrom(NOW)[1];
    fireEvent.click(screen.getByRole("button", { name: `Conseil 2 sur ${TIP_COUNT}` }));
    expect(screen.getByText(second?.text ?? "")).toBeVisible();
    expect(screen.getByRole("button", { name: `Conseil 2 sur ${TIP_COUNT}` })).toHaveAttribute("aria-current", "true");
  });

  it("défile seul quand le mouvement est permis", () => {
    setReducedMotion(false);
    mount();
    act(() => {
      vi.advanceTimersByTime(TIP.intervalMs + 10);
    });
    expect(screen.getByRole("button", { name: `Conseil 2 sur ${TIP_COUNT}` })).toHaveAttribute("aria-current", "true");
  });

  it("ne défile pas sous « réduire les animations » (MOV-01)", () => {
    setReducedMotion(true);
    mount();
    act(() => {
      vi.advanceTimersByTime(TIP.intervalMs * 3);
    });
    expect(screen.getByRole("button", { name: `Conseil 1 sur ${TIP_COUNT}` })).toHaveAttribute("aria-current", "true");
  });

  it("s'arrête avec le bouton pause, et repart avec lecture", () => {
    setReducedMotion(false);
    mount();
    fireEvent.click(screen.getByRole("button", { name: /mettre en pause/i }));
    act(() => {
      vi.advanceTimersByTime(TIP.intervalMs * 2);
    });
    expect(screen.getByRole("button", { name: `Conseil 1 sur ${TIP_COUNT}` })).toHaveAttribute("aria-current", "true");

    fireEvent.click(screen.getByRole("button", { name: /reprendre le défilement/i }));
    act(() => {
      vi.advanceTimersByTime(TIP.intervalMs + 10);
    });
    expect(screen.getByRole("button", { name: `Conseil 2 sur ${TIP_COUNT}` })).toHaveAttribute("aria-current", "true");
  });

  it("garde un lien vers l'article du conseil affiché", () => {
    setReducedMotion(true);
    mount();
    const link = within(screen.getByRole("group", { name: /conseils/i })).getAllByRole("link", { name: /en savoir plus/i })[0];
    expect(link?.getAttribute("href")).toBe(`/comprendre/${tipsFrom(NOW)[0]?.slug}`);
  });
});
