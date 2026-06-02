---
created: 2026-06-02
updated: 2026-06-02
---

# Implementation Plan: Selection components

## Overview

This plan builds the M3 Selection family (checkbox, radio, switch, chips, slider, menu) plus a shared
`@ngguide/ui/forms` CVA primitive, and migrates the `actions` FAB menu / split button onto a shared menu
surface. It is split into 7 groups in dependency order. Each group is independently mergeable — build,
lint, tests, and existing demo behaviour stay green with only that group (and earlier ones) applied.

The plan is purely additive — there are no cutovers. The `actions` migration (Group G) preserves the
public `gui-fab-menu-item` selector (it becomes an alias), so it changes internals only and is reverted by
reverting its commits.

The load-bearing decisions (from `design.md`): one `GuiFormControl<T>` host-directive implements
`ControlValueAccessor` for every control (Group A is therefore the foundation B–E build on); toggles are
**wrapper elements** over a hidden native `<input>` (avoids colliding with Angular's built-in native
accessors); chips use the strict-M3 **grid/`gridcell`** role; the slider is custom on raw pointer events;
the menu is a **directive layer over `@angular/cdk/menu`** consumed via the consumer-`<ng-template>`
pattern (so `CdkMenuItem` DI resolves `CdkMenu`).

## Tasks

### Group A — Forms foundation (`@ngguide/ui/forms`) (new feature surface)

Delivers the shared `GuiFormControl<T>` host-directive that every selection control composes. Additive;
nothing consumes it yet. Blast radius: safe; blocks Groups B–E.

- [x] 1. Add `@angular/forms` peer dependency and scaffold the `forms` entry point
  - Add `"@angular/forms": "^21.0.0"` to `libs/ui/package.json` `peerDependencies` (currently core/cdk/rxjs only)
  - Create `libs/ui/forms/ng-package.json` = `{ "lib": { "entryFile": "src/index.ts" } }`
  - Create `libs/ui/forms/src/index.ts` barrel
  - Add `"@ngguide/ui/forms": ["libs/ui/forms/src/index.ts"]` to `tsconfig.base.json` `paths`
  - _Requirements: 9.3, 12.1_

- [x] 2. Implement `GuiFormControl<T>` host-directive
  - Create `libs/ui/forms/src/form-control.directive.ts` per design: `value = model<T|null>()`,
    `disabled = input(booleanAttribute)`, private `formDisabled` signal, `effectiveDisabled` computed,
    `touched` signal, `ControlValueAccessor` (`writeValue` sets value WITHOUT calling onChange,
    `registerOnChange`/`registerOnTouched`, `setDisabledState` → `formDisabled.set`), and the
    `emit(v)` / `markTouched()` user-gesture methods; provide `NG_VALUE_ACCESSOR` via `forwardRef`
  - Export from `libs/ui/forms/src/index.ts`
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3. Unit-test `GuiFormControl` and register the spec
  - Create `libs/ui/forms/src/form-control.directive.spec.ts`: assert `writeValue` sets value without
    emitting onChange; `emit` updates value AND calls onChange; `setDisabledState` flips
    `effectiveDisabled` while the `disabled` input also independently flips it (the two-signal merge);
    `markTouched` fires onTouched once
  - Add `"../forms/src/form-control.directive.spec.ts"` to `libs/ui/project.json` `test.include`
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 4. Checkpoint — Group A verification
  - `pnpm exec nx reset` (project.json edited), then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui`
  - Confirm the new spec runs and passes; confirm `nx build ui` emits the `forms` entry in `dist/libs/ui`
  - Confirm `main` builds with only Group A applied (no consumers yet)

### Group B — Boolean toggles: checkbox + switch (new feature surface)

Two boolean controls sharing the wrapper-element-over-native-`<input>` pattern + `GuiFormControl`. Blast
radius: safe; depends on Group A.

- [x] 5. Implement `gui-checkbox` (`@ngguide/ui/checkbox`)
  - Scaffold entry: `libs/ui/checkbox/{ng-package.json, src/index.ts}`, `tsconfig.base.json` path
    `@ngguide/ui/checkbox`, `libs/ui/project.json` `test.include` for `checkbox.spec.ts`
  - Create `libs/ui/checkbox/src/checkbox.ts`: `gui-checkbox` element wrapping hidden
    `<input type=checkbox>`; compose `GuiFormControl` (`inputs: ['value: checked','disabled']`,
    `outputs: ['valueChange: checkedChange']`) + interaction directives; `indeterminate`/`error` inputs;
    `aria-checked` = `mixed` when indeterminate (kept mutually exclusive with checked per #26709);
    `onToggle` → `control.emit`; blur → `markTouched`
  - Create `libs/ui/checkbox/src/checkbox.css`: M3 box + checkmark/dash, hidden native input, error +
    `.gui-disabled` token treatment; state layers come from the interaction foundation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 10.1, 12.1_

- [x] 6. Implement `gui-switch` (`@ngguide/ui/switch`)
  - Scaffold entry (same five wiring points as task 5, for `switch`)
  - Create `libs/ui/switch/src/switch.ts`: `gui-switch` wrapping `<input type=checkbox role="switch">`;
    compose `GuiFormControl` (boolean `checked`) + interaction directives; optional handle icon slots
    `[guiSwitchIcon]` / `[guiSwitchSelectedIcon]`; binary only (no mixed)
  - Create `libs/ui/switch/src/switch.css`: track 32×52dp / 2dp outline; handle morph 16→24 (selected /
    with-icon) →28dp (pressed via `data-gui-state~='pressed'`); state layer 40/48dp; icon 16dp; the label
    must not change with state (APG)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 10.1, 10.3, 12.1_

- [x] 7. Unit-test checkbox + switch
  - `libs/ui/checkbox/src/checkbox.spec.ts`: toggle reflects `checked()` + `aria-checked`; indeterminate
    → `aria-checked="mixed"`; disabled blocks change; reactive-form `formControl` writeValue + disable
  - `libs/ui/switch/src/switch.spec.ts`: toggle on/off + `aria-checked`; `role="switch"`; disabled no-op
  - Add both spec paths to `libs/ui/project.json` `test.include`
  - _Requirements: 1.1, 1.3, 1.5, 3.1, 3.3, 3.4, 11.1, 11.3_

- [x] 8. Demo checkbox + switch in `apps/web`
  - Add demo sections to `apps/web/src/app/app.component.html` (+ state in `app.component.ts`):
    checkbox (checked / indeterminate / error / disabled), switch (on/off / with icon / disabled), and a
    reactive-form example binding one of each
  - _Requirements: 1.x, 3.x, 9.3_

- [x] 9. Checkpoint — Group B verification
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui,web`
  - New checkbox/switch specs pass; `nx serve web` boots and the new sections render; build emits both entries

