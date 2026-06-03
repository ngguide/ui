---
created: 2026-06-03
updated: 2026-06-03
---

# Requirements Document

## Introduction

This specification defines the **Text inputs** component category of the `@ngguide/ui` Material
Design 3 (M3) library: the components a user types into or picks values with — **text fields**
(filled and outlined), **date pickers** (docked, modal, modal-input, and range), and **time
pickers** (dial and input, 12-hour and 24-hour). It is the sixth component category in the
ngguide-ui project and the last of the Phase-3 component specs to begin.

Every visual, behavioral, anatomical, and accessibility detail must trace to the published M3
guideline at [m3.material.io](https://m3.material.io/) — text fields, date pickers, and time
pickers — and to the WAI-ARIA Authoring Practices Guide (APG) for keyboard and screen-reader
behavior. No improvised styling or behavior. Where the spec is ambiguous, the open question is
documented rather than guessed.

The components reuse the foundation already shipped: the M3 token contract (`m3-tokens`), the
interaction directives — state layer / ripple / focus ring (`m3-interaction-foundation`), and the
shared form-control value accessor (`GuiFormControl`, `@ngguide/ui/forms`) introduced by the
`selection` spec. Pickers surface their calendars and clock faces in floating panels and present
calendar/clock values computed from the platform's native date facilities.

## Glossary

- **Text field**: A single control that lets a user enter and edit text, with M3 anatomy (container,
  label, input region, optional leading/trailing icons, supporting text, etc.).
- **Filled text field**: The M3 text-field style with a filled container and a bottom activation
  indicator (underline).
- **Outlined text field**: The M3 text-field style with an outlined container (border) and the label
  notched into the outline.
- **Label**: The text identifying what the field is for. It rests inside the field when empty and
  unfocused, and moves to a floating position above the input region when the field is focused or
  populated.
- **Supporting text**: Helper text shown beneath the field that gives additional guidance.
- **Error text**: Supporting text shown in the error color when the field is in an invalid state.
- **Leading icon / trailing icon**: Icons placed at the start / end of the field. A trailing icon may
  be interactive (e.g. a clear button or password-visibility toggle).
- **Prefix / suffix**: Static text shown immediately before / after the user's input within the input
  region (e.g. `$` prefix, `.00` suffix, `@gmail.com` suffix).
- **Character counter**: A count shown at the end of the supporting-text row indicating how many
  characters have been entered against a maximum.
- **Multiline text field (text area)**: A text field that accepts and displays multiple lines of text
  and grows in height with its content.
- **Date picker**: A component that lets a user select a date (or date range). M3 defines docked,
  modal, and modal-input variants.
- **Docked date picker**: A calendar shown in a floating panel anchored to a text field, intended for
  pointer-based selection on larger screens.
- **Modal date picker**: A calendar shown in a centered modal dialog with a header, supporting both
  calendar selection and a toggle to keyboard date entry.
- **Modal input (date)**: A modal dialog that collects the date purely through a text-entry field, with
  no calendar grid.
- **Date range picker**: A picker that selects a start date and an end date, highlighting the range
  between them.
- **Time picker**: A component that lets a user select a time of day. M3 defines a dial variant and an
  input variant.
- **Dial (time)**: A circular clock face with a movable clock hand for selecting hours then minutes by
  pointer.
- **Time input**: Two adjacent fields for typing the hour and minute, with an AM/PM selector when in
  12-hour mode.
- **Trigger field**: The text field a user interacts with to open a picker's floating panel or dialog.
- **Floating panel**: A transient surface (docked panel or modal dialog) that presents the
  calendar/clock and dismisses on selection, outside click, or Escape.
- **GuiFormControl**: The shared form-control host directive (`@ngguide/ui/forms`) that exposes a value
  model and integrates the host as an Angular form control (ngModel / reactive forms) — already used by
  the selection controls.
- **GuiSize**: The shared `'xs' | 'sm' | 'md' | 'lg' | 'xl'` size scale defined in `@ngguide/ui`.
- **Secondary entry point**: A granular import path under the published package, e.g.
  `@ngguide/ui/text-field`.
- **APG**: WAI-ARIA Authoring Practices Guide — the reference for ARIA roles, states, and keyboard
  interaction patterns.

## Requirements

### Requirement 1: Filled and outlined text fields

**User Story:** As an app developer, I want filled and outlined M3 text fields so that users can enter
single-line text in either of the two M3 container styles.

#### Acceptance Criteria

1. THE system SHALL provide a text field in two M3 styles — **filled** and **outlined** — selectable by
   the consumer, with the resting container, label position, and activation/border treatment matching
   the corresponding M3 text-field anatomy.
2. THE system SHALL render a label that rests within the input region when the field is empty and
   unfocused, and animates to a floating position (above the input region for outlined; at the top of
   the container for filled) when the field is focused or contains a value.
3. WHEN the field is focused THEN the system SHALL display the M3 focused treatment (filled: thicker
   bottom activation indicator in the primary color; outlined: thicker outline in the primary color)
   and the label SHALL adopt the focused color.
4. THE system SHALL apply the M3 hover state treatment WHEN the user hovers the field, distinct from
   the resting and focused states.
5. THE system SHALL support a disabled state that is non-interactive and rendered with the M3 disabled
   color/opacity treatment, and SHALL NOT accept input or focus while disabled.
6. THE system SHALL expose the entered value through a model that integrates with Angular forms (see
   Requirement 8) and SHALL keep the displayed text and the model value in sync.
7. THE system SHALL place text fields on a single shared M3 size baseline consistent with the rest of
   the library, and SHALL NOT introduce non-M3 visual variants of the field.

### Requirement 2: Label, supporting text, and error state

**User Story:** As an app developer, I want labels, supporting text, and an error state so that fields
communicate their purpose and validity to users.

#### Acceptance Criteria

1. THE system SHALL display optional supporting text beneath the field, styled per the M3 supporting-text
   role.
2. WHEN the field is marked invalid THEN the system SHALL render the M3 error treatment — error color on
   the label, activation indicator/outline, and supporting text — and SHALL surface an error message in
   place of (or in addition to) the supporting text per M3.
3. THE system SHALL expose the field's required/optional status to the user per M3 (e.g. via the label
   and an accessible required indication) when the consumer marks the field as required.
