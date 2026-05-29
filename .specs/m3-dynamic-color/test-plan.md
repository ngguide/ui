---
created: 2026-05-29
updated: 2026-05-29
---

# Manual Test Plan: M3 Dynamic Color

## Overview

Validates the `@ngguide/ui/theme` dynamic-color system against its requirements: scheme
generation from a seed color, all 9 M3 variants, 3 contrast levels, light/dark with
OS-driven switching, harmonized contrast-aware custom colors, global runtime application
over the static baseline, bootstrap + runtime configuration, programmatic read, fail-fast
validation, SSR-safety, and token-contract fidelity.

Tests are derived from `requirements.md` (R1–R11), not the implementation. Each case is
reproducible by an external observer — through the demo app (`apps/web`), a browser
DevTools session, the SSR build output, or a throwaway script that imports the public API.
Where a generated value is asserted, the **M3 reference** is the committed static contract
`libs/ui/src/styles/tokens/_color.generated.css` (same seed `#6750A4`, same algorithm), so
"correct" means "equals the M3 reference", never "looks right".

## Prerequisites

- Repo installed: `pnpm install`; Node 20.11+; commands prefixed with `pnpm exec`, `NX_NO_CLOUD=true`.
- A modern browser with DevTools (Elements + Computed styles + an OS/browser light-dark toggle).
- Ability to run the demo app: `pnpm exec nx serve web` (CSR) and to build/serve the SSR
  target: `pnpm exec nx build web` then `node dist/apps/web/server/server.mjs` (defaults to
  `http://localhost:4000`).
- For API-level checks, a scratch script (run via `pnpm exec jiti <file>.mts`) that imports
  from `@ngguide/ui/theme` — e.g. `generateScheme`, and a TestBed harness for `M3ThemeService`.
- Reference file open for value comparison: `libs/ui/src/styles/tokens/_color.generated.css`.
- The demo app dogfoods `provideM3Theme({ sourceColor: '#6750A4', variant: 'tonal-spot',
  contrast: 'standard', mode: 'auto', customColors: [{ name: 'brand-success', value: '#2e7d32' }] })`
  and renders "Brand seed" buttons that call `M3ThemeService.setTheme(...)`.

## Test Scenarios

- [x] 1. Scheme generation from a source color
  - [x] 1.1 Generate a full scheme from a hex seed
    - **Preconditions:** Scratch script can call `generateScheme({ sourceColor: '#6750A4' })`.
    - **Steps:**
      1. Call `generateScheme({ sourceColor: '#6750A4' })`.
      2. Inspect the returned object's `standard` scope keys.
    - **Expected:** A value is produced for every core role; each role has a `{ light, dark }`
      hex pair. No role is empty/undefined.
    - _Requirements: 1.1, 1.3_
  - [x] 1.2 Output equals the M3 reference algorithm
    - **Preconditions:** `_color.generated.css` open for comparison (seed `#6750A4`, tonal-spot, standard).
    - **Steps:**
      1. Call `generateScheme({ sourceColor: '#6750A4' })` (defaults: tonal-spot, standard).
      2. Read `standard['primary']`, `standard['on-primary']`, `standard['surface-container-high']`.
      3. Compare against the `--md-sys-color-*: light-dark(L, D)` values in the reference file.
    - **Expected:** `primary` = `light #65558f` / `dark #cfbdfe`; the other sampled roles match
      the reference file exactly (light and dark).
    - _Requirements: 1.2, 1.4_
  - [x] 1.3 Determinism — identical input yields identical output
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. Call `generateScheme` twice with the exact same config (incl. variant, contrast, custom colors).
      2. Deep-compare the two results.
    - **Expected:** The two outputs are byte-for-byte identical.
    - _Requirements: NFR Determinism, 1.4_

