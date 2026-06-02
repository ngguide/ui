---
created: 2026-06-02
updated: 2026-06-02
---

# Research: Selection components

## Problem Statement

The `selection` spec adds the M3 selection-control family (checkbox, radio, switch, chips, sliders,
menus) to `@ngguide/ui`. Each control must be strict-M3, zoneless, standalone/OnPush/signals, reuse
the existing interaction foundation, and integrate with Angular forms. This catalogue widens the
option space for the five technical decisions that materially shape effort, risk, and architecture:
(1) how forms integration coexists with signals, (2) how the toggle controls are built, (3) how chips
and the chip set are structured, (4) which slider engine to use, and (5) how the shared menu surface
is built and how the existing `actions` menus migrate onto it.

A correction to the codebase exploration is baked in below: a first-pass scan reported
`@angular/cdk/menu`, `/drag-drop`, `/listbox`, `/overlay`, `/bidi`, `/portal` as "not installed"
because modern CDK ships flat `fesm2022` bundles + an `exports` map rather than per-entry folders.
All of those entry points **are** present and resolvable in `@angular/cdk@21.2.13` (menu is already
consumed by `actions`). See Codebase Insights.

## Problem Areas

### 1. Forms integration strategy (forms ⟷ signals)

_Related requirements: 9.1, 9.2, 9.3, 9.4_

The whole family must bind two-way and participate in template-driven + reactive forms, while also
keeping a `model()` two-way signal for non-forms consumers (the existing kit convention). The
central friction is `setDisabledState(isDisabled)` needing to *write* a disabled state, while
`disabled = input()` signals are read-only.

#### Variant A: Per-component ControlValueAccessor over a shared `value = model()`

**How it works:** Each control implements the stable `ControlValueAccessor` contract
(`writeValue`/`registerOnChange`/`registerOnTouched`/`setDisabledState`) and registers
`NG_VALUE_ACCESSOR` via `forwardRef`. A single internal `value = model<T>()` signal is the source of
truth: `writeValue` sets it (no `onChange` call — avoids the double-emit bug); user events set it and
call `onChange`. Disabled conflict resolved with the two-signal merge: public `disabled = input()`
plus a private writable `formDisabled = signal(false)` set by `setDisabledState`, combined as
`effectiveDisabled = computed(() => disabled() || formDisabled())`.

**Pros:**
- Stable, non-experimental API — safe for a published library on 21.2.x.
- Works with both `ngModel` and reactive `formControl` out of the box.
- `model()` two-way binding keeps working for non-forms consumers (same signal).
- Zoneless CD comes free when the view reads the signal (`writeValue` → `signal.set` marks dirty).

**Cons:**
- Boilerplate per component (4 methods + provider + forwardRef) repeated across 5–6 controls.
- The `setDisabledState` vs `input()` conflict must be handled deliberately every time.
- Easy to reintroduce the double-emit bug if wired via a naive `effect()` on `value()`.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** No CVA exists anywhere in `libs/ui` yet (grep confirms). Aligns with the existing
`model()` usage in button/icon-button/segmented-button. Requires adding `@angular/forms` to
`libs/ui/package.json` peerDependencies (currently only core/cdk/rxjs). [cva-api][cva-pitfalls][forms-peer]

#### Variant B: Shared CVA base — abstract base directive or host directive

**How it works:** Factor the CVA boilerplate once. **B1 (abstract base directive):** an abstract
`@Directive()` implements the CVA contract + the two-signal disabled merge + the
`emit()`/no-`onChange`-in-`writeValue` discipline; concrete controls extend it (the `NG_VALUE_ACCESSOR`
provider + `forwardRef` still live on each concrete component). **B2 (host directive):** a standalone
`ValueAccessorDirective` provides `NG_VALUE_ACCESSOR` and is attached via `hostDirectives: [...]`;
the component injects it to read/write the shared value signal (Directive Composition API).

**Pros:**
- Centralizes the bug-prone bits (double-emit, disabled conflict) in one audited place — strong fit
  for a multi-control kit.
- Still stable APIs, production-safe on 21.2.x.
- B2 composes with the existing interaction `hostDirectives` and avoids inheritance.

**Cons:**
- B1: provider/`forwardRef` still per-component; inheritance fights OnPush/host-binding ergonomics;
  generic `model()` typing gets fiddly.
