---
created: 2026-05-29
updated: 2026-05-29
---

# Implementation Plan: M3 Dynamic Color

## Overview

Add runtime M3 dynamic color to `@ngguide/ui` as a new secondary entry point `@ngguide/ui/theme`:
a DOM-free scheme engine over `@material/material-color-utilities`, an injected-`<style>` applier that
mirrors the static `m3-tokens` CSS shape, and an Angular `provideM3Theme` provider + `M3ThemeService`.
A demo-only SSR host is added to `apps/web` to verify SSR-safety.

The plan is split into 3 groups in dependency order. Each group is independently mergeable — build,
tests, and runtime behaviour stay green with only that group (and earlier ones) applied. The whole
feature is **purely additive**: `provideM3Theme` is opt-in, the static token baseline is untouched, so
nothing existing changes — there are no cutovers.

## Tasks

### Group A — Theme entry point + generation core (new feature surface)

Stands up the `@ngguide/ui/theme` entry point and all **pure, DOM-free** logic (types, engine, custom
colors, validation, CSS serialization) with unit tests. Blast radius: *safe* — a new entry point that
nothing imports yet; the static baseline and existing entry points are unchanged.

- [x] 1. Scaffold the `@ngguide/ui/theme` secondary entry point and promote MCU to a runtime dep
  - Create `libs/ui/theme/ng-package.json` = `{ "lib": { "entryFile": "src/index.ts" } }`
  - Create `libs/ui/theme/src/index.ts` (temporary placeholder export; finalized in task 8)
  - Add `"@ngguide/ui/theme": ["libs/ui/theme/src/index.ts"]` to `tsconfig.base.json` `paths`
  - Add `@material/material-color-utilities` to `libs/ui/package.json` **`dependencies`** (`^0.4.0`)
    so ng-packagr externalizes it into `dist/libs/ui/package.json` (Decision 2A)
  - Move `@material/material-color-utilities` from root `devDependencies` is NOT required; keep root
    entry as-is — only `libs/ui/package.json` needs the runtime declaration
  - Confirm `@nx/dependency-checks` in `libs/ui/eslint.config.mjs` is satisfied by the new
    `dependencies` entry (no `ignoredFiles` change needed for shipped `src/**`)
  - _Requirements: 7.1, 11.1_

- [x] 2. Define public types
  - Create `libs/ui/theme/src/types.ts` with `M3SchemeVariant` (9 values), `M3Contrast`, `M3Mode`,
    `M3CustomColor`, `M3ThemeConfig`, `M3ColorGroup`, `M3ResolvedRoles` (per design "Public types")
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 7.1_

- [x] 3. Implement the core scheme engine
  - Create `libs/ui/theme/src/engine.ts`: `camelToKebab`, `coreRoles()` (enumerate
    `MaterialDynamicColors`, exclude `*PaletteKeyColor`), `VARIANT_MAP`, `CONTRAST_MAP`,
    `buildScheme()`, and `generateScheme()` producing `{standard,medium,high}` × role × `{light,dark}`
    via `DynamicScheme` + `MaterialDynamicColors[role].getArgb` + `hexFromArgb` (Decision 1A)
  - Ensure role-name enumeration matches the build-time generator so the contract holds (Req 11)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 11.1, 11.2_

- [x] 4. Implement contrast-aware custom-color generation
  - Extend `engine.ts`: for each `M3CustomColor`, optionally `Blend.harmonize(value, source)`, then
    seed a per-color `DynamicScheme` (same variant + contrast + mode) and map its primary family to
    `--md-sys-color-<name>` / `-on-<name>` / `-<name>-container` / `-on-<name>-container`
    (Decision 5B; the documented M3-gap resolution)
  - Default `harmonize` to `true`; honour per-color override (Req 5.3)
  - Apply the selected contrast level to custom roles like core roles (Req 5.4)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 5. Implement input validation
  - Create `libs/ui/theme/src/validate.ts`: `parseHex(input,label)` (accept `#RGB`/`#RRGGBB`,
    normalize, throw descriptive `Error` otherwise) and `validateConfig(config)` validating
    `sourceColor` + each `customColors[].value`, and rejecting custom names that collide with a core
    role (protects Req 5.5). No silent fallback.
  - _Requirements: 9.1, 9.2, 9.3, 5.5_

