---
created: 2026-06-03
updated: 2026-06-03
---

# Implementation Plan: Communication Components

## Overview

Build the M3 communication family — badge, progress (linear/circular), loading indicator, snackbar,
and tooltips (plain/rich) — as new `@ngguide/ui/*` secondary entry points, plus a small additive
extension to the existing `GuiPickerOverlay` for bottom-anchored (snackbar) and connected (tooltip)
floating surfaces.

The plan is split into 6 groups in dependency order. Each group is independently mergeable — build,
lint, and tests stay green with only that group (and earlier ones) applied. The work is **purely
additive**: every group adds a new entry point or an additive method; nothing existing is removed or
changed in a breaking way, so there are no cutovers.

Group A (overlay extension) is the only shared prerequisite — Groups E (snackbar) and F (tooltip)
depend on it. Groups B/C/D are independent and can land in any order after the repo is green.

## Tasks

### Group A — Overlay extension (foundation)

Adds two additive openers to `GuiPickerOverlay`. Blast radius: **safe** — new methods only; existing
`openDocked`/`openModal` untouched. Required by Groups E and F.

- [x] 1. Add `openGlobalBottom` and `openConnected` to `GuiPickerOverlay`
  - In `libs/ui/overlay/src/picker-overlay.ts`, add `GuiGlobalBottomConfig` + `GuiConnectedConfig`
    interfaces and two methods (design.md → "Overlay extension"):
    - `openGlobalBottom(portal, cfg?)` — `GlobalPositionStrategy` anchored bottom with
      `alignment` ('center'|'leading'), `bottomOffset`, `maxWidth`; **no backdrop, no focus trap, no
      focus capture/restore**; scroll strategy `reposition`.
    - `openConnected(portal, cfg)` — `FlexibleConnectedPositionStrategy` to `cfg.origin` with optional
      `cfg.positions`; **no backdrop, no focus capture/restore**; scroll `reposition`.
  - Export the new interfaces from `libs/ui/overlay/src/index.ts`.
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 11.7, 12.5_

- [x] 2. Unit tests for the overlay extension
  - In `libs/ui/overlay/src/picker-overlay.spec.ts` (extend existing): assert `openGlobalBottom`
    attaches a pane without a backdrop element and without creating a focus trap / moving focus;
    assert `openConnected` attaches connected to an origin and does not capture/restore focus.
  - Note jsdom limits (no real positioning) — assert overlay-ref state + that focus is unchanged.
  - _Requirements: 8.1, 9.1, 11.7_

- [x] 3. Checkpoint — Group A verification
  - `pnpm exec nx test ui --include=libs/ui/overlay/src/picker-overlay.spec.ts` (or run `ui` test target).
  - `pnpm exec nx run-many -t lint build -p ui` — confirm `ui` still builds with the additive API.
  - Confirm `main` stays green with only Group A applied (existing picker tests unaffected).

### Group B — Badge (`@ngguide/ui/badge`)

New `[guiBadge]` host directive. Blast radius: **safe** — standalone new entry point, no dependencies
on A. Independent.

- [ ] 4. Scaffold the `badge` entry point
  - Create `libs/ui/badge/{ng-package.json, src/index.ts}`; add `@ngguide/ui/badge` to
    `tsconfig.base.json` `paths`; register the spec path in `libs/ui/project.json` `test.options.include`.
  - _Requirements: 16.1, 16.2_

- [ ] 5. Implement the `GuiBadge` directive
  - `libs/ui/badge/src/badge.ts` per design: `value`/`max`/`hidden` signal inputs, `variant`/`display`
    computeds, "{max}+" cap, dot vs numeric; inject a corner `<span class="gui-badge" aria-hidden="true">`
    via `Renderer2`; host `position: relative` + `data-gui-badge-*` attrs.
  - `libs/ui/badge/src/badge.css` (or inline styles): small dot **6dp**/3dp corner; large **16dp**/8dp
    corner; max-count **16×34dp**, 4dp padding; offsets 6×6 / 14×12dp; `--md-sys-color-error` /
    `--md-sys-color-on-error`; label `--md-sys-typescale-label-small`.
  - Export from `src/index.ts`.
  - _Requirements: 1.1–1.7, 2.1–2.3, 15.1, 15.2_

- [ ] 6. Badge spec + demo
  - `libs/ui/badge/src/badge.spec.ts`: dot when no value; cap "999+"; hidden ⇒ no badge; badge graphic
    `aria-hidden`.
  - Add a demo section to `apps/web` (`app.component.{ts,html}`) badging an icon button.
  - _Requirements: 1.4, 1.5, 2.2, 2.3, 16.3_

- [ ] 7. Checkpoint — Group B verification
  - Run badge spec + `lint build -p ui`. Confirm independently mergeable; no other entry points touched.

### Group C — Progress (`@ngguide/ui/progress`)

New `gui-linear-progress` (CSS) + `gui-circular-progress` (SVG). Blast radius: **safe** — independent.

- [ ] 8. Scaffold the `progress` entry point
  - Create `libs/ui/progress/{ng-package.json, src/index.ts}`; add path alias; register both spec
    paths in `project.json`.
  - _Requirements: 16.1, 16.2_

