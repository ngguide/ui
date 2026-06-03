---
created: 2026-06-03
updated: 2026-06-03
---

# Research: Text inputs (text fields, date pickers, time pickers)

## Problem Statement

We need to build the M3 **Text inputs** category — filled/outlined text fields (with label, supporting/
error text, leading/trailing icons, prefix/suffix, character counter, multiline), date pickers (docked,
modal, modal-input, range), and time pickers (dial + input, 12h/24h) — as `@ngguide/ui/*` secondary
entry points. Everything must trace to the published M3 spec and the WAI-ARIA APG, reuse the existing
token contract and interaction foundation, integrate with Angular forms via the shared `GuiFormControl`,
present floating panels with `@angular/cdk/overlay`, and localize via native `Intl`.

This catalogue widens the option space for five technical areas. Decisions are made in `spec:design`.

## Problem Areas

### 1. Text-field component architecture

_Related requirements: 1, 2, 3, 4, 5, 11_

The text field is the most-reused surface (it is also the trigger field for both pickers). M3 defines
filled and outlined as functionally identical configurations sharing one anatomy (container · label ·
input text · leading/trailing icon · prefix/suffix · supporting text · activation-indicator/outline),
container height **56dp**, input/label type role `body-large`, supporting text `body-small`, filled
container `surface-container-highest`, indicator `on-surface-variant`→`primary` on focus→`error` on
error, outline `outline`→`primary`(focus, 3px)→`error`. The question is how to structure the component(s).

**Verified live-spec measurements** (m3.material.io/components/text-fields/specs, read 2026-06-03):
default container height 56dp (target size 56dp); top/bottom padding 8dp; left/right padding 16dp
(without icons) / 12dp (with icons); padding between icon and text 16dp; supporting-text & character-
counter top padding 4dp; padding between supporting text and counter 16dp; outlined populated-label
left/right padding 4dp.

#### Variant A: Single wrapper element that owns an internal `<input>`/`<textarea>`

**How it works:** One `<gui-text-field>` element (custom element selector) renders its own native
`<input>` (or `<textarea>` for multiline) inside its template, plus content-projection slots for leading/
trailing icons (`[guiTextFieldLeading]` / `[guiTextFieldTrailing]`). `variant` (`'filled' | 'outlined'`),
`label`, `supportingText`, `errorText`, `prefix`, `suffix`, `maxLength`, `multiline`/`rows` are signal
inputs. CSS keys off `[attr.data-variant]` and state data-attributes. Mirrors how `gui-checkbox`/
`gui-switch` own their hidden native input.

**Pros:**
- One component, one CSS file — the filled/outlined parity in M3 maps cleanly to a `data-variant` switch.
- Owning the input avoids the native-CVA collision the selection spec hit (no consumer `<input>` carrying
  Angular's built-in `DefaultValueAccessor`), so `GuiFormControl` composes cleanly on the host.
- Slots + signal inputs match existing conventions (chip/slider).

**Cons:**
- Consumers lose direct access to the native input element (must reach through `@ViewChild`/template ref
  the component exposes) for things like custom `inputmode`, `autocomplete`, pattern attributes — needs a
  pass-through input API.
- A single component accreting label/affix/counter/icons/multiline is large; needs careful template
  decomposition.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Aligns with `gui-checkbox`/`gui-switch` (own a native input) and chip/slider slot+signal
conventions. Diverges from nothing existing.
**Evidence:** [ui-checkbox] `libs/ui/checkbox/src/checkbox.ts:28-94`; [m3-tf] M3 filled/outlined token
tables (container 56px, roles above).

#### Variant B: Wrapper element that projects the consumer's native `<input>`

**How it works:** `<gui-text-field>` wraps `<ng-content>`; the consumer authors their own `<input>`/
`<textarea>` inside it. The wrapper draws container/label/indicator and observes the projected input for
focus/value/disabled to drive floating-label and state. Closer to Angular Material's `<mat-form-field>` +
`matInput`.

**Pros:**
- Consumer keeps full ownership of the native input (all native attributes, their own value accessor,
  validators) — maximum flexibility.
- The wrapper is purely presentational; forms integration is whatever the consumer already uses on the
  input.

**Cons:**
- The projected `<input>` carries Angular's built-in `DefaultValueAccessor` — composing a shared
  `GuiFormControl` becomes ambiguous (which CVA owns the control?), re-introducing the exact collision the
  selection spec deliberately avoided.
- Observing a projected element's focus/value/disabled across emulated encapsulation is fiddly (the
  selection spec's ISSUE-2 lesson: rules on projected elements don't scope as expected).
