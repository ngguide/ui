---
status: DRAFT
created: 2026-05-28
updated: 2026-05-28
---

# Manual Test Plan: M3 Design Tokens

## Overview

Validates the complete M3 design-token system shipped by `@ngguide/ui`: full color-role
coverage in light/dark across three contrast levels, the typography type scale, shape,
elevation, state-layer opacities, motion, the OS-default + scoped-manual theme model, the
overridable Roboto typeface, the published token-CSS contract, and no visual regression for
the existing button/fab/icon components.

Because the deliverable is pure CSS custom properties, most checks are performed in a browser
using **DevTools → Elements → Computed / Styles** (to read resolved `--md-*` values) and the
**Rendering** panel (to emulate `prefers-color-scheme`). The `apps/web` playground is the host.

## Prerequisites

- Repo installed: `pnpm install`.
- Dev server running: `pnpm exec nx serve web` → open the printed `http://localhost:4200`.
- A Baseline-2024 browser (Chrome/Edge 123+, Firefox 120+, Safari 17.5+) — `light-dark()` support.
- DevTools open; know how to:
  - read Computed styles for an element (to see resolved custom-property values),
  - emulate OS color scheme: Chrome DevTools → **Rendering** → *Emulate CSS media feature `prefers-color-scheme`*.
- For the distribution tests: a clean library build at `dist/libs/ui` via `pnpm exec nx build ui`.
- Reference values: standard-light `--md-sys-color-primary` = `#65558f`; standard-dark = `#cfbdfe`
  (2025 M3 color spec via MCU 0.4.0).

## Test Scenarios

- [ ] 1. Color roles & schemes
  - [ ] 1.1 Full color-role coverage is defined
    - **Preconditions:** App loaded; theme.css imported.
    - **Steps:**
      1. In DevTools Console run:
         `getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary')`
      2. Repeat for a representative spread: `--md-sys-color-on-primary`, `--md-sys-color-primary-container`, `--md-sys-color-secondary`, `--md-sys-color-tertiary`, `--md-sys-color-surface`, `--md-sys-color-surface-container-highest`, `--md-sys-color-on-surface-variant`, `--md-sys-color-outline`, `--md-sys-color-outline-variant`, `--md-sys-color-error`, `--md-sys-color-on-error-container`, `--md-sys-color-inverse-surface`, `--md-sys-color-inverse-primary`, `--md-sys-color-shadow`, `--md-sys-color-scrim`, `--md-sys-color-surface-tint`.
    - **Expected:** Every query returns a non-empty value (a `light-dark(...)`-resolved hex). No role returns an empty string.
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 No non-M3 (palette-key) roles are exposed
    - **Preconditions:** App loaded.
    - **Steps:**
      1. In Console: `getComputedStyle(document.documentElement).getPropertyValue('--md-sys-color-primary-palette-key-color')`
    - **Expected:** Returns an empty string — palette-key-color roles are intentionally excluded (Req 1.4).
    - _Requirements: 1.4_

  - [ ] 1.3 Standard-light values match the M3 baseline
    - **Preconditions:** OS/emulated color scheme = **light**; no `[data-theme]`/`[data-contrast]` forced on `:root`.
    - **Steps:**
      1. Read computed `--md-sys-color-primary` on `<html>`.
    - **Expected:** Resolves to `#65558f` (standard-light primary, 2025 M3 spec).
    - _Requirements: 1.3, 2.3, 3.3_

- [ ] 2. Light / dark mode
  - [ ] 2.1 Dark scheme resolves dark values
    - **Preconditions:** No forced `[data-theme]`.
    - **Steps:**
      1. DevTools Rendering → emulate `prefers-color-scheme: dark`.
      2. Read computed `--md-sys-color-primary` and `--md-sys-color-surface` on `<html>`.
      3. Observe the button/fab demo colors.
    - **Expected:** `--md-sys-color-primary` resolves to `#cfbdfe` (dark); surface becomes a dark tone; components visibly switch to the dark palette — with no reload.
    - _Requirements: 2.1, 2.2_

  - [ ] 2.2 Light scheme resolves light values
    - **Preconditions:** Continue from 2.1.
    - **Steps:**
      1. Switch emulation to `prefers-color-scheme: light`.
      2. Re-read `--md-sys-color-primary`.
    - **Expected:** Resolves back to `#65558f`; components return to the light palette.
    - _Requirements: 2.3_