- [x] 2. Scheme variants
  - [x] 2.1 Default variant is Tonal Spot
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. Call `generateScheme({ sourceColor: '#6750A4' })` (no variant).
      2. Compare `standard['primary']` to the reference file value.
    - **Expected:** Equals the tonal-spot baseline (`light #65558f` / `dark #cfbdfe`).
    - _Requirements: 2.2_
  - [x] 2.2 All nine variants are accepted and distinct
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. For each of `monochrome, neutral, tonal-spot, vibrant, expressive, fidelity, content,
         rainbow, fruit-salad`, call `generateScheme({ sourceColor: '#6750A4', variant })`.
      2. Record `standard['primary'].light` for each.
    - **Expected:** All nine calls succeed; at least several variants produce different `primary`
      values from tonal-spot (e.g. `vibrant` ≠ `tonal-spot`). No call throws.
    - _Requirements: 2.1, 2.3_
  - [x] 2.3 No non-M3 variant is exposed
    - **Preconditions:** TypeScript scratch file.
    - **Steps:**
      1. Attempt to type `variant: 'rainbow-sherbet'` (a made-up name) in an `M3ThemeConfig`.
    - **Expected:** TypeScript rejects it; only the nine M3 variant strings are assignable.
    - _Requirements: 2.4_

- [x] 3. Contrast levels
  - [x] 3.1 Default contrast is standard
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. Call `generateScheme({ sourceColor: '#6750A4' })`.
      2. Compare its `standard` scope to the standard scope in the reference file.
    - **Expected:** Values match the reference's standard (`:root`) scope.
    - _Requirements: 3.2_
  - [x] 3.2 Medium and high adjust tones
    - **Preconditions:** Scratch script + reference file (which has all three scopes).
    - **Steps:**
      1. Call `generateScheme({ sourceColor: '#6750A4' })`.
      2. Compare `standard`, `medium`, `high` scopes to each other and to the reference's
         `[data-contrast='medium']` / `[data-contrast='high']` blocks.
    - **Expected:** `medium` ≠ `standard` ≠ `high`; each scope matches the corresponding reference block.
    - _Requirements: 3.1, 3.3_

- [x] 4. Light/dark and OS-driven switching
  - [x] 4.1 Both light and dark are emitted for one config
    - **Preconditions:** Demo app running (`nx serve web`); DevTools open.
    - **Steps:**
      1. Inspect `<head>` for the `style[data-m3-dynamic]` element.
      2. Read a few `--md-sys-color-*` declarations.
    - **Expected:** Each declaration is `light-dark(<lightHex>, <darkHex>)` — both sides present.
    - _Requirements: 4.1_
  - [x] 4.2 Active mode follows the OS preference (auto)
    - **Preconditions:** Demo app running with default config (`mode: 'auto'`).
    - **Steps:**
      1. Set OS/browser to light; observe the app and a computed `--md-sys-color-surface` value.
      2. Switch OS/browser to dark without reloading.
    - **Expected:** UI re-themes to the dark side automatically; the dynamic `<style>` has
      `color-scheme: light dark` on `:root`; no developer re-invocation needed.
    - _Requirements: 4.2_
  - [x] 4.3 Forced mode overrides the OS
    - **Preconditions:** Demo app; temporarily set `provideM3Theme({ ..., mode: 'dark' })` (or call
      `setTheme` with `mode: 'dark'`).
    - **Steps:**
      1. Apply a config with `mode: 'dark'`.
      2. Toggle the OS preference between light and dark.
    - **Expected:** App stays dark regardless of OS; the `:root` `color-scheme` is `dark`.
      Repeat with `mode: 'light'` → stays light (`color-scheme: light`).
    - _Requirements: 4.3_
  - [x] 4.4 Mode behaviour matches the static baseline
    - **Preconditions:** A page using only the static baseline (no `provideM3Theme`) and the demo app.
    - **Steps:**
      1. Compare light/dark switching of the static baseline vs a dynamic `auto` scheme.
    - **Expected:** Both follow the OS via `light-dark()` + `color-scheme` identically.
    - _Requirements: 4.4_