- Floating-label timing depends on the consumer wiring inputs correctly.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Diverges from the "own the input" pattern used by every selection control; closer to the
menu's "directive layer over consumer element" pattern but without that pattern's necessity.
**Evidence:** [ui-checkbox] `libs/ui/checkbox/src/checkbox.ts:28-38`; [sel-summary] selection spec
wrapper-element rationale (native CVA collision) recorded in this repo's prior spec.

#### Variant C: Split field-container directive + input directive (Material-style)

**How it works:** Two pieces — a `[guiTextField]` container directive (draws the M3 shell) and a
`[guiTextFieldInput]` directive applied to the consumer's `<input>`/`<textarea>` that registers itself
with the container via DI. Icons/affixes are separate directives (`[guiTextFieldPrefix]`, etc.).

**Pros:**
- Granular, composable; the input directive can expose the native element directly.
- Familiar to developers coming from Angular Material.

**Cons:**
- Most moving parts of the three; multiple directives must coordinate through DI (projection-DI traps like
  the menu's apply here too).
- Same native-CVA ambiguity as Variant B for the consumer's `<input>`.
- Heaviest to build and document for a from-scratch kit.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Echoes the menu directive-layer pattern (`[gui-menu]` on `cdkMenu`) but multiplied; no
existing multi-directive coordinated component in the kit.
**Evidence:** [ui-menu] `libs/ui/menu/src/menu.ts`, `menu-item.ts:24-58` (directive-layer + DI-through-
projection precedent).

---

### 2. Forms integration (string / Date / time values)

_Related requirements: 8_

The requirements constrain us to reuse `GuiFormControl<T>` (`@ngguide/ui/forms`) so text inputs behave
like the selection controls under `ngModel`/reactive forms. `GuiFormControl<T>` provides
`value = model<T|null>`, `disabled` input + `formDisabled` signal → `effectiveDisabled`, `touched` signal,
CVA wiring (`writeValue` sets value WITHOUT calling onChange), `emit(v)`, `markTouched()`, provided via
`NG_VALUE_ACCESSOR`. The open question is how each text-input composes it given values are `string`
(text field), `Date` (date picker), or `Date`/`{h,m}` (time picker), and that a native input fires its
own input/blur events.

#### Variant A: `hostDirectives` composition with I/O aliasing (checkbox pattern)

**How it works:** Each component lists `{ directive: GuiFormControl, inputs: ['value', 'disabled'],
outputs: ['valueChange'] }` (or aliased names like `'value: date'`) in `hostDirectives`, injects the
`GuiFormControl` instance, and on the internal input's `(input)`/`(change)` calls `control.emit(parsed)`,
on `(blur)` calls `control.markTouched()`. `writeValue` (via the model) flows back to the displayed text.
Identical mechanism to `gui-checkbox`/`gui-switch`/`gui-radio-group`.

**Pros:**
- Maximum consistency with the shipped selection controls; one forms mechanism across the library.
- `effectiveDisabled` already merges `disabled` input + form-driven `setDisabledState`.
- No new forms code to maintain.

**Cons:**
- `GuiFormControl.value` is a `model<T|null>`; bridging a native input's string value ↔ a typed `Date`
  model requires a parse/format layer living in the component (esp. for pickers).
- The "emit on user input but not on writeValue" discipline must be repeated per component (the selection
  spec's double-emit bug is the cautionary tale).

**Effort:** Low | **Risk:** Low
**Codebase fit:** Direct reuse of `libs/ui/forms` + the checkbox/switch/radio composition.
**Evidence:** [ui-forms] `libs/ui/forms/src/form-control.directive.ts:1-67`; [ui-checkbox]
`libs/ui/checkbox/src/checkbox.ts:33-38` (hostDirectives aliasing).

#### Variant B: Shared abstract base the components subclass

**How it works:** Introduce a small abstract base (e.g. `GuiTextInputBase<T>`) that internally instantiates/
extends `GuiFormControl` logic and centralizes the native-input bridge (input→emit, blur→markTouched,
writeValue→display). Text-field, date-picker, time-picker extend it.

**Pros:**
- Centralizes the parse/format-and-emit bridge so the double-emit discipline lives in one place.
- Less per-component boilerplate than Variant A for three+ components.

**Cons:**
- Inheritance for Angular components is awkward (host metadata, DI, signals don't inherit as cleanly as
  composition); the kit currently uses composition everywhere, so this is a new pattern.
- Still has to provide `NG_VALUE_ACCESSOR`; risks diverging subtly from `GuiFormControl`'s exact behavior.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Diverges from the composition-over-inheritance norm used across the kit.
**Evidence:** [ui-forms] `libs/ui/forms/src/form-control.directive.ts:1-67` (the logic that would be
lifted into a base); no existing base-class component in the kit (codebase-fit: novel).

#### Variant C: Per-component bespoke CVA (do not reuse `GuiFormControl`)

**How it works:** Each text-input implements `ControlValueAccessor` directly, tuned to its value type and
parsing needs.

**Pros:**
- Full control over value typing, parse/format, and validity reporting per component.
- No coupling to `GuiFormControl`'s `model`-based shape.

**Cons:**
- Contradicts the stated reuse constraint; introduces a second forms mechanism in the library.
- Three+ hand-rolled CVAs to keep consistent with the selection controls' touched/disabled semantics.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Diverges from the shared-CVA decision made in the selection spec.
**Evidence:** [ui-forms] `libs/ui/forms/src/form-control.directive.ts` exists specifically to avoid this;
constraint in `requirements.md` §Constraints.

---

### 3. Overlay & dialog foundation (docked panel + modal dialog)

_Related requirements: 6, 7, 9, 10_

Pickers need two surface kinds: a **docked** panel anchored to the trigger field (non-modal, dismiss on
outside-click/Escape/select) and a **modal** centered dialog (scrim, focus trap, confirm/cancel, focus
return). `@angular/cdk@21.2.13` is installed and provides everything; the menu already uses CDK (via
`CdkMenuTrigger`), but not the raw overlay. APG requires focus-into-panel-on-open, focus-trap for modal,
Escape-to-close, focus-restore-on-close.

#### Variant A: Imperative `Overlay` service + portals, wrapped in a small shared picker-overlay helper

**How it works:** A shared internal helper (in `@ngguide/ui/forms` or a new `@ngguide/ui/overlay` private
util) opens overlays via `overlay.create(config)` → `OverlayRef.attach(new TemplatePortal(...))`.
Docked: `FlexibleConnectedPositionStrategy` (anchored to the field) + `RepositionScrollStrategy`, no
backdrop, subscribe `outsidePointerEvents()` + `keydownEvents()` (Escape) to close. Modal:
`GlobalPositionStrategy` (centered) + `BlockScrollStrategy` + `hasBackdrop` + `ConfigurableFocusTrapFactory`
(auto-capture), `backdropClick()`/Escape to cancel, restore focus to trigger on dispose.

**Pros:**
- One imperative helper handles both surface kinds and all dismissal/focus rules in TS — testable, reusable
  by both pickers.
- All required APIs verified present in v21 (`backdropClick`, `keydownEvents`, `outsidePointerEvents`,
  `FlexibleConnectedPositionStrategy`, `GlobalPositionStrategy`, `ConfigurableFocusTrapFactory`).
- Full control over focus management (the APG-critical part).

**Cons:**
- More TS than a declarative directive; manual subscription teardown.
- Introduces direct overlay usage the kit hasn't had before (new surface area to test).

**Effort:** Medium | **Risk:** Low
**Codebase fit:** New (no current raw-overlay usage), but CDK is already a peer dep and the menu proves CDK
integration works zoneless.
**Evidence:** [cdk-overlay] verified v21 exports (`OverlayRef.backdropClick/keydownEvents/
outsidePointerEvents`, `FlexibleConnectedPositionStrategy`, `GlobalPositionStrategy`,
`ScrollStrategyOptions`) from `node_modules/@angular/cdk@21.2.13/types/_overlay-module-chunk.d.ts`;
[cdk-a11y] `ConfigurableFocusTrapFactory`, `CdkTrapFocus` from `types/a11y.d.ts`.

#### Variant B: Declarative `CdkConnectedOverlay` + `cdkTrapFocus` in component templates

**How it works:** Each picker template carries `<ng-template cdkConnectedOverlay [cdkConnectedOverlayOpen]=
"open()" ...>`; modal uses a centered position + `cdkTrapFocus cdkTrapFocusAutoCapture` on the dialog root.
Open/close driven by signals.

**Pros:**
- Declarative, less imperative wiring; positions/open state read straight from signals.
- Focus trap via the `cdkTrapFocus` directive needs no factory plumbing.

**Cons:**
- `CdkConnectedOverlay` is connected-position oriented; a truly centered modal usually wants
  `GlobalPositionStrategy` (passed via `[positionStrategy]`), so the modal case is a bit against the grain.
- Per-template duplication of overlay config across both pickers (vs one shared helper).
- `cdkTrapFocusAutoCapture` exact input name flagged needs-investigation against v21 directive docs.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** New; no existing `CdkConnectedOverlay` usage in the kit.
**Evidence:** [cdk-overlay] `CdkConnectedOverlay` inputs (`origin`, `positions`, `open`, `hasBackdrop`,
`disableClose`, `positionStrategy`, `scrollStrategy`) verified in v21 type decls; [needs-investigation]
`cdkTrapFocusAutoCapture` input string (minified in bundle).

#### Variant C: Reuse the existing `@angular/cdk/menu` trigger for the docked panel

**How it works:** The docked date panel rides on `CdkMenuTrigger`/`cdkMenu` like the FAB/split-button
menus — the calendar is the menu content.

**Pros:**
- Reuses a pattern already in the kit (`fab-menu`, `split-button`); positioning/dismissal handled.

**Cons:**
- A calendar is the APG **grid** pattern, not a menu — `cdkMenu` imposes `role="menu"` + menu keyboard
  semantics that fight the grid roving-tabindex/arrow model (R10.3). Fundamentally wrong a11y shape.
- Does nothing for the modal dialogs (R6.2/R7) — still need overlay there.
- Only covers the docked variant.

**Effort:** Low (docked only) | **Risk:** High (a11y mismatch)
**Codebase fit:** Reuses `fab-menu`/`split-button` wiring but misapplies the menu role to a grid.
**Evidence:** [ui-fabmenu] `libs/ui/fab-menu/src/fab-menu.ts:23-33` (CdkMenuTrigger pattern); [apg-grid]
APG grid pattern requires `role=grid` + roving tabindex — incompatible with `role=menu`.

---

### 4. Calendar / date engine + localization

_Related requirements: 6, 10, plus i18n non-functional_

Covers month-grid generation, range selection, min/max/per-date predicate, today/selected/in-range/disabled
cell states, parse/format, localized month/weekday names, and the locale's first-day-of-week.

**Verified live-spec anatomy** (m3.material.io/components/date-pickers/specs, read 2026-06-03): the
**docked** variant's trigger is an **outlined text field**, with month-selection + year-selection menu
buttons, an icon button, weekday label text, and day cells in states unselected · today · outside-month ·
selected; container = `surface-container-high`, selected date = `primary`/`on-primary`, today/weekday/
unselected = `on-surface(-variant)`. The **modal** variant adds headline · supporting text · header ·
divider; its **range** configuration adds an `in-range active indicator`, `in-range date`, and `month
subhead`, with range fill = `secondary-container`/`on-secondary-container`. **Date range is a configuration
of the modal and modal-input variants only — there is NO docked-range** (docked configurations are Day /
Month / Year selection). Day/cell **pixel** measurements on this page are rendered as images (not text-
extractable) — treat exact cell dp as needs-investigation / standard 48dp, confirm during design.
Verified
facts: `Intl.DateTimeFormat` formats (month/weekday names, `formatToParts`) but **does not parse**;
`Intl.Locale.prototype.getWeekInfo()` returns `{firstDay (1=Mon…7=Sun), weekend, minimalDays}` but is **not
Baseline** (missing in some major browsers) → needs a fallback. APG calendar = grid pattern (arrows,
PageUp/Down month, Shift+PageUp/Down year, Home/End week, Enter/Space select, `aria-selected`, roving
tabindex, grid labeled by month/year heading).

#### Variant A: Native `Date` + internal pure date-utils + `Intl` formatting, fixed to native Date values

**How it works:** A private date-utils module (`addMonths`, `startOfMonth`, `isSameDay`, `buildMonthGrid
(year, month, firstDay)`, `clamp`, `inRange`) operating on native `Date`. `Intl.DateTimeFormat` supplies
localized month/weekday labels and display formatting; `getWeekInfo().firstDay` with a small CLDR-derived
fallback map gives first-day-of-week. A custom parser uses `formatToParts` on a reference date to discover
the locale's field order, then parses typed input against that order (with ISO `yyyy-mm-dd` always
accepted). Picker value type is `Date | null`.

**Pros:**
- Honors the requirements constraint (native Date + no external date lib); zero new runtime deps.
- Pure functions are trivially unit-testable (no TestBed) — strong fit for the native-Vitest setup.
- `Intl` gives correct localized names/formatting for free.

**Cons:**
- Native `Date` is timezone/DST-sensitive; calendar math must stay in local-midnight to avoid off-by-one —
  a known footgun requiring careful normalization.
- Custom parsing is inherently lossy/ambiguous (e.g. `01/02` differs by locale); needs clear rules + error
  surfacing (R6.8).
- `getWeekInfo` fallback must be maintained for unsupported browsers.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Matches the slider's "custom engine as pure logic + signals" approach; no existing date
code to reuse.
**Evidence:** [mdn-intl] Intl.DateTimeFormat formats only, `formatToParts` returns typed parts; [mdn-week]
`getWeekInfo().firstDay` 1=Mon…7=Sun, not Baseline; [apg-dp] grid keyboard model; [ui-slider]
`libs/ui/slider/src/slider.ts` custom-engine precedent.

#### Variant B: `DateAdapter<D>` abstraction (pluggable, Material-style)

**How it works:** Define a `GuiDateAdapter<D>` injection token with methods (`today`, `addCalendarMonths`,
`getYear`, `format`, `parse`, `createDate`, `compareDate`, `getFirstDayOfWeek`…). Ship a default
`NativeDateAdapter` (wrapping Variant A internally); consumers can provide a luxon/date-fns adapter. Picker
value type is the generic `D`.

**Pros:**
- Consumers with existing luxon/date-fns/Temporal date types can plug in without conversion.
- Isolates all date-math/parsing behind one interface — cleaner testing and future Temporal support.
- Decouples first-day-of-week/parse strategy from the components.

**Cons:**
- Higher effort and more public API surface (an adapter contract) than the requirements call for; the
  constraint explicitly says native Date + "consumers wire their own forms", not "pluggable date libs".
- Generic `D` threads through every picker, the CVA value, and the demo — more complexity.
- Risks over-engineering for a course-oriented from-scratch kit.

**Effort:** High | **Risk:** Medium
**Codebase fit:** New abstraction; nothing in the kit currently uses an adapter/token-strategy of this size.
**Evidence:** [mat-adapter] Angular Material's `DateAdapter` is the well-known precedent (general knowledge;
not copied — API would be our own); [mdn-intl] same Intl basis for the native default.

