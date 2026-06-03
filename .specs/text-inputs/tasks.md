---
created: 2026-06-03
updated: 2026-06-03
---

# Implementation Plan: Text inputs (text fields, date pickers, time pickers)

## Overview

This plan delivers the M3 Text-inputs category as new `@ngguide/ui/*` secondary entry points. It is
sequenced as six additive groups in dependency order: two internal foundations (datetime utils, then the
CDK-overlay helper), the presentational text-field, then the single date picker, the date-range picker, and
finally the time picker. Each group adds new entry points and their specs without touching existing
component behaviour.

The plan is split into 6 groups in dependency order. Each group is independently mergeable — build,
type-check, lint, and the full `ui` test suite stay green with only that group (and earlier ones) applied.
There are **no cutovers** — every group is purely additive (new files + new `tsconfig`/`project.json`/
`theme.css` entries); no existing code path is removed or altered.

## Tasks

### Group A — Datetime foundation (`@ngguide/ui/datetime`) (new internal surface)

Pure, framework-free date math + `Intl` localization + locale-aware parsing consumed by both pickers.
Blast radius: **safe** — additive entry point with no consumers yet.

- [ ] 1. Scaffold the `@ngguide/ui/datetime` entry point
  - Create `libs/ui/datetime/ng-package.json` (`{ "lib": { "entryFile": "src/index.ts" } }`) and
    `libs/ui/datetime/src/index.ts` barrel.
  - Add `"@ngguide/ui/datetime": ["libs/ui/datetime/src/index.ts"]` to `tsconfig.base.json` `paths`.
  - _Requirements: 12.1, 12.2_

- [ ] 2. Implement the data models and pure date utilities
  - Create `libs/ui/datetime/src/models.ts`: `GuiTime { hours; minutes }`, `GuiDateRange { start; end }`.
  - Create `libs/ui/datetime/src/date-utils.ts`: `startOfDay`, `isSameDay`, `addDays`, `addMonths`
    (day-clamping), `startOfMonth`, `daysInMonth`, `clampDate`, `isBefore`, `compareDate`, `CalendarCell`,
    `buildMonthGrid(year, month0, firstDayOfWeek)` (always 42 cells, `inCurrentMonth` flags). All operate at
    local-midnight to avoid TZ/DST drift. No `new Date()`/`Date.now()` inside — callers pass dates in.
  - Spec `libs/ui/datetime/src/date-utils.spec.ts`: 42-cell grid shape, first-column offset per
    `firstDayOfWeek`, outside-month flags, leap-day clamp, DST-boundary `addDays` with no off-by-one.
  - _Requirements: 6.1, 6.4, 6.6_

- [ ] 3. Implement the Intl localization helpers
  - Create `libs/ui/datetime/src/intl.ts`: `monthNames`, `weekdayNames`, `formatDate`, `formatTime`,
    `firstDayOfWeek(locale)` (uses `Intl.Locale.getWeekInfo().firstDay` 1=Mon..7=Sun normalized to 0..6,
    with a small CLDR-derived fallback map then Sunday default — `getWeekInfo` is not Baseline),
    `prefersHour12(locale)`.
  - Spec `libs/ui/datetime/src/intl.spec.ts`: month/weekday name length + locale variation;
    `firstDayOfWeek` for `en-US` (0/Sun) vs `en-GB`/`ru` (1/Mon); fallback path when `getWeekInfo` absent
    (mock).
  - _Requirements: 6.7, 7.5_

- [ ] 4. Implement locale-aware parsing
  - Create `libs/ui/datetime/src/parse.ts`: `parseDate(input, locale)` (derive field order via
    `Intl.DateTimeFormat(locale).formatToParts(reference)`, always accept ISO `yyyy-mm-dd`, return `null`
    on unparseable/ambiguous) and `parseTime(input, hour12)` (return `null` on out-of-range).
  - Spec `libs/ui/datetime/src/parse.spec.ts`: per-locale order, ISO acceptance, null on garbage,
    out-of-range time → null.
  - _Requirements: 6.8, 7.6_

- [ ] 5. Register datetime specs
  - Append `../datetime/src/date-utils.spec.ts`, `../datetime/src/intl.spec.ts`,
    `../datetime/src/parse.spec.ts` to `libs/ui/project.json` `test.include`.
  - _Requirements: 12.3_

