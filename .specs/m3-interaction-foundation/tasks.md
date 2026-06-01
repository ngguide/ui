---
created: 2026-06-01
updated: 2026-06-01
---

# Implementation Plan: M3 Interaction Foundation

## Overview

Build `@ngguide/ui/interaction` — a new secondary entry point shipping the M3
state-layer / ripple / focus-ring directives, a reduced-motion utility, an
SSR-safe style loader, and generic a11y helpers over `@angular/cdk/a11y`. The
work is purely **additive**: a brand-new entry point and a new `@angular/cdk`
dependency. Nothing existing changes behavior; the `button`/`fab` retrofit is
deferred to the `actions` spec.

The plan is split into 6 groups in dependency order. Each group is independently
mergeable — build, lint, and tests stay green with only that group (and earlier
ones) applied. Groups B–E each depend only on Group A; Group F (demo) depends on
B–E. There are **no cutovers** — no task changes production behavior for an
existing surface.

## Tasks

### Group A — Foundation scaffold + shared utilities (new feature surface)

Stands up the `libs/ui/interaction` entry point, adds the `@angular/cdk` peer
dependency, and ships the two shared services every directive depends on
(`GuiReducedMotion`, `GuiInteractionStyles`) plus the base interaction CSS.
Blast radius: *safe* — new entry point, new dependency, no existing code touched.

- [x] 1. Scaffold the `@ngguide/ui/interaction` entry point
  - Create `libs/ui/interaction/ng-package.json`: `{ "lib": { "entryFile": "src/index.ts" }, "assets": [{ "input": "src/styles", "output": "styles", "glob": "**/*.css" }] }`
  - Create `libs/ui/interaction/src/index.ts` (barrel; will export `GuiReducedMotion` once it exists in task 4)
  - Add path alias to `tsconfig.base.json` `paths`: `"@ngguide/ui/interaction": ["libs/ui/interaction/src/index.ts"]`
  - _Requirements: 7.5, 7.6_

- [x] 2. Add the `@angular/cdk` dependency and wire build/lint
  - Install `@angular/cdk@21.2.13` (matches `@angular/core` 21.2.9) into root `package.json` and run `pnpm install`
  - Add to `libs/ui/package.json` `peerDependencies`: `"@angular/cdk": "^21.2.0"` and `"rxjs": "^7.4.0"` (FocusMonitor returns an `Observable`); `rxjs ~7.8.0` is already installed at the root
  - Do NOT add `@angular/cdk` to `libs/ui/ng-package.json` `allowedNonPeerDependencies` (that list is for non-peer deps only; CDK is a peer)
  - _Requirements: 3 (FocusMonitor), 6 (CDK a11y), 5 (MediaMatcher)_

- [x] 3. Implement `GuiInteractionStyles` (SSR-safe CSS loader) + base interaction CSS
  - Create `libs/ui/interaction/src/interaction.css.ts` exporting the static CSS string: `.gui-state-layer` host setup (`position: relative` when static, `overflow: hidden`), `.gui-state-layer::before` overlay (`content`, `inset: 0`, `border-radius: inherit`, `background: currentColor`, opacity `0`, `pointer-events: none`), `.gui-ripple` base (absolute, `border-radius: 50%`, `pointer-events: none`), and `.gui-focus-ring.gui-focus-visible` outline. All opacities/colors/offsets read `--md-sys-state-*` / `--md-sys-shape-*` tokens — no literals (see design "State layering")
  - Create `libs/ui/interaction/src/interaction-styles.ts`: `@Injectable({ providedIn: 'root' }) GuiInteractionStyles` mirroring `libs/ui/theme/src/style-applier.ts` — `inject(DOCUMENT)` + `RendererFactory2.createRenderer(null,null)`; `ensure()` is idempotent, adopts an existing `<style data-gui-interaction>` on hydration or creates one, and degrades silently if no `<head>`
  - _Requirements: 1.6, 1.7, 1.9, 7.3, 7.4_

- [x] 4. Implement `GuiReducedMotion` utility
  - Create `libs/ui/interaction/src/reduced-motion.ts`: `@Injectable({ providedIn: 'root' }) GuiReducedMotion` using `inject(MediaMatcher).matchMedia('(prefers-reduced-motion: reduce)')` (from `@angular/cdk/layout`, SSR-safe); expose `prefersReducedMotion: Signal<boolean>`; subscribe to the MQL `change` event to update the signal at runtime
  - Export `GuiReducedMotion` from `libs/ui/interaction/src/index.ts`
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 5. Unit tests for Group A utilities
  - `libs/ui/interaction/src/reduced-motion.spec.ts`: provide a fake `MediaMatcher` returning a controllable `MediaQueryList`; assert `prefersReducedMotion()` reflects `.matches` and updates when a `change` event fires (Req 5.3)
  - `libs/ui/interaction/src/interaction-styles.spec.ts`: assert `ensure()` injects exactly one `<style data-gui-interaction>`, is idempotent on repeat calls, and adopts a pre-existing element instead of duplicating (Req 7.4)
  - Add both spec paths to `libs/ui/project.json` test `include`
  - _Requirements: 5.3, 7.4_