#### Variant C: `Temporal.PlainDate` (+ polyfill) as the value type

**How it works:** Use the TC39 `Temporal` API (`Temporal.PlainDate`) for calendar math — no timezone/DST
ambiguity by design — with a polyfill where unsupported.

**Pros:**
- `PlainDate` eliminates the native-`Date` timezone footguns; calendar arithmetic is exact and ergonomic.
- Future-proof.

**Cons:**
- Browser support not universal in 2026 → requires a polyfill (a runtime dep), contradicting the
  no-external-date-lib constraint.
- Value type `Temporal.PlainDate` is unfamiliar to most consumers and complicates the forms value/`ngModel`
  story.
- `Temporal` availability/parsing specifics → needs-investigation.

**Effort:** Medium | **Risk:** High
**Codebase fit:** Diverges from the native-Date constraint; new dependency.
**Evidence:** [needs-investigation] Temporal browser support + polyfill size as of 2026-06-03 (not verified
this pass).

---

### 5. Time-picker engine (dial + input, 12h/24h)

_Related requirements: 7, 10_

M3 time picker = a modal with two variants: **dial** (clock face, hour-then-minute, clock hand) and
**input** (two fields). 12-hour adds an AM/PM toggle (hours 1–12); 24-hour drops it and uses **two
concentric rings** (inner 0–12, outer 13–23), hour range 0–23. A keyboard icon toggles dial↔input. APG:
input fields are `role="spinbutton"` (`aria-valuenow/min/max/text`, Up/Down, Home/End); the dial must be
keyboard-operable too.