- [ ] 9. Implement `GuiLinearProgress` (CSS)
  - `libs/ui/progress/src/linear-progress.ts` + css per design: `value` (0..1, null⇒indeterminate),
    `label`; `role="progressbar"`, `aria-valuenow/min/max` for determinate, omitted for indeterminate;
    track 4dp + rounded ends + 4dp gap + stop indicator; `--md-sys-color-primary` active /
    `--md-sys-color-secondary-container` track; indeterminate `@keyframes`, reduced under
    `@media (prefers-reduced-motion)`.
  - _Requirements: 3.1–3.6, 6.1–6.4, 14.1, 14.2, 15.1_

- [ ] 10. Implement `GuiCircularProgress` (SVG)
  - `libs/ui/progress/src/circular-progress.ts` + css per design: SVG track + active arc via
    `stroke-dasharray`/`offset`, `stroke-linecap="round"`; same ARIA contract; M3 circular default
    size/stroke (confirm against token browser); same color roles.
  - _Requirements: 4.1–4.5, 6.1–6.4, 14.1, 15.1_

- [ ] 11. Progress specs + demo
  - `linear-progress.spec.ts` + `circular-progress.spec.ts`: indeterminate omits `aria-valuenow`;
    determinate clamps + exposes `aria-valuenow`; value 0 vs null differ.
  - Demo sections in `apps/web` (determinate slider-driven + indeterminate, both geometries).
  - _Requirements: 3.2, 4.2, 6.2, 6.3, 16.3_

- [ ] 12. Checkpoint — Group C verification
  - Run progress specs + `lint build -p ui`. Confirm independently mergeable.

### Group D — Loading indicator (`@ngguide/ui/loading-indicator`)

New `gui-loading-indicator` (SVG morph). Blast radius: **safe** — independent.

- [ ] 13. Scaffold the `loading-indicator` entry point
  - Create `libs/ui/loading-indicator/{ng-package.json, src/index.ts}`; add path alias; register spec.
  - _Requirements: 16.1, 16.2_

- [ ] 14. Implement `GuiLoadingIndicator` (SVG morphing shapes)
  - `libs/ui/loading-indicator/src/loading-indicator.ts` + css per design: `variant`
    ('default'|'contained'), `label`; SVG `<path>` driven by a **deterministic** shape-tween (no
    `Math.random`/`Date.now`); 48dp overall / 38dp shape container; `role="progressbar"` busy +
    `aria-label`; default `--md-sys-color-primary`, contained on-primary-container/primary-container;
    morph stops at a resting shape under `prefers-reduced-motion` (use `GuiReducedMotion`).
  - _Requirements: 5.1–5.4, 6.5, 14.1, 15.1_

- [ ] 15. Loading-indicator spec + demo
  - `loading-indicator.spec.ts`: renders SVG path; `role="progressbar"` + accessible label; default vs
    contained variant attr; deterministic output (no nondeterministic source).
  - Demo section in `apps/web`.
  - _Requirements: 5.4, 6.5, 16.3_

- [ ] 16. Checkpoint — Group D verification
  - Run loading-indicator spec + `lint build -p ui`. Confirm independently mergeable.

### Group E — Snackbar (`@ngguide/ui/snackbar`)

