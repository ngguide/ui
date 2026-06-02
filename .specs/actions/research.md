---
created: 2026-06-02
updated: 2026-06-02
---

# Research: Actions Components

## Problem Statement

`@ngguide/ui` needs the full Material Design 3 "Actions" catalog — common buttons (5
variants), icon buttons, FAB, extended FAB, FAB menu, segmented buttons, split button,
button groups — implemented strictly per [m3.material.io](https://m3.material.io/), plus a
retrofit of the existing `button`/`fab`/`icon` entry points onto the M3 token contract and
the M3 interaction foundation. The catalog is large and the components share a lot:
variant/size/shape styling, hover/focus/pressed state, toggle/selected behavior, and
keyboard a11y. The decisions that matter are **how to factor that shared surface** and
**which a11y/overlay foundations to build the composite controls on** — the project vision
names `@angular/aria`, but the existing interaction layer shipped on `@angular/cdk/a11y`,
so that fork is live and unresolved.

This document catalogs variants per problem area with evidence. It makes no decisions —
`spec:design` picks one variant per area.

## M3 specification reference (sourced facts that constrain every area)

All exact numbers below come from the Compose Material3 generated design-token files
(`android.googlesource.com .../material3/tokens/*.kt`) and the Material Web component docs;
**m3.material.io itself is JS-rendered and returned no body via WebFetch**, so spec-page
verbatim wording is an open question (see Open Questions). [compose-tokens] [matweb-button]
[matweb-iconbtn] [matweb-fab] [compose-button-api] [compose-iconbtn-api]

- **Common-button size ladder** (XS/S/M/L/XL): container height **32 / 40 / 56 / 96 / 136 dp**;
  icon size **20 / 20 / 24 / 32 / 40 dp**; leading/trailing padding **16 / 16 / 24 / 48 / 64 dp**;
  icon→label gap **8 / 8 / 8 / 12 / 16 dp**; outlined stroke **1 / 1 / 1 / 2 / 3 dp**. [compose-tokens]
- **Button shape** (spec-page corner table, now directly sourced [m3-buttons-specs]): every size
  has a **round (default = `Full`)** and a **square** shape; **square** = XS 12 / S 12 / M 16 /
  L 28 / XL 28 dp; **pressed** = XS 8 / S 8 / M 12 / L 16 / XL 16 dp. "Both round and square
  buttons should have the same pressed shape." Toggle buttons also change the **resting** shape:
  unselected round → selected square (and if unselected is square → selected round). All shapes
  must be corner-based for the morph to animate. [m3-buttons-specs] [compose-tokens]
- **Toggle button color roles** (spec-page table, directly sourced [m3-buttons-specs]), per
  variant as `Default / Toggle-unselected / Toggle-selected`:
  - Elevated: `surface-container-low + primary` / `surface-container-low + primary` / `primary + on-primary`
  - Filled: `primary + on-primary` / `surface-container + on-surface-variant` / `primary + on-primary`
  - Tonal: `secondary-container + on-secondary-container` / (same) / `secondary + on-secondary`
  - Outlined: `outline-variant + on-surface-variant` / (same) / `inverse-surface + inverse-on-surface`
  - Text: `primary` / — / — (no toggle text button)
  - Small-button default padding: M3 = **24 dp**, M3 Expressive = **16 dp**. [m3-buttons-specs]
- **Icon buttons**: 4 variants (standard/filled/filled-tonal/outlined); **3 widths**
  Narrow/Uniform(default)/Wide (per-width leading/trailing space); 5 sizes (32…136 dp ladder);
  round+square+pressed+selected shapes; toggle swaps the glyph (`slot="selected"`) and shape;
  **`aria-label` required**, `role="toolbar"` for icon-button rows. [matweb-iconbtn] [compose-iconbtn-api]
- **FAB**: small **40×40 / Corner 12 / icon 24** (no longer recommended), baseline/regular
  **56×56 / Corner 16 / icon 24**, medium, large **96×96 / Corner 28 / icon 32**. **Color
  mappings** (spec page [m3-fab-specs]): default is now **primary container + on-primary-container**;
  also secondary-container, tertiary-container, primary, secondary, tertiary. **Surface FABs are
  no longer recommended.** Per non-default color, the state-layer color must match the icon color.
  **Elevation** (spec page): resting = level 3 (M3 standard, inferred), **hovered = elevation 4**
  with an 8% state layer; focused = 10% state layer; pressed = 10% state layer. [m3-fab-specs] [compose-tokens]
- **Extended FAB**: container + leading icon + label; collapses to icon-only FAB and expands. [matweb-fab] [compose-extfab]
- **FAB menu**: a `ToggleFloatingActionButton` (animates size/corner/color, icon morphs Add→Close)
  + a menu container + flat menu items stacked vertically above the FAB; semantics via
  state-description "Expanded"/"Collapsed". [compose-fabmenu]
- **Segmented buttons**: single- and multi-select; **2–5 segments** (spec figure, unsourced —
  Compose doesn't encode min/max); selection **checkmark** in the active segment; outlined,
  height **40 dp**, pill shape with interior dividers, outline 1 dp, icon 18 dp, LabelLarge.
  In M3 Expressive the **connected button group supersedes segmented buttons**. [compose-segbtn-api] [compose-tokens]
- **Split button**: leading primary button + trailing **toggle** button (opens a menu);
  trailing corners morph — pressed → `InnerCornerSizePressed`, checked → **full**; 5 sizes. [compose-splitbtn-api]
- **Button groups**: **standard** (spaced) and **connected** (shared edges); **expressive press**
  = pressed button expands ~**15%** (`ExpandedRatio = 0.15`) and neighbors compress; per-position
  (leading/middle/trailing) shapes + pressed + checked shapes; sizes inherit the button ladder. [compose-btngroup-api]
- **ARIA / keyboard patterns** (now directly sourced from the M3 accessibility pages —
  **important: M3 uses plain Tab between items, NOT roving tabindex**):
  - **Segmented buttons** [m3-seg-a11y]: "**Tab** focuses on an individual segment"; **Space or
    Enter** selects/unselects. Single-select **behaves like radio buttons, role = Radiogroup**;
    multi-select **behaves like checkboxes, role = Checkbox** (per segment). Initial focus on the
    first segment regardless of selection. *(So each segment is its own tab stop — not a single
    roving stop with arrow keys.)*
  - **Button groups** [m3-grp-a11y]: the **container is not focusable**; initial focus on the
    first button, then **Tab** to each button; **Space or Enter** activates. (Each button is a tab stop.)
  - **Split button** [m3-split-a11y]: focus lands on the **leading** button then the **trailing**
    button; **Space/Enter** activates; the **trailing button is the menu trigger** and must
    communicate **expanded/collapsed** state; the opened menu follows menu a11y guidance.
  - **FAB menu** [m3-fabmenu-a11y]: activating the FAB opens the menu; the **close button takes the
    FAB's place** and keeps focus, then focus moves **top→bottom** through items. Close button:
    **Label "Toggle menu", Role Button, State Expanded/Collapsed**. Items meet **48×48 dp**.
  - **Icon-button rows**: `role="toolbar"`. [matweb-iconbtn]

> **Token gap (cross-spec):** the existing `_shape.css` defines up to `extra-large` (28) plus
> `large-increased` (20) but **not** `extra-large-increased` (32 dp), which the expressive
> button/FAB shapes reference. The pressed/selected/connected shape morph also has no dedicated
> `--md-sys-shape-*` "pressed" tokens. Whether to extend `m3-tokens` or hold shape values in
> component CSS/TS is surfaced in Area 2.

## Problem Areas

### 1. Component composition & shared core

_Related requirements: 1, 2, 3, 4, 5, 13, 14, 17_

How to share variant/size/shape/state/toggle logic and interaction-directive wiring across 8
component families without duplication, and how the existing `button`/`fab`/`icon` migrate
onto it.

#### Variant A: `hostDirectives` composition

**How it works:** Each component declares `hostDirectives: [GuiStateLayerDirective,
GuiRippleDirective, GuiFocusRingDirective]` (optionally wrapped in one `GuiInteractiveDirective`
that composes all three transitively), forwarding/aliasing their inputs (e.g. `disabled`) onto
the component API. Variant/size/shape/toggle stay as the component's own signal inputs + host
`data-*` bindings.

**Pros:**
- Idiomatic Angular 21 behavior-sharing; the interaction foundation already ships as directives.
- Input/output forwarding with aliasing is a documented first-class feature.
- Transitive composition lets one `GuiInteractive` host directive stack the three, applied once per component.

**Cons:**
- Host directives are static/compile-time and their selector is ignored — they apply
  unconditionally to every instance (no per-instance opt-out without an input flag).
- Host directives execute before the component, so binding-precedence needs care.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Aligns with `libs/ui/interaction` directives and the existing host-driven
`data-*` convention in `button.ts`. Diverges from today's `button.ts`, which hand-rolls all
state in CSS and uses no directives.
**Evidence:** `hostDirectives` is compile-time, standalone-only, selector-ignored, supports
input/output aliasing and transitive composition; host directives run before the component
which can override their bindings. [ng-compose] [ng-hostdir]

#### Variant B: Shared abstract base directive/class with `inject()`

**How it works:** A `GuiActionBase` abstract directive holds the common signal inputs
(`variant`, `size`, `shape`, `disabled`, `selected`) and wires interaction via `inject()` in
the constructor; each component `extends GuiActionBase` and adds its specifics.

**Pros:**
- Centralizes shared state/logic in TS (one place for size/shape maps, disabled computation).
- No reliance on host-directive precedence rules.

**Cons:**
- Inheritance shares logic but **not** host bindings cleanly — host metadata isn't inherited,
  so each component still re-declares `host` bindings (or uses host directives anyway).
- Angular guidance frames `hostDirectives` (composition) as the path for behavior + host bindings.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** No existing base-class pattern in the repo to follow; would be a new convention.
**Evidence:** DI/`inject()` works in directives; docs position composition over inheritance for
host-binding-bearing behavior but give no hard rule. [ng-compose] (trade-off = needs investigation)

#### Variant C: Hybrid — `GuiInteractive` host directive + TS token/shape maps

**How it works:** One `GuiInteractive` host directive composes the three interaction
directives and exposes `disabled`/`size`; components apply it via `hostDirectives` (Variant A
mechanism) **and** import a shared, framework-free TS module of size/shape/variant→token maps
(consumed by either CSS custom props or host `data-*`).

**Pros:**
- Single composition point + single source of truth for the size/shape matrices.
- Keeps per-component code thin; matrices are unit-testable in isolation.

**Cons:**
- Two moving parts (directive + maps) to keep in sync.
- Still inherits host-directive precedence considerations from Variant A.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Extends the interaction-foundation directive style; introduces a new shared TS
map module (none exists today).
**Evidence:** Same composition facts as Variant A. [ng-compose] [ng-hostdir]

#### Variant D: Per-component, minimal sharing

**How it works:** Each component is standalone and repeats the variant/size/shape/state wiring
following the existing `button.ts` convention; interaction directives applied in each template/host.

**Pros:** Zero shared abstraction to design up front; each component fully independent.
**Cons:** Heavy duplication across ~12 components; drift risk; large retrofit churn.
**Effort:** High (aggregate) | **Risk:** Medium
**Codebase fit:** Matches today's isolated `button`/`fab`/`icon` style.
**Evidence:** Current `button.ts`/`fab.ts`/`icon.ts` are fully independent components. [code-existing]

### 2. Variant / size / shape styling & shape morph

_Related requirements: 1, 2, 4, 16_

How variant/size/shape map to CSS, and how the expressive **shape morph** on press/select is
rendered — given the token gap (no `extra-large-increased` / pressed shape tokens).

#### Variant A: Host `data-*` attributes + token-keyed CSS (existing convention)

**How it works:** Host binds `[attr.data-variant]`, `[attr.data-size]`, `[attr.data-shape]`,
`[attr.data-selected]`; CSS keys off them, reading `--md-sys-*` tokens. Morph done via a
`data-gui-state="pressed"` attribute (already emitted by `GuiStateLayerDirective`) swapping
`border-radius` with a CSS `transition` using motion tokens.

**Pros:**
- Matches the existing `button.css` and the vision's "host-driven `data-variant`/`data-size`" decision.
- `GuiStateLayerDirective` already exposes `data-gui-state` for the pressed selector — morph for free.
- CSS `transition` on `border-radius` honors `prefers-reduced-motion` via the existing media block.

**Cons:**
- The CSS matrix is large (variant × size × shape × state); must avoid the current file's
  hardcoded radii (`16px/20px/68px`) and `rgba(255,255,255,...)` token violations.
- Per-size square/pressed radii that aren't in the token set must live somewhere (see token gap).

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Direct continuation of `button.css` + `interaction.css.ts` patterns.
**Evidence:** `GuiStateLayerDirective` sets `data-gui-state~='pressed'`; existing button CSS uses
`data-size`/`data-shape`/`:active` for morph (with hardcoded values to replace). [code-statelayer] [code-buttoncss]

#### Variant B: Component-computed CSS custom properties

**How it works:** A TS size/shape map computes per-instance `--gui-btn-height`,
`--gui-btn-radius`, `--gui-btn-radius-pressed`, etc., bound via `[style.--*]`; CSS consumes the
custom props. Morph = swapping the radius custom prop on pressed (CSS transition).

**Pros:**
- Centralizes the numeric matrix in testable TS; CSS stays small and declarative.
- Easy to express the pressed/selected radius per size without a token explosion.

**Cons:**
- Moves "shape values" out of the CSS token layer into TS — a partial divergence from
  "everything from `--md-sys-*` tokens" unless the props are themselves token-derived.
- Inline style props increase host attribute churn.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** `icon.ts` already uses a computed `--gui-comp-icon-size` custom prop — precedent exists.
**Evidence:** `icon.ts` binds `[style.--gui-comp-icon-size]`. [code-icon]

#### Variant C: WAAP-driven morph directive (mirror the ripple)

**How it works:** A small directive animates `border-radius` via the Web Animations API on
press/select (like `GuiRippleDirective`), reading duration/easing from motion tokens and gating
on `GuiReducedMotion`; static shapes stay in CSS.

**Pros:**
- Precise, interruptible morph matching M3 expressive motion; reuses the reduced-motion gate.
- Keeps shape *states* out of the CSS combinatorics.

**Cons:**
- More moving parts than a CSS transition; animating `border-radius` per corner is fiddly.
- Overlaps with what a CSS `transition` already achieves for the common case.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Mirrors `ripple.directive.ts` (WAAP + token reads + reduced-motion). New directive.
**Evidence:** `GuiRippleDirective` uses `Element.animate` with motion tokens and a reduced-motion
gate; `GuiReducedMotion` exposes a signal. [code-ripple] [code-reducedmotion]

> **Cross-spec note (token gap):** Variants A/B need per-size square/pressed/selected radii.
> Option 1 — extend `m3-tokens` with `--md-sys-shape-corner-extra-large-increased` (32) and
> pressed/selected shape tokens (touches another spec). Option 2 — hold these as component
> constants derived from existing tokens. This choice rides along with the Area-2 decision and
> should be flagged to `m3-tokens`.

### 3. Toggle / selected state & forms integration

_Related requirements: 3, 6, 10, 14_

How single-button toggle and group selection (segmented/button-group/split) expose state and
integrate with Angular forms, under zoneless + OnPush.

#### Variant A: `model()` two-way signal

**How it works:** A `selected = model(false)` (single button) and a group `value`/`selection`
model for segmented/group; two-way bindable `[(selected)]`, mutated on activate, emits on change.

**Pros:**
- Native Angular 21 two-way binding; no forms dependency; signal-native for zoneless/OnPush.
- Minimal API; controlled and uncontrolled both work (parent may bind or ignore).

**Cons:**
- No direct `ngModel`/reactive-forms participation without an additional CVA.
**Effort:** Low | **Risk:** Low
**Codebase fit:** Matches the repo's signal-input convention.
**Evidence:** `model()` creates a writable two-way signal input; child mutates via `.set()`. [ng-model]

#### Variant B: `ControlValueAccessor` (classic forms)

**How it works:** Toggle/segmented implement CVA and register `NG_VALUE_ACCESSOR`; backing value
stored in a `signal` so reads stay reactive under zoneless OnPush.

**Pros:**
- Works with existing `@angular/forms` (`ngModel`, `formControlName`) that consumers already use.
- `setDisabledState` integrates the disabled requirement with forms.

**Cons:**
- More boilerplate; CVA is imperative — must back state with a signal to re-render zoneless OnPush
  (not documented, mitigation-by-pattern).
**Effort:** Medium | **Risk:** Medium
**Codebase fit:** `@angular/forms` is already a project dependency; no CVA in the repo yet.
**Evidence:** CVA interface + `NG_VALUE_ACCESSOR` multi/`forwardRef` registration; zoneless CD on
imperative `writeValue` = needs investigation, signal-backing is the mitigation. [ng-cva] [ng-ngva]

#### Variant C: Signal forms `FormValueControl` / `FormCheckboxControl`

**How it works:** Implement the new `@angular/forms/signals` control interface using `model()`
for `value`/`touched` and `input()` for `disabled`/`invalid`; bind via `FormField`.

**Pros:**
- Signal-native, OnPush-designed; future direction of Angular forms.
**Cons:**
- **Experimental since v21.0** — API-instability risk for a published library.
**Effort:** Medium | **Risk:** High
**Codebase fit:** No signal-forms usage in the repo; would be the first.
**Evidence:** `FormValueControl`/`FormField` documented but marked "Experimental since v21.0". [ng-signalforms] [ng-formfield]

> Note: A11y `aria-pressed`/`aria-checked` exposure (Req 3.3, 15.1) is independent of the
> forms choice and applies in all three variants.

### 4. Composite a11y & focus management (segmented, split, button group, FAB menu)

_Related requirements: 10.4, 11, 12.3, 15_

Role + keyboard wiring for the composites. Interacts with Area 5 (the menu-bearing components).

> **Key constraint from the M3 a11y pages (sourced):** M3 prescribes **plain `Tab` between
> segments / group buttons** (each item is its own tab stop) with **Space/Enter** to select —
> **NOT** a single roving tab stop with arrow-key navigation. This is a deliberate divergence from
> the WAI-ARIA APG radiogroup pattern (which uses roving + arrows). Strict-M3 ⇒ follow M3. The
> upshot: a **roving-tabindex manager (`FocusKeyManager`) is the wrong tool** for segmented buttons
> and button groups; native per-button focus is what M3 wants. Roving may still matter only inside
> a menu (FAB menu items), which Area 5 covers. [m3-seg-a11y] [m3-grp-a11y] [m3-split-a11y] [m3-fabmenu-a11y]

#### Variant A: Native focusable buttons + manual ARIA roles (no roving manager)

**How it works:** Each segment/group button is a natively focusable element (its own tab stop,
matching M3). Set roles/states by hand: single-select segmented = container `role="radiogroup"`
with `role="radio"` + `aria-checked` children; multi-select = `role="checkbox"`/`aria-pressed`
per segment; button group = a labelled set of plain buttons (container not focusable); split
button trailing = menu trigger with `aria-expanded`. Reuse the foundation's `GuiFocusRingDirective`
for the focus indicator. No `FocusKeyManager`/`createRovingFocus`.

**Pros:**
- Matches M3's documented Tab-per-item keyboard model exactly; least machinery.
- Full control over the precise roles M3 names (radiogroup/radio, checkbox, menu-button).
- No new dependency; relies only on native focus + the interaction foundation's focus ring.

**Cons:**
- ARIA roles/states are hand-wired and must be unit-tested per component.
- Selection state management (single vs multi) is bespoke (ties to Area 3).
**Effort:** Medium | **Risk:** Low
**Codebase fit:** Uses `GuiFocusRingDirective`; ignores the (now ill-fitting) roving helper.
**Evidence:** M3 a11y pages prescribe Tab-per-item + Space/Enter and name the roles. [m3-seg-a11y]
[m3-grp-a11y] [m3-split-a11y] `GuiFocusRingDirective` exists. [code-a11y]

#### Variant B: `@angular/aria` headless primitives (Listbox/Toolbar/Menu)

**How it works:** Build segmented on Listbox/Toolbar, FAB menu/split on aria Menu; aria supplies
keyboard, ARIA attributes, and focus modes (`roving`/`activedescendant`).

**Pros:**
- Matches the **project vision** ("behavior/ARIA on `@angular/aria`").
- Signal-native API; consistent patterns across future selection/navigation specs.

**Cons:**
- **Developer Preview** (latest 21.2.13) — breaking-change risk in a published library.
- Its listbox/toolbar default to **roving + arrow-key** nav, which **conflicts with M3's Tab-per-item
  model** for segmented/group — would need to be reconciled or overridden.
- New peer dependency not yet installed; diverges from the interaction layer's CDK choice.
**Effort:** Medium | **Risk:** High
**Codebase fit:** Not installed; first `@angular/aria` use; revisits the foundation's CDK decision.
**Evidence:** `@angular/aria` published (latest 21.2.13), ships Listbox/Toolbar/Menu, Developer
Preview, not in `node_modules`; its patterns use roving/activedescendant focus modes. [npm-aria] [ng-aria] [code-nopeer]

#### Variant C: Native ARIA for segmented/group + `@angular/cdk/menu` for menu-bearing

**How it works:** Native focusable buttons + manual roles (Variant A) for segmented buttons and
button groups; FAB menu and split button delegate their menu to `@angular/cdk/menu` (Area 5
Variant A), which supplies the menu role, keyboard, and focus management inside the overlay.

**Pros:**
- Each composite uses the most fitting tool; no Developer-Preview dependency; CDK already a peer.
- Segmented/group keep M3's Tab model; only the menu (where roving/focus-trap *is* wanted) uses CDK.
**Cons:**
- Two a11y mechanisms in one spec; keep role semantics consistent.
**Effort:** Medium | **Risk:** Low
**Codebase fit:** Native focus + `GuiFocusRingDirective` + `@angular/cdk/menu` (CDK 21.2.13 present).
**Evidence:** M3 a11y model [m3-seg-a11y] [m3-grp-a11y]; `@angular/cdk/menu` ships menu role +
keyboard + focus mgmt. [cdk-menu]

#### Variant C: Mixed — CDK key managers for segmented/group, CDK Menu for menu-bearing

**How it works:** Roving via CDK key managers (Variant A) for segmented buttons and button
groups; FAB menu and split button delegate to `@angular/cdk/menu` (Area 5 Variant A).

**Pros:**
- Each composite uses the most fitting stable CDK tool; no preview dependency.
**Cons:**
- Two a11y mechanisms in one spec; must keep role semantics consistent.
**Effort:** Medium | **Risk:** Low
**Codebase fit:** Reuses interaction `a11y.ts` + adds `@angular/cdk/menu` (CDK already a peer dep).
**Evidence:** CDK key managers + `@angular/cdk/menu` both exist under the installed CDK 21.2.13. [cdk-a11y] [cdk-menu]

### 5. Menu-overlay dependency (FAB menu, split button)

_Related requirements: 9, 11 (Constraints: menu/overlay belongs to `selection`)_

FAB menu and split button must reveal a set of actions in an overlay. The menu *control*
belongs to the `selection` spec, which doesn't exist yet.

#### Variant A: `@angular/cdk/menu` + CDK Overlay now

**How it works:** Use `CdkMenuTrigger`/`CdkMenu`/`CdkMenuItem` (auto ARIA roles, keyboard, RTL,
positioning via CDK Overlay) for the FAB-menu and split-button menus.

**Pros:**
- Stable, accessible, positioning solved; CDK is already a peer dependency.
**Cons:**
- A reported **zoneless positioning bug (#28984)** on CDK 17 (closed without visible fix) — must
  validate under this project's zoneless setup on CDK 21.x before relying on it.
- SSR-safety not explicitly documented (Overlay/DOCUMENT-based; verify).
- Pre-empts the `selection` spec's ownership of the menu control.
**Effort:** Medium | **Risk:** Medium
**Codebase fit:** CDK present (21.2.13); no overlay usage in the repo yet.
**Evidence:** `@angular/cdk/menu` ships 7 directives with auto ARIA + keyboard; built on CDK
Overlay; zoneless positioning issue #28984 status unclear on 21.x. [cdk-menu] [cdk-overlay] [gh-28984]

#### Variant B: `@angular/aria` Menu (Developer Preview)

**How it works:** Use the aria Menu/MenuTrigger primitives (which position via CDK Overlay internally).

**Pros:** Vision-aligned; pairs naturally with Area 4 Variant B; signal-native.
**Cons:** Developer Preview (API risk); new peer dep.
**Effort:** Medium | **Risk:** High
**Codebase fit:** Not installed.
**Evidence:** aria Menu is Developer Preview; aria Select/Menu use CDK Overlay for positioning. [ng-aria] [npm-aria]

#### Variant C: Internal menu-trigger contract + temporary stub, defer real overlay to `selection`

**How it works:** Define a minimal `GuiMenuTrigger` interface (open/close, expanded state, item
projection) in this spec; FAB menu and split button render the trigger + items and integrate
through the contract, with a thin stub overlay until the `selection` spec ships the real menu.

**Pros:**
- Honors the plan boundary (menu control = `selection` spec); no premature lock-in to CDK vs aria.
- Lets FAB-menu/split-button ship their *trigger + styling + a11y state* now.
**Cons:**
- A stub means FAB menu / split button aren't fully production-complete until `selection` lands.
- Risk of designing a contract that doesn't match the eventual menu implementation.
**Effort:** Medium | **Risk:** Medium
**Codebase fit:** New internal contract; no overlay dependency added.
**Evidence:** Plan assigns the menu overlay to `selection`; requirements Constraints already frame
the overlay as an external dependency. [plan] [code-requirements]

### 6. Icon-slot integration

_Related requirements: 5, 6.4, 7.4 (and the existing `// todo: icon`)_

How icons enter buttons (leading icon + label, icon-only, toggle selected-icon swap).

#### Variant A: Content projection via `<ng-content>` (existing pattern)

**How it works:** Consumers place `<gui-icon>` (or a Material Symbols glyph) inside the button;
CSS sizes/spaces it per variant/size. Toggle selected-icon handled by consumer markup or a
second projected slot.

**Pros:**
- Matches every existing component (`button`/`fab`/`icon` all use `<ng-content>`); zero coupling
  to an icon font; consumer controls the icon source.
**Cons:**
- Styling projected children needs structural CSS (gap/size) and can't deep-style arbitrary icons.
- Selected-icon swap needs a convention (named slot) rather than a single input.
**Effort:** Low | **Risk:** Low
**Codebase fit:** Identical to `button.ts`/`icon.ts` (`template: '<ng-content />'`).
**Evidence:** `button.ts`, `fab.ts`, `icon.ts` all project content via `<ng-content />`. [code-existing]

#### Variant B: Named slots (`ng-content select=`) for leading icon vs label vs selected icon

**How it works:** Template defines `<ng-content select="[guiIcon]">`, default slot for label, and
`<ng-content select="[guiSelectedIcon]">` for the toggle swap; CSS positions each slot.

**Pros:**
- Explicit anatomy (leading icon / label / selected icon) matching M3; clean per-slot styling.
- Supports the icon-button toggle glyph swap declaratively.
**Cons:**
- More template structure; consumers must use the slot attributes.
**Effort:** Medium | **Risk:** Low
**Codebase fit:** Extends the projection convention; no named slots used in the repo yet.
**Evidence:** Angular `ng-content` selectors are standard; Material Web icon-button uses a
`slot="selected"` for the same swap. [matweb-iconbtn]

#### Variant C: `icon` string input rendering `<gui-icon>` internally

**How it works:** Component takes `icon`/`selectedIcon` string inputs and renders the existing
`IconComponent` internally.

**Pros:** Simplest consumer API for the common case (`icon="favorite"`).
**Cons:** Couples buttons to a specific icon-name system (Material Symbols font assumed);
less flexible than projection for custom SVGs; diverges from the projection convention.
**Effort:** Low | **Risk:** Medium
**Codebase fit:** Would import `@ngguide/ui/icon` into each button; new pattern.
**Evidence:** `IconComponent` exists and sizes via a custom prop. [code-icon]

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|---|---|---|---|---|
| 1 Composition | A hostDirectives | Med | Low | Reuses interaction directives + host `data-*` |
| 1 Composition | B base class/`inject()` | Med | Med | New convention |
| 1 Composition | C hybrid directive + TS maps | Med | Low | Extends interaction style + new map module |
| 1 Composition | D per-component | High | Med | Matches current isolated style |
| 2 Styling/morph | A data-attrs + token CSS | Med | Low | Continues `button.css`/`interaction.css.ts` |
| 2 Styling/morph | B computed custom props | Med | Med | Precedent in `icon.ts` |
| 2 Styling/morph | C WAAP morph directive | High | Med | Mirrors `ripple.directive.ts` |
| 3 Toggle/forms | A `model()` two-way | Low | Low | Signal-input convention |
| 3 Toggle/forms | B ControlValueAccessor | Med | Med | `@angular/forms` already present |
| 3 Toggle/forms | C signal forms | Med | High | First signal-forms use |
| 4 Composite a11y | A native focus + manual ARIA roles | Med | Low | Uses `GuiFocusRingDirective`; M3 Tab-per-item |
| 4 Composite a11y | B `@angular/aria` | Med | High | Not installed; roving conflicts w/ M3 Tab model |
| 4 Composite a11y | C native ARIA + CDK menu for menus | Med | Low | CDK already a peer dep |
| 5 Menu overlay | A `@angular/cdk/menu` now | Med | Med | CDK present; zoneless bug to verify |
| 5 Menu overlay | B `@angular/aria` Menu | Med | High | Not installed |
| 5 Menu overlay | C contract + stub, defer | Med | Med | Honors `selection` boundary |
| 6 Icon slot | A `<ng-content>` | Low | Low | Matches all existing components |
| 6 Icon slot | B named slots | Med | Low | Extends projection |
| 6 Icon slot | C `icon` string input | Low | Med | Couples to icon font |

## Cross-area dependencies

- **Area 4 ↔ Area 5 (a11y library):** Segmented buttons and button groups need **no** menu/roving
  library under M3's Tab-per-item model (Area 4 Variant A = native focus). Only the menu-bearing
  components (FAB menu, split button) need an overlay/menu mechanism. So `@angular/aria` (4B) pairs
  with aria Menu (5B); native ARIA (4A/4C) pairs with `@angular/cdk/menu` (5A) — or with the
  contract-stub (5C) if the menu is deferred to `selection`.
- **Area 1 ↔ Area 3:** Where toggle state lives (component signal vs CVA vs base class) depends
  on the composition choice — a shared base/host directive (1B/1C) is the natural home for a
  shared `selected`/`disabled` contract.
- **Area 1 ↔ Area 6:** A named-slot icon anatomy (6B) is most cleanly expressed if the shared
  core (1C) defines the common template shape; pure projection (6A) is composition-agnostic.
- **Area 2 ↔ `m3-tokens` (external):** The expressive shape-token gap (no `extra-large-increased`
  32, no pressed/selected shape tokens) must be resolved by either extending `m3-tokens` or
  holding values component-side — a decision that touches another spec.

## Codebase Insights

- The existing `button.css` hand-rolls hover/focus/active and **hardcodes non-token values**
  (`rgba(255,255,255,0.08/0.1)`, `16px/20px/28px/48px/68px` radii) and uses `:focus-visible`/
  `:active` directly — it does **not** use the interaction foundation. The retrofit (Req 17) is a
  substantial rewrite, not a tweak. [code-buttoncss]
- `GuiStateLayerDirective` already emits `data-gui-state~='pressed'` and a `gui-focus-visible`
  class via `FocusMonitor`, and `interaction.css.ts` already styles state layers — buttons can
  drop their bespoke hover/focus/pressed CSS and adopt the directives. [code-statelayer]
- `@ngguide/ui/interaction` already re-exports `FocusKeyManager`/`ListKeyManager`/
  `createRovingFocus` — composite a11y can build on the foundation without new deps. [code-a11y]
- Adding an entry point is mechanical: `libs/ui/<name>/{ng-package.json, src/index.ts, src/*.ts}`
  + a `tsconfig.base.json` path + a spec line in `libs/ui/project.json` `include`; ng-packagr
  auto-discovers secondary entry points. `@ngguide/ui` root exports only `GuiSize`. [code-wiring]
- `apps/web` already provides the theme (`provideM3Theme` in `app.config.ts`) and imports the
  token CSS (`styles.css`), so new component demos get tokens for free. [code-web]
- The repo runs `@angular/cdk@21.2.13` as a peer dep; `@angular/aria` is **not** installed. [code-nopeer]

## Sources

- [compose-tokens] https://android.googlesource.com/platform/frameworks/support/+/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ (Button*/Fab*/IconButton*/Shape/OutlinedSegmentedButton Tokens.kt) — fetched 2026-06-02
- [matweb-button] https://github.com/material-components/material-web/blob/main/docs/components/button.md — fetched 2026-06-02
- [matweb-iconbtn] https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md — fetched 2026-06-02
- [matweb-fab] https://github.com/material-components/material-web/blob/main/docs/components/fab.md — fetched 2026-06-02
- [compose-button-api] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button-defaults/ — fetched 2026-06-02
- [compose-iconbtn-api] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-icon-button-defaults/ — fetched 2026-06-02
- [compose-splitbtn-api] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-split-button-defaults/ — fetched 2026-06-02
- [compose-segbtn-api] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-segmented-button-defaults/ — fetched 2026-06-02
- [compose-btngroup-api] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/-button-group-defaults/ — fetched 2026-06-02
- [compose-togglebtn] https://composables.com/material3/togglebutton — fetched 2026-06-02
- [compose-fabmenu] https://composables.com/material3/togglefloatingactionbutton — fetched 2026-06-02
- [compose-extfab] https://kotlinlang.org/api/compose-multiplatform/material3/androidx.compose.material3/ (ExtendedFloatingActionButton) — fetched 2026-06-02
- [m3-buttons-specs] https://m3.material.io/components/buttons/specs — read 2026-06-02 (agent-browser, JS-rendered: corner table, toggle color roles, padding)
- [m3-fab-specs] https://m3.material.io/components/floating-action-button/specs — read 2026-06-02 (agent-browser: color mappings, hovered elevation 4)
- [m3-seg-a11y] https://m3.material.io/components/segmented-buttons/accessibility — read 2026-06-02 (agent-browser: Tab-per-segment, Radiogroup/Checkbox roles)
- [m3-split-a11y] https://m3.material.io/components/split-button/accessibility — read 2026-06-02 (agent-browser: leading→trailing Tab, trailing = menu trigger w/ expanded state)
- [m3-grp-a11y] https://m3.material.io/components/button-groups/accessibility — read 2026-06-02 (agent-browser: container not focusable, Tab per button)
- [m3-fabmenu-a11y] https://m3.material.io/components/fab-menu/accessibility — read 2026-06-02 (agent-browser: close button Label "Toggle menu"/Role Button/State Expanded-Collapsed, top→bottom focus)
- [ng-compose] https://angular.dev/guide/directives/directive-composition-api — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-hostdir] https://angular.dev/api/core/Component (hostDirectives) — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-model] https://angular.dev/guide/components/inputs (model two-way) — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-cva] https://angular.dev/api/forms/ControlValueAccessor — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-ngva] https://angular.dev/api/forms/NG_VALUE_ACCESSOR — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-signalforms] https://angular.dev/guide/forms/signals/custom-controls — fetched 2026-06-02 (context7: /websites/angular_dev)
- [ng-formfield] https://angular.dev/api/forms/signals/FormField — fetched 2026-06-02 (context7: /websites/angular_dev)
- [npm-aria] https://registry.npmjs.org/@angular/aria (latest 21.2.13, next 22.0.0-rc.3) — fetched 2026-06-02
- [ng-aria] https://angular.dev/guide/aria/overview — fetched 2026-06-02
- [cdk-a11y] https://raw.githubusercontent.com/angular/components/main/src/cdk/a11y/a11y.md — fetched 2026-06-02
- [cdk-menu] https://raw.githubusercontent.com/angular/components/main/src/cdk/menu/menu.md — fetched 2026-06-02
- [cdk-overlay] material.angular.dev/cdk/overlay (FlexibleConnectedPositionStrategy) — fetched 2026-06-02
- [gh-28984] https://github.com/angular/components/issues/28984 — fetched 2026-06-02
- [code-existing] libs/ui/{button,fab,icon}/src/*.ts — read 2026-06-02
- [code-buttoncss] libs/ui/button/src/button.css — read 2026-06-02
- [code-statelayer] libs/ui/interaction/src/state-layer.directive.ts — read 2026-06-02
- [code-ripple] libs/ui/interaction/src/ripple.directive.ts — read 2026-06-02
- [code-reducedmotion] libs/ui/interaction/src/reduced-motion.ts — read 2026-06-02
- [code-a11y] libs/ui/interaction/src/a11y.ts + index.ts — read 2026-06-02
- [code-icon] libs/ui/icon/src/icon.ts — read 2026-06-02
- [code-wiring] libs/ui/project.json, tsconfig.base.json, libs/ui/ng-package.json — read 2026-06-02
- [code-web] apps/web/src/app/app.config.ts, apps/web/src/styles.css — read 2026-06-02
- [code-nopeer] libs/ui/package.json peerDependencies; node_modules/@angular/aria absent — read 2026-06-02
- [code-requirements] .specs/actions/requirements.md — read 2026-06-02
- [plan] .projects/ngguide-ui/plan.md — read 2026-06-02

## Open Questions

- [x] **FAB elevation** — RESOLVED via spec page: hovered = **elevation 4** (8% state layer),
  focused/pressed = 10% state layer; resting = level 3 (standard M3, inferred). [m3-fab-specs]
- [x] **Button corner sizes per size** — RESOLVED via spec page corner table (round=Full all;
  square 12/12/16/28/28; pressed 8/8/12/16/16). [m3-buttons-specs]
- [x] **ARIA roles + keyboard** for segmented (Radiogroup/Checkbox, Tab-per-segment), split
  (leading→trailing Tab, trailing=menu trigger w/ expanded state), button groups (container not
  focusable, Tab per button), FAB menu (close button Label/Role/State, top→bottom focus) —
  RESOLVED via the M3 a11y pages. Roving tabindex is NOT the M3 pattern. [m3-seg-a11y] [m3-grp-a11y]
  [m3-split-a11y] [m3-fabmenu-a11y]
- [ ] **Label typography per button size (XS→XL):** still not captured — the spec "Measurements"
  section renders typography in images / the interactive baseline-token explorer, not page text.
  Needs the token-explorer widget or the type-scale token files; minor for design start.
- [ ] **Icon-button Small/Large/XLarge exact container dp** and **split-button / button-group
  per-size dp** — only XS (32) and M (56) ladders directly fetched; the rest inferred from the
  common-button ladder (32/40/56/96/136). Confirm per-component when building each.
- [ ] **Segmented "2–5 segments"** — still a spec-figure not found verbatim in fetched text; the
  a11y/spec pages describe behavior but not a hard min/max. Treat 2–5 as guidance.
- [ ] **`@angular/cdk/menu` under zoneless on CDK 21.x** — validate issue #28984 (positioning) is
  resolved before adopting it for FAB menu / split button (only relevant if Area 5 Variant A/C chosen).
- [ ] **Expressive shape-token gap** — decide with `m3-tokens` whether to add
  `extra-large-increased` (32) and pressed/selected shape tokens, or hold them component-side.

## Next Steps

`spec:design actions` will pick one variant per problem area and produce the technical design.
The cross-area a11y-library fork (CDK vs `@angular/aria`) and the menu-overlay ownership
boundary with `selection` are the load-bearing decisions to settle first.

If new directions surface during design, run `spec:research actions` again — it extends this
catalogue rather than overwriting it.
