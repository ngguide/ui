---
status: APPROVED
created: 2026-05-28
updated: 2026-05-28
---

# Research: M3 Design Tokens

## Problem Statement

`@ngguide/ui` ships only a partial, light-only token set in `libs/ui/src/styles/theme.css` (17 color
roles, 4 typeface refs, 6 shape steps, 6 elevation levels, 2 focus props). The `m3-tokens` spec
requires the complete M3 token vocabulary — all color roles in light **and** dark across three
contrast levels, the full typography type scale, shape, elevation, state-layer opacities, and motion —
delivered as a stable, documented CSS-custom-property contract that does not break the tokens
button/fab already consume. This research catalogues the meaningfully distinct ways to (1) source the
token values, (2) resolve light/dark + contrast, (3) distribute the tokens + contract, and (4) handle
the typeface default/override. Decisions are deferred to `spec:design`.

## Problem Areas

### 1. Token value sourcing

_Related requirements: 1, 2, 3, 5, 7, 8, 9, 10, 12_

How the actual M3 values (thousands of cells: color roles × 2 modes × 3 contrasts, plus type/shape/
elevation/state/motion) get into the kit. The project's strict-M3 directive means every value must
match the published M3 spec.

#### Variant A: Hand-author from the M3 spec tables

**How it works:** Transcribe the published M3 baseline values directly into CSS custom properties —
all color roles for light/dark × standard/medium/high, the type scale, shape, elevation, state, motion.

**Pros:**
- Zero runtime or build-time dependencies; pure CSS output.
- Full control over names/format; trivially matches the existing `--md-*` taxonomy (Req 12).
- Transparent — every value visible and reviewable against the spec.

**Cons:**
- Large, error-prone transcription effort (the contrast matrix alone is ~50 roles × 6 schemes).
- Manual to keep in sync if M3 baseline values are revised.