### Group C — Radio (`@ngguide/ui/radio`) (new feature surface)

Group/child radio coordination over native `<input type=radio>` (free APG keyboard) with the group
carrying `GuiFormControl`. Blast radius: safe; depends on Group A.

- [x] 10. Implement `gui-radio-group` + `gui-radio`
  - Scaffold entry `@ngguide/ui/radio` (ng-package, index barrel exporting both, tsconfig path,
    project.json include)
  - Create `libs/ui/radio/src/radio-group.ts`: `role="radiogroup"`, composes `GuiFormControl<string|null>`,
    generates a shared `name`, exposes `select(v)` / `isSelected(v)` (mirrors `SegmentedButtonGroupComponent`)
  - Create `libs/ui/radio/src/radio.ts`: `gui-radio` wrapping `<input type=radio [name]=group.name>`;
    `inject(RadioGroupComponent)`; `value` required input; `error`/`disabled`; change → `group.select`;
    interaction directives
  - Create `libs/ui/radio/src/radio.css`: M3 ring + inner dot, selected/error/disabled token treatment
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.1, 11.2, 12.1_

- [x] 11. Unit-test radio + demo
  - `libs/ui/radio/src/radio.spec.ts`: selecting one option deselects others; group `value()` updates;
    `radiogroup`/`radio` roles; disabled option no-op; reactive-form binding. Add to `test.include`
  - Demo a radio group (+ disabled option + reactive form) in `apps/web`
  - _Requirements: 2.1, 2.2, 2.3, 11.2, 9.3_