- [ ] 6. Checkpoint — Group A verification
  - Run `pnpm exec nx test ui` — the three datetime specs pass.
  - Run `pnpm exec nx build ui` — the new entry point builds via ng-packagr.
  - Confirm `main` builds/tests green with only Group A applied; `@ngguide/ui/datetime` resolves but has no
    consumers yet.

### Group B — Overlay foundation (`@ngguide/ui/overlay`) (new internal surface)

A thin `GuiPickerOverlay` service over `@angular/cdk/overlay` for docked panels and focus-trapped modal
dialogs, plus the global overlay-container stylesheet (first raw cdk/overlay use — deviation D2). Blast
radius: **safe** — additive; `theme.css` gains overlay container rules that affect nothing until an overlay
opens.

- [ ] 7. Scaffold the `@ngguide/ui/overlay` entry point
  - Create `libs/ui/overlay/ng-package.json` + `libs/ui/overlay/src/index.ts`.
  - Add `"@ngguide/ui/overlay": ["libs/ui/overlay/src/index.ts"]` to `tsconfig.base.json` `paths`.
  - _Requirements: 12.1, 12.2_

- [ ] 8. Implement the `GuiPickerOverlay` service
  - Create `libs/ui/overlay/src/picker-overlay.ts`: `openDocked(portal, {origin,width})` →
    `FlexibleConnectedPositionStrategy` (`STANDARD_DROPDOWN_BELOW_POSITIONS`, viewportMargin) +
    `RepositionScrollStrategy`, no backdrop, close on `outsidePointerEvents()`/Escape; `openModal(portal,
    {ariaLabel})` → `GlobalPositionStrategy` centered + `hasBackdrop` (scrim class) + `BlockScrollStrategy`
    + `ConfigurableFocusTrap` (focus initial element), close on backdrop/Escape. Both capture+restore focus
    to the pre-open `activeElement`. Return a `GuiOverlayHandle { ref, closed, close() }`.
  - Imports: `Overlay`, `OverlayRef`, position/scroll strategies from `@angular/cdk/overlay`;
    `TemplatePortal` from `@angular/cdk/portal`; `ConfigurableFocusTrapFactory` from `@angular/cdk/a11y`.
  - Spec `libs/ui/overlay/src/picker-overlay.spec.ts`: TestBed attaches a `TemplatePortal`, asserts the
    overlay attaches, `close()` disposes and emits `closed`, focus restores to the trigger.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.5_

- [ ] 9. Ship the overlay-container stylesheet
  - Create `libs/ui/src/styles/overlay.css` with the CDK overlay container/backdrop structural rules
    (mirroring `@angular/cdk/overlay-prebuilt.css`, no node_modules `@import`), backdrop themed via
    `--md-sys-color-scrim`.
  - Add `@import './overlay.css';` to `libs/ui/src/styles/theme.css` so it ships in the package asset bundle
    and the demo app inherits it through its existing `theme.css` import.
  - _Requirements: 9.4, 11.1, 12.5_

- [ ] 10. Register overlay spec
  - Append `../overlay/src/picker-overlay.spec.ts` to `libs/ui/project.json` `test.include`.
  - _Requirements: 12.3_

- [ ] 11. Checkpoint — Group B verification
  - Run `pnpm exec nx test ui` — overlay spec passes alongside Group A.
  - Run `pnpm exec nx build ui` — `overlay.css` is copied into `dist/libs/ui/styles/`.
  - Confirm `main` green with only A+B; no component opens an overlay yet (inert).

### Group C — Text field (`@ngguide/ui/text-field`) (new public component)

Presentational `<gui-text-field>` projecting the consumer's native `<input>`/`<textarea>` (deviation D1 —
no CVA on the wrapper). Blast radius: **safe** — standalone additive component.

- [ ] 12. Scaffold the `@ngguide/ui/text-field` entry point
  - Create `libs/ui/text-field/ng-package.json` + `src/index.ts` barrel.
  - Add `"@ngguide/ui/text-field": ["libs/ui/text-field/src/index.ts"]` to `tsconfig.base.json` `paths`.
  - _Requirements: 12.1, 12.2_