- [x] 6. Implement the CSS builder
  - Create `libs/ui/theme/src/css-builder.ts`: `buildCss(scheme, mode)` emitting
    `:root,[data-contrast='standard']{ color-scheme: <mode>; --md-sys-color-*: light-dark(L,D); }`
    plus `[data-contrast='medium'|'high']` blocks, identical in shape to `_color.generated.css`;
    `mode` → `color-scheme` (`auto`→`light dark`, else forced) (Decision 3A, Req 4)
  - _Requirements: 3.1, 3.3, 4.1, 4.2, 4.3, 4.4, 6.1_

- [x] 7. Unit-test the pure core
  - Create `libs/ui/theme/src/engine.spec.ts`, `css-builder.spec.ts`, `validate.spec.ts`
  - Assert: role-name set equals the names in `libs/ui/src/styles/tokens/_color.generated.css`
    (Req 11.3); baseline seed `#6750A4` tonal-spot/standard yields `primary` `light #65558f` /
    `dark #cfbdfe`; output varies by variant and contrast; 4 harmonized contrast-aware roles per
    custom color; `buildCss` emits `light-dark()`, `color-scheme`, and 3 `[data-contrast]` scopes and
    forces mode correctly; `validateConfig` throws naming the offender
  - Register all three specs in `libs/ui/project.json` `test.options.include`
  - _Requirements: 1.4, 2.3, 3.2, 4.2, 4.3, 5.2, 5.4, 9.1, 9.2, 11.3_

- [x] 8. Checkpoint — Group A verification
  - Run new tests: `pnpm exec nx test ui`
  - Run `pnpm exec nx lint ui` and `pnpm exec nx build ui` (entry point builds; MCU externalized in
    `dist/libs/ui/package.json`)
  - Confirm `main` still builds/tests with only Group A applied; the new entry point is importable but
    referenced by nothing else yet

### Group B — Angular integration (new feature surface)

Adds the DOM/runtime layer: `<style>` applier, theme service, and the `provideM3Theme` provider, with
`TestBed` tests, and finalizes the public barrel. Blast radius: *safe* — additive; no app calls
`provideM3Theme` yet, so the static baseline still governs. Depends on Group A.

- [x] 9. Implement the SSR-safe style applier
  - Create `libs/ui/theme/src/style-applier.ts`: `M3StyleApplier` (`providedIn:'root'`) injecting
    `DOCUMENT` (from `@angular/core`) and `RendererFactory2.createRenderer(null,null)`; `apply(css)`
    creates-or-replaces a single managed `<style>` at the end of `<head>` (Decision 3A; overrides
    baseline via document order, Req 6.5; replace-in-place, Req 6.3; no throw without a browser DOM,
    Req 10.2)
  - _Requirements: 6.1, 6.3, 6.5, 10.2_

- [x] 10. Implement the theme service
  - Create `libs/ui/theme/src/theme.service.ts`: `M3ThemeService` (`providedIn:'root'`) with
    `init(config)`, `setTheme(config)` (validate → `generateScheme` → `buildCss` → `applier.apply`),
    `config` signal, and `resolve({mode?,contrast?})` returning flat role→hex incl. custom roles
    equal to applied values (Req 8)
  - _Requirements: 6.2, 6.3, 7.3, 8.1, 8.2, 8.3_

- [x] 11. Implement `provideM3Theme`
  - Create `libs/ui/theme/src/provide-theme.ts`: `provideM3Theme(config): EnvironmentProviders` via
    `makeEnvironmentProviders` + `provideEnvironmentInitializer` that calls `validateConfig` then
    `inject(M3ThemeService).init(config)` (Decision 4A; applies on server and client, Req 7.2, 10.1)
  - _Requirements: 7.1, 7.2, 9.1, 9.2, 10.1_

- [x] 12. Finalize the public barrel and docs
  - Update `libs/ui/theme/src/index.ts` to export `./types`, `provideM3Theme`, `M3ThemeService`,
    `generateScheme`/`GeneratedScheme`
  - Add `libs/ui/theme/README.md` documenting `provideM3Theme`, runtime `setTheme`, `resolve`,
    custom colors + harmonize, and the import path
  - _Requirements: 7.1, 7.3, 8.1_

- [x] 13. Test the Angular layer
  - Create `libs/ui/theme/src/theme.service.spec.ts` (TestBed + real `DOCUMENT`): asserts a `<style>`
    is injected after baseline, `setTheme` replaces it, `resolve()` equals applied values, and
    `provideM3Theme` applies the configured scheme at init; invalid config throws
  - Register the spec in `libs/ui/project.json` `test.options.include`
  - _Requirements: 6.2, 6.3, 6.5, 7.2, 7.3, 8.2, 8.3, 9.1_