- [x] 12. Checkpoint — Group C verification
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui,web`
  - Radio specs pass; demo group enforces single-selection; build emits the `radio` entry

### Group D — Chips (`@ngguide/ui/chip`) (new feature surface)

Strict-M3 grid: `gui-chip-set` (`role=grid`/`row`) of `gui-chip` (`role=gridcell`), 1-D roving +
Delete/Backspace removal, four types + elevated + filter selection. Blast radius: safe; depends on Group A.

- [ ] 13. Implement `gui-chip-set`
  - Scaffold entry `@ngguide/ui/chip` (ng-package, index exporting set + chip, tsconfig path, project.json include)
  - Create `libs/ui/chip/src/chip-set.ts`: `role="grid"` host + inner `role="row"`; `select` input
    (`'none'|'single'|'multiple'`); composes `GuiFormControl<string|string[]|null>` for selectable sets;
    `contentChildren(forwardRef(ChipComponent))`; wire `createRovingFocus(chips, { orientation: 'horizontal' })`
    to host keydown; `isSelected`/`toggle`; on children change move focus to an adjacent chip
  - _Requirements: 6.1, 6.2, 6.3, 4.3, 11.5, 10.1, 12.1_

- [ ] 14. Implement `gui-chip` (four types, removable, slots, elevated)
  - Create `libs/ui/chip/src/chip.ts`: `role="gridcell"`, `tabindex=-1`, `type` (assist/filter/input/
    suggestion), `value`/`label`, `removable`/`elevated`/`disabled` inputs, `remove` output; primary
    `button` (role button or checkbox+aria-checked for filter), leading slot `[guiChipLeading]`, optional
    trailing remove `button` (`aria-label="Remove …"`); `keydown.delete`/`keydown.backspace` → emit remove;
    implements `FocusableOption`; interaction directives
  - Create `libs/ui/chip/src/chip.css`: per-type M3 appearance + leading checkmark for selected filter +
    elevated (elevation) + disabled token treatment
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 10.1_

- [ ] 15. Unit-test chips + demo
  - `libs/ui/chip/src/chip.spec.ts`: `grid`/`row`/`gridcell` roles; filter chip toggles selected +
    `aria-checked`; Delete on a removable chip emits `remove`; elevated sets `data-elevated`. Add to include
  - Demo a chip set per type (assist, filter multi-select, input removable, suggestion) in `apps/web`
  - _Requirements: 4.1, 4.3, 5.3, 6.2, 11.5_

- [ ] 16. Checkpoint — Group D verification
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui,web`
  - Chip specs pass; demo set navigates with arrows and removes with Delete; build emits the `chip` entry

### Group E — Slider (`@ngguide/ui/slider`) (new feature surface)

Custom track + thumb(s) on raw pointer events; continuous/discrete, single/range, value indicator, 5-size
scale. Blast radius: safe; depends on Group A.

- [ ] 17. Slider tokens + single-thumb slider
  - Scaffold entry `@ngguide/ui/slider` (ng-package, index, tsconfig path, project.json include)
  - Create `libs/ui/slider/src/slider-tokens.ts`: `GUI_SLIDER_SIZES: Record<GuiSize, GuiSliderSizeSet>`
    (track 16/24/40/56/96dp; handle 44/44/52/68/108dp; track shape 8/8/12/16/28dp; inset icon —/—/24/24/32dp)
  - Create `libs/ui/slider/src/slider.ts` + `slider.html` + `slider.css`: `gui-slider` composing
    `GuiFormControl<number|[number,number]>`; `min`/`max`/`step`/`size`/`discrete`/`range` inputs;
    single thumb `role="slider"` + `aria-valuenow/min/max/text`; raw pointer (`setPointerCapture`)
    px→value with clamp+snap; keyboard Arrow(±step)/Home/End/Space+Arrow(±interval); value indicator on
    press; discrete stop indicators
  - _Requirements: 7.1, 7.3, 7.4, 7.6, 7.7, 10.1, 10.3, 11.4, 12.1_

- [ ] 18. Range (two-thumb) support
  - Extend `slider.ts`: when `range`, render two thumbs each its own `role="slider"`, value `[number,number]`,
    each thumb's effective min/max clamped to the other so start ≤ end (no-cross); pointerdown picks nearest thumb
  - _Requirements: 7.2, 7.5, 11.4_

- [ ] 19. Unit-test slider + demo
  - `libs/ui/slider/src/slider.spec.ts`: arrow keys move value by step + clamp to min/max; Home/End →
    min/max; discrete snaps to step; range thumbs never cross; disabled no-op. Add to `test.include`
  - Demo continuous, discrete, and range sliders (+ reactive form) in `apps/web`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 11.4_