- [x] 6. Checkpoint — Group A verification
  - Run new tests: `pnpm exec nx test ui`
  - Build the library to confirm the new entry point compiles via ng-packagr: `pnpm exec nx build ui`
  - Lint: `pnpm exec nx lint ui`
  - Confirm `pnpm install` left the lockfile consistent and `@angular/cdk@21.2.13` resolves
  - **CDK resolution check**: if `@angular/cdk/a11y` or `/layout` fails to resolve under the Vitest builder, add `@angular/cdk` to the four arrays in `libs/ui/vitest.config.ts` (mirroring the MCU handling); CDK ships proper `fesm2022`, so this is likely unnecessary — verify here
  - Confirm `main` builds and tests pass with only Group A applied

### Group B — State-layer directive (new feature surface)

Adds `[guiStateLayer]` and its `::before` overlay behavior. Blast radius: *safe*
— depends on Group A's `GuiInteractionStyles`.

- [x] 7. Implement `GuiStateLayerDirective`
  - Create `libs/ui/interaction/src/state-layer.directive.ts`: selector `[guiStateLayer]`, host `class: 'gui-state-layer'`; `disabled = input(false, {transform: booleanAttribute})`; computed `isDisabled` also reads the host's native `disabled` / `aria-disabled` (Req 4.4)
  - Host bindings: `[attr.data-gui-state]` (`'pressed' | 'dragged' | null`) and `[attr.data-gui-disabled]`; pointer listeners (`pointerenter/leave/down/up/cancel`) to track hover/pressed; drag listeners to set `dragged` (Req 1.5)
  - Call `inject(GuiInteractionStyles).ensure()` on init so the overlay CSS is present
  - Hover/focus opacities come from CSS pseudo-classes in `interaction.css`; pressed/dragged from `[data-gui-state]` rules; combined focus+hover sums to the M3 combined opacity via specificity (Req 1.8); disabled hides `::before` (Req 4.1)
  - Export from `index.ts`
  - _Requirements: 1.1–1.9, 4.1, 4.4, 4.5_

- [x] 8. State-layer CSS rules
  - Extend `interaction.css.ts` with the per-state `::before` opacity rules keyed off `:hover`, `:focus-visible`, `[data-gui-state~='pressed']`, `[data-gui-state~='dragged']`, and the combined `:hover:focus-visible` rule; `[data-gui-disabled]::before { opacity: 0 }`
  - Each opacity = the matching `--md-sys-state-*-state-layer-opacity` token (Req 1.6)
  - _Requirements: 1.2, 1.4, 1.5, 1.6, 1.8, 4.1_

- [x] 9. Unit tests for the state-layer directive
  - `libs/ui/interaction/src/state-layer.directive.spec.ts` on a host fixture: `data-gui-state` becomes `pressed` on pointerdown and clears on pointerup (Req 1.4); `data-gui-disabled` is set and overlay suppressed when `disabled` or `aria-disabled` (Req 4.1, 4.4); toggling `disabled` at runtime updates the attribute without re-creating the element (Req 4.5)
  - Add spec path to `libs/ui/project.json` test `include`
  - _Requirements: 1.4, 4.1, 4.4, 4.5_

- [x] 10. Checkpoint — Group B verification
  - Run `pnpm exec nx test ui` (new + Group A specs), `pnpm exec nx lint ui`, `pnpm exec nx build ui`
  - Confirm `main` builds and passes with only Groups A–B applied; `[guiStateLayer]` is unreferenced by any existing component (additive)

### Group C — Ripple directive (new feature surface)

Adds `[guiRipple]` using the Web Animations API. Blast radius: *safe* — depends
on Group A (`GuiReducedMotion`, `GuiInteractionStyles`).