- [ ] 3. Contrast levels
  - [ ] 3.1 Standard / medium / high produce distinct palettes
    - **Preconditions:** Emulated scheme = light.
    - **Steps:**
      1. In Console, set on a test element (or `<body>`): `document.body.setAttribute('data-contrast','standard')`; read `getComputedStyle(document.body).getPropertyValue('--md-sys-color-primary')`.
      2. Repeat with `data-contrast="medium"`, then `"high"`.
    - **Expected:** All three return values; medium and high differ from standard (higher-contrast primaries). No empty values.
    - _Requirements: 3.1, 3.2_

  - [ ] 3.2 Contrast scoping is subtree-local
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Add `data-contrast="high"` to one container that holds a button; leave the rest of the page default.
    - **Expected:** Only the descendants of that container use the high-contrast palette; siblings outside it stay standard.
    - _Requirements: 3.2_

- [ ] 4. Theme selection — OS default + scoped manual override
  - [ ] 4.1 Follows OS when nothing is forced
    - **Preconditions:** No `[data-theme]` anywhere.
    - **Steps:**
      1. Toggle emulated `prefers-color-scheme` between light and dark.
    - **Expected:** Resolved colors track the OS preference automatically.
    - _Requirements: 4.1, 4.2_

  - [ ] 4.2 Forced mode overrides OS
    - **Preconditions:** Emulated scheme = light.
    - **Steps:**
      1. Set `document.body.setAttribute('data-theme','dark')`.
      2. Read `--md-sys-color-surface` / observe components.
    - **Expected:** The body subtree renders dark despite the light OS preference.
    - _Requirements: 4.3_

  - [ ] 4.3 Forced mode is scoped to a subtree
    - **Preconditions:** Emulated scheme = light; page default (light).
    - **Steps:**
      1. Wrap one region with `data-theme="dark"`; leave the rest default.
    - **Expected:** Only that region is dark; the rest of the page remains light. A nested `data-theme="light"` inside the dark region flips back to light.
    - _Requirements: 4.4_

- [ ] 5. Typography type scale
  - [ ] 5.1 All roles expose all discrete properties
    - **Preconditions:** App loaded.
    - **Steps:**
      1. For each role/size combination (display/headline/title/body/label × large/medium/small), in Console read the five tokens, e.g.:
         `['font','weight','size','line-height','tracking'].map(p=>getComputedStyle(document.documentElement).getPropertyValue('--md-sys-typescale-body-large-'+p))`
      2. Spot-check `body-large-size` = `1rem`, `body-large-line-height` = `1.5rem`, `display-large-size` = `3.5625rem`, `label-small-size` = `0.6875rem`.
    - **Expected:** Every token returns a non-empty value; spot-checks match the M3 type scale.
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. Typeface default & override
  - [ ] 6.1 Defaults to Roboto
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Read `--md-ref-typeface-plain` and `--md-ref-typeface-brand`.
    - **Expected:** Both resolve to a stack beginning with `'Roboto'` and ending in a generic family (`sans-serif`).
    - _Requirements: 6.1_

  - [ ] 6.2 Overriding the ref token re-themes all type-scale roles
    - **Preconditions:** App loaded.
    - **Steps:**
      1. In Console: `document.documentElement.style.setProperty('--md-ref-typeface-plain', "'Comic Sans MS', cursive")`.
      2. Inspect a body-text element's computed `font-family`.
    - **Expected:** Body/label/title text now uses the overridden font without any component-style edits; display/headline (brand) unchanged until `--md-ref-typeface-brand` is also overridden.
    - _Requirements: 6.2_

- [ ] 7. Shape scale
  - [ ] 7.1 All corner steps defined with M3 values
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Read `--md-sys-shape-corner-{none,extra-small,small,medium,large,large-increased,extra-large,full}`.
    - **Expected:** Values are `0px, 4px, 8px, 12px, 16px, 20px, 28px, 9999px` respectively.
    - _Requirements: 7.1, 7.2_