**Verified live-spec measurements** (m3.material.io/components/time-pickers/specs, read 2026-06-03):
container padding 24dp on all sides, headline left-aligned; time-selector container 96dp wide (114dp for
24h vertical) × 80dp tall; period selector 52×80dp (vertical) / 216×38dp (horizontal); **clock dial
container 256dp**; **clock dial selector handle 48dp**; **selector center 8dp**; **selector track width
2dp**. Color roles: handle = `primary`/`on-primary`; dial container = `surface-container-highest`;
selected period = `tertiary-container`/`on-tertiary-container`; dial label = `on-surface`. Anatomy
confirmed: time-selector container/label, separator, period-selector container/label, clock dial
container/label/selector (container/track/center), headline, text button, icon button.

#### Variant A: Custom pointer dial engine (SVG) + spinbutton inputs, both modes always built

**How it works:** A custom pointer engine (like the slider's) maps pointer angle → hour/minute. Numbers and
the clock hand are rendered in SVG (positions via trig: `x = cx + r·sin θ`, `y = cy − r·cos θ`); 24-hour
adds an inner ring at a smaller radius. The input mode renders two `spinbutton` fields + AM/PM segmented
control. A keyboard-icon button toggles modes; both share one `{hour, minute, period}` signal state. Dial
is keyboard-operable (arrows step the active unit) to satisfy APG.

**Pros:**
- Reuses the proven custom-pointer-engine approach from the slider (angle math instead of linear).
- SVG positioning is precise and resolution-independent; clock hand is a simple rotated line.
- One shared state model feeds both dial and input → consistent value + easy validity (R7.6).

**Cons:**
- Most complex piece in the spec: pointer math + two rings + AM/PM + keyboard model + focus management in a
  modal.
- Dial keyboard interaction isn't a standard APG widget (clock dials aren't in APG) → must define a
  sensible, documented key model (needs-investigation for the exact mapping).