`GuiSnackbar` service (queue + timer + announce) + `gui-snackbar` surface. Blast radius: **coupled to
Group A** (uses `openGlobalBottom`); otherwise additive/**safe**.

- [ ] 17. Scaffold the `snackbar` entry point
  - Create `libs/ui/snackbar/{ng-package.json, src/index.ts}`; add path alias; register service + surface specs.
  - _Requirements: 16.1, 16.2_

- [ ] 18. Implement snackbar config + surface
  - `libs/ui/snackbar/src/snackbar-config.ts`: `GuiSnackbarConfig`, `GuiSnackbarRef`,
    `GuiSnackbarCloseReason`.
  - `libs/ui/snackbar/src/snackbar.ts` surface component + css: `role="status"`; single/two-line;
    optional action (`gui-button` text) + optional close (`gui-icon-button`); container
    `--md-sys-color-inverse-surface`, text/close `--md-sys-color-inverse-on-surface`, action
    `--md-sys-color-inverse-primary`; corner-extra-small (4dp); elevation level 3.
  - _Requirements: 7.1–7.7, 10.2, 15.1_

- [ ] 19. Implement `GuiSnackbar` service (queue, timer, announce, dismissal)
  - `libs/ui/snackbar/src/snackbar.service.ts` per design: signal FIFO queue showing one at a time;
    `open(config|string)` → `GuiSnackbarRef`; `dismissAll()`; attach surface via
    `GuiPickerOverlay.openGlobalBottom` (alignment by breakpoint, `aboveFab` offset, max-width);
    `LiveAnnouncer.announce(message, politeness 'polite')`; auto-dismiss timer with configurable
    `duration` (null disables); pause on `pointerenter`/`focusin`, resume on leave/blur; swipe-dismiss;
    `afterDismissed(reason)` + `onAction`. Keep pure helpers (queue ops, two-line inference)
    deterministic; timer side-effects live in the service.
  - _Requirements: 8.1–8.3, 9.1–9.7, 10.1, 10.3, 14.1_

- [ ] 20. Snackbar specs + demo
  - `snackbar.service.spec.ts`: FIFO one-at-a-time; queues while showing; reports close reason;
    `LiveAnnouncer` called politely; `duration: null` never auto-dismisses; `dismissAll()` clears.
  - `snackbar.spec.ts`: surface renders message/action/close; `role="status"`.
  - Demo buttons in `apps/web` (simple, with-action, action-required, above-FAB).
  - _Requirements: 9.2, 9.3, 9.4, 9.6, 10.1, 16.3_

- [ ] 21. Checkpoint — Group E verification
  - Run snackbar specs + Group A overlay spec + `lint build -p ui`. Confirm Group A is present (coupled);
    confirm independently mergeable on top of A.

### Group F — Tooltips (`@ngguide/ui/tooltip`)

`[guiTooltip]` plain directive + `gui-rich-tooltip` panel + trigger directive. Blast radius: **coupled
to Group A** (uses `openConnected`); otherwise additive/**safe**.

- [ ] 22. Scaffold the `tooltip` entry point
  - Create `libs/ui/tooltip/{ng-package.json, src/index.ts}`; add path alias; register plain + rich specs.
  - _Requirements: 16.1, 16.2_

- [ ] 23. Implement the plain tooltip directive
  - `libs/ui/tooltip/src/tooltip.ts` + css per design: `guiTooltip` message, `position`, `showDelay`
    (default 500), `hideDelay`, `disabled`; hover/focus/long-press → after delay `openConnected` a
    `role="tooltip"` panel; set `aria-describedby` on the trigger while visible; pointerleave/blur/
    Escape hide (Escape keeps focus on trigger); container `--md-sys-color-inverse-surface` /
    `--md-sys-color-inverse-on-surface`, height 24dp, padding 8dp, corner-extra-small.
  - _Requirements: 11.1–11.7, 13.1–13.3, 14.1_

- [ ] 24. Implement the rich tooltip (panel + trigger)
  - `libs/ui/tooltip/src/rich-tooltip.ts` + css per design: `gui-rich-tooltip` panel projecting
    subhead/body/actions (up to two `gui-button`s), `role="tooltip"`, surface
    `--md-sys-color-surface-container`, subhead/body `--md-sys-color-on-surface-variant`, padding
    12/8/16dp, corner-medium (12dp), elevation level 2; `[guiRichTooltipTrigger]` opens via
    `openConnected` and is **persistent** (stays open while pointer is over trigger OR panel, closes
    when over neither after a grace delay); Escape / action activation closes; `aria-describedby` while open.
  - _Requirements: 12.1–12.5, 13.2, 13.4, 14.1_

- [ ] 25. Tooltip specs + demo
  - `tooltip.spec.ts`: `aria-describedby` only while visible; Escape hides + focus stays on trigger;
    disabled/empty never opens.
  - `rich-tooltip.spec.ts`: panel renders subhead/body/actions; persistent open/close logic; actions focusable.
  - Demo sections in `apps/web` (plain on icon buttons; rich with actions).
  - _Requirements: 11.5, 12.2, 13.1, 13.3, 16.3_

- [ ] 26. Checkpoint — Group F verification
  - Run tooltip specs + Group A overlay spec + `lint build -p ui`. Confirm independently mergeable on top of A.

- [ ] 27. Final checkpoint — everything green
  - `pnpm exec nx run-many -t lint test build -p ui web` — all green for both projects.
  - Confirm every new entry point builds via ng-packagr (`nx build ui` produces all new entries).
  - All 16 requirements traceable to a shipped task; new specs registered in `project.json`.
  - Dogfood in browser (`nx serve web`) recommended before release — overlay positioning, motion, and
    geometry are not covered by jsdom specs.

## Notes

### Scope boundaries

- **Dialogs** are out of scope (containment category).
- **Wavy/expressive progress** is deferred — Group C implements classic flat only (design decision).
- **Pixel geometry & overlay positioning** are verified by browser dogfood, not jsdom specs (jsdom
  can't measure layout). Specs assert state/ARIA/DOM structure only.

### Codebase verification findings

- `libs/ui/project.json` `test.options.include` lists each spec path explicitly (relative `../<name>/src/*.spec.ts`)
  and now also carries `runnerConfig: libs/ui/vitest.config.ts` — append new spec paths there.
- `tsconfig.base.json` `paths` map confirmed — add one entry per new entry point.
- `GuiPickerOverlay` (`libs/ui/overlay/src/picker-overlay.ts`) currently exposes only
  `openDocked`/`openModal`, both of which manage focus — the new snackbar/tooltip openers must NOT, so
  they are new methods rather than option flags on the existing ones.
- `@angular/cdk/a11y` is already a dependency (focus-trap usage in picker-overlay) — `LiveAnnouncer`
  comes from the same package, no new dependency.