4. THE system SHALL associate the label, supporting text, and error text with the input region so that
   assistive technology announces them when the input is focused.
5. THE system SHALL NOT lose the floating-label state while an error is shown (the label remains in its
   floating position when the field has focus or a value).

### Requirement 3: Leading and trailing icons

**User Story:** As an app developer, I want leading and trailing icons in text fields so that I can add
visual affordances and inline actions (clear, reveal password, etc.).

#### Acceptance Criteria

1. THE system SHALL provide a leading-icon slot rendered at the start of the input region per the M3
   leading-icon anatomy and spacing.
2. THE system SHALL provide a trailing-icon slot rendered at the end of the input region per the M3
   trailing-icon anatomy and spacing.
3. THE system SHALL support an interactive trailing icon (e.g. a clear button or password-visibility
   toggle) that is keyboard-focusable, operable with Enter/Space, and exposes an accessible label.
4. WHEN the field is in the error state THEN the system SHALL render the trailing icon in the M3 error
   color where M3 specifies an error trailing icon.
5. THE system SHALL keep the input text horizontally inset so it never overlaps a present leading or
   trailing icon.

### Requirement 4: Prefix, suffix, and character counter

**User Story:** As an app developer, I want prefix/suffix text and a character counter so that fields can
show inline affixes and communicate length limits.

#### Acceptance Criteria

1. THE system SHALL support optional prefix text rendered immediately before the user's input within the
   input region, and optional suffix text rendered immediately after it, both styled per M3.
2. THE system SHALL only reveal the prefix/suffix when the field is populated or focused, consistent with
   M3 (so they do not visually collide with the resting label).
3. WHEN the consumer sets a maximum character length THEN the system SHALL display a character counter at
   the end of the supporting-text row in the form `current / max`.
4. WHEN the entered length reaches or exceeds the maximum THEN the system SHALL reflect that state per M3
   (the field enters the error treatment) and SHALL expose the over-limit condition to assistive
   technology.
5. THE system SHALL keep the counter value synchronized with the actual entered text length.

### Requirement 5: Multiline text field (text area)

**User Story:** As an app developer, I want a multiline text field so that users can enter longer,
wrapping text.

#### Acceptance Criteria

1. THE system SHALL provide a multiline variant that accepts and displays multiple lines of wrapping
   text using the same M3 container styles (filled and outlined).
2. THE system SHALL grow the field's height to fit its content as the user types, per the M3 text-area
   behavior, and SHALL support a consumer-specified minimum and maximum number of visible rows.
3. THE system SHALL keep the label, supporting text, error state, character counter, and icon slots
   (Requirements 2–4) available in the multiline variant where M3 permits them.
4. THE system SHALL retain the floating-label and focus/error treatments (Requirements 1–2) in the
   multiline variant.

### Requirement 6: Date pickers

**User Story:** As an app developer, I want M3 date pickers so that users can select a single date or a
date range through a calendar or by typing.

#### Acceptance Criteria

1. THE system SHALL provide a **docked date picker**: a trigger text field that opens a calendar in a
   floating panel anchored to the field, with month navigation and selectable day cells per the M3
   docked anatomy.