**Effort:** High | **Risk:** Medium
**Codebase fit:** Mirrors `libs/ui/slider` custom-engine + per-thumb interaction directives; no existing
dial.
**Evidence:** [ui-slider] `libs/ui/slider/src/slider.ts` (custom pointer engine precedent); [m3-tp]
material-android TimePicker anatomy (dial, two rings for 24h, AM/PM 12h only); [apg-spin] spinbutton
pattern for the input fields.

#### Variant B: CSS-transform dial (absolutely-positioned number buttons) + spinbutton inputs

**How it works:** Same two-mode structure, but dial numbers are real `<button>`s positioned with CSS
(`transform: rotate(θ) translateY(-r) rotate(-θ)` or CSS custom props), and the hand is a CSS-rotated
element. Each number is a focusable button → keyboard support comes "for free" via roving tabindex
(`createRovingFocus`).

**Pros:**
- Number-as-button gives native focusability and a clean roving-tabindex keyboard model (reuses
  `createRovingFocus` from `@ngguide/ui/interaction`).
- No SVG; pure DOM + CSS, easier to theme with tokens and apply state-layer/focus-ring directives per
  number.

**Cons:**
- CSS rotation positioning is finicky to get pixel-perfect against the M3 dial measurements (and 24h inner
  ring).