- B2: value-signal handoff between directive and host adds indirection.
- Same limit as A: does not serve the experimental Signal Forms `[formField]` system.

**Effort:** Medium one-time, Low per control after | **Risk:** Low–Medium (base-class generics)
**Codebase fit:** B2 mirrors how every control already composes `GuiStateLayer/Ripple/FocusRing` via
`hostDirectives`. No existing base-class pattern in the repo to extend. [cva-reuse][host-directives]

#### Variant C: Signal Forms (`@angular/forms/signals`) `FormValueControl`

**How it works:** Angular 21 ships a first-party signals-native forms system. A custom control exposes
`value = model<T>()` (or `checked = model<boolean>()` via `FormCheckboxControl`) and implements
`FormValueControl<T>` — **no CVA, no provider, no forwardRef**. Disabled is just an `input()` the form
pushes down (no `setDisabledState` conflict). Bound in templates via `[formField]`.

**Pros:**
- Minimal boilerplate; one `value` signal, no provider.
- No `setDisabledState` read-only conflict — disabled is an input signal.
- Fully zoneless/OnPush-native; the direction Angular is heading.

**Cons:**
- `@experimental` since v21.0 — API may change; stable targeted for v22. Risky as the *sole* strategy
  for a published library on 21.2.x.
- **Separate system from `ngModel`/`formControl`** — implementing `FormValueControl` does NOT make a
  control work with classic template-driven/reactive forms, which R9.3 requires.