- [x] 5. Custom (extended) colors
  - [x] 5.1 Each custom color emits four roles, light + dark
    - **Preconditions:** Demo app running (default config has `brand-success`).
    - **Steps:**
      1. In DevTools, search the dynamic `<style>` for `brand-success`.
    - **Expected:** Present: `--md-sys-color-brand-success`, `--md-sys-color-on-brand-success`,
      `--md-sys-color-brand-success-container`, `--md-sys-color-on-brand-success-container`,
      each as a `light-dark(L, D)` pair.
    - _Requirements: 5.1, 5.2_
  - [x] 5.2 Harmonization is on by default and toggleable
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. `generateScheme({ sourceColor: '#6750A4', customColors: [{ name: 'brand', value: '#00FF00' }] })`.
      2. `generateScheme({ sourceColor: '#6750A4', customColors: [{ name: 'brand', value: '#00FF00', harmonize: false }] })`.
      3. Compare `standard['brand'].light` between the two.
    - **Expected:** Default (harmonized) value differs from the `harmonize: false` value
      (hue rotated toward the source). With `harmonize: false`, the value reflects the raw `#00FF00` family.
    - _Requirements: 5.3_
  - [x] 5.3 Custom roles respond to contrast
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. `generateScheme` with one custom color, then read `standard['brand']` vs `high['brand']`.
    - **Expected:** The custom role's value differs across contrast scopes, like core roles.
    - _Requirements: 5.4_
  - [x] 5.4 Custom name collision with a core role is rejected
    - **Preconditions:** Scratch script / app bootstrap.
    - **Steps:**
      1. Configure a custom color named `primary` (collides directly).
      2. Configure a custom color named `surface` (derives `on-surface`, a core role).
    - **Expected:** Both fail fast with a descriptive error naming the offending custom color
      and the colliding `--md-sys-color-*` role. No silent overwrite of a core role.
    - _Requirements: 5.5_

- [x] 6. Global runtime application
  - [x] 6.1 Applied scheme writes the token contract at document root
    - **Preconditions:** Demo app running with default config.
    - **Steps:**
      1. In DevTools Elements, confirm a single `style[data-m3-dynamic]` at the end of `<head>`.
      2. Confirm it declares `--md-sys-color-*` under `:root` / `[data-contrast]` scopes.
    - **Expected:** The dynamic `<style>` is present at document-root scope with the contract names.
    - _Requirements: 6.1_
  - [x] 6.2 Components reflect the scheme with no component changes
    - **Preconditions:** Demo app; buttons/fabs rendered.
    - **Steps:**
      1. Click a "Brand seed" button with a clearly different seed (e.g. `#B3261E`).
      2. Observe the rendered buttons/fabs.
    - **Expected:** Component colors change to the new scheme immediately; no component code changed.
    - _Requirements: 6.2_
  - [x] 6.3 Re-applying fully replaces prior dynamic values
    - **Preconditions:** Demo app; DevTools.
    - **Steps:**
      1. Apply seed A, note `--md-sys-color-primary` and that exactly one `style[data-m3-dynamic]` exists.
      2. Apply seed B.
    - **Expected:** Still exactly one `style[data-m3-dynamic]` element; its text is fully replaced
      (primary now reflects seed B; no stale seed-A values linger).
    - _Requirements: 6.3_
  - [x] 6.4 No dynamic config → static baseline remains
    - **Preconditions:** A page/app that imports the baseline `theme.css` but does NOT call `provideM3Theme`.
    - **Steps:**
      1. Load it; inspect `<head>`.
    - **Expected:** No `style[data-m3-dynamic]`; `--md-sys-color-*` come from the static baseline; UI renders themed.
    - _Requirements: 6.4_
  - [x] 6.5 Dynamic values override the static baseline
    - **Preconditions:** Demo app (imports baseline AND uses `provideM3Theme`); pick a seed whose
      `primary` differs from the baseline (e.g. `#00629D`).
    - **Steps:**
      1. Apply the differing seed.
      2. In DevTools Computed, read the resolved `--md-sys-color-primary` on `:root`.
    - **Expected:** The computed value equals the dynamic (seed) value, not the baseline — the
      dynamic `<style>` wins by document order.
    - _Requirements: 6.5_