- Pointer "drag the hand" interaction is less natural over discrete buttons than over an SVG hit-area;
  hybrid pointer + button focus needs care.

**Effort:** High | **Risk:** Medium
**Codebase fit:** Reuses `createRovingFocus` + interaction directives directly; closer to the kit's
"interactive elements are real buttons" norm (chip/menu-item).
**Evidence:** [ui-a11y] `createRovingFocus` in `libs/ui/interaction/src/a11y.ts`; [ui-chip]
`libs/ui/chip/src/chip.ts` (real-button + roving focus precedent); [m3-tp] dial anatomy.

#### Variant C: Input-mode as the canonical engine; dial as an optional presentation layer

**How it works:** Build the `input` variant first as the source of truth (two spinbutton fields + AM/PM),
fully wired to forms/validity. The dial is a thin visual layer that writes into the same state, added on
top — and could ship in a later group.

**Pros:**
- De-risks the spec: a fully functional, accessible time picker exists without the hardest (dial) piece.
- Clean separation lets the dial be iterated/visually polished independently.
- Natural shippable-group boundary (input group, then dial group).

**Cons:**
- M3's primary/default time picker is the **dial**; shipping input-first is a phasing choice, not the M3
  default surface — must not be mistaken for "dial is optional" in the final product.
- Two visual modes still both required by R7; this only sequences them.