- [x] 11. Implement `GuiRippleDirective`
  - Create `libs/ui/interaction/src/ripple.directive.ts`: selector `[guiRipple]`, host `class: 'gui-ripple-host'`; `disabled = input(false, {transform: booleanAttribute})`; inject `ElementRef`, `Renderer2`, `GuiReducedMotion`, `GuiInteractionStyles`
  - Host listeners: `pointerdown` → `launch(event)` (origin at pointer, Req 2.1); `keydown.enter` / `keydown.space` → centered ripple (Req 2.2)
  - `fade(x, y)`: return early if disabled (Req 4.2) or `prefersReducedMotion()` (Req 5.1) or `typeof el.animate !== 'function'`; create a `.gui-ripple` span via `Renderer2`, position at `(x, y)`, size radius from `getBoundingClientRect`; `span.animate([{transform:'scale(0)',opacity:τ},{transform:'scale(1)',opacity:0}], {duration: <md-sys-motion-duration>, easing: <md-sys-motion-easing>, fill:'forwards'})`; `anim.finished.then(() => renderer.removeChild(host, span))` (Req 2.6, 2.7)
  - Ripple color/opacity from content color role + `--md-sys-state-pressed-state-layer-opacity` (Req 2.4); pick the M3 pressed motion duration/easing tokens from `libs/ui/src/styles/tokens/_motion.css` and document which (open question in design)
  - Call `GuiInteractionStyles.ensure()`; export from `index.ts`
  - _Requirements: 2.1–2.7, 4.2, 5.1_

- [x] 12. Ripple CSS base + reduced-motion guard
  - Ensure `.gui-ripple` base styles in `interaction.css.ts` clip to the host shape (host `overflow: hidden`, ripple `border-radius` / containment) without clipping the host's own `box-shadow` (design "State layering"; Req 2.3, 2.5)
  - Add a `@media (prefers-reduced-motion: reduce)` belt-and-suspenders rule that neutralizes any ripple transition (the JS gate in task 11 is primary; Req 5.1)
  - _Requirements: 2.3, 2.5, 5.1_

- [x] 13. Unit tests for the ripple directive
  - `libs/ui/interaction/src/ripple.directive.spec.ts`: stub `Element.prototype.animate` to return `{ finished: Promise.resolve(), cancel(){} }`; on activation a `.gui-ripple` child is appended then removed after `finished` (Req 2.1, 2.7); `animate` is NOT called when `disabled` (Req 4.2) or when a `GuiReducedMotion` stub reports `true` (Req 5.1); keyboard activation produces a centered ripple (Req 2.2)
  - Add spec path to `libs/ui/project.json` test `include`
  - _Requirements: 2.1, 2.2, 2.7, 4.2, 5.1_

- [x] 14. Checkpoint — Group C verification
  - Run `pnpm exec nx test ui`, `pnpm exec nx lint ui`, `pnpm exec nx build ui`
  - Confirm `main` builds/passes with only Groups A–C applied; note that jsdom can't verify ripple geometry — that's covered by the browser test plan (Group F + `spec:test`)

### Group D — Focus-ring directive (new feature surface)

Adds `[guiFocusRing]` via CDK `FocusMonitor`. Blast radius: *safe* — depends on
Group A (`@angular/cdk`).

- [x] 15. Implement `GuiFocusRingDirective`
  - Create `libs/ui/interaction/src/focus-ring.directive.ts`: selector `[guiFocusRing]`, host `class: 'gui-focus-ring'`; inject `FocusMonitor` (`@angular/cdk/a11y`, `providedIn:'root'`, SSR-safe) and `ElementRef`
  - In the constructor, `focusMonitor.monitor(el).subscribe(origin => el.classList.toggle('gui-focus-visible', origin === 'keyboard'))` (Req 3.1, 3.2); `ngOnDestroy` → `focusMonitor.stopMonitoring(el)` (cleanup)
  - Disabled / `[aria-disabled]` hosts get no ring (CSS + non-focusability, Req 4.3); `monitor()` returns an empty observable on the server (SSR-safe, Req 7.3)
  - Export from `index.ts`
  - _Requirements: 3.1, 3.2, 3.3, 4.3, 7.3_

- [x] 16. Focus-ring CSS
  - Ensure `.gui-focus-ring.gui-focus-visible` in `interaction.css.ts` draws an `outline` from `--md-sys-state-focus-indicator-thickness` + `--md-sys-state-focus-indicator-outer-offset` and a color role, visible in light + dark and unclipped by the host's `overflow` (Req 3.4, 3.5); `[disabled]`/`[aria-disabled]` → no ring (Req 4.3)
  - _Requirements: 3.4, 3.5, 4.3_

- [x] 17. Unit tests for the focus-ring directive
  - `libs/ui/interaction/src/focus-ring.directive.spec.ts`: provide a `FocusMonitor` test double whose `monitor()` emits `'mouse'` then `'keyboard'`; assert `gui-focus-visible` is absent for mouse and present for keyboard (Req 3.1, 3.2); assert `stopMonitoring` is called on destroy
  - **Edge case** (design Edge Case 1): in a focused test, drive keyboard-then-programmatic focus and record the reported `FocusOrigin`; if keyboard-driven `focus()` reports `'program'` rather than `'keyboard'`, widen the ring condition accordingly and note it
  - Add spec path to `libs/ui/project.json` test `include`
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 18. Checkpoint — Group D verification
  - Run `pnpm exec nx test ui`, `pnpm exec nx lint ui`, `pnpm exec nx build ui`
  - Confirm `main` builds/passes with only Groups A–D applied

