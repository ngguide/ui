---
created: 2026-06-02
updated: 2026-06-02
---

# Implementation Plan: Actions Components

## Overview

This plan builds the full M3 "Actions" catalog as secondary entry points of `@ngguide/ui` and
retrofits the existing `button`/`fab`/`icon` entry points onto the M3 token contract and the
interaction foundation. It is split into 8 groups in dependency order. Each group is independently
mergeable — `lint test build` for `ui` and `web` stay green with only that group (and earlier ones)
applied.

There are **no cutovers**: this is a presentational library with no production traffic, env flip, or
schema. The `button`/`fab` retrofits are permitted breaking changes on a pre-release package
(Requirement 17.3); each retrofit group keeps the build green by updating that component's spec and
the `apps/web` demo in the same group.

The load-bearing mechanics (from `design.md`): every interactive Action composes
`GuiStateLayerDirective` / `GuiRippleDirective` / `GuiFocusRingDirective` via `hostDirectives`;
**disabled is auto-detected** by those directives (no input forwarding); variant/size/shape/state
ride host `data-*` attributes styled from `--md-sys-*` tokens; shape morph is a CSS `border-radius`
transition keyed on `data-gui-state=pressed` / `data-selected`; toggle/selection use `model()`;
composites follow M3's **Tab-per-item** keyboard model with native ARIA roles; FAB-menu and
split-button use `@angular/cdk/menu`. The button corner table maps onto **existing** shape tokens,
so **no `m3-tokens` change is required**.

## Tasks

### Group A — Shared foundation & icon retrofit (new shared surface)

Adds the framework-free size/shape→token maps every button consumes, and the minor icon retrofit.
Blast radius: *safe* — purely additive.

- [x] 1. Shared action-token maps
  - Create `libs/ui/src/lib/action-tokens.ts` with `GuiShapeSet` and `GUI_BUTTON_SHAPES: Record<GuiSize, GuiShapeSet>` exactly per `design.md` (round=`corner-full`; square=medium/medium/large/extra-large/extra-large; pressed=small/small/medium/large/large for xs/sm/md/lg/xl).
  - Re-export from the root barrel `libs/ui/src/index.ts` (`export * from './lib/action-tokens';`).
  - Add `libs/ui/src/lib/action-tokens.spec.ts` asserting each size maps to the expected existing `--md-sys-shape-corner-*` var (string equality, proving no `m3-tokens` change is needed). This spec lives under `sourceRoot` (`libs/ui/src`) so it is auto-discovered — no `project.json` `include` entry needed.
  - _Requirements: 2, 4, 16_

- [x] 2. Icon retrofit (minor)
  - In `libs/ui/icon/src/icon.ts`, confirm the component sizes from `--gui-comp-icon-size` and is cleanly consumable inside button icon slots; no public API change.
  - Extend `libs/ui/icon/src/icon.spec.ts` to assert the size custom-property is applied when `size` is set.
  - _Requirements: 5.3, 17_

- [x] 3. Checkpoint — Group A verification
  - Run new tests: `pnpm exec nx test ui --include=src/lib/action-tokens.spec.ts` and the icon spec.
  - Run `pnpm exec nx run-many -t lint test build` for `ui` and `web` (after `pnpm exec nx reset` if `project.json` was touched).
  - Confirm the root `@ngguide/ui` build still emits and the new map is exported.

### Group B — Button retrofit (replace hand-rolled styling)

Rewrites `ButtonComponent` onto the interaction foundation with toggle, icon slots, and shape morph.
Blast radius: *safe* — pre-release breaking change; spec + demo updated in this group keep `web` green.

- [x] 4. Retrofit `ButtonComponent`
  - Rewrite `libs/ui/button/src/button.ts`: add `hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective]` (imported from `@ngguide/ui/interaction`); named-slot template (`[guiIcon]` / default label / `[guiSelectedIcon]`); inputs `variant`/`size`/`shape`/`disabled`/`toggle` + `selected = model(false)`; host bindings for `data-variant`/`data-size`/`data-shape`/`data-selected`/`aria-pressed`, and `disabled` (native) vs `aria-disabled` (anchor) via a computed `isButton`; `(click)="onActivate($event)"` that flips `selected` only when `toggle()` && !`disabled()` (and never for `variant==='text'`).
  - Remove the old standalone-CSS reliance; the directives now own hover/focus/pressed.
  - _Requirements: 1, 2, 3, 4, 5, 13, 14, 17_