- [x] 7. Configuration at startup and runtime
  - [x] 7.1 Configurable at bootstrap with all options
    - **Preconditions:** Demo app `app.config.ts` with `provideM3Theme({...})`.
    - **Steps:**
      1. Confirm the config accepts `sourceColor`, `variant`, `contrast`, `mode`, `customColors`.
      2. Start the app.
    - **Expected:** App starts; the configured scheme is in effect.
    - _Requirements: 7.1_
  - [x] 7.2 Configured scheme is present on first render
    - **Preconditions:** Demo app (CSR) and SSR build.
    - **Steps:**
      1. CSR: hard-reload; before any interaction, inspect `<head>` for the dynamic `<style>`.
      2. Note that no flash of an unstyled/baseline-only theme is visible.
    - **Expected:** The dynamic `<style>` exists from the first painted frame; first render is already themed.
    - _Requirements: 7.2_
  - [x] 7.3 Scheme can be changed after startup
    - **Preconditions:** Demo app running.
    - **Steps:**
      1. Click each "Brand seed" button in turn.
    - **Expected:** The running app re-themes each time (`M3ThemeService.setTheme` applied live).
    - _Requirements: 7.3_

- [x] 8. Programmatic read of computed values
  - [x] 8.1 Read role→value mapping without applying
    - **Preconditions:** TestBed harness or running app with `M3ThemeService` injected and a theme set.
    - **Steps:**
      1. Call `resolve({ mode: 'light', contrast: 'standard' })`.
      2. Read `roles['primary']` and a custom role.
    - **Expected:** A flat role→hex map covering every core role and every custom role for that mode/contrast.
    - _Requirements: 8.1, 8.2_
  - [x] 8.2 Read values equal the applied values
    - **Preconditions:** App with a theme applied; DevTools.
    - **Steps:**
      1. Get `resolve({ mode: 'light' })['primary']`.
      2. Compare to the light side of `--md-sys-color-primary` in the applied `<style>` and to the
         DevTools computed value under a light `color-scheme`.
    - **Expected:** All three agree.
    - _Requirements: 8.3_

- [x] 9. Fail-fast on invalid input
  - [x] 9.1 Invalid source color throws a descriptive error
    - **Preconditions:** App bootstrap or `setTheme`.
    - **Steps:**
      1. Configure `sourceColor: '#zzz'` (and separately `'not-a-color'`).
    - **Expected:** Throws an error identifying `sourceColor` and the offending value; the app does
      not start themed with a substituted color.
    - _Requirements: 9.1, 9.3_
  - [x] 9.2 Invalid custom color throws, naming which one
    - **Preconditions:** `setTheme`.
    - **Steps:**
      1. Configure `customColors: [{ name: 'brand', value: 'nope' }]`.
    - **Expected:** Throws an error naming the custom color `brand` and the invalid value.
    - _Requirements: 9.2_
  - [x] 9.3 No silent default substitution
    - **Preconditions:** `setTheme` with an invalid `sourceColor`.
    - **Steps:**
      1. Apply the invalid config; inspect whether any `style[data-m3-dynamic]` was written.
    - **Expected:** No scheme is applied (the call threw before applying); nothing falls back to a default seed.
    - _Requirements: 9.3_
  - [x] 9.4 Valid shorthand / uppercase hex is accepted
    - **Preconditions:** Scratch script.
    - **Steps:**
      1. Generate with `sourceColor: '#abc'` and with `'#AABBCC'`.
    - **Expected:** Both succeed; `#abc` normalizes to the same scheme as `#aabbcc`.
    - _Requirements: 9.1 (boundary), 1.1_