**Effort:** Medium (to first ship) | **Risk:** Low
**Codebase fit:** Spinbutton inputs reuse text-field/forms patterns; dial later reuses A or B.
**Evidence:** [apg-spin] spinbutton pattern; [m3-tp] dial is the default M3 variant (so input-first is a
sequencing decision, called out for design).

---

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|---|---|---|---|---|
| 1. Text-field architecture | A. Wrapper owns internal input | Medium | Low | Matches checkbox/switch own-input |
| 1. Text-field architecture | B. Wrapper projects consumer input | High | Medium | Reintroduces native-CVA collision |
| 1. Text-field architecture | C. Split container+input directives | High | Medium | Echoes menu directive-layer ×N |
| 2. Forms integration | A. hostDirectives + I/O aliasing | Low | Low | Direct reuse of forms/checkbox |
| 2. Forms integration | B. Shared abstract base class | Medium | Medium | Novel inheritance pattern |
| 2. Forms integration | C. Per-component bespoke CVA | Medium | Medium | Diverges from shared-CVA decision |
| 3. Overlay foundation | A. Imperative Overlay + shared helper | Medium | Low | New, but CDK already a peer dep |
| 3. Overlay foundation | B. Declarative CdkConnectedOverlay | Medium | Medium | New; modal-centering against grain |
| 3. Overlay foundation | C. Reuse cdk/menu trigger | Low | High | Misapplies menu role to a grid |
| 4. Date engine | A. Native Date + utils + Intl | High | Medium | Matches slider custom-engine; honors constraint |
| 4. Date engine | B. DateAdapter abstraction | High | Medium | New large abstraction |
| 4. Date engine | C. Temporal.PlainDate + polyfill | Medium | High | Diverges from native-Date constraint |
| 5. Time-picker engine | A. SVG dial + spinbutton inputs | High | Medium | Mirrors slider engine |
| 5. Time-picker engine | B. CSS-transform button dial + inputs | High | Medium | Reuses roving-focus/real-button norm |
| 5. Time-picker engine | C. Input-first, dial as later layer | Medium | Low | Sequencing of A/B |

## Cross-area dependencies

- **Area 3 (overlay) underpins Areas 4 & 5.** Both pickers consume whatever surface mechanism is chosen.
  Picking Overlay-service Variant A (a shared helper) means date and time pickers both call one util;
  picking declarative Variant B means each picker template wires its own overlay. Variant C only covers the
  docked date case and leaves modal date/time still needing A or B — so C alone is insufficient.
- **Area 1 ↔ Areas 4 & 5.** The text-field (Area 1) is the trigger field for both pickers. If Area 1 is
  Variant A (component owns the input), the picker can embed/extend that component as its trigger directly;
  if Area 1 is Variant B/C (consumer-owned input), the picker must coordinate with a projected input.
- **Area 2 ↔ Area 4.** The forms value type follows the date-engine choice: Variant 4A/4B-native → value is
  `Date`; 4B-pluggable → generic `D`; 4C → `Temporal.PlainDate`. The CVA composition (Area 2) must carry
  whatever type Area 4 yields.

## Codebase Insights

- `GuiFormControl<T>` (`libs/ui/forms/src/form-control.directive.ts:1-67`) is value-type-generic and already
  handles the `disabled` input + `setDisabledState` merge and the "writeValue must not emit" rule — directly
  reusable for any value type.