**Effort:** High | **Risk:** Medium (transcription errors)
**Codebase fit:** Extends the current hand-written `theme.css` pattern (plain CSS, no preprocessor — confirmed no Sass in repo).
**Evidence:** Current `libs/ui/src/styles/theme.css` is already hand-authored. M3 publishes baseline values per role/scheme ([M3 design tokens](https://m3.material.io/foundations/design-tokens), [M3 color roles](https://m3.material.io/styles/color/roles)). Spec page body is JS-rendered (not fetchable as text) — exact tables need manual reference.

#### Variant B: Generate from the baseline seed via material-color-utilities (build-time)

**How it works:** A build step runs `@material/material-color-utilities` (`themeFromSourceColor`) on
the M3 baseline seed (`#6750A4`) to emit the color-role tokens for all modes/contrasts, written to a
vendored CSS file checked into the repo. Non-color tokens (type/shape/elevation/state/motion) still
authored from spec.

**Pros:**
- Color values are algorithmically correct and complete (all roles, all contrasts) — no manual color matrix.
- Shares the exact algorithm with the future `m3-dynamic-color` spec, guaranteeing consistency.

**Cons:**
- Adds a build/codegen step and a dev dependency; output must be vendored so the published package stays CSS-only.
- Generator's role coverage/naming must be mapped onto our `--md-*` contract.
- Only solves color; other categories still hand-authored.

**Effort:** Medium | **Risk:** Medium (codegen wiring, name mapping)
**Codebase fit:** New build tooling pattern; no existing codegen in repo. Plays into the planned `m3-dynamic-color` spec (shared dep).
**Evidence:** `@material/material-color-utilities` provides `themeFromSourceColor`/`applyTheme` that produce M3 tokens from a hex seed ([npm](https://www.npmjs.com/package/@material/material-color-utilities)); wrappers like [material-tokens-generator](https://github.com/glare-labs/material-tokens-generator) emit `--md-sys-color-*` CSS. Baseline M3 seed is `#6750A4` (matches current `theme.css` primary).

#### Variant C: Vendor the official @material/web token CSS

**How it works:** Import/copy the token stylesheets shipped by `@material/web` (the official MWC) and
re-expose them as the kit's tokens.

**Pros:**
- Lowest authoring effort; values are first-party and current.

**Cons:**
- Pulls in MWC's token shape, which includes component-level tokens we don't want and may not match our `--md-sys-*`/`--md-ref-*` contract exactly (Req 11/12 risk).
- Couples the kit to MWC's packaging and release cadence; potential licensing/attribution overhead for vendored copies.
- Less transparent; harder to assert strict 1:1 with the M3 spec vs MWC's interpretation.

**Effort:** Low | **Risk:** Medium-High (contract drift, unwanted tokens)
**Codebase fit:** Diverges from the from-scratch, "not a wrapper" project principle (vision Non-Goals).
**Evidence:** `@material/web` documents token-based theming via CSS custom properties ([material-web color docs](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)).

#### Variant D: Hybrid — generate color, hand-author the rest

**How it works:** Variant B for the color matrix (build-time MCU generation, vendored) + Variant A for
all non-color categories (type scale, shape, elevation, state, motion) authored from spec.

**Pros:**
- Removes the largest/most error-prone manual chunk (color contrast matrix) while keeping full control over the smaller, stable non-color sets.

**Cons:**
- Two sourcing mechanisms to maintain; same codegen wiring cost as B.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Same as B for color; same as A for the rest.
**Evidence:** Combination of A and B evidence above.

### 2. Light/dark + contrast resolution & scoping

_Related requirements: 2, 3, 4_

How tokens resolve to the right scheme and how apps switch mode/contrast (OS default + manual,
scoped to a subtree), under the zoneless constraint.

#### Variant A: CSS-native `light-dark()` + `color-scheme`, contrast as a second axis

**How it works:** Each color-role token is `light-dark(<lightVal>, <darkVal>)`. Mode is driven by the
CSS `color-scheme` property (`light dark` follows OS; forcing `light`/`dark` on a scope overrides).
Contrast is a separate axis selected by attribute/class (e.g. `[data-contrast=high]`) that swaps the
light/dark value pair.

**Pros:**
- Minimal CSS for the mode axis; OS auto-switch and subtree override are native (Req 4.1–4.4) with no JS.
- Zoneless-safe — purely declarative, no change detection involved.

**Cons:**
- `light-dark()` only encodes two values, so the three contrast levels still need a second selector axis (one `light-dark()` set per contrast).
- Requires `light-dark()` support (Baseline 2024 — Chrome/Edge 123+, Firefox 120+, Safari 17.5+); older browsers unsupported.

**Effort:** Medium | **Risk:** Medium (browser baseline)
**Codebase fit:** Pure CSS, matches current `:root` token approach; extends `theme.css`.
**Evidence:** Angular Material 18+ emits `color-scheme: light dark` and `light-dark()` for tokens ([Angular M3 theming](https://konstantin-denerz.com/angular-material-3-theming-design-tokens-and-system-variables/), [Modern theming in Angular 20](https://trailheadtechnology.com/modern-theming-in-angular-20-light-dark-mode-with-material-design-3/)).

#### Variant B: Selector-scoped scheme blocks (media query + attribute/class)

**How it works:** Full matrix of selector blocks: a default `:root` (light/standard), a
`@media (prefers-color-scheme: dark)` block, and attribute/class overrides for forced mode
(`[data-theme=light|dark]`) and contrast (`[data-contrast=medium|high]`). Each block redefines the
`--md-sys-color-*` set.

**Pros:**
- Works across the full 2-mode × 3-contrast matrix with broad browser support (no `light-dark()` dependency).
- Total control over cascade/override precedence; subtree scoping via attributes (Req 4.4).

**Cons:**
- Verbose — many duplicated token blocks; larger CSS payload.
- Override precedence (OS media vs forced attribute) must be carefully ordered.

**Effort:** Medium-High | **Risk:** Low
**Codebase fit:** Pure CSS, consistent with current approach; just more of it.
**Evidence:** Standard dark-mode token pattern ([Dark mode design systems guide](https://muz.li/blog/dark-mode-design-systems-a-complete-guide-to-patterns-tokens-and-hierarchy/)). `prefers-color-scheme` + attribute override is widely supported.

#### Variant C: Runtime Angular provider writes the active scheme

**How it works:** An `EnvironmentProviders` API (e.g. `provideGuiTheme(...)`) reads OS preference via a
`matchMedia` signal and writes the active scheme's custom properties onto a scope element; forcing a
mode/contrast updates the signal.

**Pros:**
- Programmatic control; natural seam for the later `m3-dynamic-color` runtime API.
- Can persist user choice and react to OS changes explicitly.

**Cons:**
- Runtime JS for something CSS can do declaratively; SSR/FOUC concerns (flash before hydration).
- More than a tokens-only deliverable — overlaps Area 3 / dynamic-color scope; must stay zoneless (signals + `matchMedia`, no Zone).

**Effort:** Medium | **Risk:** Medium (SSR/FOUC, scope creep)
**Codebase fit:** No existing runtime CSS-var writer or DOCUMENT-injection pattern in repo (confirmed). Introduces a new pattern.
**Evidence:** Runtime `applyTheme` writing CSS vars is the MCU pattern ([npm](https://www.npmjs.com/package/@material/material-color-utilities)). Repo is zoneless (`apps/web/src/app/app.config.ts`).

### 3. Distribution & token contract

_Related requirements: 11, 12_

How the tokens reach consumers and how the contract is published, given ng-packagr currently ships no
global CSS and the web app imports `theme.css` by relative path.

#### Variant A: Ship a global CSS file as a published library asset

**How it works:** Configure ng-packagr to include a token stylesheet in `dist/libs/ui` and expose it
via a documented path/subpath (e.g. consumer imports `@ngguide/ui/styles` or the file directly). The
web app switches from the relative-path import to the published path.

**Pros:**
- Framework-agnostic; one explicit import; clean contract.
- Keeps the published package CSS-only (no runtime).

**Cons:**
- Requires ng-packagr asset/styles shipping config (not currently set up — `ng-package.json` files only declare `entryFile`).
- Consumer must remember to import it (documented in the contract).

**Effort:** Medium | **Risk:** Low-Medium (packaging config)
**Codebase fit:** New asset-export pattern; today `theme.css` is only consumed via relative import in `apps/web/src/styles.css`.
**Evidence:** ng-packagr supports `assets`; current `ng-package.json` uses none (Explore report §3). M3 treats tokens as exportable CSS variables ([M3 design tokens](https://m3.material.io/foundations/design-tokens)).

#### Variant B: Provide tokens via Angular EnvironmentProviders

**How it works:** `provideGuiTheme()` injects the token stylesheet (and/or writes vars) at app bootstrap;
the contract is the provider API plus documented token names.

**Pros:**
- Ergonomic Angular DX; single provider call; natural pairing with dynamic color later.

**Cons:**
- Runtime injection; SSR/FOUC considerations; more than CSS-only.
- Ties token delivery to Angular (less framework-agnostic than a CSS file).

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** No existing provider/injection pattern; introduces one. Pairs with Area 2 / Variant C.
**Evidence:** `applyTheme` runtime pattern ([npm](https://www.npmjs.com/package/@material/material-color-utilities)).

#### Variant C: Formalize the root-entry CSS import (extend current pattern)

**How it works:** Keep tokens as a CSS file under the root entry, exported and documented, consumed by
a global `@import` (the existing mechanism), just expanded to the full token set and published name.

**Pros:**
- Smallest change from today's working setup; lowest risk.
- Pure CSS; no packaging or runtime additions if the relative import stays internal to the repo.

**Cons:**
- If not shipped as a real package asset, external consumers can't import it cleanly (only works in-repo) — weakens Req 11 for published consumers.

**Effort:** Low | **Risk:** Low (in-repo) / Medium (external consumers)
**Codebase fit:** Exactly the current `apps/web/src/styles.css` → `theme.css` import pattern.
**Evidence:** Explore report §1/§4: `theme.css` imported via relative path in `apps/web/src/styles.css`.

### 4. Typeface default + font delivery

_Related requirements: 5, 6_

Roboto-by-default but overridable typeface, and whether the kit ships the font.

#### Variant A: Typeface ref tokens default to Roboto; ship no font

**How it works:** `--md-ref-typeface-*` default to Roboto; the consumer is responsible for loading the
Roboto webfont (Google Fonts or self-host). Overriding the tokens swaps the typeface everywhere.

**Pros:**
- No font bundling, no licensing/asset concerns; small package.
- Matches the current setup (web app imports Roboto from Google Fonts).

**Cons:**
- Out-of-the-box rendering depends on the consumer loading Roboto (FOUT/fallback if not).

**Effort:** Low | **Risk:** Low
**Codebase fit:** Exactly current behavior — `apps/web/src/styles.css` imports Roboto from Google Fonts; `theme.css` sets `--md-ref-typeface-*: 'Roboto'`.
**Evidence:** Explore report §1/§4.

#### Variant B: Bundle/self-host Roboto as a library asset

**How it works:** Ship Roboto (e.g. variable font) + `@font-face` in the published package so the kit
renders correctly with no consumer font setup.

**Pros:**
- Works out of the box, offline, no external font request.

**Cons:**
- Increases package size; requires ng-packagr asset shipping; font licensing/attribution to manage.
- Consumers wanting a different font carry unused bytes.

**Effort:** Medium | **Risk:** Medium (assets, licensing)
**Codebase fit:** Requires the same asset-shipping capability as Area 3 / Variant A; not currently configured.
**Evidence:** Roboto is the M3 default typeface ([M3 typography](https://m3.material.io/styles/typography)). No font assets shipped today (Explore §3).

#### Variant C: Font-agnostic with a documented Roboto preset

**How it works:** No typeface imposed by default; the kit documents the required typeface tokens and
offers an optional Roboto preset the consumer opts into.

**Pros:**
- Maximum flexibility; no implicit font dependency.

**Cons:**
- Diverges from the chosen requirement (Roboto default, overridable — Req 6.1); worse out-of-box DX.

**Effort:** Low | **Risk:** Low
**Codebase fit:** Would change current default-Roboto behavior.
**Evidence:** Req 6 specifies Roboto as the default — listed for completeness.

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. Token sourcing | A: Hand-author from spec | High | Medium | Extends current hand-written theme.css |
| 1. Token sourcing | B: Generate via MCU (build-time) | Medium | Medium | New codegen; shares dynamic-color dep |
| 1. Token sourcing | C: Vendor @material/web token CSS | Low | Med-High | Diverges from "not a wrapper" |
| 1. Token sourcing | D: Hybrid (gen color + author rest) | Medium | Medium | Mix of A and B |
| 2. Mode/contrast | A: light-dark() + color-scheme | Medium | Medium | Pure CSS; needs contrast axis + Baseline 2024 |
| 2. Mode/contrast | B: Selector-scoped blocks | Med-High | Low | Pure CSS; verbose; broad support |
| 2. Mode/contrast | C: Runtime provider | Medium | Medium | New runtime pattern; SSR/FOUC |
| 3. Distribution | A: Published CSS asset | Medium | Low-Med | New ng-packagr asset config |
| 3. Distribution | B: EnvironmentProviders | Medium | Medium | New provider pattern |
| 3. Distribution | C: Formalize root CSS import | Low | Low/Med | Current import pattern |
| 4. Typeface | A: Default Roboto, ship no font | Low | Low | Current behavior |
| 4. Typeface | B: Bundle/self-host Roboto | Medium | Medium | Needs asset shipping |
| 4. Typeface | C: Font-agnostic + preset | Low | Low | Changes current default |

## Cross-area dependencies

- **Area 1 / Variant B or D (MCU generation)** shares the exact color algorithm with the planned
  `m3-dynamic-color` spec — picking it here makes that spec a thin runtime wrapper over the same
  generator, ensuring static and dynamic schemes agree.
- **Area 2 / Variant A (light-dark())** needs a second selector axis for the three contrast levels;
  it pairs naturally with Area 3 / Variant A or C (CSS delivery). It does **not** require a runtime.
- **Area 2 / Variant C (runtime provider)** essentially forces **Area 3 / Variant B (provider
  delivery)** — both are runtime/Angular-coupled and would be built together.
- **Area 4 / Variant B (bundle Roboto)** depends on the same ng-packagr asset-shipping capability as
  **Area 3 / Variant A**; choosing both amortizes that packaging work.

## Codebase Insights

- Plain CSS only — no Sass anywhere in `libs/ui`; tokens live in a single `:root` block in
  `libs/ui/src/styles/theme.css`.
- The "do not break" contract is concrete: button uses 19 tokens, fab uses 14 (icon uses none). All
  names follow `--md-sys-*` / `--md-ref-*`; the full set must be a superset of these.
- `theme.css` is **not** published — it is imported by relative path in `apps/web/src/styles.css`;
  ng-packagr ships no global CSS assets today (`ng-package.json` declares only `entryFile`).
- Repo is zoneless with no runtime CSS-var writer and no `DOCUMENT` injection — any runtime variant
  introduces a brand-new pattern and must avoid Zone APIs.
- New secondary entry points (if tokens get their own) must be added to `tsconfig.base.json` paths and
  the `ui` test target `include` (CLAUDE.md).
- Current primary color `#6750A4` is the M3 baseline seed — consistent with MCU-based generation.

## Open Questions

- [ ] Minimum browser support target — does the kit require `light-dark()` (Baseline 2024) or must it
  support older browsers (which would rule out Area 2 / Variant A)?
- [ ] Should the token CSS be a dedicated secondary entry point / published subpath, or remain a
  single asset under the root entry? (Affects Area 3 wiring.)
- [ ] Is a build-time codegen step acceptable in this repo's pipeline, or is hand-authored CSS
  preferred to keep the build dependency-free? (Decides Area 1 A vs B/D.)
- [ ] Exact M3 baseline value tables (color contrast matrix, type-scale numbers, motion durations/
  easing) need to be pulled from the live M3 spec at design time — the spec pages are JS-rendered and
  weren't fetchable as text here.
- [ ] SSR/FOUC posture: is the kit expected to render correctly under SSR (which penalizes runtime
  Area 2/3 variants)?

## Next Steps

`spec:design m3-tokens` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research m3-tokens` again — it will extend this
catalogue rather than overwrite it.