2. THE system SHALL provide a **modal date picker**: a centered modal dialog containing a header, a
   calendar, and confirm/cancel actions, with a control to switch between calendar selection and keyboard
   date entry per M3.
3. THE system SHALL provide a **modal input** date picker: a modal dialog that collects the date through
   a text-entry field only (no calendar grid), with confirm/cancel actions.
4. THE system SHALL provide a **date range picker** that selects a start and end date, visually
   highlighting the selected endpoints and the dates between them, and SHALL prevent an end date earlier
   than the start date.
5. WHEN a user selects a date (or completes a range) THEN the system SHALL update the field's displayed
   value and the form model (Requirement 8), and SHALL dismiss the floating panel/dialog as specified by
   the variant.
6. THE system SHALL let the consumer constrain selectable dates to a minimum date, a maximum date, and/or
   a per-date enabled/disabled predicate, and SHALL render disabled dates as non-selectable.
7. THE system SHALL display month, weekday, and date text, and parse/format typed dates, using the active
   locale's conventions (including the locale's first day of week) — see the Constraints and
   Non-functional Requirements sections.
8. WHEN a user types a date into a date field THEN the system SHALL parse it according to the active
   locale and reflect an unparseable or out-of-range entry as an error state (Requirement 2).
9. THE system SHALL dismiss an open picker panel/dialog when the user presses Escape, clicks/taps outside
   it (for non-blocking variants), or activates the cancel action, without committing an unconfirmed
   value where the variant requires explicit confirmation.

### Requirement 7: Time pickers

**User Story:** As an app developer, I want M3 time pickers so that users can select a time using a clock
dial or by typing, in 12-hour or 24-hour format.

#### Acceptance Criteria

1. THE system SHALL provide a **dial** time picker: a modal containing a circular clock face with a
   movable clock hand, selecting the hour first and then the minute, per the M3 time-picker anatomy.
2. THE system SHALL provide an **input** time picker: a modal containing two text fields for entering the
   hour and the minute directly.
3. WHEN a time picker is in 12-hour mode THEN the system SHALL present an AM/PM selector and constrain the
   hour to 1–12; WHEN in 24-hour mode THEN the system SHALL omit the AM/PM selector and constrain the hour
   to 0–23.
4. THE system SHALL let the consumer choose the dial or input variant and switch between them within the
   modal where M3 provides that control.
5. WHEN a user confirms a time THEN the system SHALL update the field's displayed value and the form model
   (Requirement 8) using the active locale's time format, and SHALL dismiss the modal; the cancel action
   SHALL dismiss without committing.
6. THE system SHALL reject and surface invalid typed times (hour/minute out of range) as an error state.

### Requirement 8: Angular forms integration

**User Story:** As an app developer, I want every text input to work as a standard Angular form control
so that I can bind it with `ngModel` or reactive forms exactly like the selection controls.

#### Acceptance Criteria

1. THE system SHALL expose each text input (text field, date picker, time picker) as an Angular form
   control that supports two-way value binding and participates in `ngModel` and reactive-forms bindings,
   consistent with the shared form-control behavior used by the selection components.
2. WHEN a form disables the control THEN the system SHALL reflect the disabled treatment and stop
   accepting input, and WHEN the form enables it THEN the system SHALL resume accepting input.
3. THE system SHALL report touched/untouched and value-change events to the bound form so that consumer
   validation reacts to user interaction.
4. WHEN the bound model value changes programmatically THEN the system SHALL update the displayed value
   without emitting a spurious user-initiated change event.
5. THE system SHALL surface the control's validity (e.g. unparseable date, out-of-range time, over-limit
   length) to the bound form so consumers can drive their own validation messages, while the component
   renders its own M3 error treatment.

### Requirement 9: Floating panels, overlay, and dismissal behavior

**User Story:** As a user, I want picker panels and dialogs to open, position, and dismiss predictably so
that I can pick a value without getting trapped or losing my place.

#### Acceptance Criteria

1. THE system SHALL open a docked date picker's panel anchored to its trigger field, repositioning to stay
   within the viewport, and SHALL close it on outside click, Escape, or selection per the variant.
2. THE system SHALL present modal date and time pickers as centered, focus-trapped dialogs with a scrim,
   returning focus to the trigger field on dismissal.
3. WHEN a picker panel/dialog opens THEN the system SHALL move focus into it (to the appropriate initial
   element per APG) and SHALL restore focus to the trigger when it closes.
4. THE system SHALL prevent interaction with the underlying page while a modal picker is open and SHALL
   allow it for a non-modal docked panel.

### Requirement 10: Accessibility (WAI-ARIA APG + M3)

**User Story:** As an assistive-technology user, I want text inputs and pickers to expose correct roles,
states, and keyboard interaction so that I can use them without sight or a pointer.

#### Acceptance Criteria

