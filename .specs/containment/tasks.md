---
created: 2026-06-03
updated: 2026-06-03
---

# Implementation Plan: Containment Components

## Overview

Adds the M3 containment category to `@ngguide/ui` as seven new secondary entry points (card, divider, list,
dialog, bottom-sheet, side-sheet, carousel) plus a small shared overlay foundation. The work is purely
additive — every change creates new files or new entry points; nothing existing is removed or rewired — so
each group simply lands new, independently importable surface area.

The plan is split into 7 groups in dependency order. Each group is independently mergeable — build, lint, and
the full Vitest suite stay green with only that group (and earlier ones) applied. Group A ships the shared
modal foundation that the dialog and sheet groups consume; the card, divider, list, and carousel groups
depend only on the existing token + interaction foundation and could land in any order.

There are **no cutovers** — the plan is purely additive (new entry points, no production behaviour change).

### Per-entry-point wiring (applies to every new entry point)

Each new `@ngguide/ui/<name>` requires the same wiring (verified against the snackbar/tooltip precedent):
1. Scaffold: `pnpm exec nx g @nx/angular:library-secondary-entry-point --library=ui --name=<name> --skipModule`
   (creates `libs/ui/<name>/{ng-package.json, src/index.ts, src/<name>.ts, src/<name>.spec.ts}`).