**Effort:** Low | **Risk:** High (experimental; doesn't satisfy classic-forms requirement alone)
**Codebase fit:** Greenfield (no forms code yet). Could be added *alongside* A/B behind the same
`value` signal for forward-compatibility, but cannot replace them given R9.3. [signal-forms][signal-forms-custom][signal-forms-api]

### 2. Toggle controls — checkbox / radio / switch DOM strategy

_Related requirements: 1.x, 2.x, 3.x, 11.1, 11.2, 11.3_

The decision: build each toggle on a real (hidden / `appearance:none`) native `<input>`, or on fully
custom DOM with explicit ARIA roles.

**M3 switch dimensions resolved** ([m3-switch-specs], fetched 2026-06-02): track 32dp H × 52dp W,
outline 2dp; handle is square and **grows by state** — 16dp unselected → 24dp selected (and 24dp when
it carries an icon) → **28dp pressed**; state layer 40/48dp; handle icon 16dp (selectable on selected,
or on both states). This handle-size morph is pure CSS over whichever DOM strategy is chosen below.

#### Variant A: Native hidden `<input>` + CSS-drawn M3 visuals

**How it works:** `<input type=checkbox>` (checkbox), `<input type=radio name>` (radio group),
`<input type=checkbox role="switch">` (switch), each visually hidden or `appearance:none`, with the
M3 box/ring/track+handle drawn in CSS off `:checked`/`:indeterminate`. Indeterminate set via the JS
`el.indeterminate = true` property (reports `aria-checked="mixed"`). The interaction foundation
directives layer the state layer/ripple/focus ring on the host.

**Pros:**
- Free a11y: correct roles, Space toggling, focus, and **native form participation** — directly
  satisfies R9 with little extra wiring.
- Browser implements the **entire APG radio-group keyboard model** (roving + arrow-select + single
  tab stop) for free with a shared `name`.
- Native `indeterminate` property maps 1:1 to APG `mixed`.
- Smallest code; SSR-safe.

**Cons:**
- Native-input styling has limits; the standard workaround (hide input, draw custom box) adds a layer.
- Switch overrides the implicit `checkbox` role to `switch` — must verify AT announces it correctly.
- Checkbox gotcha: `checked` + `indeterminate` both true can report "checked" not "mixed"; keep them
  mutually exclusive (angular/components #26709).

**Effort:** Low–Medium | **Risk:** Low
**Codebase fit:** New pattern (existing components are attribute-selector hosts on `button`/`a`). A
hidden-input control implies a `gui-checkbox` element-selector component wrapping an `<input>`, or an
attribute selector on `input[type=checkbox]`. [mdn-checkbox][websw-switch][apg-checkbox][apg-radio][apg-switch]

#### Variant B: Custom DOM + explicit ARIA roles + manual keyboard

**How it works:** A custom host (e.g. `gui-checkbox`/`gui-switch`) with `role=checkbox|switch`,
`aria-checked`, `tabindex=0`, manual Space handling; radio group implemented as a `role=radiogroup`
container coordinating `role=radio` children with a manual roving tabindex (reuse `createRovingFocus`)
and arrow-select. Value lives in a `model()` + CVA.

**Pros:**
- Full control over DOM/animation without an underlying input element to wrestle.
- Radio group reuses the existing `createRovingFocus` helper and the segmented-button parent/child
  DI pattern.

**Cons:**
- Re-implements everything native gives free: roving, arrow-select, single tab stop, **and form
  participation** (must hand-build CVA + hidden state).
- More a11y surface to get wrong; higher test burden.
- No native `indeterminate`; must manage `aria-checked="mixed"` manually.

**Effort:** High | **Risk:** Medium (re-implementing APG keyboard correctly)
**Codebase fit:** Radio-group coordination mirrors `SegmentedButtonGroupComponent`
(`contentChildren` + parent-owned `model()` + child DI). [apg-radio][apg-checkbox][apg-switch][seg-group]

#### Variant C: Hybrid — native input for checkbox/switch, custom-coordinated radio

**How it works:** Use Variant A's native input for checkbox and switch (where a single input is
clean), but accept either approach for radio depending on whether the group is authored as native
`name`-grouped inputs (free keyboard) or a custom `radiogroup` coordinating children (consistent with
the kit's group/child DI pattern but manual keyboard).

**Pros:**
- Picks the lowest-risk path per control instead of one-size-fits-all.

**Cons:**
- Two patterns to learn/maintain; less uniform than A or B.

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Mixed. [apg-radio][seg-group]

### 3. Chips and chip set

_Related requirements: 4.x, 5.x, 6.x, 11.5_

Two coupled questions: the chip-set ARIA/keyboard pattern, and how removal + slots are modeled.

**Resolved against the live M3 chips accessibility page** ([m3-chips-a11y], fetched 2026-06-02):
- **Role (Web)** for a basic chip (one action) and a selectable chip is **`gridcell`** — i.e. M3's
  published web a11y model puts chips in a **grid** (`role="grid"` → `role="row"` → `role="gridcell"`),
  not a toolbar. (The material-web library's `role="toolbar"` is an *implementation* choice that
  diverges from the M3 a11y spec.) A two-action chip (select + remove) exposes `button`/`checkbox`
  controls *inside* the gridcell.
- **Keyboard (M3 spec):** Tab → moves focus to the enabled chip or chip group; Space/Enter → activates,
  selects, or deselects; **Backspace/Delete → removes the currently focused input chip** (now sourced);
  Arrows → move focus between chips.
- A chip that performs an action "should present the same semantics as a button". Min target 48×48 CSS px.

#### Variant A: Grid pattern (`gridcell`) — M3's published web a11y role

**How it works:** `gui-chip-set` carries `role="grid"` (single `role="row"`), each chip a
`role="gridcell"`; 2D roving keeps a single tab stop into the set with Arrow navigation between chips,
and (for two-action chips) between the chip's primary control and its trailing remove `button` within
the cell. Filter chips are selectable (checkmark + selected state); Backspace/Delete on a focused input
chip emits the removal request (R5.3); after removal focus moves to an adjacent chip (R6.3).

**Pros:**
- Matches the M3 accessibility spec's `gridcell` role exactly (strict-M3).
- Grid cells naturally model a chip *plus* its remove button (two focusable controls per cell) — the
  exact "two actions" case M3 describes.

**Cons:**
- Grid 2D navigation is more to implement than a 1D roving toolbar; `createRovingFocus` covers 1D only,
  so the cell-internal axis needs extra handling.
- APG has no dedicated chip pattern; grid semantics for a chip row are less common in the wild.

**Effort:** Medium–High | **Risk:** Medium
**Codebase fit:** `createRovingFocus` covers the inter-chip axis; the group/child DI mirrors
`SegmentedButtonGroupComponent`; the intra-cell axis is new. [m3-chips-a11y][apg-grid][roving][seg-group]

#### Variant B: Toolbar pattern (material-web's implementation choice) + roving tabindex

**How it works:** `gui-chip-set` as `role="toolbar"`; chips are buttons with a single tab stop and
Left/Right arrow nav via `createRovingFocus` (`orientation: 'horizontal'`); the trailing remove button
sits last in the cell. Same M3 keyboard map (Space/Enter, Backspace/Delete, Arrows).

**Pros:**
- 1D roving maps directly onto the existing `createRovingFocus` helper — lowest implementation cost.
- This is what Google's own material-web ships, so it's battle-tested even if it diverges from the
  M3 a11y spec's `gridcell`.

**Cons:**
- Diverges from the M3 accessibility spec (`gridcell`/grid) — a strict-M3 concern.
- APG warns that a control needing the same arrow keys as the toolbar should be placed last (the remove
  button).

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** `createRovingFocus` + group/child DI apply directly. [mw-chip][apg-toolbar][roving][seg-group]

#### Variant C: Listbox pattern (filter-selection-centric)

**How it works:** `gui-chip-set` as `role="listbox"` with `role="option"` filter chips (optionally via
`@angular/cdk/listbox`, installed). Selection via `aria-selected`.

**Pros:**
- Natural for **filter** chips as a multi-select listbox; CDK listbox provides keyboard + value mgmt.

**Cons:**
- Wrong semantics for assist/suggestion chips (actions, not options) — would split the family across two
  patterns; awkward for per-item remove buttons.
- Diverges from both the M3 `gridcell` spec and material-web's toolbar.

**Effort:** Medium | **Risk:** Medium (semantic mismatch for non-filter chips)
**Codebase fit:** `@angular/cdk/listbox` available but unused. [cdk-listbox][apg-listbox]

### 4. Slider engine

_Related requirements: 7.x, 11.4_

No native control covers M3's value indicator + tick marks + **two-thumb range**. Native `type=range`
is single-thumb only. CDK has **no** slider; `@angular/cdk/drag-drop` is available.

**M3 slider specs resolved** ([m3-slider-specs][m3-slider-a11y], fetched 2026-06-02): anatomy = value
indicator (optional) + stop indicators (optional) + active track + handle + inactive track + inset icon
(optional). The handle is a thin **4dp-wide** vertical bar whose width **shrinks** on press/drag while
the value indicator (the "label container", 44dp H × 48dp W) appears. There is a **5-step size scale**
that maps onto `GuiSize` — track height 16/24/40/56/96dp (xs–xl), handle height 44/44/52/68/108dp,
track shape 8/8/12/16/28dp, inset icon —/—/24/24/32dp. Keyboard (M3 spec): Tab → focus handle; Arrows →
±1 value/stop; Space+Arrows → ±1 interval/stop; Home/End → first/last value; role = `slider`. A stop
indicator at the inactive-track end is recommended for ≥3:1 contrast.

#### Variant A: Custom DOM + raw pointer events + manual keyboard/ARIA

**How it works:** Custom track + thumb(s); `pointerdown`/`pointermove`/`pointerup` with
`setPointerCapture`; value computed from `clientX` + track rect + min/max/step; `role="slider"` per
thumb with `aria-valuenow/min/max/text`; manual Arrow/Home/End/PageUp-Down. Range = two thumbs, each
its own focusable `slider`, with each thumb's effective min/max dynamically clamped to the other
(no-cross) — single source of truth in a signal.

**Pros:**
- Zero extra runtime coupling; full control over M3 visuals (active track, ticks, value indicator).
- Cleanest place to enforce the range no-cross constraint exactly (own all the math).
- Matches APG multi-thumb model (each thumb a separate slider in tab order).

**Cons:**
- Re-implements pointer capture, touch, boundary, RTL, resize handling.
- Highest correctness/test burden of the three.

**Effort:** Medium–High | **Risk:** Medium
**Codebase fit:** Greenfield; no slider precedent. State-layer/focus-ring directives apply to the
thumb. [apg-slider][apg-slider-multi][mdn-slider][mca-slider]

#### Variant B: Custom DOM + `@angular/cdk/drag-drop` (`CdkDrag`) for the thumb

**How it works:** Thumb gets `cdkDrag` with `cdkDragLockAxis="x"` + `cdkDragBoundary` (track);
`cdkDragMoved` maps pixel→value; `cdkDragConstrainPosition` snaps to discrete steps and clamps bounds.
Keyboard + ARIA still hand-written. Range = two `cdkDrag` thumbs sharing the boundary; no-cross
enforced in `cdkDragConstrainPosition`.

**Pros:**
- CDK provides pointer/touch unification, axis lock, boundary, RTL (`withDirection`).
- Less pointer plumbing than Variant A.

**Cons:**
- `CdkDrag` is built for drag-and-drop reordering — off-label as a slider engine (you ignore drop
  lists).
- Still must add all keyboard + ARIA + discrete snapping manually.
- Extra dependency surface vs raw pointer events.

**Effort:** Medium | **Risk:** Medium (relies on `cdkDragConstrainPosition` for snap/clamp)
**Codebase fit:** `@angular/cdk/drag-drop` available, unused so far. [cdk-drag][apg-slider-multi]

#### Variant C: Native `<input type=range>` (single-thumb) + custom for range

**How it works:** Single-thumb continuous/discrete sliders use a styled native `type=range` (free
keyboard + ARIA + forms); range (two-thumb) falls back to Variant A/B custom DOM.

**Pros:**
- Free a11y/keyboard/forms for the common single-thumb case; smallest code there.

**Cons:**
- Two implementations in one component family (native single + custom range) — inconsistent visuals
  and value-indicator/tick rendering between them.
- Native range can't render the M3 value indicator bubble or tick labels well; cross-browser thumb
  styling is fiddly.

**Effort:** Low (single) + Medium–High (range) | **Risk:** Low (single) / High (range hack)
**Codebase fit:** Greenfield. [mdn-slider][apg-slider]

### 5. Menu shared surface (and `actions` migration)

_Related requirements: 8.x, 11.6_

The menu must own a reusable M3 surface that `actions`' FAB menu + split button migrate onto. `actions`
already consumes `@angular/cdk/menu` directly (consumer-provided `<ng-template>` queried by
`contentChild.required(TemplateRef)`).

#### Variant A: Build `gui-menu`/`gui-menu-item` over `@angular/cdk/menu`

**How it works:** Wrap CDK menu primitives: `gui-menu-item` composes `CdkMenuItem` via
`hostDirectives` (+ interaction directives), styled to M3; the menu surface uses `CdkMenu`. Cascading
submenus use the confirmed CDK pattern — a `cdkMenuItem` that is *also* `[cdkMenuTriggerFor]` a nested
`<ng-template cdkMenu>`; `CdkTargetMenuAim` improves hover UX. Dividers = plain
`<hr role="separator">` (CDK has no separator directive). Disabled items via `cdkMenuItemDisabled`
(key nav skips them via the internal `FocusKeyManager`). Groups via `CdkMenuGroup`. `actions` migrates
by swapping its raw CDK usage for `gui-menu`/`gui-menu-item`.

**Pros:**
- Reuses the exact stack `actions` already ships — proven in this repo; smallest conceptual delta.
- CDK provides roving, typeahead, disabled-skip, submenu open/close, focus return, overlay
  positioning, `aria-haspopup`/`aria-expanded` wiring.
- The zoneless positioning bug (#28984) is fixed upstream (closed 2024-05-06, before 21.2.13).

**Cons:**
- Inherits CDK's content-projection DI constraint: `cdkMenuItem` must be a structural descendant of
  the `cdkMenu` template (the consumer-`ng-template` pattern), not arbitrarily `<ng-content>`-projected
  — shapes the public API.
- Dynamic reposition caveat (#30145) and overlay base CSS needs (#26856) require a demo-app smoke test.

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Mirrors `fab-menu`/`split-button` exactly (CdkMenuTrigger + consumer template +
CdkMenuItem via hostDirectives). [cdk-menu][cdk-menu-sub][issue-28984][fab-menu]

#### Variant B: Build a bespoke menu on `@angular/cdk/overlay` + `createRovingFocus`

**How it works:** Own overlay management via `@angular/cdk/overlay` (FlexibleConnectedPositionStrategy)
+ a hand-built `role=menu`/`menuitem` tree navigated by `createRovingFocus` (FocusKeyManager with a
`skipPredicate` for disabled). Submenus, focus return, and `aria-expanded` are hand-wired.

**Pros:**
- Full control over DOM/roles without CDK menu's DI-projection constraint; can support flexible
  content-projection of items.
- Reuses the existing `createRovingFocus` helper.

**Cons:**
- Re-implements submenu open/close, focus return, typeahead, disabled-skip, menu-stack management —
  all of which CDK menu already provides.
- More a11y surface to get right; higher risk of APG drift.
- `actions` migration is larger (new abstraction, not the stack it already uses).

**Effort:** High | **Risk:** Medium–High
**Codebase fit:** `@angular/cdk/overlay` + `createRovingFocus` available; diverges from current
`actions` menu wiring. [cdk-a11y][cdk-overlay][apg-menu][roving]

#### Variant C: Thin shared wrapper — `actions` keeps direct CDK, menu adds only M3 item styling

**How it works:** Don't introduce a coordinating `gui-menu` container; ship only a styled
`gui-menu-item` (CdkMenuItem + interaction directives + M3 CSS, like the existing `fab-menu-item`) and
documentation for assembling a menu from raw `<div cdkMenu>` + the styled items. `actions` reuses the
shared item; no container migration.

**Pros:**
- Smallest change; `actions` components barely move.
- Avoids the DI-projection API design problem.

**Cons:**
- Not really a "menu control" — fails R8.1's surface/open/close expectations as a first-class
  component; pushes menu assembly onto consumers.
- Weakest realization of "single M3 menu implementation" (R8.7).

**Effort:** Low | **Risk:** Low (but under-delivers on R8)
**Codebase fit:** Extends the existing `fab-menu-item` pattern directly. [fab-menu]

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|---|---|---|---|---|
| 1. Forms strategy | A: Per-component CVA + `model()` | M | L | New (no CVA yet); aligns with `model()` use |
| 1. Forms strategy | B: Shared CVA base (B1 abstract / B2 host-directive) | M→L | L–M | B2 mirrors `hostDirectives` composition |
| 1. Forms strategy | C: Signal Forms `FormValueControl` | L | H | Greenfield; experimental, misses classic forms |
| 2. Toggles | A: Native hidden `<input>` + CSS | L–M | L | New element-selector pattern |
| 2. Toggles | B: Custom DOM + ARIA + manual keyboard | H | M | Radio mirrors seg-button group DI |
| 2. Toggles | C: Hybrid (native cb/switch, either radio) | M | L–M | Mixed |
| 3. Chips | A: Grid (`gridcell` — M3 a11y spec) | M–H | M | roving (inter-chip) + group DI; intra-cell new |
| 3. Chips | B: Toolbar (material-web impl) + roving | M | L–M | `createRovingFocus` + group DI |
| 3. Chips | C: Listbox (CDK listbox) | M | M | CDK listbox available, unused |
| 4. Slider | A: Custom + raw pointer events | M–H | M | Greenfield |
| 4. Slider | B: Custom + `CdkDrag` | M | M | cdk/drag-drop available |
| 4. Slider | C: Native range (single) + custom (range) | L/M–H | L/H | Greenfield; inconsistent |
| 5. Menu | A: Wrap `@angular/cdk/menu` | M | L–M | Mirrors `fab-menu`/`split-button` |
| 5. Menu | B: Bespoke on cdk/overlay + roving | H | M–H | Diverges from current wiring |
| 5. Menu | C: Thin item-only wrapper | L | L | Extends `fab-menu-item` (under-delivers R8) |

## Cross-area dependencies

- **Area 1 ⟷ Area 2.** If Area 2 picks native hidden `<input>` (2A), form participation comes for
  free, so the Area-1 CVA in checkbox/radio/switch becomes thin (mostly value↔signal bridging). If
  Area 2 picks custom DOM (2B), the Area-1 CVA must also synthesize a hidden form value, increasing
  the forms-integration cost. The shared CVA base (1B) pays off more the more controls there are.
- **Area 4 ⟷ Area 1.** A slider has no native form value unless built on `type=range` (4C); for
  custom-DOM sliders (4A/4B) the Area-1 CVA carries the full value contract.
- **Area 5 ⟷ `actions` spec.** Variant 5A reuses the stack `actions` already ships, making the
  Superseded-Behaviors migration (FAB menu / split button → shared surface) a swap rather than a
  rewrite. 5B/5C change the migration cost.
- **Area 3 ⟷ Area 1.** Filter chips' selection value participates in forms; a listbox chip set (3B)
  could lean on `@angular/cdk/listbox`'s own value management, overlapping the Area-1 decision.

## Codebase Insights

- **CDK entry points present (correction).** `@angular/cdk@21.2.13` resolves `menu`, `drag-drop`,
  `listbox`, `overlay`, `a11y`, `bidi`, `portal` via its `exports` map + `fesm2022` bundles + `types/*.d.ts`,
  despite no per-entry folders under `node_modules/@angular/cdk/`. Verified by `require.resolve` and the
  package `exports`. `@angular/material` and `@angular/aria` are **not** installed.
- **Interaction foundation is ready to compose.** `GuiStateLayerDirective` ([guiStateLayer]),
  `GuiRippleDirective`, `GuiFocusRingDirective`, and `createRovingFocus(items, opts)` (wraps
  `FocusKeyManager` with wrap/typeahead/home-end + orientation) are exported from
  `@ngguide/ui/interaction`. `createRovingFocus` does **not** set a `skipPredicate` — a hand-rolled menu
  (5B) would add disabled-skipping at the call site; horizontal orientation is hardcoded `'ltr'` (RTL gap).
- **Group/child coordination precedent.** `SegmentedButtonGroupComponent` owns a `model()` and
  children query it by DI (`inject(SegmentedButtonGroupComponent)`, parent uses
  `contentChildren(forwardRef(...))`) — the template for radio-group and chip-set coordination.
- **Menu precedent.** `fab-menu`/`split-button` use `CdkMenuTrigger` with a consumer-provided
  `<ng-template>` queried by `contentChild.required(TemplateRef)`, and `fab-menu-item` composes
  `CdkMenuItem` via `hostDirectives`. Their specs avoid calling `CdkMenuTrigger.open()` under
  jsdom/zoneless (overlay needs real layout) and validate open-state in the browser plan instead.
- **No forms code yet.** No `ControlValueAccessor`/`NG_VALUE_ACCESSOR` anywhere in `libs/ui`;
  `@angular/forms` is installed at the root but is **not** a `libs/ui` peerDependency
  (`libs/ui/package.json` lists only `@angular/core`, `@angular/cdk`, `rxjs`).
- **Scaffolding per entry point** is fixed: `libs/ui/<name>/{ng-package.json, src/index.ts, src/*.ts}`
  + a `tsconfig.base.json` `paths` entry + the spec listed in `libs/ui/project.json` `test.include`
  (run `pnpm exec nx reset` after editing). Build = `@nx/angular:package`; test = `@nx/angular:unit-test`.

## Sources

- [cva-api] https://angular.dev/api/forms/ControlValueAccessor + /api/forms/NG_VALUE_ACCESSOR — fetched 2026-06-02 (context7: /websites/angular_dev)
- [cva-pitfalls] https://valor-software.com/articles/avoiding-common-pitfalls-with-controlvalueaccessors-in-angular — fetched 2026-06-02
- [cva-reuse] https://dev.to/cyrillbrito/stop-re-implementing-controlvalueaccessor-5hmh — fetched 2026-06-02
- [host-directives] https://dev.to/valorsoftware/leveraging-angular-15-host-directives-52en — fetched 2026-06-02
- [forms-disabled-conflict] https://github.com/angular/angular/issues/53889 — fetched 2026-06-02
- [signal-forms] https://angular.dev/guide/forms/signals/overview — fetched 2026-06-02
- [signal-forms-custom] https://angular.dev/guide/forms/signals/custom-controls — fetched 2026-06-02
- [signal-forms-api] https://angular.dev/api/forms/signals/FormValueControl (@experimental since v21.0) — fetched 2026-06-02
- [forms-peer] libs/ui/package.json (read) — 2026-06-02
- [mdn-checkbox] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox — fetched 2026-06-02
- [websw-switch] https://web.dev/articles/building/a-switch-component — fetched 2026-06-02
- [apg-checkbox] https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/ — fetched 2026-06-02
- [apg-radio] https://www.w3.org/WAI/ARIA/apg/patterns/radio/ — fetched 2026-06-02
- [apg-switch] https://www.w3.org/WAI/ARIA/apg/patterns/switch/ — fetched 2026-06-02
- [apg-toolbar] https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/ — fetched 2026-06-02
- [apg-listbox] https://www.w3.org/WAI/ARIA/apg/patterns/listbox/ — fetched 2026-06-02
- [apg-slider] https://www.w3.org/WAI/ARIA/apg/patterns/slider/ — fetched 2026-06-02
- [apg-slider-multi] https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/ — fetched 2026-06-02
- [apg-menu] https://www.w3.org/WAI/ARIA/apg/patterns/menubar/ + /patterns/menu-button/ — fetched 2026-06-02
- [mw-chip] https://github.com/material-components/material-web/blob/main/docs/components/chip.md (chip sets are toolbars — implementation) — fetched 2026-06-02
- [m3-chips-a11y] https://m3.material.io/components/chips/accessibility (Role Web = gridcell; Tab/Space-Enter/Backspace-Delete/Arrows keyboard) — read live via agent-browser 2026-06-02
- [m3-switch-specs] https://m3.material.io/components/switch/specs (track 32×52dp, handle 16/24/28dp, state layer 40/48dp, icon 16dp) — read live via agent-browser 2026-06-02
- [m3-slider-specs] https://m3.material.io/components/sliders/specs (anatomy; track 16/24/40/56/96dp; handle 4dp×44–108dp; label container 44×48dp; track shape 8/8/12/16/28dp) — read live via agent-browser 2026-06-02
- [m3-slider-a11y] https://m3.material.io/components/sliders/accessibility (Tab/Arrows/Space+Arrows/Home-End; role slider; handle shrinks + value appears on press) — read live via agent-browser 2026-06-02
- [apg-grid] https://www.w3.org/WAI/ARIA/apg/patterns/grid/ — fetched 2026-06-02
- [mca-slider] https://github.com/material-components/material-components-android/blob/master/docs/components/Slider.md — fetched 2026-06-02
- [mdn-slider] https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range + ARIA slider role — fetched 2026-06-02
- [cdk-menu] context7 /angular/components src/cdk/menu/menu.md + node_modules/@angular/cdk/types/menu.d.ts (read) — fetched 2026-06-02
- [cdk-menu-sub] context7 /angular/components menu.md nested-menu pattern (cdkMenuItem + cdkMenuTriggerFor) — fetched 2026-06-02
- [cdk-drag] context7 /angular/components goldens/cdk/drag-drop/index.api.md (CdkDrag lockAxis/boundary/constrainPosition) — fetched 2026-06-02
- [cdk-a11y] context7 /angular/components goldens/cdk/a11y/index.api.md (List/Focus/ActiveDescendant KeyManager) — fetched 2026-06-02
- [cdk-listbox] node_modules/@angular/cdk exports map (./listbox present) — fetched 2026-06-02
- [cdk-overlay] context7 /angular/components overlay docs (FlexibleConnectedPositionStrategy) — fetched 2026-06-02
- [issue-28984] https://github.com/angular/components/issues/28984 (zoneless menu positioning; closed completed 2024-05-06) — fetched 2026-06-02
- [seg-group] libs/ui/segmented-button/src/segmented-button-group.ts (read) — 2026-06-02
- [fab-menu] libs/ui/fab-menu/src/{fab-menu.ts,fab-menu-item.ts} (read) — 2026-06-02
- [roving] libs/ui/interaction/src/a11y.ts (createRovingFocus) — 2026-06-02

## Open Questions

Resolved this pass via the live M3 pages (`/agent-browser`): chip web role = `gridcell` (grid, not
toolbar); Backspace/Delete removes a focused input chip; M3 switch handle dp (16→24→28 pressed) and
track 32×52dp; M3 slider anatomy, 5-size dp scale, value-indicator/handle-shrink behavior, and keyboard.
Still open:

- [ ] **Chip pattern decision** — the *facts* are settled (M3 a11y spec says `gridcell`/grid; material-web
  ships `toolbar`). Which to implement is a design call: strict-M3 grid (Variant 3A) vs. the simpler,
  battle-tested toolbar (3B). Decide in design.
- [ ] **Zoneless CDK menu anchoring under 21.2.13** — #28984 is fixed upstream, but #30145 (dynamic
  reposition) and #26856 (overlay base CSS) warrant a demo-app smoke test before relying on 5A.
- [ ] **Signal Forms coexistence** — whether one component implementing *both* CVA and `FormValueControl`
  has any DI/binding collision is unverified; only relevant if Area-1 adds C alongside A/B.
- [ ] **Per-control resting dp not yet pulled** — checkbox/radio container + ripple dp, chip heights/padding
  per type, exact slider tick spacing. Not blocking design; pull from the live M3 specs during implementation
  (as in `actions`).

## Next Steps

`spec:design selection` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research selection` again — it will extend this
catalogue rather than overwrite it.
