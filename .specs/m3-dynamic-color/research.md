---
created: 2026-05-29
updated: 2026-05-29
---

# Research: M3 Dynamic Color

## Problem Statement

`@ngguide/ui` ships a **static** M3 token system (`m3-tokens`): `--md-sys-color-*` roles pre-generated
from one fixed seed at build time and emitted as CSS using `light-dark()` pairs under
`[data-contrast]` scopes. This spec adds **runtime dynamic color** — an Angular API that generates a
full M3 scheme from an arbitrary source color (plus optional custom colors), across all 9 M3 scheme
variants and 3 contrast levels, and applies it by writing the *same* token contract to the document,
SSR-safely. The research below catalogues the meaningfully-distinct ways to build each part. No
decisions are made here — `spec:design` picks one variant per area.

Grounding facts that shape every area (verified against the installed code, not memory):

- The color algorithm library **`@material/material-color-utilities` (MCU) v0.4.0 is already in the
  repo**, but only as a **root `devDependency`** used by the build-time generator
  `libs/ui/tooling/generate-color-tokens.mts`. `libs/ui/package.json` declares **only `@angular/core`
  as a peer** and **no runtime deps**; ng-packagr externalizes third-party deps, so runtime use of
  MCU requires adding it to `libs/ui/package.json`. [mcu-pkg][libui-pkg]
- The static generator already uses the **`DynamicScheme` / `MaterialDynamicColors` / `Hct`** path
  (49 roles, 2025 M3 spec) — dynamic color can reuse the identical role enumeration so the contract
  matches by construction. [gen-mts]
- **`apps/web` has no SSR today** (CSR-only; no `@angular/ssr`, no server target) and the repo uses
  **zero** `DOCUMENT` / `Renderer2` / `PLATFORM_ID` / `afterNextRender` anywhere. The library must
  still be SSR-*safe* per Req 10, so SSR handling is greenfield. [web-proj][no-dom]
- App bootstrap is **zoneless**, `ApplicationConfig.providers` only, **no `APP_INITIALIZER`** in use
  yet. [app-config]

## Problem Areas

### 1. Scheme generation engine

_Related requirements: 1.1–1.4, 2.1–2.4, 3.1–3.3_

How the `--md-sys-color-*` ARGB values are computed for a (source, variant, contrast, mode) tuple.

#### Variant A: MCU `DynamicScheme` + `MaterialDynamicColors` (low-level)

**How it works:** `new DynamicScheme({ sourceColorHct: Hct.fromInt(argb), variant: Variant.X,
contrastLevel, isDark })`, then enumerate roles via `MaterialDynamicColors.<role>.getArgb(scheme)` —
exactly the enumeration the static generator already performs, but at runtime with an arbitrary seed.
The `Variant` enum carries all 9 M3 variants; `contrastLevel` is a number (M3 uses 0 / 0.5 / 1 for
standard / medium / high). [mcu-dynamicscheme][mcu-variant][gen-mts]

**Pros:**
- Produces the full 2025 M3 role set, identical mechanism to `m3-tokens` → contract matches by
  construction (Req 11).
- All 9 variants and all 3 contrast levels from one code path; no per-variant branching.
- Reuses already-proven role-enumeration logic from `generate-color-tokens.mts`.

**Cons:**
- Requires our own loop to assemble light + dark + contrast scopes (no one-call convenience).
- Couples us to the `DynamicScheme` options-object shape (stable in 0.4.0, but evolving upstream).

**Effort:** Low | **Risk:** Low
**Codebase fit:** Same MCU API family already used in `libs/ui/tooling/generate-color-tokens.mts:14-22,65-71`; would move that knowledge from build-time tooling into shipped library code.
**Evidence:** `DynamicScheme({sourceColorHct,variant,contrastLevel,isDark})` constructor and `Variant` enum (9 values) confirmed in installed 0.4.0 d.ts. [mcu-dynamicscheme][mcu-variant]

#### Variant B: MCU per-variant `Scheme*` subclasses (positional)