- [ ] 5. Rewrite `button.css` onto tokens + shape morph
  - In `libs/ui/button/src/button.css`: delete the `rgba(255,255,255,…)` literals, the `:hover`/`:focus-visible`/`:active` `color-mix()` state rules, the hardcoded radii (16/20/28/48/68px), and the hardcoded secondary-color focus outline — these are superseded by the interaction foundation.
  - Per-size measurements keyed by `[data-size]` from `research.md` §M3 reference (heights 32/40/56/96/136dp; leading/trailing padding 16/16/24/48/64; icon→label gap 8/8/8/12/16; outlined stroke 1/1/1/2/3).
  - Shape: `border-radius` from `GUI_BUTTON_SHAPES` per `[data-shape]`, morphing to the pressed value on `[data-gui-state~='pressed']` and to the selected (round↔square flip) shape on `[data-selected]`, with `transition: border-radius var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)`.
  - Toggle color roles per variant × Default/Unselected/Selected from the `design.md` table; disabled uses M3 disabled opacities from tokens.
  - _Requirements: 1, 2, 4, 13, 14, 16_

- [ ] 6. Button specs + demo
  - Rewrite `libs/ui/button/src/button.spec.ts`: `data-*` reflection; `toggle` click flips `selected` and sets `aria-pressed`; disabled blocks toggle and emits nothing; `[data-selected]` shows the `guiSelectedIcon` slot; `a[gui-button]` uses `aria-disabled`.
  - Update `apps/web/src/app/app.component.{ts,html}` to exercise the 5 variants × sizes × round/square × toggle × icon.
  - _Requirements: 1, 2, 3, 5, 18_

- [ ] 7. Checkpoint — Group B verification
  - Run `pnpm exec nx test ui --include=button/src/button.spec.ts` and `pnpm exec nx run-many -t lint test build`.
  - Manually confirm in `nx serve web` that buttons show state-layer/ripple/focus-ring (no bespoke CSS), toggle flips color+shape, and disabled suppresses feedback.

### Group C — Icon button (new entry point)

New `@ngguide/ui/icon-button`. Blast radius: *safe* — additive.

- [ ] 8. Icon-button entry point + component
  - Create `libs/ui/icon-button/ng-package.json`, `libs/ui/icon-button/src/index.ts` (`export * from './icon-button';`); add the `@ngguide/ui/icon-button` path to `tsconfig.base.json`; add `../icon-button/src/icon-button.spec.ts` to `libs/ui/project.json` `test.include`.
  - Implement `IconButtonComponent` per `design.md`: variants standard/filled/tonal/outlined, `width` narrow/uniform/wide, `size`, `toggle` + `selected = model(false)`, `[guiSelectedIcon]` slot, `hostDirectives` trio, disabled handling as in the button.
  - _Requirements: 6, 1, 3, 13, 14, 18_

- [ ] 9. `icon-button.css` + specs + demo
  - CSS: the 4 variant containers, the 3 widths (per-width leading/trailing space), the size scale + selected shapes, and a transparent 48×48dp hit area for `[data-size='xs']`/`[data-size='sm']` (M3 target size) — tokens only.
  - Spec `libs/ui/icon-button/src/icon-button.spec.ts`: variant/width/size reflection; toggle + `aria-pressed`; selected glyph swap.
  - Add an icon-button section to the `apps/web` demo.
  - _Requirements: 6, 15, 18_

- [ ] 10. Checkpoint — Group C verification
  - Run the icon-button spec and `nx run-many -t lint test build`; confirm the new entry point builds (ng-packagr auto-discovery) and is importable.

### Group D — FAB retrofit + Extended FAB

Retrofits `@ngguide/ui/fab` and adds `ExtendedFabComponent` to the same entry point (resolves
`// todo: add extended variant`). Blast radius: *safe* — pre-release breaking change to the fab API.

- [ ] 11. Retrofit `FabComponent`
  - Rewrite `libs/ui/fab/src/fab.ts`: replace `GuiFabColor`/`GuiFabVariant` with `GuiFabSize` (`sm`|`md`|`lg`) and the M3 `GuiFabColor` (`primary-container` default, secondary-container, tertiary-container, primary, secondary, tertiary); add `lowered` and `disabled` inputs; `hostDirectives` trio; host `data-color`/`data-size`/`data-lowered`. (Drops the old `Exclude<GuiSize,'xs'|'xl'>` size and the tonal-* color enum — pre-release breaking.)
  - _Requirements: 7, 13, 14, 16, 17_

- [ ] 12. Rewrite `fab.css` onto tokens (sizes, elevation, states)
  - Replace hardcoded widths (56/80/96px) with M3 40/56/96dp; radii via tokens (12=medium / 16=large / 28=extra-large per sm/md/lg); resting elevation level 3, hovered level 4 (`--md-sys-elevation-*`); `[data-lowered]` → `surface-container-low`; the 6 color mappings; transitions via motion tokens; remove the hand-rolled focus outline.
  - _Requirements: 7, 13, 16_

