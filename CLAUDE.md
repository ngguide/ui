# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Angular UI Kit — a Material-Design-inspired component library built from scratch (not a wrapper around Angular Material), developed in public for the [ng.guide](https://ng.guide/ui-kit) course. Nx monorepo on **Angular 22 / Nx 23**, package manager is **pnpm**.

## Commands

```bash
pnpm install                       # uses .npmrc node-linker=hoisted (flat node_modules)
pnpm exec nx serve web             # run the demo app (dev playground for components)
pnpm exec nx run-many -t lint test build   # everything, both projects
pnpm exec nx build ui              # build the publishable library (ng-packagr)

pnpm exec nx test web              # test a single project
pnpm exec nx test web --filter "^App"                          # filter by test name (regex)
pnpm exec nx test web --include=src/app/app.component.spec.ts  # single file
```

Notes:
- Prefix Nx invocations with `pnpm exec` (no `nx` is installed globally). `NX_NO_CLOUD=true` skips the Nx Cloud prompt in non-interactive shells.
- After editing `project.json` test config, the Nx daemon may cache stale options — run `pnpm exec nx reset` if changes don't take effect.

## Architecture

### Single publishable library with secondary entry points
`libs/ui` is **one** Nx project (`ui`) that publishes the `@ngguide/ui` package. Each component is a **secondary entry point**, not a separate Nx project:
- `libs/ui/src` → `@ngguide/ui` (shared primitives, e.g. `GuiSize` type)
- `libs/ui/{button,fab,icon}/src` → `@ngguide/ui/button`, `/fab`, `/icon`

Each entry point has its own `ng-package.json` (with `entryFile: src/index.ts`) and an `index.ts` barrel. Import paths are wired through `tsconfig.base.json` `paths` — update that map when adding an entry point. Build is driven by `libs/ui/ng-package.json` via the `@nx/angular:package` (ng-packagr) executor, producing `dist/libs/ui`.

Create a new component with:
```bash
pnpm exec nx g @nx/angular:library-secondary-entry-point --library=ui --name=<name> --skipModule
```

`apps/web` is the demo/host application — a playground that imports the entry points to exercise components; it is not published.

### Component conventions (see `libs/ui/button/src/button.ts`)
- Standalone, signal inputs (`input()`, `input(false, { transform: booleanAttribute })`). **Do not write `changeDetection` at all** — OnPush is the Angular 22 default, and `angular-eslint`'s `prefer-on-push-component-change-detection` rejects opting out. The three portal containers that need `ChangeDetectionStrategy.Eager` (their hosts bind plain CDK state) carry a scoped `eslint-disable` plus a rationale; match that shape if a component ever genuinely needs it.
- Root-provided services use `@Service()` (Angular 22), not `@Injectable({ providedIn: 'root' })`. Services that are provided by hand — e.g. the route-scoped stores in `apps/web` — stay on plain `@Injectable()`.
- Attribute selectors (e.g. `button[gui-button], a[gui-button]`) — these require the `// eslint-disable-next-line @angular-eslint/component-selector` comment.
- Variants/sizes are driven onto the host via the `host` property (`[attr.data-variant]`, `[attr.data-size]`, ...) and styled from the component CSS using those attributes. Members referenced in host bindings must be at least `protected` (Angular 22 disallows `private` here).
- The shared `GuiSize` union lives in `@ngguide/ui` and is imported by each component.

### Form components and Signal Forms
Value-bearing components (checkbox, switch, radio group, slider, chip set, the pickers) take `GuiFormControl` from `@ngguide/ui/forms` as a **host directive**, aliasing its `value`/`disabled` inputs to component-facing names. That directive provides `NG_VALUE_ACCESSOR`, which is what makes one component serve template-driven, reactive **and** Signal Forms at once: `FormField.ɵngControlCreate` picks a control value accessor ahead of the native `FormValueControl` contract, which in turn comes ahead of a plain form element. Dropping the CVA to adopt the native contract would therefore trade away the older two form APIs, not add to them — `libs/ui/forms/src/signal-forms-interop.spec.ts` pins the interop so that trade cannot happen by accident.

### Zoneless + native Vitest testing
The app is **zoneless** (`provideZonelessChangeDetection()` in `apps/web/src/app/app.config.ts`; no `zone.js` polyfill). Tests run on Angular's **first-party Vitest builder** via the `@nx/angular:unit-test` executor (Vitest 4) — **AnalogJS has been removed**. Consequences:
- No `test-setup.ts` — the builder auto-initializes `TestBed` and sets `globals: true` + `jsdom`. (Each project does keep a `vitest.config.ts` wired through `runnerConfig`, which only *adds* options on top of that.)
- **Zoneless is not automatic — it has to be forced.** Since Angular 22 the unit-test builder resolves its zone strategy from the build target's `polyfills`: if that list is `undefined` it loads `zone.js` + `zone.js/testing` anyway (`getZoneTestingStrategy` in `@angular/build/src/builders/unit-test/runners/vitest/build-options.js`). Only an explicitly *defined* list without `zone.js` yields a zoneless `TestBed`. So `apps/web` sets `"polyfills": []` on its `build` target, and `libs/ui` — whose real build is ng-packagr, which has no `polyfills` option — carries a `test-build` target (`@angular/build:application`, `polyfills: []`) that exists purely as the `buildTarget` of its `test` target. Drop either and `NgZone` comes back, which silently breaks specs that assert on `afterNextRender`/`afterRenderEffect` timing or on microtask ordering.
- The native runner has **no `passWithNoTests`** — a project with zero specs fails. Every project with a `test` target must have at least one spec.
- The builder's `include` globs are resolved relative to `sourceRoot`, not `projectRoot`, and an explicit `include` **replaces** the `**/*.spec.ts` default rather than extending it. For the `ui` library, specs in secondary entry points live outside `sourceRoot` (`libs/ui/src`), so the `test` target in `libs/ui/project.json` needs both `**/*.spec.ts` (inside `src`) and `../**/*.spec.ts` (everything else under `libs/ui`) — a parent-relative glob never matches files inside the cwd. New specs are picked up automatically.

### Build executors
`web` uses the canonical `@angular/build:*` executors (application/dev-server/extract-i18n); `ui` uses `@nx/angular:package`. Module boundaries are enforced by `@nx/enforce-module-boundaries` (eslint).

### Release
Nx release with `currentVersionResolver: git-tag` (see `libs/ui/project.json`); `.verdaccio/` provides a local registry for verifying publishes. Do not change release/verdaccio config unless that is the task.