### Group E — Generic a11y utilities (new feature surface)

Re-exports + thin wrappers over CDK roving-tabindex / focus-management. Blast
radius: *safe* — depends on Group A (`@angular/cdk`). Pattern wiring stays in the
component specs (Req 6.5).

- [ ] 19. Implement and export generic a11y helpers
  - Create `libs/ui/interaction/src/a11y.ts`: re-export `FocusKeyManager`, `ListKeyManager`, `type FocusableOption` from `@angular/cdk/a11y` (Req 6.2, 6.3); add a generic `createRovingFocus(...)` factory applying M3/APG defaults (wrap-around, type-ahead) over a caller-supplied item list + orientation (Req 6.1, 6.4) — pattern-agnostic, no listbox/menu/tabs/combobox binding (Req 6.5)
  - Export the helpers from `libs/ui/interaction/src/index.ts`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 20. Unit test for roving-focus helper
  - `libs/ui/interaction/src/a11y.spec.ts`: build a small set of fake `FocusableOption` items, create a roving manager via `createRovingFocus`, simulate arrow `keydown`, assert focus/active index moves and exactly one item is the active tab stop at a time (Req 6.3), and that wrap-around behaves per the configured default
  - Add spec path to `libs/ui/project.json` test `include`
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 21. Checkpoint — Group E verification
  - Run `pnpm exec nx test ui`, `pnpm exec nx lint ui`, `pnpm exec nx build ui`
  - Confirm `main` builds/passes with only Groups A–E applied; the full public API (`index.ts`) exports all three directives, `GuiReducedMotion`, and the a11y helpers (Req 7.1)

### Group F — Demo playground for manual/browser verification (new feature surface)

Adds a small playground to `apps/web` that applies all three directives so the
manual/browser test plan (`spec:test` via `agent-browser`) has a target. Blast
radius: *safe* — demo host only, not published.

- [ ] 22. Wire an interaction-foundation demo into `apps/web`
  - Import the directives from `@ngguide/ui/interaction` into a demo section of `apps/web/src/app/app.component.ts` / `.html` (e.g. a plain element with `guiStateLayer guiRipple guiFocusRing`, an `aria-disabled` variant, and a small roving-tabindex list)
  - Confirm the interaction CSS is present at runtime (the loader injects it on first directive use); verify in dev (`pnpm exec nx serve web`)
  - _Requirements: 7.1, 7.2_

- [ ] 23. Final checkpoint — everything green
  - Full suite: `pnpm exec nx run-many -t lint test build` for `ui` and `web`
  - SSR-safety: build `web` (SSR is configured) and confirm there is exactly one `<style data-gui-interaction>` and no duplicated ripple nodes after hydration (Req 7.4)
  - Trace: every requirement (1–7) maps to a shipped task (see per-task `_Requirements:`)
  - Remind: no PR opened by this skill; the user bundles groups into PRs

## Notes

### Scope boundaries

- **Retrofitting `button`/`fab`/`icon` onto these directives is out of scope** —
  deferred to the `actions` spec (per the project plan). This spec only defines
  the primitives; existing component CSS (`:focus-visible` outline, `color-mix`
  hover/active) is left untouched.
- **ARIA pattern wrappers (listbox/menu/tabs/combobox) are out of scope** (Req
  6.5) — they belong to the component specs, which may additionally adopt
  `@angular/aria` (peer-pinned to the same `@angular/cdk@21.2.13`).
- **Token definitions are out of scope** — consumed from `m3-tokens`.

### Codebase verification findings

- `tsconfig.base.json:17–23`, `libs/ui/project.json` test `include`,
  `libs/ui/package.json`, `libs/ui/ng-package.json`, `libs/ui/eslint.config.mjs`
  (directive selector: attribute/`gui`/camelCase), and
  `libs/ui/theme/src/style-applier.ts` (SSR loader pattern) all confirmed as
  described in the design.
- `rxjs ~7.8.0` is already installed (satisfies CDK's `^7.4.0` peer);
  `@angular/cdk` is **not** installed (Group A adds it).
- M3 motion tokens (`--md-sys-motion-duration-*`, `--md-sys-motion-easing-*`)
  exist in `libs/ui/src/styles/tokens/_motion.css` for the ripple.
- State tokens (`--md-sys-state-*`) exist in
  `libs/ui/src/styles/tokens/_state.css` and are currently unused — this spec is
  their first consumer.