**How it works:** Map each variant to its subclass — `SchemeTonalSpot`, `SchemeVibrant`,
`SchemeExpressive`, `SchemeNeutral`, `SchemeMonochrome`, `SchemeFidelity`, `SchemeContent`,
`SchemeRainbow`, `SchemeFruitSalad` — each `new SchemeX(sourceColorHct, isDark, contrastLevel)`, then
the same `MaterialDynamicColors` enumeration. This is the exact call shape the current generator uses
(`new SchemeTonalSpot(hct, isDark, contrast)`). [gen-mts][mcu-schemefiles]

**Pros:**
- Byte-for-byte the construction style already in the repo generator.
- Each subclass is a thin wrapper over `DynamicScheme`, so output equals Variant A.

**Cons:**
- Needs an explicit 9-entry variant→class lookup map to satisfy Req 2.
- Upstream `main` documents the positional subclass constructors as **deprecated** in favour of the
  `DynamicScheme` options object; 0.4.0 still ships them, but choosing this path adopts an API the
  upstream is moving away from. [mcu-migrate]

**Effort:** Low | **Risk:** Medium (deprecation trajectory)
**Codebase fit:** Identical to `generate-color-tokens.mts:66`.
**Evidence:** All 9 `scheme_*.js` files present in installed 0.4.0; `SchemeExpressive(sourceColorHct, isDark, contrastLevel, specVersion?, platform?)` signature confirmed; upstream migration note marks positional constructors deprecated. [mcu-schemefiles][mcu-migrate]

#### Variant C: MCU `themeFromSourceColor` + `Theme` convenience

**How it works:** `themeFromSourceColor(argb, customColors)` returns a `Theme` with `schemes.light` /
`schemes.dark` and `customColors`. Pair with MCU's `applyTheme(theme, {target, dark})` to write CSS
vars. One call covers seed + custom colors + light/dark. [mcu-themeutils]

**Pros:**
- Single high-level call; custom colors handled by the same helper (Req 5 base roles).
- Least code to reach a first working theme.

**Cons:**
- `Theme.schemes` is typed as the **legacy `Scheme`** (2021-era role set), **not**
  `MaterialDynamicColors` — its role set does **not** match the `m3-tokens` 2025 contract (Req 11
  violation). [mcu-themeutils]
- **No contrast-level parameter** anywhere in `themeFromSourceColor` / `customColor` → cannot satisfy
  Req 3 or Req 5.4.
- `applyTheme` writes a **single mode** (`dark?: boolean`) to a DOM `target` — not `light-dark()`
  pairs — so OS auto-switch (Req 4.2) and SSR-safety (Req 10) don't come for free.

**Effort:** Low | **Risk:** High (contract + contrast mismatch)
**Codebase fit:** Diverges from the `DynamicScheme`/`MaterialDynamicColors` path the static tokens use.
**Evidence:** `Theme.schemes: {light: Scheme; dark: Scheme}`, `themeFromSourceColor(source, customColors?)`, and `applyTheme(theme, {dark?, target?, brightnessSuffix?, paletteTones?})` confirmed in installed 0.4.0 `utils/theme_utils.d.ts`; no contrast parameter present. [mcu-themeutils]

### 2. Color-engine packaging

_Related requirements: 7.1, Constraints (consume contract, ship MCU), NFR (bundle)_

How MCU reaches the consumer's app, and which entry point exposes the new API.

#### Variant A: MCU as a `dependencies` entry of `@ngguide/ui`

**How it works:** Add `@material/material-color-utilities` to `libs/ui/package.json` `dependencies`.
ng-packagr keeps it external but declares it, so package managers install it transitively. [libui-pkg][ngpkg]

**Pros:**
- Consumers get a working theme API with no extra install step.
- Version pinned by the library; predictable behaviour.