- [ ] 13. Extended FAB
  - Create `libs/ui/fab/src/extended-fab.ts` + `extended-fab.css`; export from `libs/ui/fab/src/index.ts`; add `../fab/src/extended-fab.spec.ts` to `project.json` `include`.
  - Icon slot + label; `expanded` input collapses to icon-only and expands, animated via motion tokens with a reduced-motion end-state fallback.
  - _Requirements: 8, 13, 16, 18_

- [ ] 14. FAB specs + demo
  - Update `libs/ui/fab/src/fab.spec.ts` (size/color/lowered/disabled reflection); add `extended-fab.spec.ts` (expanded/collapsed label visibility); update the `apps/web` fab demo for the new size/color set + extended FAB.
  - _Requirements: 7, 8, 18_

- [ ] 15. Checkpoint — Group D verification
  - Run the fab + extended-fab specs and `nx run-many -t lint test build`; confirm both fab components build and the demo compiles with the new API.

### Group E — Segmented buttons (new entry point)

New `@ngguide/ui/segmented-button` (group + segment, native ARIA, no CDK menu). Blast radius: *safe*.

- [ ] 16. Segmented entry point + components
  - Create `libs/ui/segmented-button/{ng-package.json, src/index.ts}`; tsconfig path; add the group + segment specs to `project.json` `include`.
  - `SegmentedButtonGroupComponent` (host `role="radiogroup"`, `multiple` input, `value = model<string|string[]|null>(null)`, `contentChildren` registry, `isSelected`/`toggleValue`, dev `console.warn` when <2 or >5 segments) and `SegmentedButtonComponent` (`role` radio|checkbox, `aria-checked`, `data-selected`, active checkmark, `(click)` → `group.toggleValue`, `hostDirectives` trio, `value` required input).
  - _Requirements: 10, 3, 13, 15, 18_

- [ ] 17. Segmented CSS + specs + demo
  - CSS: connected pill row with interior dividers, height 40dp, icon 18dp, 1dp outline, the active checkmark, and the selected container appearance — tokens only.
  - Specs: single-select assigns `role=radio` + `aria-checked` and updates a string value; multi-select assigns `role=checkbox` and accumulates an array; out-of-range segment count warns; each segment is an independent tab stop activated by click (Space/Enter).
  - Add a segmented-buttons section to the demo.
  - _Requirements: 10, 15, 18_

- [ ] 18. Checkpoint — Group E verification
  - Run the segmented specs and `nx run-many -t lint test build`; confirm single/multi selection and roles in the demo.

### Group F — Button group (new entry point)

New `@ngguide/ui/button-group`; projects `gui-button` / `gui-icon-button` children. Blast radius:
*safe* — additive (depends on Groups B and C for the child components).

- [ ] 19. Button-group entry point + component
  - Create `libs/ui/button-group/{ng-package.json, src/index.ts}`; tsconfig path; add spec to `include`.
  - `ButtonGroupComponent`: host `role="group"`, `connected` input, projects children; container not focusable (children keep their own tab stops).
  - _Requirements: 12, 18_

- [ ] 20. Button-group CSS (expressive press) + specs + demo
  - CSS: connected vs standard spacing, per-position (leading/middle/trailing) shared shapes, and the expressive press where the pressed child expands ~15% and neighbors compress — driven by `:has([data-gui-state~='pressed'])` sibling rules and gated by `prefers-reduced-motion`.
  - Specs: `role=group`, container not focusable, projected buttons remain individually focusable.
  - Add a button-group demo (connected + standard).
  - _Requirements: 12, 4, 15, 18_

- [ ] 21. Checkpoint — Group F verification
  - Run the button-group spec and `nx run-many -t lint test build`; confirm Tab moves between grouped buttons and the press expansion respects reduced motion.

### Group G — FAB menu (new entry point, CDK menu)

New `@ngguide/ui/fab-menu` using `@angular/cdk/menu`. Blast radius: *safe* — additive (depends on
Groups C and D). Includes the zoneless overlay-positioning validation.

