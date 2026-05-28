---
status: APPROVED
created: 2026-05-28
updated: 2026-05-28
---

# Implementation Plan: M3 Design Tokens

## Overview

Build the complete M3 token foundation for `@ngguide/ui`: a committed build-time color-token generator
(MCU), hand-authored non-color partials, a composing `theme.css` barrel, and ng-packagr distribution
of the token CSS as a published asset. The plan is split into 3 groups in dependency order. Each group
is independently mergeable — build, tests, and runtime behaviour stay green with only that group (and
earlier ones) applied.

This is a purely additive change: the new color tokens are a strict superset of the names button/fab
already consume (Req 12), and `apps/web` keeps its existing relative import, so nothing observably
breaks. There are no cutovers.

## Tasks

### Group A — Color-token generator + generated CSS (new feature surface)

Adds the MCU dependency, the committed generator script, an Nx target to run it, and the generated
color partial (with mode override). Blast radius: *safe* — new files + one new dev dependency; no
existing file changes behaviour yet (the generated CSS isn't imported until Group B).

- [ ] 1. Add the MCU dependency
  - Add `@material/material-color-utilities` to `devDependencies` in `package.json` (it is build-time only; the published package stays CSS-only).
  - Run `pnpm install`; if pnpm blocks any build script for it, add to `pnpm.onlyBuiltDependencies` only if actually required.
  - _Requirements: 1, 2, 3_

- [ ] 2. Create the color-token generator script
  - Create `libs/ui/tooling/generate-color-tokens.mts` per design §"Components and Interfaces / 1".
  - Seed `#6750A4`; for each contrast level (`standard`=0, `medium`=0.5, `high`=1) build a light and a dark `SchemeTonalSpot(Hct.fromInt(argbFromHex(seed)), isDark, contrast)`.
  - Enumerate the full role set from `MaterialDynamicColors` (do not use the smaller `scheme.primary` accessors) and resolve each via `role.getArgb(scheme)` → `hexFromArgb`.
  - Map each camelCase role to a kebab-case `--md-sys-color-<role>` token; emit one `light-dark(<lightHex>, <darkHex>)` declaration per role inside each `[data-contrast]` scope; emit `color-scheme: light dark` and the `[data-theme=light|dark]` override block.
  - Write output to `libs/ui/src/styles/tokens/_color.generated.css` with a "GENERATED — do not edit" header noting the seed.
  - _Requirements: 1, 2, 3, 4, 12_

- [ ] 3. Add the `generate-tokens` Nx target
  - Add a `generate-tokens` target to `libs/ui/project.json` using `nx:run-commands` to execute the `.mts` script.
  - Use a TS-capable loader already present in the repo (`@swc-node/register` or `jiti`). Verify the exact invocation works locally (see Notes — loader subpath needs confirming); pick whichever runs the `.mts` cleanly.
  - Do NOT make `build`/`serve` depend on this target — the output is committed.
  - _Requirements: 1, 2, 3_

- [ ] 4. Generate and commit the color partial
  - Run `pnpm exec nx run ui:generate-tokens`.
  - Commit the resulting `libs/ui/src/styles/tokens/_color.generated.css`.
  - Spot-check: `--md-sys-color-primary` standard scope ≈ `light-dark(#6750a4, #d0bcff)` and all three `[data-contrast]` scopes are present.
  - _Requirements: 1, 2, 3, 4_

- [ ] 5. Add the generator-output spec
  - Create `libs/ui/tooling/generate-color-tokens.spec.ts` per design §"Testing Strategy": assert the three contrast scopes exist, `color-scheme: light dark` and `light-dark(` are present, and every button/fab token name from Req 12 appears.
  - Register the spec in the `ui` test target `include` array in `libs/ui/project.json` (secondary/non-sourceRoot specs are not auto-discovered — CLAUDE.md). Run `pnpm exec nx reset` if the daemon caches stale options.
  - _Requirements: 1, 12_

- [ ] 6. Checkpoint — Group A verification
  - Run the new spec: `pnpm exec nx test ui`.
  - Confirm existing button/fab/icon specs still pass (unchanged).
  - Confirm `main` builds with only Group A applied: `pnpm exec nx run-many -t lint build` for `ui` (the generated CSS is not yet imported, so nothing else is affected).

### Group B — Non-color partials + barrel (feature surface)

Hand-authors the remaining M3 token families from spec, then rewrites `theme.css` as a barrel that
composes all partials (including the generated color file from Group A). Blast radius: *safe*, coupled
to Group A (the barrel `@import`s `_color.generated.css`). Existing token names are preserved as a
superset, so button/fab/icon keep rendering.

- [ ] 7. Author the reference + typography partials
  - Create `libs/ui/src/styles/tokens/_ref.css`: `--md-ref-typeface-{plain,brand}` defaulting to Roboto (with generic fallback in the stack), `--md-ref-typeface-weight-{regular,medium}` — preserving the names button/fab use (Req 12).
  - Create `libs/ui/src/styles/tokens/_typography.css`: full `--md-sys-typescale-<role>-<size>-{font,weight,size,line-height,tracking}` for display/headline/title/body/label × large/medium/small, font/weight referencing the ref tokens.
  - _Requirements: 5, 6, 12_

- [ ] 8. Author the shape, elevation, state, and motion partials
  - `_shape.css`: `--md-sys-shape-corner-{none,extra-small,small,medium,large,large-increased,extra-large,full}` (carry over existing values, add the missing steps).
  - `_elevation.css`: `--md-sys-elevation-level0..5` (carry over the current `color-mix` definitions keyed off `--md-sys-color-shadow`).
  - `_state.css`: existing `--md-sys-state-focus-indicator-{thickness,outer-offset}` plus `--md-sys-state-{hover,focus,pressed,dragged}-state-layer-opacity` (M3 values).
  - `_motion.css`: `--md-sys-motion-duration-*` and `--md-sys-motion-easing-*` (M3 values).
  - _Requirements: 7, 8, 9, 10, 12_

- [ ] 9. Rewrite `theme.css` as a barrel
  - Replace the contents of `libs/ui/src/styles/theme.css` with `@import` lines for `_ref`, `_color.generated`, `_typography`, `_shape`, `_elevation`, `_state`, `_motion` (order per design §"Barrel").
  - Verify no token name previously defined in `theme.css` and consumed by a component is dropped (Req 12) — cross-check against the button (19) and fab (14) token lists.
  - _Requirements: 1–12_

- [ ] 10. Checkpoint — Group B verification
  - Build the library: `pnpm exec nx build ui`.
  - Run all specs: `pnpm exec nx test ui` (generator spec + component specs) and `pnpm exec nx test web`.
  - Serve the demo and visually confirm button/fab render unchanged in light mode, and that forcing `[data-theme="dark"]` on a container flips colors, and `[data-contrast="high"]` changes the palette: `pnpm exec nx serve web`.
  - Confirm `main` builds/passes with only Groups A+B applied.

### Group C — Distribution as a published asset (feature surface)

Ships the token CSS in the published package via ng-packagr `assets` + a manual `exports` subpath, so
external consumers can `@import '@ngguide/ui/styles/theme.css'`. Blast radius: *safe* — packaging-only;
`apps/web` continues to use its in-repo relative import.

- [ ] 11. Configure ng-packagr asset + export
  - Edit `libs/ui/ng-package.json`: add `assets: [{ "input": "src/styles", "output": "styles", "glob": "**/*.css" }]` and an `exports` entry mapping `./styles/theme.css` (per design §"Packaging").
  - _Requirements: 11_

- [ ] 12. Verify the published output
  - Build: `pnpm exec nx build ui`.
  - Confirm `dist/libs/ui/styles/theme.css` and the token partials exist under `dist/libs/ui/styles/`.
  - Confirm `dist/libs/ui/package.json` `exports` includes the `./styles/theme.css` entry (ng-packagr merges the manual export).
  - Sanity-check relative `@import`s inside the shipped barrel resolve within the `styles/` dir.
  - _Requirements: 11_

- [ ] 13. Document the token contract
  - Update `libs/ui/README.md` (or the existing docs) with: the required `@import '@ngguide/ui/styles/theme.css'`, how to force mode (`[data-theme]`) and contrast (`[data-contrast]`), how to override the typeface via `--md-ref-typeface-*`, and that Roboto must be provided by the consumer.
  - _Requirements: 6, 11_

- [ ] 14. Final checkpoint — everything green
  - Full run: `pnpm exec nx run-many -t lint test build` for `ui` and `web`.
  - All requirements traceable to a shipped task (see mapping in each task's `_Requirements:`).
  - Confirm no button/fab/icon token regressed and the published package exposes the token CSS.

## Notes

### Scope boundaries

- **Dynamic color generation from an arbitrary source color at runtime is out of scope** — handled by the separate `m3-dynamic-color` spec. This spec only commits the statically generated baseline schemes; the generator deliberately shares MCU so the two stay consistent.
- **Shipping the Roboto font is out of scope** (Area 4 decision A) — consumers provide it.
- **Component refactors to consume new state/motion tokens are out of scope** — this spec only defines tokens; components adopt them in their own specs.

### Codebase verification findings

- `@swc-node/register` (1.11.1) and `jiti` (2.4.2) are present in devDependencies — both can run the `.mts` generator. The exact loader invocation in design §6 (`node --import @swc-node/register/esm-register`) must be confirmed against the installed version's exported subpaths; if it doesn't resolve, use `jiti` (e.g. `node_modules/.bin/jiti libs/ui/tooling/generate-color-tokens.mts`). This is an implementation detail, not a design change.
- `@material/material-color-utilities` is NOT currently a dependency (confirmed in `package.json`) — Task 1 adds it.
- No `tooling/`, `scripts/`, or `tools/` directory exists yet — Task 2 creates `libs/ui/tooling/`.
- Current `theme.css` is imported only via relative path in `apps/web/src/styles.css` (line 7); ng-packagr ships no assets today — Group C adds that capability.
- Existing token names to preserve (Req 12): button uses 19, fab uses 14, icon uses 0 `--md-*` tokens.
