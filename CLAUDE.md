# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Prix Malin is a selling-price advisor for small merchants in Côte d'Ivoire (F CFA, French UI). It is built as a **system** (public app, API, back-office), not a single app. The calculation engine (`src/clients/domain`) and the public app (`src/clients/app`, lot 1: React + Vite PWA, offline, no account) exist; the back-office and infra directories are empty placeholders. Current status and what is left: `docs/19-etat-lot-1.md`. Docs and UI copy are in French; code identifiers are in English.

## Commands

The pnpm workspace root is `src/`, not the repository root. Run pnpm from there.

```bash
cd src && pnpm install
cd src && pnpm test                # all packages
cd src && pnpm typecheck
cd src/clients/domain && pnpm test:coverage     # 100% threshold on statements/branches/functions/lines
cd src/clients/domain && pnpm vitest run tests/pricing.test.ts            # one file
cd src/clients/domain && pnpm vitest run -t "mode TTC"                    # one test by name
```

A root `justfile` wraps these (`just`, `just dev`, `just test`, `just check`, `just build`, `just coverage`); it needs `just` (`winget install Casey.Just`).

**Running app tests (L-35):** `pnpm test` from `src/` runs everything; coverage is `pnpm test:coverage` from `src/clients/app` (`just coverage` does both packages). Never give vitest a file filter or use `pnpm --filter … test`: it breaks React ("Invalid hook call"). For one test use `pnpm exec vitest run -t "name start"` from `src/clients/app`.

No lint step exists yet. Node 22+, pnpm 10.

## Architecture

**Specs drive code (SDD + TDD).** `docs/` is the source of truth, and `docs/03-regles-metier.md` is the executable spec of the engine: rule IDs `RG-xx` and reference test vectors. A rule change means updating that file and the tests in the same change; write the failing test first and cite the `RG-xx`. Requirement IDs (`EXG-xx`, `NFR-xx`, `BO-xx`, `SYS-xx`) are defined in `docs/02`, `docs/10`, `docs/09`. Architectural decisions live in `docs/adr/`; add an ADR for any hard-to-reverse choice. Open questions are tracked in `docs/08-questions-ouvertes.md`.

**Engine (`src/clients/domain`)** is a pure TypeScript library: no dependencies, no UI, network, storage, clock or randomness. A test (`tests/purity.test.ts`) fails if `src/` imports anything outside `./`. Do not add dependencies to it.

How the engine fits together (spans several files):
- `ratio.ts` does exact arithmetic on `bigint` fractions (ADR-0002). All money maths stays in `Ratio`; conversion to `number` happens only when building the result (`toNumber`). Inputs are converted with at most 6 decimals.
- `context.ts` validates input and builds the shared exact `Context` (direct cost, fixed cost per unit, full cost, fee/VAT rates). `buildBreakdown` produces every output field from an HT price. Both `computePrice` (`pricing.ts`) and `analyzePrice` / `compareWithCompetitor` (`analysis.ts`) go through it, so a new indicator is added once there.
- Functions never throw on bad input; they return `{ ok: false, reason }` with a `PricingError`.

Domain rules that are easy to get wrong:
- Margin is a share of the **selling price** (RG-04), not of cost. Payment fees are computed on the **HT price** (decision Q-07).
- Rounding is always **upward**, never below the raw price: to the chosen step when enabled, to the next franc when disabled. In TTC mode the **TTC** price is rounded and HT is derived (RG-06); the HT/TTC switch also sets the base of the competitor price and of a user-entered price.
- VAT is optional, off by default, single rate (18%); it is never a cost nor part of the margin. Costs are entered as paid.
- Limits: margin 0-70, fees 0-20, volume an integer ≥ 1.

**App (`src/clients/app`)** — how it fits together:
- Data: `lib/model.ts` (zod schemas, `newCalcul`, `toPricingInput`) → `lib/outcome.ts` (`computeOutcome` turns a `Calcul` into a price, a verdict or a guiding message; components never call the engine directly). State is three zustand stores plus one for "Mon activité", persisted behind `StorageAdapter` and validated on read (`lib/stores.ts`, ADR-0012); provided by `StoreProvider` (no global singleton, tests use a fresh `localStorage`).
- Screens are in `pages/` under a `HashRouter` (ADR-0014); `App.tsx` holds the routes, the first-launch redirect and the error boundary. The calculate screen is a fixed vertical stepper (`StepRail` + `Step`); pure helpers in `lib/steps.ts`.
- Content (articles, glossary, onboarding) is schema-validated data in `content/` (ADR-0005), never inline in components. Charges shared across products: `lib/shared.ts`.
- Motion is GSAP only (ADR-0011); every timing and `motionAllowed()` live in `lib/motion.ts`. Offline/PWA: ADR-0013, `docs/18-emballage-natif.md`.
- UI follows `docs/ui-ux/DESIGN.md` (update it first). shadcn components live in `components/ui/` and are excluded from coverage.

**Planned system** (ADR-0001, 0003, 0008, docs/09):
- The app works fully offline and the server only enriches it (content, config), never blocks it.
- Prices and costs stay on the device; the engine is client-side only, the server does not recompute prices.
- Stack: React + Vite + Capacitor for the app (`src/clients/app`), AdonisJS + PostgreSQL for API and back-office (`src/admin`). Build order: app alone first (content embedded as versioned data with a schema), then API + back-office B0 (content/config), then public SEO site, then B1-B3. Keep lot-1 code ready for that: storage behind an interface, content as schema-versioned data, rights checks through a single always-allowed entry point.

## Working agreements

- **Read `docs/17-lecons-apprises.md` at the start of every session**, and add a line (`L-xx`) in the same session whenever the owner corrects a mistake or a workaround is found. **Before any UI change, read `docs/ui-ux/DESIGN.md` (tokens + do/don't) and update it first, then `styles.css`.** Key rules: UI uses shadcn/ui (never hand-written components), the images in `docs/ui-ux/` inspire style not content, verify the real rendering before saying it works.

- **Prefer proven dependencies over hand-rolled code** (animation: `motion` or GSAP; UI: shadcn/ui; etc.): search what exists first, build by hand only if nothing fits. The only exception is `src/clients/domain`, which stays dependency-free. A structural dependency gets a recommendation, then an ADR (L-33).
- Keep the repository root minimal (`docs/`, `src/`, `.gitignore`, `justfile`, `README.md`, `CLAUDE.md`). Tooling files belong in `src/`.
- Do not create new top-level or `src/` directories without asking. The owner defined `admin`, `clients`, `infra`; shared code that clients use lives in `clients/`.
- On Windows, a shell whose working directory is inside a folder blocks moving that folder; run `mv` from the repository root.
- Do not reuse any code from the owner's employer projects; this is a separate personal project (open question Q-21 in docs/08).