- [x] 14. Checkpoint — Group B verification
  - Run `pnpm exec nx run-many -t lint test build -p ui`
  - Confirm `@ngguide/ui/theme` exports the full API and `dist/libs/ui` builds with the `theme` entry
    point and MCU declared; static baseline behaviour unchanged when `provideM3Theme` is unused

### Group C — SSR host + dogfood in apps/web (verification)

Adds server-side rendering to the demo app and wires `provideM3Theme` to verify Req 10 end-to-end.
Blast radius: *safe* — `apps/web` is the unpublished demo host; release/verdaccio config is untouched.
Depends on Group B.

- [x] 15. Add SSR build wiring to `apps/web`
  - Install `@angular/ssr` and `@angular/platform-server` (`^21`) at the workspace root
  - Add `server` / `ssr` / `outputMode: 'server'` options to the `@angular/build:application` build
    target in `apps/web/project.json`; create `apps/web/tsconfig.server.json`
  - _Requirements: 10.1, 10.2_

- [x] 16. Add the server bootstrap
  - Create `apps/web/src/main.server.ts` (Angular 21 form: `const bootstrap = (context) =>
    bootstrapApplication(App, serverConfig, context); export default bootstrap;` — NG0401) and
    `apps/web/src/app/app.config.server.ts` merging `provideServerRendering()` with `appConfig`
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 17. Dogfood `provideM3Theme` in `apps/web`
  - Add `provideM3Theme({ sourceColor, variant, contrast, mode, customColors })` to
    `apps/web/src/app/app.config.ts`, plus a minimal demo control that calls
    `M3ThemeService.setTheme(...)` at runtime (Req 7.3) to exercise re-theming
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 18. Verify SSR-safety end-to-end
  - Build/serve the SSR target; confirm the server-rendered HTML `<head>` contains the dynamic
    `<style>` with `--md-sys-color-*: light-dark(...)` and that the client hydrates with no theme
    flash (identical CSS string) (Req 10.2, 10.3)
  - Optionally add a server-render smoke spec if feasible in the harness
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 19. Final checkpoint — everything green
  - `pnpm exec nx run-many -t lint test build` green for `ui` and `web`
  - All 11 requirements traceable to a shipped task (see Notes); static-only consumers unaffected
    (Req 6.4); `@ngguide/ui` root import (`GuiSize`) does not pull MCU

## Notes

### Scope boundaries

- **Image/content-based color extraction is out of scope** (Req decisions): only hex seed + named
  custom colors. MCU `themeFromImage` is intentionally unused.
- **Scoped-subtree theming is out of scope**: application is global (document root) only (Req 6.1).
- **Release / verdaccio / Nx release config unchanged** (project constraint). The SSR additions touch
  only the unpublished `apps/web` demo host.

### Requirement traceability

- Req 1, 2, 3 → tasks 3, 7 (engine + tests)
- Req 4 → tasks 6, 7 (CSS builder)
- Req 5 → tasks 4, 5, 7 (custom colors + collision validation)
- Req 6 → tasks 6, 9, 10, 13 (build + apply + override + replace)
- Req 7 → tasks 10, 11, 12, 17 (service + provider + dogfood)
- Req 8 → tasks 10, 13 (`resolve`)
- Req 9 → tasks 5, 11, 13 (validation, fail-fast)
- Req 10 → tasks 9, 11, 15, 16, 18 (SSR-safe applier + host verification)
- Req 11 → tasks 1, 3, 7 (MCU runtime dep + same enumeration + parity test)

### Codebase verification findings

- `@angular/ssr` and `@angular/platform-server` are **not installed** — task 15 adds them. `apps/web`
  is CSR-only today (`apps/web/project.json` has no `server`/`ssr` options).
- MCU is currently a **root `devDependency`** only; task 1 adds it to `libs/ui/package.json`
  `dependencies`. ng-packagr externalizes deps (only `tslib` is auto-injected today).
- The repo has **no** existing `DOCUMENT`/`Renderer2`/`PLATFORM_ID` usage — Group B introduces the
  first; verified `DOCUMENT`, `RendererFactory2`, `makeEnvironmentProviders`,
  `provideEnvironmentInitializer` all exist in installed `@angular/core` 21.2.9.
- Secondary-entry specs are not auto-discovered — tasks 7 and 13 must add each spec to
  `libs/ui/project.json` `test.options.include`.