- [ ] 20. Checkpoint — Group E verification
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui,web`
  - Slider specs pass; demo sliders drag + keyboard-adjust and the range never crosses; build emits the `slider` entry

### Group F — Menu surface (`@ngguide/ui/menu`) (new feature surface)

Shared M3 menu as a directive layer over `@angular/cdk/menu`, consumed via the consumer-`<ng-template>`
pattern. Additive new entry; nothing migrated yet. Blast radius: safe; independent of A; required by Group G.

- [ ] 21. Implement `[gui-menu]` + `gui-menu-item` + `gui-menu-divider`
  - Scaffold entry `@ngguide/ui/menu` (ng-package, index exporting all three, tsconfig path, project.json include)
  - `libs/ui/menu/src/menu.ts`: `[gui-menu]` directive (M3 surface styling on the consumer's `<div cdkMenu>`)
  - `libs/ui/menu/src/menu-item.ts`: `button[gui-menu-item], a[gui-menu-item]` composing `CdkMenuItem` +
    interaction directives via `hostDirectives`; leading/label/trailing `<ng-content>` slots
    (`[guiMenuItemLeading]`/`[guiMenuItemTrailing]`); honors `cdkMenuItemDisabled` (CDK skips in nav)
  - `libs/ui/menu/src/menu-divider.ts`: `gui-menu-divider`, `role="separator"`
  - `libs/ui/menu/src/menu.css`: M3 menu container + item (leading/trailing) + divider styling
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 10.1, 12.1_

- [ ] 22. Unit-test menu + demo (incl. cascading + disabled)
  - `libs/ui/menu/src/menu.spec.ts`: `gui-menu-item` composes `CdkMenuItem` and renders leading/trailing
    slots; divider is `role="separator"`; disabled item carries the CDK disabled flag. Use the
    fab-menu/split-button try/catch fallback for any overlay-open assertion (jsdom/zoneless). Add to include
  - Demo in `apps/web`: a `gui-button` trigger + consumer `<ng-template [gui-menu] cdkMenu>` with items,
    a divider, a disabled item, and a cascading submenu (`gui-menu-item [cdkMenuTriggerFor]`)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 11.6_

- [ ] 23. Checkpoint — Group F verification
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build --projects=ui,web`
  - Menu specs pass; in `nx serve web` the menu opens anchored to the trigger, submenu opens, Escape returns
    focus, disabled item is skipped (manual smoke for the #28984/#30145/#26856 zoneless anchoring concern)
  - Build emits the `menu` entry

### Group G — Migrate `actions` menus onto the shared surface (consolidation)

Routes the `actions` FAB menu / split button through `@ngguide/ui/menu`. Public selectors/inputs stay
stable (`gui-fab-menu-item` becomes an alias), so this is an internal swap. Blast radius: safe; depends on
Group F. Revert = revert this group's commits.

- [ ] 24. Re-base `fab-menu-item` on `gui-menu-item`
  - Update `libs/ui/fab-menu/src/fab-menu-item.ts` to re-export/alias `MenuItemComponent` from
    `@ngguide/ui/menu` under the `button[gui-fab-menu-item]` selector + `guiFabMenuItem` exportAs (keep the
    public API identical); add `@ngguide/ui/menu` to fab-menu's deps if needed
  - Confirm `libs/ui/fab-menu/src/index.ts` still exports the same symbol names
  - _Requirements: 8.7_

- [ ] 25. Point split-button + demos at `gui-menu-item`
  - Update the `split-button` demo and `apps/web` menus that used bare `cdkMenuItem` to use `gui-menu-item`
    for consistent M3 styling (non-breaking — `cdkMenuItem` still works)
  - Verify the Superseded Behavior (research.md / requirements.md): the `actions` menus now resolve to the
    single shared menu implementation
  - _Requirements: 8.7_

- [ ] 26. Final checkpoint — everything green
  - `pnpm exec nx reset`, then `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build` (ui + web, full suite)
  - Existing `fab-menu`/`split-button` specs still pass with the aliased item; their demos render and open
    identically to before the migration
  - Every requirement R1–R12 traces to a shipped task; all new entry points build in `dist/libs/ui`

## Notes

### Scope boundaries

- **Signal Forms (`@angular/forms/signals`) is out of scope.** R9.3 requires classic template-driven +
  reactive forms; the shared `GuiFormControl` CVA serves both. Signal Forms is experimental and a separate
  system (research.md §1, Variant C) — it can be added later behind the same `value` signal if desired.
- **Per-control resting dp beyond what design.md fixed** (checkbox/radio container + ripple dp, exact chip
  heights/padding per type, slider tick spacing) is pulled from the live M3 specs during implementation
  (as in `actions`), not pre-listed here.
- **Menu overlay base CSS / zoneless anchoring** (#28984 fixed upstream; #30145/#26856) is verified by the
  Group F manual smoke check, not by new automated tests (jsdom can't position the overlay).

### Codebase verification findings

- `@angular/forms` is NOT yet a `libs/ui` peerDependency (only `@angular/core`/`@angular/cdk`/`rxjs`) — added in task 1.
- `@angular/cdk@21.2.13` resolves `menu`/`a11y`/`overlay` etc. via its `exports` map + `fesm2022` bundles
  (no per-entry folders); `menu` is already consumed by `fab-menu`/`split-button`.
- Entry-point scaffolding is fixed: `libs/ui/<name>/{ng-package.json, src/index.ts, src/*.ts}` + a
  `tsconfig.base.json` `paths` entry + the spec in `libs/ui/project.json` `test.include`; run
  `pnpm exec nx reset` after editing `project.json`.
- Group/child DI (`SegmentedButtonGroupComponent`) and the CDK-menu consumer-`<ng-template>` pattern
  (`fab-menu`) exist and are the templates reused by radio/chip-set and menu respectively.