- The selection spec already paid for the native-CVA-collision lesson: **own the native input inside a
  custom element** rather than projecting a consumer `<input>` (selection's toggles-as-wrapper decision).
- `@angular/cdk@21.2.13` is a confirmed peer dep with full overlay + a11y (focus-trap) surface; the menu
  proves CDK works under zoneless here. No raw-overlay usage exists yet — this spec introduces it.
- `createRovingFocus` (`libs/ui/interaction/src/a11y.ts`) supports `'horizontal'|'vertical'|'both'`
  orientation, wrap, type-ahead, home/end — usable for the calendar grid and a button-based dial.
- The slider (`libs/ui/slider`) is the precedent for a custom pointer engine expressed as pure logic +
  signals + per-element interaction directives — the closest analog for both the calendar grid and the dial.
- New entry points wire through five spots: `tsconfig.base.json` paths, the component `ng-package.json` +
  `index.ts` barrel, `libs/ui/project.json` `test.include`, and (if a new peer dep) `libs/ui/package.json`.

## Sources

- [ui-forms] `libs/ui/forms/src/form-control.directive.ts:1-67` — read 2026-06-03
- [ui-checkbox] `libs/ui/checkbox/src/checkbox.ts:28-94` — read 2026-06-03
- [ui-menu] `libs/ui/menu/src/menu.ts`, `libs/ui/menu/src/menu-item.ts:24-58` — read 2026-06-03
- [ui-fabmenu] `libs/ui/fab-menu/src/fab-menu.ts:23-33` — read 2026-06-03
- [ui-slider] `libs/ui/slider/src/slider.ts`, `libs/ui/slider/src/slider-tokens.ts:7-26` — read 2026-06-03
- [ui-a11y] `libs/ui/interaction/src/a11y.ts` (`createRovingFocus`) — read 2026-06-03
- [ui-chip] `libs/ui/chip/src/chip.ts:28-116` — read 2026-06-03
- [m3-tf] M3 filled/outlined text-field token tables — https://github.com/material-components/material-web/blob/main/tokens/versions/latest/sass/_md-comp-filled-text-field.scss and `_md-comp-outlined-text-field.scss` — fetched 2026-06-03
- [m3-tf-docs] https://github.com/material-components/material-web/blob/main/docs/components/text-field.md — fetched 2026-06-03
- [m3-tf-specs] https://m3.material.io/components/text-fields/specs — read live via agent-browser 2026-06-03 (container 56dp + paddings)
- [m3-dp] https://github.com/material-components/material-components-android/blob/master/docs/components/DatePicker.md — fetched 2026-06-03
- [m3-dp-specs] https://m3.material.io/components/date-pickers/specs — read live via agent-browser 2026-06-03 (anatomy, color roles, range-is-modal-only)
- [m3-tp] https://github.com/material-components/material-components-android/blob/master/docs/components/TimePicker.md — fetched 2026-06-03
- [m3-tp-specs] https://m3.material.io/components/time-pickers/specs — read live via agent-browser 2026-06-03 (dial 256dp, handle 48dp, center 8dp, track 2dp, paddings)
- [apg-dp] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/ — fetched 2026-06-03
- [apg-dialog] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ — fetched 2026-06-03
- [apg-spin] https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/ — fetched 2026-06-03
- [apg-grid] https://www.w3.org/WAI/ARIA/apg/patterns/grid/ — fetched 2026-06-03
- [cdk-overlay] `node_modules/@angular/cdk@21.2.13/types/_overlay-module-chunk.d.ts` (Overlay, OverlayRef.backdropClick/keydownEvents/outsidePointerEvents, FlexibleConnectedPositionStrategy, GlobalPositionStrategy, ScrollStrategyOptions) — read 2026-06-03; cross-ref context7 /websites/angular_dev
- [cdk-a11y] `node_modules/@angular/cdk@21.2.13/types/a11y.d.ts` (ConfigurableFocusTrapFactory, CdkTrapFocus) — read 2026-06-03
- [mdn-intl] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat — fetched 2026-06-03
- [mdn-week] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo — fetched 2026-06-03

## Open Questions

- [x] **M3 pixel measurements** — RESOLVED via `/agent-browser` on the live specs pages (2026-06-03):
  text-field paddings and time-picker dial measurements are now captured above. **Remaining gap:** date-
  picker day-cell/grid pixel sizes render as images on the specs page (not text-extractable) — treat as
  standard 48dp and confirm during design.
- [x] **Distinct docked date-range anatomy** — RESOLVED: there is **no docked-range**; date range is a
  configuration of the **modal** and **modal-input** variants only (docked configs = Day/Month/Year
  selection). Captured in Area 4.
- [ ] **Date parsing strategy** — Intl can't parse; decide between `formatToParts`-derived locale order vs
  ISO-only vs a lightweight mask, and the error rules for unparseable/out-of-range (R6.8).
- [ ] **`Intl.Locale.getWeekInfo()` browser support** is not Baseline — confirm the fallback first-day-of-
  week source (small CLDR map?) and target-browser matrix.
- [ ] **`cdkTrapFocusAutoCapture`** exact input attribute name in v21 (minified in the bundle) — verify in
  the directive docs before relying on auto-capture.
- [ ] **Dial keyboard model** — clock dials aren't an APG widget; define and document the arrow/step key
  mapping for the dial (R10.4).

## Next Steps

`spec:design <spec-name>` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research <spec-name>` again — it will extend this
catalogue rather than overwrite it.