1. THE system SHALL associate each text field's input region with its label, supporting/error text, and
   required/invalid state via the appropriate accessible name and description and an invalid indication,
   so screen readers announce them on focus.
2. THE system SHALL make every interactive element (input, trailing-icon button, calendar day, clock
   number, AM/PM selector, dialog actions) reachable and operable by keyboard alone.
3. THE system SHALL implement the date picker's calendar as the APG grid pattern: arrow keys move between
   days, Page Up/Page Down change month, Home/End move within the week, and Enter/Space selects the
   focused date.
4. THE system SHALL implement the time picker's keyboard interaction per APG (dial selection operable from
   the keyboard; input fields behave as spin/number entry), with the selected hour/minute exposed to
   assistive technology.
5. WHEN a picker opens THEN the system SHALL manage focus per Requirement 9 and APG (focus into the panel,
   focus trap for modal, focus restoration on close).
6. THE system SHALL convey the current selection, focused date/time, and out-of-range/disabled states to
   assistive technology through appropriate ARIA states.
7. THE system SHALL maintain the M3 color roles such that text, icons, and indicators meet WCAG 2.1 AA
   contrast in both light and dark schemes (see Non-functional Requirements).

### Requirement 11: Sizing, theming, and tokens

**User Story:** As a design-system owner, I want text inputs to derive every visual value from the M3 token
contract so that they stay in sync with the theme and dynamic color.

#### Acceptance Criteria

1. THE system SHALL derive all colors, typography, shape, elevation, and state-layer values from the
   `--md-sys-*` token contract and SHALL NOT hard-code colors, spacing, or motion outside that contract.
2. THE system SHALL respond to runtime theme and dynamic-color changes (light/dark, source-color reseed)
   without requiring component re-instantiation, by virtue of consuming CSS custom properties.
3. THE system SHALL apply the interaction foundation (state layer, ripple where M3 specifies it, focus
   ring) to interactive elements via the shared `m3-interaction-foundation` directives rather than
   bespoke implementations.
4. THE system SHALL use the shared `GuiSize` scale where M3 defines size variation for these components,
   and SHALL NOT invent sizes outside that scale.

### Requirement 12: Packaging and library conventions

**User Story:** As a consumer of `@ngguide/ui`, I want text inputs delivered as tree-shakable entry points
that follow the library's conventions so that imports and builds stay consistent.

#### Acceptance Criteria

1. THE system SHALL publish the text-input components as secondary entry points under `@ngguide/ui/*`
   following the existing per-component entry-point structure, each with its own barrel and build wiring.
2. THE system SHALL implement every component as a standalone, `OnPush`, signal-based Angular 21 component
   that is zoneless-safe.
3. THE system SHALL provide at least one passing spec per published entry point on the native Angular
   Vitest runner, with secondary-entry specs registered in the `ui` test target's `include` list.
4. THE system SHALL keep `pnpm exec nx run-many -t lint test build` green for `ui` and `web`, and SHALL
   exercise each component in the `apps/web` demo host.
5. THE system SHALL declare any new runtime peer dependency it introduces (e.g. the overlay primitives) in
   the library's peer dependencies, consistent with how forms support was declared for the selection
   components.

## Constraints

These are stated technical constraints for the research/design phase to honor (or push back on with
evidence):

- **Reuse the shared form-control value accessor** (`GuiFormControl`, `@ngguide/ui/forms`) for forms
  integration, so text inputs behave identically to the selection controls under `ngModel`/reactive forms
  rather than introducing a second forms mechanism.
- **Use the platform-native date facilities plus `@angular/cdk/overlay`** for calendar computation and
  floating panels/dialogs — no external date library and no external overlay library. (`@angular/cdk` is
  already a dependency and its overlay is already used by the menu component.)
- **Localize via the platform-native `Intl` APIs** (`Intl.DateTimeFormat` and locale data) for month/day
  names, formatting, and first-day-of-week — no bundled locale tables.
- **Strict M3 adherence** per `vision.md`: only behavior and visuals defined by the M3 text-field, date-
  picker, and time-picker guidelines; no improvised variants.

## Non-functional Requirements

- **Accessibility**: Full WAI-ARIA APG conformance for the text-field, grid (calendar), and time-picker
  patterns, and WCAG 2.1 AA color contrast for all M3 color roles used, in both light and dark schemes.
- **Internationalization**: Month/weekday names, date/time formatting and parsing, and first-day-of-week
  derive from the active locale via native `Intl` — correct for at least the browser/default locale
  without code changes.
- **Framework conformance**: Standalone + `OnPush` + signal inputs/outputs, zoneless-safe (no `zone.js`
  dependency), per the project's Angular 21 conventions.

## Superseded Behaviors

This feature is entirely additive (new entry points); it does not modify or remove existing functionality.