- [x] 10. Server-side rendering safety
  - [x] 10.1 Scheme computes without a DOM
    - **Preconditions:** SSR build (`nx build web`).
    - **Steps:**
      1. Build the `web` SSR target.
      2. Observe the build prerenders the index route without error.
    - **Expected:** Build succeeds; the server bootstrap runs `provideM3Theme` and generates the scheme
      with no browser DOM.
    - _Requirements: 10.1_
  - [x] 10.2 Applying on the server does not throw; HTML carries the theme
    - **Preconditions:** SSR build output present (`dist/apps/web/browser/index.html`).
    - **Steps:**
      1. Open the prerendered `index.html`.
      2. Search for `data-m3-dynamic`, `--md-sys-color-primary`, and `color-scheme`.
    - **Expected:** The `<style data-m3-dynamic>` is serialized into the server HTML with
      `--md-sys-color-primary: light-dark(#65558f, #cfbdfe)` and `color-scheme: light dark`. No render error.
    - _Requirements: 10.2_
  - [x] 10.3 No theme shift on hydration
    - **Preconditions:** SSR server running (`node dist/apps/web/server/server.mjs`).
    - **Steps:**
      1. Load `http://localhost:4000/` with cache disabled; watch the first paint through hydration.
      2. Compare the server `--md-sys-color-*` values to the client-applied ones.
    - **Expected:** Identical CSS both sides; no visible flash/recolor when the client hydrates.
    - _Requirements: 10.3_

- [x] 11. Token-contract fidelity
  - [x] 11.1 Core role names exactly match the static contract
    - **Preconditions:** Scratch script + `_color.generated.css`.
    - **Steps:**
      1. Collect `Object.keys(generateScheme({ sourceColor: '#6750A4' }).standard)`.
      2. Collect the unique `--md-sys-color-<token>` names from the reference file.
      3. Compare the two sets.
    - **Expected:** The sets are equal — same spelling, same membership (49 core roles), none added/omitted.
    - _Requirements: 11.1, 11.2_
  - [x] 11.2 Divergence from the contract is detectable
    - **Preconditions:** The parity unit test exists (`engine.spec.ts`).
    - **Steps:**
      1. Run `pnpm exec nx test ui`.
      2. (Optional) Temporarily add a fake role to the reference file and re-run.
    - **Expected:** The suite passes against the real contract; an artificial divergence makes the
      parity test fail — so drift between dynamic and static role sets is caught.
    - _Requirements: 11.3_

- [x] 12. Accessibility (non-functional)
  - [x] 12.1 Standard contrast meets WCAG AA for key pairings
    - **Preconditions:** Demo app with default (`standard`) contrast; a contrast-ratio checker.
    - **Steps:**
      1. Measure contrast for `on-primary` vs `primary`, `on-surface` vs `surface`,
         `on-primary-container` vs `primary-container`, in light and dark.
    - **Expected:** Each text/background pairing meets WCAG 2.1 AA, as guaranteed by the M3 algorithm.
    - _Requirements: NFR Accessibility_
  - [x] 12.2 Medium/high progressively increase contrast
    - **Preconditions:** Scratch script + contrast checker.
    - **Steps:**
      1. Measure `on-surface` vs `surface` contrast at `standard`, `medium`, `high`.
    - **Expected:** Contrast ratio is non-decreasing standard → medium → high.
    - _Requirements: NFR Accessibility, 3.3_

## Summary
- Total: 30 tests
- Passed: 30
- Failed: 0
- Skipped: 0

_Note: 6.3 initially failed (SSR + client hydration produced two identical `<style data-m3-dynamic>` elements). Fixed — the applier now adopts the server-serialized `<style>` on first `apply()`; re-tested: single element after hydration, runtime re-theme reuses it, no visual shift._