**Cons:**
- Adds a hard transitive runtime dep to every consumer, even those who only use static tokens.
- MCU ships ESM with extensionless internal imports; must confirm it resolves under consumer bundlers
  (it's `type: module`, `sideEffects` unset). [mcu-pkg]

**Effort:** Low | **Risk:** Low
**Codebase fit:** New runtime dep; today `libs/ui` has none. dependency-checks rule currently only
ignores `tooling/**`, so a shipped import will be enforced to appear here. [eslint-depcheck]
**Evidence:** `libs/ui/package.json` has no `dependencies`; published `dist` only gains `tslib`; ng-packagr externalizes deps. [libui-pkg][ngpkg]

#### Variant B: MCU as a `peerDependencies` entry

**How it works:** Declare MCU as a peer (+ `peerDependenciesMeta` optional if static-only use should
stay install-free). Consumers using dynamic color install MCU themselves. [libui-pkg]

**Pros:**
- No forced dep for static-only consumers (if marked optional).
- Single MCU instance in the consumer tree; matches what `@nx/dependency-checks` nudged toward during
  `m3-tokens`.

**Cons:**
- Dynamic-color users must add MCU manually or hit an unmet-peer error.
- Version-skew risk between what we generate against and what the consumer installs.

**Effort:** Low | **Risk:** Medium (consumer install friction / skew)
**Codebase fit:** Mirrors the existing `@angular/core` peer pattern in `libs/ui/package.json`.
**Evidence:** Current peer-only declaration in `libs/ui/package.json`. [libui-pkg]

#### Variant C: Vendor a tree-shaken MCU subset into the library

**How it works:** Copy only the needed MCU modules (HCT, DynamicScheme, MaterialDynamicColors, blend)
into `libs/ui`, dropping quantizer/image code we don't use, and ship them as library source.

**Pros:**
- Zero external runtime dep; smallest, fully-controlled surface.
- No consumer install step and no version skew.

**Cons:**
- Manual maintenance + drift from upstream M3 algorithm updates (works against the strict-M3
  "trace to canonical algorithm" principle).
- Apache-2.0 attribution/license obligations to carry.

**Effort:** High | **Risk:** Medium
**Codebase fit:** No precedent for vendored third-party source in the repo.
**Evidence:** MCU is modular ESM (`export * from './...'` per submodule), so a subset is mechanically
extractable. [mcu-pkg][mcu-index]

> **Entry-point placement (cross-cutting sub-decision, see Open Questions):** the API can live in the
> existing root entry `@ngguide/ui` (alongside `GuiSize`) or in a new secondary entry point
> (e.g. `@ngguide/ui/theme`). A separate entry keeps MCU out of the root barrel so importing `GuiSize`
> never pulls the color engine. Adding an entry point is mechanical: `ng-package.json` + `src/index.ts`
> + a `tsconfig.base.json` path + a spec listed in `libs/ui/project.json` test `include`. [entrypoint]

### 3. Runtime token-application mechanism

_Related requirements: 4.1–4.4, 6.1–6.5_

How computed values reach the document so the live UI re-themes, preserving OS-driven light/dark and
contrast scopes.

#### Variant A: Inject a `<style>` element with generated CSS text

**How it works:** Build CSS text identical in shape to `_color.generated.css` —
`:root,[data-contrast='standard']{ color-scheme: light dark; --md-sys-color-*: light-dark(L,D); }`
plus `[data-contrast='medium'|'high']` blocks — and inject it as a `<style>` (created via Renderer2 /
the document token) into `<head>`. Replacing the element's text re-themes. [m3-tokens-css][ng-ssr-style]

**Pros:**
- Mirrors the static `m3-tokens` output exactly → OS auto-switch via `light-dark()` and `[data-contrast]`
  scopes work unchanged (Req 4.2, 4.4, 3).
- SSR-safe: a `<style>` rendered on the server carries tokens into the first paint, identical to client
  (Req 10.2, 10.3).
- One element fully replaces prior dynamic values (Req 6.3).

**Cons:**
- Must serialize CSS text (slightly more work than setting properties).
- Specificity: `:root` injected styles must reliably override the statically-imported baseline (Req 6.5)
  — ordering/scope needs care.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Same CSS structure as `libs/ui/src/styles/tokens/_color.generated.css`; needs the
repo's first `DOCUMENT`/`Renderer2` usage.
**Evidence:** Static output uses `light-dark()` + `color-scheme` + `[data-contrast]` scopes; Renderer2
`<style>` injection is the documented SSR-safe approach. [m3-tokens-css][ng-ssr-style]

#### Variant B: Set inline custom properties on the document root

**How it works:** For each role call `documentElement.style.setProperty('--md-sys-color-x',
'light-dark(L,D)')`. Inline values can still carry `light-dark()` so OS switching survives. [m3-tokens-css]

**Pros:**
- No CSS-text serialization; direct property writes.
- Inline values beat stylesheet values in the cascade → reliably overrides the baseline (Req 6.5).

**Cons:**
- Inline styles can't express `[data-contrast]` **selector scopes** — switching contrast means
  recomputing and rewriting all properties rather than toggling an attribute (works against Req 3's
  scope model).
- Setting CSS custom properties via the **server** document `style` has a known Angular SSR failure;
  needs a guard/fallback (Req 10.2). [ng-universal-2163]

**Effort:** Medium | **Risk:** Medium (SSR + contrast-scope handling)
**Codebase fit:** Greenfield DOM access; no scope-attribute reuse.
**Evidence:** angular/universal#2163 documents server-side `setProperty` on the injected document
throwing; `light-dark()` is valid as an inline custom-property value. [ng-universal-2163][m3-tokens-css]

#### Variant C: Constructable stylesheet via `adoptedStyleSheets`

**How it works:** Build a `CSSStyleSheet`, `replaceSync()` the generated CSS, and push it to
`document.adoptedStyleSheets`. Re-theme by replacing the sheet's contents. [mdn-adopted]

**Pros:**
- Clean, single owned stylesheet; cheap atomic replacement; no extra DOM nodes.
- Same CSS shape as Variant A, so OS switching + contrast scopes work.

**Cons:**
- `adoptedStyleSheets` / Constructable Stylesheets are **browser-only** — unavailable in the SSR DOM,
  so server rendering needs a `<style>` fallback anyway (Req 10). [mdn-adopted]
- Adds a capability check + dual path.

**Effort:** Medium | **Risk:** Medium (SSR gap)
**Codebase fit:** Greenfield; no current stylesheet manipulation.
**Evidence:** MDN documents `adoptedStyleSheets` as a browser Document API (Constructable Stylesheets);
not part of server DOM. [mdn-adopted]

### 4. Angular integration & SSR lifecycle

_Related requirements: 7.1–7.3, 10.1–10.3_

The shape of `provideM3Theme`, how the initial scheme is applied at bootstrap (incl. server), and how
runtime updates happen.

#### Variant A: `EnvironmentProviders` + bootstrap initializer + update service

**How it works:** `provideM3Theme(config)` returns `EnvironmentProviders` bundling (a) the config as a
token, (b) an environment/app initializer that computes the scheme and applies it (Area 3) during
bootstrap — on both server and client — and (c) an injectable service exposing a method/signal to
swap the scheme at runtime (Req 7.3). [ng-env-providers][app-config]

**Pros:**
- Theme is in effect for first render on server and client (Req 7.2, 10.3).
- Matches the pre-defined shared interface `provideM3Theme(): EnvironmentProviders` in `plan.md`.
- Runtime updates via a normal injectable, zoneless-friendly (signal-driven).

**Cons:**
- Initializer must run the engine eagerly at bootstrap (small cost on the critical path).
- Needs careful SSR/browser branching inside one provider.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Extends the existing `ApplicationConfig.providers` pattern; introduces the repo's
first initializer + injectable service. [app-config]
**Evidence:** `EnvironmentProviders` + initializer is the standard Angular standalone provider pattern;
current app uses plain providers with no initializer. [ng-env-providers][app-config]

#### Variant B: Config token + component-driven application (`afterNextRender`)

**How it works:** `provideM3Theme(config)` only registers the config; a directive/component (or the
service called from one) applies the scheme in `afterNextRender`, i.e. browser-only.

**Pros:**
- Simplest provider; no bootstrap-time work.
- Naturally browser-scoped (sidesteps server DOM concerns).

**Cons:**
- Nothing themed during SSR → first server paint uses the static baseline, then the client re-themes →
  **visible theme shift on hydration** (conflicts with Req 10.3).
- Application timing tied to a component being rendered.

**Effort:** Low | **Risk:** High (Req 10.3 hydration shift)
**Codebase fit:** Would be the repo's first `afterNextRender` use; no SSR contribution.
**Evidence:** `afterNextRender` runs only in the browser by design; no server-side token emission. [needs investigation — exact hydration-shift behaviour to be confirmed in design]

#### Variant C: Bootstrap initializer + `TransferState` hand-off

**How it works:** Like Variant A, but the server stores the computed scheme in `TransferState`; the
client reads it instead of recomputing, guaranteeing identical server/client values. [ng-transferstate]

**Pros:**
- Strongest guarantee of identical server/client scheme (Req 10.3), and skips a client-side recompute.

**Cons:**
- Extra moving part; MCU generation is deterministic anyway (same inputs → same outputs), so the
  recompute it avoids may be unnecessary.
- More to test/maintain for marginal benefit when inputs are static config.

**Effort:** High | **Risk:** Low
**Codebase fit:** No current `TransferState` usage.
**Evidence:** `TransferState` is Angular's server→client data channel; determinism of MCU output makes
the transfer optional rather than required. [ng-transferstate]

### 5. Custom-color modeling

_Related requirements: 5.1–5.5_

How named custom colors become role sets, with harmonization and contrast.

#### Variant A: MCU `customColor()` helper

**How it works:** For each `{ value, name, blend }`, call `customColor(sourceArgb, customColor)` →
`CustomColorGroup` with `light`/`dark` `ColorGroup`s (`color`, `onColor`, `colorContainer`,
`onColorContainer`). `blend` is the harmonize toggle. [mcu-themeutils]

**Pros:**
- Exactly the 4 roles × light/dark required (Req 5.2), with built-in harmonize (Req 5.3); least code.
- Canonical M3 helper for custom colors.

**Cons:**
- **No contrast-level support** — `customColor()` takes no contrast argument, so custom roles stay at
  standard contrast and **cannot satisfy Req 5.4**.

**Effort:** Low | **Risk:** Medium (fails Req 5.4 as-is)
**Codebase fit:** Same MCU library already in use.
**Evidence:** `customColor(source, color): CustomColorGroup`, `CustomColor = {value,name,blend}`,
`CustomColorGroup = {color, value, light, dark}` confirmed in 0.4.0; no contrast parameter. [mcu-themeutils]

#### Variant B: Tonal palette per custom color through the core contrast pipeline

**How it works:** Optionally harmonize the custom hue with `Blend.harmonize(customArgb, sourceArgb)`,
build a `TonalPalette` from it, then select tones for `color`/`on-color`/`container`/`on-container`
through the **same DynamicScheme + contrast logic** used for core roles, so custom roles respond to
standard/medium/high. [mcu-blend][mcu-dynamicscheme]

**Pros:**
- Custom roles obey the selected contrast level (Req 5.4) and the same light/dark mechanism as core
  roles (Req 5.2), fully consistent with the core engine.
- Harmonize is an explicit per-color toggle (Req 5.3).

**Cons:**
- More code: we own the tone-selection mapping for custom roles rather than calling one helper.
- Must define and document the role-name derivation from `name` without colliding with core roles
  (Req 5.5).

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Builds on the same `DynamicScheme`/`Hct`/palette APIs as Area 1 Variant A/B.
**Evidence:** `Blend.harmonize(designColor, sourceColor)` and `TonalPalette` exist in 0.4.0; contrast
flows only through `DynamicScheme`, not `customColor()`. [mcu-blend][mcu-themeutils][mcu-dynamicscheme]

#### Variant C: `DynamicScheme` palette-override slots

**How it works:** Pass `primaryPalette` / `secondaryPalette` / `tertiaryPalette` etc. in
`DynamicSchemeOptions` to substitute palettes for a brand color. [mcu-dynamicscheme]

**Pros:**
- Native to the scheme; contrast-aware automatically.

**Cons:**
- **Overrides core roles** rather than adding *new named* roles — does not model "additional named
  custom colors" (Req 5.1/5.2) and would clash with Req 5.5's no-collision rule.

**Effort:** Low | **Risk:** High (wrong fit for additive custom colors)
**Codebase fit:** Same options object as Area 1 Variant A.
**Evidence:** `DynamicSchemeOptions` exposes `primaryPalette?`…`errorPalette?` override slots — for
replacing core palettes, not adding roles. [mcu-dynamicscheme]

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. Generation engine | A. `DynamicScheme` + `MaterialDynamicColors` | Low | Low | Same API as static generator |
| 1. Generation engine | B. Per-variant `Scheme*` subclasses | Low | Medium | Exact current generator call shape; upstream-deprecated |
| 1. Generation engine | C. `themeFromSourceColor` + `applyTheme` | Low | High | Legacy role set; no contrast |
| 2. Packaging | A. MCU as `dependencies` | Low | Low | First runtime dep |
| 2. Packaging | B. MCU as `peerDependencies` | Low | Medium | Mirrors `@angular/core` peer |
| 2. Packaging | C. Vendor MCU subset | High | Medium | No vendoring precedent |
| 3. Token application | A. Injected `<style>` text | Medium | Low | Same CSS shape as `_color.generated.css` |
| 3. Token application | B. Inline props on `:root` | Medium | Medium | Can't scope `[data-contrast]`; SSR caveat |
| 3. Token application | C. `adoptedStyleSheets` | Medium | Medium | Browser-only; needs SSR fallback |
| 4. Angular/SSR lifecycle | A. Providers + bootstrap initializer + service | Medium | Low | Extends `ApplicationConfig` |
| 4. Angular/SSR lifecycle | B. Config token + `afterNextRender` | Low | High | Hydration shift (Req 10.3) |
| 4. Angular/SSR lifecycle | C. Initializer + `TransferState` | High | Low | Optional given deterministic output |
| 5. Custom colors | A. MCU `customColor()` helper | Low | Medium | No contrast (Req 5.4) |
| 5. Custom colors | B. Palette-per-color via contrast pipeline | Medium | Low | Builds on Area 1 A/B |
| 5. Custom colors | C. Palette-override slots | Low | High | Overrides core, not additive |

## Cross-area dependencies

- **Area 1/C (`themeFromSourceColor`) forces Area 3 toward MCU `applyTheme`** and conflicts with the
  token contract (Req 11), contrast (Req 3), and the `light-dark()` OS-switch model (Req 4) — picking
  it effectively rules out the contrast-aware paths in Areas 3 and 5.
- **Area 5/B (contrast-aware custom colors) requires Area 1/A or 1/B** (low-level `DynamicScheme`),
  because contrast flows only through `DynamicScheme`, never through the `customColor()` helper.
- **Area 3/C (`adoptedStyleSheets`) and Area 4/B (`afterNextRender`) both leave SSR uncovered** — if
  Req 10 is taken strictly, each needs a server-side `<style>` fallback (Area 3/A) regardless.
- **Area 3/A pairs naturally with Area 4/A**: a server-rendered `<style>` is what makes the bootstrap
  initializer produce identical first paint on server and client.

## Codebase Insights

- `libs/ui/tooling/generate-color-tokens.mts:14-22,51-63,65-71` already enumerates 49 roles via
  `MaterialDynamicColors` + `getArgb` and emits `--md-sys-color-<kebab>: light-dark(L,D)` — runtime
  generation is largely a relocation of this logic into shipped code with a dynamic seed.
- `libs/ui/src/styles/tokens/_color.generated.css` defines the exact CSS shape to reproduce:
  `:root,[data-contrast='standard']` + `[data-contrast='medium'|'high']` + `[data-theme]` overrides.
- `libs/ui/package.json` ships **no runtime deps** and only the `./styles/theme.css` export; adding the
  API means new `dependencies`/`peer` + possibly a new entry point + `tsconfig.base.json` path +
  `libs/ui/project.json` test `include` entry.
- `libs/ui/eslint.config.mjs` `@nx/dependency-checks` ignores only `tooling/**`; a **shipped** MCU
  import will be enforced to be declared in `libs/ui/package.json`.
- No `DOCUMENT`/`Renderer2`/`PLATFORM_ID`/`afterNextRender`/`TransferState` anywhere yet; whichever
  application + SSR variant is chosen introduces the first such usage.
- `apps/web` is CSR-only, so end-to-end SSR verification of Req 10 has **no host to run in** today —
  see Open Questions.

## Sources

- [mcu-pkg] `node_modules/@material/material-color-utilities/package.json` (v0.4.0; `type:module`, no `sideEffects`) — read 2026-05-29
- [mcu-index] `node_modules/@material/material-color-utilities/index.d.ts` (submodule re-exports) — read 2026-05-29
- [mcu-dynamicscheme] `node_modules/@material/material-color-utilities/dynamiccolor/dynamic_scheme.d.ts` (`DynamicSchemeOptions`, `constructor(args)`, palette-override slots) — read 2026-05-29
- [mcu-variant] `node_modules/@material/material-color-utilities/dynamiccolor/variant.d.ts` (9-value `Variant` enum) — read 2026-05-29
- [mcu-schemefiles] `node_modules/@material/material-color-utilities/scheme/scheme_*.d.ts` (all 9 variant subclasses; `SchemeExpressive(sourceColorHct,isDark,contrastLevel,specVersion?,platform?)`) — read 2026-05-29
- [mcu-themeutils] `node_modules/@material/material-color-utilities/utils/theme_utils.d.ts` (`CustomColor`, `CustomColorGroup`, `Theme` with legacy `Scheme`, `themeFromSourceColor`, `customColor`, `applyTheme`) — read 2026-05-29
- [mcu-blend] `node_modules/@material/material-color-utilities/blend/blend.d.ts` (`Blend.harmonize`) — read 2026-05-29
- [mcu-migrate] https://github.com/material-foundation/material-color-utilities/blob/main/_autodocs/api-reference/schemes.md — fetched 2026-05-29 (context7: /material-foundation/material-color-utilities; positional `SchemeTonalSpot` deprecated in favour of `DynamicScheme`)
- [gen-mts] `libs/ui/tooling/generate-color-tokens.mts:14-22,51-71` — read 2026-05-29
- [m3-tokens-css] `libs/ui/src/styles/tokens/_color.generated.css` (light-dark() + `[data-contrast]` scopes + `color-scheme`) — read 2026-05-29
- [libui-pkg] `libs/ui/package.json` (peer-only `@angular/core`, no runtime deps, `./styles/theme.css` export) — read 2026-05-29
- [eslint-depcheck] `libs/ui/eslint.config.mjs` (`@nx/dependency-checks` ignoredFiles incl. `tooling/**`) — read 2026-05-29
- [ngpkg] `dist/libs/ui/package.json` (ng-packagr externalizes deps; only injects `tslib`) — read 2026-05-29
- [app-config] `apps/web/src/app/app.config.ts` (zoneless, no initializer) + `apps/web/src/main.ts` — read 2026-05-29
- [web-proj] `apps/web/project.json` (no SSR/server target) — read 2026-05-29
- [no-dom] repo-wide search: no `DOCUMENT`/`Renderer2`/`PLATFORM_ID`/`afterNextRender` — searched 2026-05-29
- [entrypoint] `libs/ui/button/ng-package.json`, `libs/ui/button/src/index.ts`, `tsconfig.base.json:17-22`, `libs/ui/project.json` test `include` — read 2026-05-29
- [ng-ssr-style] https://medium.com/@piyalidas.it/angular-theme-integration-using-dynamically-load-css-1617147799bf — fetched 2026-05-29 (Renderer2 `<style>` injection as SSR-safe pattern)
- [ng-universal-2163] https://github.com/angular/universal/issues/2163 — fetched 2026-05-29 (server-side `style.setProperty` on injected document throws)
- [mdn-adopted] https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets — fetched 2026-05-29 (browser Document API)
- [ng-env-providers] Angular `EnvironmentProviders` / standalone provider pattern — context7 Angular docs, fetched 2026-05-29
- [ng-transferstate] Angular `TransferState` server→client hydration data — context7 Angular docs, fetched 2026-05-29

## Open Questions

- [ ] **Entry-point placement:** root `@ngguide/ui` vs a new secondary entry (e.g. `@ngguide/ui/theme`)
  for the dynamic-color API. Affects whether importing `GuiSize` pulls MCU. (Decide in `spec:design`.)
- [ ] **SSR verification host:** `apps/web` is CSR-only, so Req 10 can't be exercised end-to-end today.
  Does this spec add a minimal SSR harness/target, or assert SSR-safety via unit tests of the
  DOM-agnostic generation path only? (Scope decision for `spec:design`/`spec:tasks`.)
- [ ] **Custom-role naming scheme:** exact `--md-sys-color-<name>-*` derivation and collision rule with
  core roles (Req 5.5) — to be specified in design.
- [ ] **Baseline-override guarantee:** confirm injected `:root` styles reliably override the statically
  imported `theme.css` for the same roles (Req 6.5) given import order; pin the mechanism in design.
- [ ] **Exact document/Renderer access API** (Angular 21 `DOCUMENT` token source + Renderer2 vs direct)
  — confirm against installed `@angular/core`/`@angular/common` in design rather than assume.

## Next Steps

`spec:design m3-dynamic-color` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research m3-dynamic-color` again — it will extend
this catalogue rather than overwrite it.