- [ ] 22. FAB-menu entry point + component (+ #28984 validation)
  - Create `libs/ui/fab-menu/{ng-package.json, src/index.ts}`; tsconfig path; add specs to `include`.
  - `FabMenuComponent` per `design.md`: a `gui-fab` trigger with `[cdkMenuTriggerFor]`, `aria-expanded` + "Toggle menu" label on open, `(cdkMenuOpened)`/`(cdkMenuClosed)` → `opened` signal; an `ng-template` `cdkMenu` list; `FabMenuItemComponent` (`button[gui-fab-menu-item][cdkMenuItem]`, 48dp min target).
  - **Validate zoneless positioning (#28984):** confirm the opened overlay anchors to the trigger (not top-left) under this project's zoneless setup on CDK 21.2.13. If broken, stop and fall back to `research.md` §5 Variant C (internal `GuiMenuTrigger` contract + stub) and flag the deviation.
  - _Requirements: 9, 13, 15, 18_

- [ ] 23. FAB-menu CSS + specs + demo
  - CSS: vertically stacked items above the FAB, 48dp targets, open/close animation with a reduced-motion end-state; the FAB→close icon swap.
  - Specs (jsdom): `aria-expanded` toggles and the label becomes "Toggle menu" on open; menu items render with the correct role. (Overlay geometry is covered by the browser test plan.)
  - Add a fab-menu demo.
  - _Requirements: 9, 15, 18_

- [ ] 24. Checkpoint — Group G verification
  - Run the fab-menu specs and `nx run-many -t lint test build`; in `nx serve web`, confirm the menu opens positioned at the FAB (the #28984 check), keyboard-dismisses, and exposes expanded/collapsed state.

### Group H — Split button (new entry point, CDK menu)

New `@ngguide/ui/split-button` using `@angular/cdk/menu`. Blast radius: *safe* — additive (depends on
Group B for `gui-button`).

- [ ] 25. Split-button entry point + component
  - Create `libs/ui/split-button/{ng-package.json, src/index.ts}`; tsconfig path; add spec to `include`.
  - `SplitButtonComponent` per `design.md`: leading `gui-button` (emits `action`) + trailing `gui-button` `[cdkMenuTriggerFor]` with `aria-expanded` and `data-open`; `ng-template` `cdkMenu` for the projected items.
  - _Requirements: 11, 13, 15, 18_

- [ ] 26. Split-button CSS (trailing morph) + specs + demo
  - CSS: a single connected container (outer corners on leading-start/trailing-end, inner corners on the facing edges + a spacing gap); trailing button morphs to the inner-pressed radius on press and to full radius on `[data-open]`.
  - Specs: focus order leading→trailing; trailing reflects `aria-expanded`; the leading button emits `action`.
  - Add a split-button demo.
  - _Requirements: 11, 4, 15, 18_

- [ ] 27. Final checkpoint — everything green
  - Run the full suite: `pnpm exec nx run-many -t lint test build` for `ui` and `web` (after `nx reset`).
  - Trace all 18 requirements to a shipped task (every entry point present, tested, and demoed).
  - SSR sanity: prerender `web` and confirm no orphan overlay/menu nodes are emitted at server render (mirrors the interaction-foundation SSR guarantee).
  - Confirm CDK-menu overlays position correctly under zoneless (final #28984 confirmation).

## Notes

### Scope boundaries

- **The menu *overlay control* is consumed, not owned.** FAB menu and split button use
  `@angular/cdk/menu`; the dedicated M3 menu component remains the `selection` spec's responsibility.
  If `selection` later ships a first-party menu, these two can migrate to it.
- **Chips, dynamic-color generation, and any loading/busy state are out of scope** (chips →
  `selection`; scheme generation → `m3-dynamic-color`; loading is not an M3 button state).
- **No `m3-tokens` change** — the button corner table maps onto existing shape tokens (Group A,
  task 1 verifies this). A stray expressive 32dp shape, if ever needed, is coordinated with
  `m3-tokens` rather than hardcoded.

### Codebase verification findings

- `libs/ui/button/src/button.css` hardcodes non-token values (`rgba(255,255,255,0.08/0.1)`,
  radii 16/20/28/48/68px) and hand-rolls `:hover`/`:focus-visible`/`:active` — all removed in Group B.
- `libs/ui/fab/src/fab.ts` restricts `size` to `Exclude<GuiSize,'xs'|'xl'>` and uses a `tonal-*`
  color enum; both are replaced by `GuiFabSize` + the M3 color set in Group D (pre-release breaking).
- `libs/ui/fab/src/fab.ts` has no `disabled` input today — added in Group D so the state layer can
  suppress feedback.
- `@angular/cdk/menu` ships no styles and `CdkMenuTrigger` exposes `cdkMenuOpened`/`cdkMenuClosed`
  outputs + `open()/close()/toggle()/isOpen()`; `aria-expanded` auto-reflection is unverified, so the
  components bind it explicitly (Groups G/H).
- Issue **#28984** (zoneless overlay positioning) is closed-inactive on CDK v17 with no fix PR — it
  must be validated on CDK 21.2.13 (Group G, task 22); documented fallback is research §5C.
- Specs under `libs/ui/src` (`sourceRoot`) are auto-discovered; every secondary-entry spec must be
  added explicitly to `libs/ui/project.json` `test.include` (run `pnpm exec nx reset` after editing).