- [ ] 13. Implement the input marker + slot directives
  - Create `libs/ui/text-field/src/text-field-input.ts`: `TextFieldInputDirective`
    (`input[guiTextFieldInput], textarea[guiTextFieldInput]`) exposing `el`, `focused`, `empty`, `multiline`
    signals via `(focus)/(blur)/(input)` — no value accessor (consumer's native CVA stays intact).
  - Create slot marker directives `[guiTextFieldLeading]`, `[guiTextFieldTrailing]` in the same entry.
  - _Requirements: 1.6, 3.1, 3.2, 3.3, 8.1_

- [ ] 14. Implement the `TextFieldComponent` (template + styles)
  - Create `libs/ui/text-field/src/text-field.ts` (`gui-text-field`), `.html`, `.css`, and
    `text-field-tokens.ts` (`GUI_TEXT_FIELD` const: 56px height + verified paddings).
  - Inputs: `variant` (filled/outlined), `label`, `supportingText`, `errorText`, `error`, `required`,
    `prefix`, `suffix`, `maxLength`. `contentChild.required(TextFieldInputDirective)` drives floating-label
    (`data-populated`), focus (`data-focused`), error (`data-error`), disabled. Counter reads
    `input().el.value.length`; sets `aria-describedby`/`aria-invalid` on the projected input. Multiline via
    projected `<textarea>` (auto-grow CSS). CSS keys off `data-*` + `--md-sys-*`; filled vs outlined on
    `[data-variant]`.
  - Spec `libs/ui/text-field/src/text-field.spec.ts`: floating-label toggles on value/focus; error shows
    `errorText` + `aria-invalid`; counter reflects length; leading/trailing slots render; outlined variant
    switches.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 10.1, 11.1, 11.3_

- [ ] 15. Register spec + wire the demo host
  - Append `../text-field/src/text-field.spec.ts` to `libs/ui/project.json` `test.include`.
  - Add a text-field section to `apps/web/src/app/app.component.{ts,html}` (after the slider section):
    filled + outlined, with label/supporting/error, leading/trailing icon (`gui-icon-button` clear),
    prefix/suffix + counter, and a multiline example bound via `ngModel`/`FormControl` on the projected
    input.
  - _Requirements: 12.3, 12.4_

- [ ] 16. Checkpoint — Group C verification
  - Run `pnpm exec nx run-many -t lint test build -p ui web` — green.
  - Confirm the text-field renders both variants in `nx serve web`; `main` green with only A+B+C.

### Group D — Date picker (`@ngguide/ui/date-picker`, single) (new public component)

Single-date picker (docked · modal · modal-input) over an APG grid calendar, composing
`GuiFormControl<Date>`. Blast radius: **safe** — additive; depends on Groups A, B, C.

- [ ] 17. Scaffold the `@ngguide/ui/date-picker` entry point
  - Create `libs/ui/date-picker/ng-package.json` + `src/index.ts`.
  - Add `"@ngguide/ui/date-picker": ["libs/ui/date-picker/src/index.ts"]` to `tsconfig.base.json` `paths`.
  - _Requirements: 12.1, 12.2_

- [ ] 18. Implement the calendar grid component
  - Create `libs/ui/date-picker/src/calendar.ts` (`gui-calendar`, `role="grid"`), `.html`, `.css`.
  - Inputs: `activeMonth` model, `selected`, `min`, `max`, `dateFilter`, `locale`, `today`; output
    `dateSelected`. Renders weekday `columnheader`s ordered by `firstDayOfWeek(locale)` + 42 gridcells from
    `buildMonthGrid`. Roving tabindex (one cell `tabindex=0`); APG keys: Arrows, Home/End (week),
    PageUp/Down (month), Shift+PageUp/Down (year), Enter/Space select. `aria-selected` on selected; today,
    outside-month, and disabled (min/max/filter) states with `aria-disabled`. Apply state-layer/ripple/
    focus-ring directives per cell.
  - Spec `libs/ui/date-picker/src/calendar.spec.ts`: grid roles, weekday order per locale, keyboard
    navigation moves focus, disabled cells unselectable, `aria-selected` on the chosen date.
  - _Requirements: 6.1, 6.6, 6.7, 10.2, 10.3, 10.6, 11.3_

- [ ] 19. Implement the `DatePickerComponent`
  - Create `libs/ui/date-picker/src/date-picker.ts` (`gui-date-picker`), `.html`, `.css`. `hostDirectives`:
    `{ directive: GuiFormControl, inputs: ['value: date','disabled'], outputs: ['valueChange: dateChange'] }`
    (`GuiFormControl<Date>`). Inputs: `variant` (docked/modal/modal-input), `label`, `locale`, `min`,
    `max`, `dateFilter`. Trigger = `gui-text-field` + trailing calendar `gui-icon-button`. `open()`: docked →
    `overlay.openDocked(#panel, {origin})`; modal/modal-input → `overlay.openModal(#panel)` with
    `role="dialog"`/`aria-modal`. `commit(date)`: `control.emit(date)` + `control.markTouched()`; modal/
    modal-input require OK, docked commits on select. Typed input parsed via `parseDate(value, locale)` →
    error state on `null`/out-of-range.
  - Spec `libs/ui/date-picker/src/date-picker.spec.ts`: reactive-forms round-trip (`FormControl<Date>`
    updates on select); programmatic `writeValue` updates the display without emitting; unparseable typed
    date → error.
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.8, 6.9, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 10.1, 10.5_

- [ ] 20. Register spec + wire the demo host
  - Append `../date-picker/src/calendar.spec.ts` and `../date-picker/src/date-picker.spec.ts` to
    `libs/ui/project.json` `test.include`.
  - Add a date-picker demo (docked + modal + modal-input) to `apps/web` bound via `FormControl<Date>`.
  - _Requirements: 12.3, 12.4_

- [ ] 21. Checkpoint — Group D verification
  - Run `pnpm exec nx run-many -t lint test build -p ui web` — green.
  - Confirm docked/modal/modal-input open, navigate, and commit in `nx serve web`; `main` green with A–D.

### Group E — Date range picker (`@ngguide/ui/date-picker` range) (extends date-picker)

Range selection (modal / modal-input only — verified no docked range), composing
`GuiFormControl<GuiDateRange>`. Blast radius: **safe** — additive; depends on Group D.

- [ ] 22. Implement the `DateRangePickerComponent`
  - Create `libs/ui/date-picker/src/date-range-picker.ts` (`gui-date-range-picker`), `.html`, `.css`;
    export from the `date-picker` barrel. `hostDirectives`: `{ directive: GuiFormControl, inputs: ['value:
    range','disabled'], outputs: ['valueChange: rangeChange'] }` (`GuiFormControl<GuiDateRange>`). Modal +
    modal-input variants; calendar highlights `rangeStart`, `rangeEnd`, and in-range cells
    (`secondary-container`/`on-secondary-container`); clamps end ≥ start. Extends the calendar with
    `rangeStart`/`rangeEnd` inputs + in-range rendering.
  - Spec `libs/ui/date-picker/src/date-range-picker.spec.ts`: selecting start then end produces an ordered
    `GuiDateRange`; an end before start is clamped; in-range cells flagged.
  - _Requirements: 6.4, 6.5, 6.9, 8.1, 8.5, 10.6_

- [ ] 23. Wire the demo host for range
  - Append the range spec to `libs/ui/project.json` `test.include`; add a range demo to `apps/web`.
  - _Requirements: 12.3, 12.4_

- [ ] 24. Checkpoint — Group E verification
  - Run `pnpm exec nx run-many -t lint test build -p ui web` — green.
  - Confirm range selection + in-range highlight in `nx serve web`; `main` green with A–E.

### Group F — Time picker (`@ngguide/ui/time-picker`) (new public component)

Dial + input time picker (12h/24h) composing `GuiFormControl<GuiTime>`, with an SVG clock dial. Blast
radius: **safe** — additive; depends on Groups A, B, C.

- [ ] 25. Scaffold the `@ngguide/ui/time-picker` entry point
  - Create `libs/ui/time-picker/ng-package.json` + `src/index.ts`.
  - Add `"@ngguide/ui/time-picker": ["libs/ui/time-picker/src/index.ts"]` to `tsconfig.base.json` `paths`.
  - _Requirements: 12.1, 12.2_

- [ ] 26. Implement the SVG clock dial
  - Create `libs/ui/time-picker/src/clock-dial.ts` (`gui-clock-dial`), `.html`, `.css`, and
    `time-picker-tokens.ts` (`GUI_CLOCK`: dial 256px, handle 48px, center 8px, track 2px). Inputs: `mode`
    (hours/minutes), `hour12`, `value` model. SVG numbers at `x = cx + r·sin θ`, `y = cy − r·cos θ`; 24h adds
    an inner ring (0/13–23). Pointer engine (pointerdown/move/up like the slider) maps angle → unit;
    keyboard arrows step the active unit. `GuiReducedMotion` gates the hand animation.
  - Spec `libs/ui/time-picker/src/clock-dial.spec.ts`: pointer angle maps to the expected hour/minute; 24h
    inner ring only when `hour12=false`; keyboard arrows step the unit.
  - _Requirements: 7.1, 7.3, 7.4, 10.4_

- [ ] 27. Implement the `TimePickerComponent`
  - Create `libs/ui/time-picker/src/time-picker.ts` (`gui-time-picker`), `.html`, `.css`. `hostDirectives`:
    `{ directive: GuiFormControl, inputs: ['value: time','disabled'], outputs: ['valueChange: timeChange']
    }` (`GuiFormControl<GuiTime>`). Inputs: `variant` (dial/input), `hour12` (null → `prefersHour12(locale)`),
    `locale`. Modal dialog (`overlay.openModal`); dial mode → `gui-clock-dial`; input mode → two
    `role="spinbutton"` fields (`aria-valuenow/min/max/text`) + AM/PM segment (12h). Keyboard-icon button
    toggles dial↔input. OK → `control.emit(time)` + `markTouched()`; Cancel dismisses without commit. Input
    validated via `parseTime` → error state.
  - Spec `libs/ui/time-picker/src/time-picker.spec.ts`: spinbutton `aria-valuemax` = 23 (24h) / 12 (12h);
    AM/PM present only in 12h; reactive-forms round-trip; cancel does not commit.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.2, 9.3, 10.2, 10.4, 10.5_

- [ ] 28. Register specs + wire the demo host
  - Append `../time-picker/src/clock-dial.spec.ts` and `../time-picker/src/time-picker.spec.ts` to
    `libs/ui/project.json` `test.include`.
  - Add a time-picker demo (dial + input, 12h + 24h) to `apps/web` bound via `FormControl<GuiTime>`.
  - _Requirements: 12.3, 12.4_

- [ ] 29. Final checkpoint — everything green
  - Run `pnpm exec nx run-many -t lint test build -p ui web` — full suite green.
  - All 12 requirements trace to a shipped task (see mapping across Groups A–F).
  - `pnpm exec nx serve web` exercises text-field, date-picker (docked/modal/modal-input/range), and
    time-picker (dial/input, 12/24h). Browser dogfood pass recommended for overlay-rendered surfaces (the
    selection-spec lesson: emulated-encapsulation / overlay-scoping defects are not caught by jsdom).

## Notes

### Scope boundaries

- **No external date library, no external overlay library, no form-state abstraction** — native `Date` +
  `Intl` + `@angular/cdk/overlay` only, per the requirements Constraints.
- **No `GuiSize` input** on text-field/pickers — M3 defines no size variation for these (deviation D3); a
  single fixed measurement set is used.
- **Text-field carries no CVA** (deviation D1) — forms flow through the consumer's projected native input.

### Codebase verification findings

- All integration points confirmed by the design-phase Explore agents: `GuiFormControl<T>` is type-generic
  and works for `Date`/`GuiDateRange`/`GuiTime`; `@angular/cdk@21.2.13` exports all overlay/portal/a11y
  symbols used; `createRovingFocus`, `GuiReducedMotion`, `gui-icon`, `gui-icon-button` all exist;
  content-projection + `contentChild`/`contentChildren` precedent exists (`segmented-button-group`,
  `chip-set`, `menu-item`). No `@angular/cdk` overlay CSS is imported anywhere yet → Task 9 adds it.
- `libs/ui/project.json` test executor is `@nx/angular:unit-test` with `runnerConfig
  libs/ui/vitest.config.ts`; new specs must be listed in `test.include` (Tasks 5, 10, 15, 20, 23, 28).
- No new peer dependency is required (`@angular/cdk` ^21.2.0 and `@angular/forms` ^21.0.0 already declared).