2. Add the path alias to `tsconfig.base.json` `paths` (alphabetical): `"@ngguide/ui/<name>": ["libs/ui/<name>/src/index.ts"]`.
3. Append every spec file to the `test.options.include` array in `libs/ui/project.json`, then run `pnpm exec nx reset`.
4. If the entry point ships global chrome (scrim/surface/structural rules a directive can't carry), add
   `libs/ui/src/styles/<name>.css` and `@import './<name>.css';` to `libs/ui/src/styles/theme.css`.
5. `libs/ui/package.json` needs **no change** — `@angular/cdk ^21.2.0` is already a peer dependency, so
   `@angular/cdk/dialog`, `/drag-drop`, and `/layout` are available.

## Tasks

### Group A — Shared overlay foundation (new feature surface)

Extends the existing `@ngguide/ui/overlay` entry point with the compact-window signal, the shared modal
config/normalizer/ref helpers, and the global scrim stylesheet that the dialog and sheet groups consume.
Blast radius: **safe** — additive helpers, inert until a later group imports them.

- [x] 1. `GuiBreakpoint` compact-window signal
  - Create `libs/ui/overlay/src/breakpoint.ts`: `@Injectable({providedIn:'root'})` injecting `MediaMatcher`
    from `@angular/cdk/layout`, exposing `isCompact: Signal<boolean>` from `matchMedia('(max-width: 599.98px)')`
    — mirror `libs/ui/interaction/src/reduced-motion.ts` exactly (SSR-safe `addEventListener?.`).
  - Export it from `libs/ui/overlay/src/index.ts`.
  - Test (`libs/ui/overlay/src/breakpoint.spec.ts`): mock `MediaMatcher`; assert initial value tracks
    `matches` and updates on `change`. Append the spec to `project.json` `include`; `pnpm exec nx reset`.
  - _Requirements: 8, 11.6, 16.3_

- [x] 2. Shared modal config + normalizer + ref wrapper
  - Create `libs/ui/overlay/src/modal.ts`: `GuiDialogRole`, `GuiModalConfigBase<D>`, the `GuiDialogRef<R>`
    interface, `normalizeModalConfig(config)` mapping onto CDK `DialogConfig`
    (`ariaModal:true`, `role`, `ariaLabel`, `ariaLabelledBy`, `disableClose`, `autoFocus` default
    `'first-tabbable'`, `restoreFocus` default `true`, `hasBackdrop:true`, `backdropClass:'gui-scrim'`,
    `data`, `injector`, `panelClass`), and `wrapDialogRef(ref: DialogRef): GuiDialogRef` (re-exposes
    `closed`/`backdropClick`/`keydownEvents`/`close`). Re-export CDK `DIALOG_DATA` as `GUI_DIALOG_DATA`.
  - Set the CDK Dialog scroll strategy to `block()` (Req 12.6) via the normalizer/config default.
  - Export all from `libs/ui/overlay/src/index.ts`.
  - Test (`libs/ui/overlay/src/modal.spec.ts`): `normalizeModalConfig` sets `ariaModal:true` + scrim class +
    block scroll; `disableClose` propagates; `wrapDialogRef` forwards `close(result)`→`closed`. Add to `include`; reset.
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.6, 12.7, 14.1_

- [x] 3. Global scrim stylesheet
  - Create `libs/ui/src/styles/scrim.css`: `.gui-scrim` backdrop using `--md-sys-color-scrim` at 32% opacity,
    with an `@media (prefers-reduced-motion: reduce)` fade fallback (overlay.css precedent).
  - Add `@import './scrim.css';` to `libs/ui/src/styles/theme.css` (after `badge.css`).
  - _Requirements: 12.1, 15.2_

- [x] 4. Checkpoint — Group A verification
  - Run new specs: `pnpm exec nx test ui` (breakpoint + modal specs pass).
  - Run existing overlay spec to catch regressions: confirm `picker-overlay.spec.ts` still green.
  - `pnpm exec nx run-many -t lint build --projects=ui` green; confirm `@ngguide/ui/overlay` still builds.
  - Confirm the new helpers are exported and unused by anything yet (inert until Group D/E/F).

### Group B — Card + Divider (new feature surface)

Two structural entry points reusing tokens + interaction directives; no overlay dependency. Blast radius: **safe**.

- [x] 5. Card entry point
  - Scaffold `@ngguide/ui/card` (+ wiring steps 1–4 from the Overview; card ships `styles/card.css` only if
    a global rule is needed — prefer component `card.css`).
  - `libs/ui/card/src/card.ts`: `GuiCard` (`selector: gui-card`, OnPush, `variant` input
    `elevated|filled|outlined`, `disabled`, host `data-variant`/`data-disabled`); `GuiCardClickable`
    (`[guiCardClickable]`, hostDirectives state-layer/ripple/focus-ring, role/button + Enter/Space/click,
    `cardActivate` output, disabled guard); `GuiCardPrimaryAction` (`[guiCardPrimaryAction]`, same interaction
    set, `primaryAction` output).
  - `libs/ui/card/src/card.css`: variant tokens — elevated `surface-container-low`+`elevation-level1`
    (hover `level2`, dragged `level4`); filled `surface-container-highest`+`level0` (hover `level1`);
    outlined `surface`+`level0`+`outline-variant` 1px (focus border `on-surface`); corner `medium`; clip
    content to corners; disabled 0.38 opacity + no state layers.
  - Export from `libs/ui/card/src/index.ts`.
  - Test (`card.spec.ts`): reflects `variant`→`data-variant`; clickable emits on click/Enter; disabled
    suppresses activation + state layers; primary-action region emits independently.
  - _Requirements: 1.1–1.7, 2.1–2.6, 13.1–13.4, 14.3, 14.4_

- [x] 6. Divider entry point
  - Scaffold `@ngguide/ui/divider` (+ wiring).
  - `libs/ui/divider/src/divider.ts`: `GuiDivider` (`gui-divider`, OnPush, `inset`
    `none|inset|middle-inset`, `orientation` `horizontal|vertical`, host `role=separator` +
    `aria-orientation` + `data-inset`).
  - `libs/ui/divider/src/divider.css`: 1px `outline-variant`; `inset`=16px leading; `middle-inset`=16px both.
  - Export from index; test (`divider.spec.ts`): `role=separator`, `data-inset` reflects input, not focusable.
  - _Requirements: 3.1–3.4, 13.1, 14.5_

- [x] 7. Demo — card + divider
  - `apps/web/src/app/app.component.ts/.html`: import `GuiCard`/`GuiCardClickable`/`GuiCardPrimaryAction`/
    `GuiDivider`; add a containment demo section showing all three card variants, a clickable card, a
    primary-action card with separate action buttons, and the three divider insets.
  - _Requirements: 1, 2, 3_

- [x] 8. Checkpoint — Group B verification
  - `pnpm exec nx test ui` (card + divider specs pass); `nx test web` if demo wiring added bindings.
  - `pnpm exec nx run-many -t lint build --projects=ui,web` green; both new entry points build via ng-packagr.
  - Confirm `@ngguide/ui/card` and `@ngguide/ui/divider` resolve from `tsconfig.base.json` paths.

### Group C — List (new feature surface)

One entry point with container + item, both `action` and `listbox` modes; reuses `createRovingFocus`. Blast radius: **safe**.

- [x] 9. List container + item structure
  - Scaffold `@ngguide/ui/list` (+ wiring; ships `styles/list.css` or component CSS).
  - `libs/ui/list/src/list.ts`: `GuiList` (`gui-list`, OnPush, `mode` `action|listbox`, `multiselectable`,
    host role `list|listbox` + `aria-multiselectable` in listbox mode, `(keydown)` delegating to the manager).
  - `libs/ui/list/src/list-item.ts`: `GuiListItem` (`gui-list-item`, OnPush, `lines` 1|2|3, `interactive`,
    `selectable`, `selected` model, `disabled`; host role `option|listitem|null`, `aria-selected`/
    `aria-disabled`/`data-selected`; projects `[guiListItemLeading]`, headline, `[guiListItemSupporting]`,
    `[guiListItemTrailing]`); implements `FocusableOption`.
  - CSS: heights 56/72/88dp per `lines`; leading icon 24 / avatar 40 / image 56dp; headline `body-large`,
    supporting `body-medium`, trailing supporting `label-small`; 16dp start/end padding; container `surface`;
    selected container `secondary-container`; text inset when no leading element.
  - Export both from index.
  - Test (`list.spec.ts`, `list-item.spec.ts`): density→`data-lines`; action mode role list/listitem;
    listbox mode role listbox/option + `aria-selected`; disabled item not activatable.
  - _Requirements: 4.1–4.5, 5.1–5.4, 6.5, 13.1–13.4_

- [x] 10. List interaction + selection
  - `GuiList`: in `listbox` mode build a `createRovingFocus(items, {orientation:'vertical'})` manager
    (single tab stop, arrow/typeahead/home-end), wire `onKeydown`; toggle `selected` on Enter/Space/click;
    honor `multiselectable`. In `action` mode rely on nested native controls + natural tab order.
  - Ensure trailing checkbox/switch state and item selected state stay in sync without double-announcing (Req 6.4).
  - Test: roving focus moves with arrows + wraps; selection toggles `aria-selected`; single vs multi select;
    trailing-control sync exposes one accessible state.
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 14.2, 14.3_

- [x] 11. Demo — list
  - apps/web: import `GuiList`/`GuiListItem`; add a 1/2/3-line action list (leading icon/avatar, trailing
    text/icon) and a selectable listbox with checkboxes.
  - _Requirements: 4, 5, 6_

- [x] 12. Checkpoint — Group C verification
  - `pnpm exec nx test ui` (list specs pass); lint + build green for `ui` (and `web` if demo added).
  - Confirm `@ngguide/ui/list` builds and roving focus works in the demo (keyboard arrows).

### Group D — Dialog (new feature surface)

Basic + full-screen dialog on CDK `Dialog` via a custom container, imperative `open()` + declarative trigger.
Depends on Group A (modal foundation). Blast radius: **coupled to Group A** (imports its helpers).

- [x] 13. Dialog config, service, ref, anatomy slots
  - Scaffold `@ngguide/ui/dialog` (+ wiring; `styles/dialog.css`).
  - `dialog-config.ts`: `GuiDialogFullScreen` (`never|compact|always`), `GuiDialogConfig<D>` extending
    `GuiModalConfigBase`, re-export `GUI_DIALOG_DATA`.
  - `dialog.service.ts`: `@Injectable({providedIn:'root'}) GuiDialog` injecting CDK `Dialog` + `GuiBreakpoint`;
    `open(content: ComponentType|TemplateRef, config)` → `Dialog.open` with `container: GuiDialogContainer`,
    `maxWidth` default `min(560px, calc(100% - 48px))`, full-screen resolution via `GuiBreakpoint`; returns
    `wrapDialogRef(ref)`.
  - `dialog.ts`: anatomy slot components/directives — `GuiDialogHeadline` (h2/role=heading), `GuiDialogIcon`,
    `GuiDialogContent`, `GuiDialogActions` — token-styled wrappers.
  - Export all from index. Test (`dialog.service.spec.ts`): opens with `role=dialog`+`aria-modal`; `close(r)`
    emits on `closed`; restore-focus returns to opener; `fullScreen:'compact'` honors the breakpoint signal.
  - _Requirements: 7.1, 7.2, 7.4, 7.6, 8.1, 12.1–12.7, 16.2_

- [x] 14. Dialog container (M3 chrome + motion) + full-screen layout
  - `dialog-container.ts`: `GuiDialogContainer extends CdkDialogContainer` — `surface-container-high`,
    `corner-extra-large` (28dp), `elevation-level3`, centered; enter (emphasized-decelerate) / exit
    (emphasized-accelerate) via motion tokens, disabled under `GuiReducedMotion`; full-screen mode
    (`data-fullscreen`) fills the window with a top-app-bar header slot (close/back + title + confirm) and
    scrolls the body independently.
  - `dialog.css`: basic + full-screen surface rules, scrollable content region keeping headline/actions visible.
  - Test (`dialog.spec.ts`): container renders headline/content/actions; full-screen sets `data-fullscreen`
    + header; content scrolls; reduced-motion disables animation.
  - _Requirements: 7.1, 7.3, 7.5, 8.1, 8.2, 8.4, 8.5, 15.1, 15.2, 15.3_

- [x] 15. Declarative trigger + demo
  - `dialog.trigger.ts`: `[guiDialogTrigger]` directive (`TemplateRef` input + optional `guiDialogConfig`,
    opens on click via `GuiDialog`).
  - apps/web: import `GuiDialog` + slots + trigger; add buttons opening a basic dialog (icon/headline/2
    actions) and a full-screen dialog, plus a declarative `<ng-template>` trigger example.
  - Test: trigger opens the template; Escape + scrim-click close (unless `disableClose`).
  - _Requirements: 7.2, 8.2, 8.3, 12.4, 12.5, 16.2_

- [x] 16. Checkpoint — Group D verification
  - `pnpm exec nx test ui` (dialog specs pass) + existing overlay specs green.
  - lint + build green for `ui`,`web`; `@ngguide/ui/dialog` builds; demo opens/closes both dialog types with
    focus trap + restore verified in the browser.

### Group E — Bottom sheet (new feature surface)

Modal (CDK Dialog + drag) and standard (inline) variants. Depends on Group A. Blast radius: **coupled to Group A**.

- [ ] 17. Bottom-sheet config, service, container
  - Scaffold `@ngguide/ui/bottom-sheet` (+ wiring; `styles/bottom-sheet.css`).
  - `bottom-sheet-config.ts`: `GuiBottomSheetConfig<D>` extending `GuiModalConfigBase`
    (`showDragHandle` default true, `aboveFab`, `dismissThreshold` default 96, `maxWidth` default `640px`).
  - `bottom-sheet.service.ts`: `GuiBottomSheet` injecting CDK `Dialog`; `open()` with
    `container: GuiBottomSheetContainer`, a bottom-centered global position strategy, scrim + block scroll.
  - `bottom-sheet-container.ts`: `extends CdkDialogContainer` — `surface-container-low`,
    `corner-extra-large-top` (28dp top), `elevation-level1`, slide-up enter / slide-down exit (emphasized
    easing, reduced-motion aware), initial height capped at ~50% with internal scroll.
  - Export from index. Test (`bottom-sheet.service.spec.ts`): opens bottom-anchored modal with scrim + trap; `close` emits.
  - _Requirements: 9.1, 9.5, 12.1–12.7, 15.1, 15.2, 16.2_

- [ ] 18. Drag handle + dismiss/spring-back + standard inline mode
  - `bottom-sheet.ts`: `GuiBottomSheet` surface component used by both modes — drag handle (32×4dp
    `on-surface-variant`) with `CdkDrag cdkDragLockAxis="y"`, `cdkDragConstrainPosition` clamping upward;
    `cdkDragMoved`→fade scrim by `distance.y/height`; `cdkDragEnded`→ if `distance.y > dismissThreshold`
    `close('swipe')` else `setFreeDragPosition({x:0,y:0})` spring-back; `touch-action:none`/`user-select:none`
    during drag. Standard variant (`variant="standard"`, `[(open)]` model) renders fixed-position inline,
    **no scrim, no focus trap** (coexists).
  - Test (`bottom-sheet.spec.ts`): drag past threshold dismisses; below springs back; standard mode renders
    without scrim and leaves the page interactive.
  - _Requirements: 9.2, 9.3, 9.4, 9.6, 9.7_

- [ ] 19. Demo — bottom sheet
  - apps/web: import `GuiBottomSheet` (service + surface); add a button opening a modal sheet (drag handle,
    drag-to-dismiss) and a toggled standard sheet.
  - _Requirements: 9_

- [ ] 20. Checkpoint — Group E verification
  - `pnpm exec nx test ui` (bottom-sheet specs pass); lint + build green for `ui`,`web`.
  - `@ngguide/ui/bottom-sheet` builds; browser: drag-to-dismiss + spring-back + standard coexistence verified.

### Group F — Side sheet (new feature surface)

Modal + standard side sheet on the end edge. Depends on Group A. Blast radius: **coupled to Group A**.

- [ ] 21. Side-sheet config, service, container (modal)
  - Scaffold `@ngguide/ui/side-sheet` (+ wiring; `styles/side-sheet.css`).
  - `side-sheet-config.ts`: `GuiSideSheetConfig<D>` extending `GuiModalConfigBase` (`maxWidth` default 400px).
  - `side-sheet.service.ts`: `GuiSideSheet` injecting CDK `Dialog`; `open()` with
    `container: GuiSideSheetContainer`, end-anchored global position strategy, scrim + block scroll.
  - `side-sheet-container.ts`: `extends CdkDialogContainer` — end edge, width 256–400px, `corner-large` (16dp),
    appropriate container color + elevation, slide-in/out (emphasized easing, reduced-motion aware).
  - Export from index. Test (`side-sheet.service.spec.ts`): opens end-anchored modal with scrim + trap; Escape/close emits.
  - _Requirements: 10.1, 10.2, 10.5, 10.6, 12.1–12.7, 15.1, 15.2, 16.2_

- [ ] 22. Side-sheet header/actions + standard inline mode + demo
  - `side-sheet.ts`: surface with header slot (title + close affordance) and actions slot; standard variant
    (`variant="standard"`, `[(open)]`) renders inline without scrim/trap (coexists).
  - apps/web: import `GuiSideSheet`; add a modal side sheet (header + close + actions) and a toggled standard one.
  - Test (`side-sheet.spec.ts`): header/close/actions render; standard mode no scrim, page interactive.
  - _Requirements: 10.3, 10.4, 10.5, 10.6_

- [ ] 23. Checkpoint — Group F verification
  - `pnpm exec nx test ui` (side-sheet specs pass); lint + build green for `ui`,`web`.
  - `@ngguide/ui/side-sheet` builds; browser: modal open/close + standard coexistence verified.

### Group G — Carousel (new feature surface)

Pure keyline engine + components implementing the four M3 layouts. Independent of the overlay foundation.
Blast radius: **safe**.

- [ ] 24. Keyline sizing engine (pure)
  - Scaffold `@ngguide/ui/carousel` (+ wiring).
  - `carousel-keylines.ts`: `GuiCarouselLayout`, `MIN_SMALL_ITEM=40`, `MAX_SMALL_ITEM=56`,
    `KeylineArrangement`, `arrange(layout, viewportWidth, opts)` (small=clamp(large/3,40,56),
    medium=(large+small)/2; multi-browse caps non-focal at 2 + drops small below 80px; hero start/center
    variants; uncontained resizes last cut-off item; full-screen single item) and
    `maskForOffset(arrangement, scrollOffset, index)`. Pure — no `Date.now`/`Math.random` (Req 16.4).
  - Test (`carousel-keylines.spec.ts`): the verified sizing rules per layout; small clamp; drop-below-threshold.
  - _Requirements: 11.2, 11.3, 11.5, 16.4_

- [ ] 25. Carousel + item components
  - `carousel.ts`: `GuiCarousel` (`gui-carousel`, OnPush, `layout`, `preferredLargeWidth` default 186,
    `itemSpacing` default 8, host `role=group`+`aria-roledescription=carousel`+`data-layout`); injects
    `GuiBreakpoint` + `GuiReducedMotion`; `afterNextRender` sets up `ResizeObserver(track)` + scroll listener
    that recompute `arrange()` and assign item widths/clip via signals; SSR/first frame renders items at large size.
  - `carousel-item.ts`: `GuiCarouselItem` (`gui-carousel-item`, width signal set by engine, `scroll-snap-align`).
  - `carousel.css`: native scroll + `scroll-snap`, item corner `extra-large` (28dp).
  - Export both from index. Test (`carousel.spec.ts`): renders items; `data-layout` reflects input;
    items get widths from the engine after layout.
  - _Requirements: 11.1, 11.4, 16.3, 16.4_

- [ ] 26. Layouts, full-screen orientation, reduced motion + demo
  - `GuiCarousel.effectiveLayout()`: full-screen layout switches to vertical orientation on compact
    (`GuiBreakpoint.isCompact()`); under `GuiReducedMotion`, disable per-scroll size morphing (items render at
    arranged sizes). Verify multi-browse/uncontained/hero/full-screen all render per the engine.
  - apps/web: import `GuiCarousel`/`GuiCarouselItem`; add a demo with a layout switcher across all four layouts.
  - Test: full-screen compact orientation; reduced-motion disables morph; resize re-arranges (Req 11.5/11.6).
  - _Requirements: 11.5, 11.6, 15.1, 15.2, 15.3_

- [ ] 27. Final checkpoint — everything green
  - Full suite: `pnpm exec nx run-many -t lint test build --projects=ui,web` green.
  - All seven entry points (`card, divider, list, dialog, bottom-sheet, side-sheet, carousel`) build via
    ng-packagr and resolve from `tsconfig.base.json`.
  - Every requirement (1–16) traces to a shipped task (see Notes traceability).
  - Browser dogfood: card variants/actionable, divider insets, list densities + listbox selection, basic +
    full-screen dialog, modal + standard bottom sheet (drag), modal + standard side sheet, all four carousel layouts.

## Notes

### Scope boundaries

- **Navigation surfaces** (drawer/rail/bar, top app bar, tabs) are out of scope — they live in the `navigation` spec.
- **Standard (non-modal) sheets** deliberately do **not** use CDK `Dialog` (which always traps focus); they render
  as inline fixed-position surfaces so they can coexist with page content (Req 9.2 / 10.3).
- **Carousel parallax multiplier** and exact **dialog/sheet motion durations** were unverifiable from the
  JS-rendered M3 spec pages (research Open Questions); the implementation uses the verified easing pairing and a
  reasonable duration token, to be confirmed during dogf/test-plan.

### Requirements traceability (group → requirements)

- Group A → 8, 11.6, 12.1–12.7, 14.1, 16.3
- Group B → 1, 2, 3, 13, 14.3–14.5
- Group C → 4, 5, 6, 14.2, 14.3
- Group D → 7, 8, 12, 15, 16.2
- Group E → 9, 12, 15, 16.2
- Group F → 10, 12, 15, 16.2
- Group G → 11, 15, 16.3, 16.4
- Cross-cutting 13 (tokens) and 14 (a11y) are exercised by every group's components; 16 (packaging/SSR/zoneless)
  by every entry point's scaffold + specs.

### Codebase verification findings

- `@angular/cdk` is already a peer dependency of `libs/ui/package.json` (`^21.2.0`) — `cdk/dialog`,
  `cdk/drag-drop`, `cdk/layout` need no dependency change.
- CDK `Dialog.open` supports both `ComponentType` and `TemplateRef` overloads, and `DialogConfig.container`
  allows swapping the container component — both verified in `@angular/cdk` 21.2.13 typings.
- `createRovingFocus` (FocusKeyManager wrapper) and `GuiReducedMotion`/`MediaMatcher` patterns exist and are
  reused as-is.
- After every `libs/ui/project.json` `include` edit, run `pnpm exec nx reset` (daemon caches stale options).