- [ ] 8. Elevation
  - [ ] 8.1 Levels 0–5 defined and shadow-color responsive
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Read `--md-sys-elevation-level0` … `level5`.
      2. Apply `box-shadow: var(--md-sys-elevation-level3)` to a test element in light, then toggle dark mode and re-observe.
    - **Expected:** All six levels return non-empty `box-shadow` values; the shadow reflects `--md-sys-color-shadow` (responds to the active scheme).
    - _Requirements: 8.1, 8.2_

- [ ] 9. State-layer opacities
  - [ ] 9.1 Hover/focus/pressed/dragged opacities match M3
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Read `--md-sys-state-{hover,focus,pressed,dragged}-state-layer-opacity`.
    - **Expected:** `0.08`, `0.12`, `0.12`, `0.16` respectively.
    - _Requirements: 9.1, 9.2_

- [ ] 10. Motion
  - [ ] 10.1 Duration and easing sets defined with M3 values
    - **Preconditions:** App loaded.
    - **Steps:**
      1. Read a spread of `--md-sys-motion-duration-*` (e.g. `short1`=50ms, `medium2`=300ms, `extra-long4`=1000ms).
      2. Read `--md-sys-motion-easing-{standard,emphasized,emphasized-decelerate,legacy}`.
    - **Expected:** Durations match the M3 set; easings resolve to the expected `cubic-bezier(...)` curves (e.g. standard = `cubic-bezier(0.2, 0, 0, 1)`).
    - _Requirements: 10.1, 10.2_

- [ ] 11. Token contract & distribution
  - [ ] 11.1 Published package exposes the token stylesheet
    - **Preconditions:** `pnpm exec nx build ui` completed.
    - **Steps:**
      1. Confirm `dist/libs/ui/styles/theme.css` and `dist/libs/ui/styles/tokens/*.css` exist.
      2. In `dist/libs/ui/package.json`, confirm `exports["./styles/theme.css"]` is present alongside `.`/`./button`/`./fab`/`./icon`.
    - **Expected:** Files present; export subpath resolvable as `@ngguide/ui/styles/theme.css`.
    - _Requirements: 11.1, 11.3_

  - [ ] 11.2 Retheming requires no component-style edits
    - **Preconditions:** App loaded.
    - **Steps:**
      1. In Console, override several `--md-sys-color-*` and `--md-ref-typeface-*` tokens on `:root`.
    - **Expected:** Components visibly re-theme purely from token value changes; no component CSS was touched.
    - _Requirements: 11.2_

  - [ ] 11.3 Missing import degrades predictably
    - **Preconditions:** A scratch page/component that does NOT import `theme.css`.
    - **Steps:**
      1. Render a `gui-button` without importing the token stylesheet.
    - **Expected:** Component renders with unstyled/undefined colors (custom properties undefined) — confirming the documented required-import contract.
    - _Requirements: 11.3_

- [ ] 12. No regression for existing components
  - [ ] 12.1 button / fab / icon render correctly in standard light
    - **Preconditions:** Emulated scheme = light; no forced attributes.
    - **Steps:**
      1. Visually inspect the button, fab, and icon demos in `apps/web`.
      2. Confirm shapes, colors, elevation, and focus ring look correct.
    - **Expected:** Components render as intended M3 components; note colors reflect the 2025 baseline (e.g. primary `#65558f`) per the superseded-behavior entry — names/roles preserved.
    - _Requirements: 12.1, 12.2_

  - [ ] 12.2 Every previously-used token still resolves
    - **Preconditions:** App loaded.
    - **Steps:**
      1. For each of the 32 tokens the components consume (color/ref/elevation/shape/state), read its computed value on `<html>`.
    - **Expected:** None return empty — no token name was removed or renamed (no `:root` undefined-variable fallbacks triggered).
    - _Requirements: 12.1, 12.3_

  - [ ] 12.3 Automated generator coverage spec passes
    - **Preconditions:** Repo installed.
    - **Steps:**
      1. Run `pnpm exec nx test ui`.
    - **Expected:** All specs pass, including `generate-color-tokens.spec.ts` (contrast scopes, `light-dark()`, color-scheme, required token names).
    - _Requirements: 1.1, 12.1_

## Summary
- Total: 22 tests
- Passed: 0
- Failed: 0
- Skipped: 0
