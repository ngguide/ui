---
created: 2026-06-02
updated: 2026-06-02
---

# Requirements Document

## Introduction

This specification defines the Material Design 3 (M3) **Selection** component family for the
`@ngguide/ui` library: the controls a user employs to make and express choices — checkboxes, radio
buttons, switches, chips (assist / filter / input / suggestion), sliders, and menus. Each control
must match its m3.material.io guideline page 1:1 in anatomy, variants, sizes, states, and
accessibility behavior, with no invented appearance or behavior. The menu control additionally
serves as the canonical shared menu surface for the whole kit — the action-category menus (FAB menu,
split button) are expected to migrate onto it.

This document captures **what** the selection controls must do from the perspective of the consuming
developer, the end user, and assistive-technology users. It does not prescribe class names, file
layout, or library mechanics — those are decided in research and design.

## Glossary

- **Selection control**: any of the components in scope — checkbox, radio button, switch, chip,
  slider, menu.
- **Toggle control**: a checkbox, radio button, or switch — a control whose primary state is
  on/off (or, for radio, one-of-many).
- **Indeterminate**: a third visual state of a checkbox, distinct from checked and unchecked, used
  when the control represents a mix of checked and unchecked descendants.
- **Chip**: a compact element representing an input, attribute, or action. M3 defines four types:
  **assist**, **filter**, **input**, **suggestion**.
- **Chip set**: a container that lays out and coordinates keyboard navigation across a group of
  chips.
- **Slider**: a control for selecting a value (or a range of values) from a continuous or discrete
  range by dragging a handle (thumb) along a track.
- **Range slider**: a slider with two thumbs that selects a start and end value.
- **Value indicator**: the label that appears above a slider thumb showing the current value while
  the user interacts with it.
- **Menu**: a transient surface containing a list of choices, anchored to a trigger element.
- **Menu item**: a single selectable row within a menu.
- **Submenu (cascading menu)**: a menu opened from a menu item, presenting a nested set of choices.
- **Form system**: the host application's form binding and validation facility (the standard
  Angular forms surfaces — template-driven and reactive).
- **APG**: the WAI-ARIA Authoring Practices Guide, the reference for roles, keyboard interaction,
  and focus management.
- **Interaction foundation**: the existing shared state-layer / ripple / focus-ring behavior
  (`m3-interaction-foundation`) that every interactive control reuses.
- **Token contract**: the M3 design tokens published as CSS custom properties by `m3-tokens`
  (color, typography, shape, elevation, state, motion).

## Requirements

### Requirement 1: Checkbox

**User Story:** As an end user, I want a checkbox that I can check, uncheck, and recognize in a mixed
state, so that I can express binary and tri-state selections.

#### Acceptance Criteria

1. THE system SHALL present a checkbox with the M3 unchecked, checked, and indeterminate visual
   states, each matching the M3 checkbox guideline.
2. WHEN the user activates an unchecked checkbox THEN the system SHALL transition it to checked, and
   WHEN the user activates a checked checkbox THEN the system SHALL transition it to unchecked.
3. WHEN a checkbox is in the indeterminate state and the user activates it THEN the system SHALL
   transition it to checked.
4. THE system SHALL expose an error appearance for the checkbox per the M3 error state.
5. THE system SHALL expose a disabled appearance per M3, and WHEN a checkbox is disabled THEN the
   system SHALL NOT respond to pointer or keyboard activation and SHALL NOT change its value.
6. THE system SHALL render the M3 hover, focus, and pressed state layers via the interaction
   foundation and SHALL NOT re-implement those visuals.

### Requirement 2: Radio button

**User Story:** As an end user, I want radio buttons grouped together so that I can pick exactly one
option from a set.

#### Acceptance Criteria

1. THE system SHALL present a radio button with the M3 selected and unselected visual states.
2. WHEN radio buttons are grouped and the user selects one option THEN the system SHALL deselect the
   previously selected option in that group, so that at most one option in the group is selected.
3. THE system SHALL expose error and disabled appearances per M3, and WHEN a radio button is
   disabled THEN the system SHALL NOT respond to activation.
4. THE system SHALL render hover, focus, and pressed state layers via the interaction foundation.

### Requirement 3: Switch

**User Story:** As an end user, I want a switch that I can toggle on and off, so that I can change a
setting with immediate effect.

#### Acceptance Criteria

1. THE system SHALL present a switch with the M3 on (selected) and off (unselected) visual states,
   including the M3 handle size change between states.
2. THE system SHALL support an optional icon inside the handle for the on state, and optionally for
   both states, per the M3 switch guideline.
3. WHEN the user activates the switch THEN the system SHALL toggle between on and off.
4. THE system SHALL expose a disabled appearance per M3, and WHEN a switch is disabled THEN the
   system SHALL NOT respond to activation.
5. THE system SHALL render hover, focus, and pressed state layers via the interaction foundation.

### Requirement 4: Chips — types and content

**User Story:** As an end user, I want chips that represent inputs, attributes, and actions, so that
I can see and manipulate compact, contextual choices.

#### Acceptance Criteria

1. THE system SHALL provide the four M3 chip types — assist, filter, input, and suggestion — each
   matching its M3 guideline appearance and behavior.
2. THE system SHALL support a leading slot for an icon or avatar, per the chip types where M3 permits
   it.
3. WHEN a filter chip is selected THEN the system SHALL display the M3 selected appearance including
   the leading selected checkmark.
4. THE system SHALL support an elevated chip appearance (with M3 elevation) for the chip types where
   the M3 guideline allows it, in addition to the default outlined appearance.
5. THE system SHALL expose a disabled appearance per M3, and WHEN a chip is disabled THEN the system
   SHALL NOT respond to activation.
6. THE system SHALL render hover, focus, and pressed state layers via the interaction foundation.

### Requirement 5: Chips — removable (input chips) and trailing action

**User Story:** As an end user, I want to remove a chip I added, so that I can revise my set of
inputs.

#### Acceptance Criteria

1. THE system SHALL support a trailing remove affordance on chips that are removable, per the M3
   input-chip guideline.
2. WHEN the user activates the trailing remove affordance THEN the system SHALL emit a removal
   request identifying the chip, so that the consuming application can remove it.
3. WHEN a removable chip is focused and the user presses the platform removal keys (Delete or
   Backspace) THEN the system SHALL emit the same removal request.
4. THE system SHALL NOT remove the chip from the document on its own; removal of the chip is the
   consuming application's responsibility in response to the removal request.

### Requirement 6: Chip set (group)

**User Story:** As a keyboard user, I want to move between chips in a group with arrow keys, so that
I can navigate a set of chips efficiently.

#### Acceptance Criteria

1. THE system SHALL provide a chip-set container that lays out a group of chips per the M3 chip
   layout (including wrapping or horizontal scrolling per the guideline).
2. WHEN the user moves focus within a chip set using arrow keys THEN the system SHALL move focus
   between chips following the APG pattern, with a single tab stop into the set.
3. WHEN a chip is removed from a chip set THEN the system SHALL move focus to an adjacent chip per
   the APG guidance, so that keyboard focus is never lost.

### Requirement 7: Slider — continuous and discrete, single and range

**User Story:** As an end user, I want to drag a slider to choose a value or a range, so that I can
set a quantity within allowed bounds.

#### Acceptance Criteria

1. THE system SHALL provide a continuous slider and a discrete slider (with tick marks at each step)
   per the M3 slider guideline.
2. THE system SHALL provide a single-thumb slider and a range (two-thumb) slider.
3. THE system SHALL constrain the selectable value(s) to a configurable minimum, maximum, and step.
4. WHEN the user drags a thumb or operates it with the keyboard THEN the system SHALL display the M3
   value indicator showing the current value while the interaction is active.
5. WHEN the slider is a range slider THEN the system SHALL NOT allow the start thumb to cross past
   the end thumb (the start value stays less than or equal to the end value).
6. THE system SHALL expose a disabled appearance per M3, and WHEN a slider is disabled THEN the
   system SHALL NOT respond to pointer or keyboard interaction.
7. THE system SHALL render hover, focus, and pressed state layers on the thumb via the interaction
   foundation.

### Requirement 8: Menu and menu items

**User Story:** As an end user, I want a menu of choices anchored to the control I activated, so that
I can pick an action or option without leaving my current context.

#### Acceptance Criteria

1. THE system SHALL provide a menu surface that opens anchored to a trigger element and closes on
   selection, on dismissal (Escape or outside interaction), per the M3 menu guideline.
2. THE system SHALL provide menu items that match the M3 menu-item anatomy, including optional
   leading and trailing elements (e.g. a leading icon and a trailing shortcut hint or icon).
3. THE system SHALL support dividers and grouping of menu items per the M3 menu guideline.
4. THE system SHALL support disabled menu items, and WHEN navigating the menu THEN the system SHALL
   skip disabled items per the APG menu pattern while still exposing them to assistive technology.
5. THE system SHALL support cascading submenus opened from a menu item, with the submenu opening and
   closing per the APG menu pattern (keyboard and pointer).
6. THE system SHALL render hover, focus, and pressed state layers on menu items via the interaction
   foundation.
7. THE menu surface SHALL be reusable as the shared menu foundation for other components in the kit
   (the action-category FAB menu and split button), so that the kit has a single M3 menu
   implementation.

### Requirement 9: Value binding and form integration

**User Story:** As a consuming developer, I want each selection control to bind two-way and
participate in form validation, so that I can use them with my existing forms without custom glue.

#### Acceptance Criteria

1. THE system SHALL expose the current value of each control as a two-way binding so that the
   consuming application can read and set it.
2. WHEN a control's value changes through user interaction THEN the system SHALL emit the new value
   so that bound state updates.
3. THE system SHALL integrate with the host application's form system so that each control's value
   binds two-way and the control participates in form validation and disabled state through the
   standard form surfaces (template-driven and reactive).
4. WHEN the host marks a control as required or otherwise invalid THEN the system SHALL reflect the
   M3 error appearance for controls that define one.

### Requirement 10: Sizing and theming

**User Story:** As a design-system owner, I want the selection controls to follow M3 tokens and the
shared size scale, so that they stay visually consistent with the rest of the kit and re-theme
correctly.

#### Acceptance Criteria

1. THE system SHALL derive all color, typography, shape, elevation, state, and motion values from
   the M3 token contract (CSS custom properties), with no hard-coded values absent from the tokens.
2. WHEN the active M3 scheme changes (light/dark or a dynamically generated scheme) THEN the system
   SHALL reflect the new scheme without code changes, by virtue of consuming the token contract.
3. WHERE the M3 guideline defines a size scale for a control, THE system SHALL expose those sizes via
   the shared `GuiSize` scale, mapped to the M3 size tokens.
4. THE system SHALL meet WCAG 2.1 AA color contrast for its color roles in both light and dark
   schemes.

### Requirement 11: Accessibility (WAI-ARIA APG)

**User Story:** As an assistive-technology user, I want each selection control to expose the correct
role, state, and keyboard interaction, so that I can operate it the way the platform leads me to
expect.

#### Acceptance Criteria

1. THE checkbox SHALL follow the APG checkbox pattern, exposing checked / unchecked / mixed state and
   operability with the Space key.
2. THE radio group SHALL follow the APG radio-group pattern, including arrow-key navigation and a
   single tab stop into the group.
3. THE switch SHALL follow the APG switch pattern, exposing on/off state and operability with Space
   (and Enter where the platform expects it).
4. THE slider SHALL follow the APG slider (and multi-thumb slider) pattern, exposing current value,
   minimum, maximum, and arrow / Home / End / Page key operation; a range slider SHALL expose both
   thumb values.
5. THE chip set SHALL follow the applicable APG pattern for a focusable group with arrow-key
   navigation; removable chips SHALL expose their remove affordance to assistive technology.
6. THE menu SHALL follow the APG menu / menu-button pattern, including arrow navigation, Home/End,
   typeahead where applicable, Escape to close, and correct focus return to the trigger on close;
   submenus SHALL follow the APG submenu interaction.
7. THE system SHALL keep all selection controls fully operable by keyboard alone.
8. WHEN a control is disabled THEN the system SHALL expose the disabled state to assistive technology
   per the relevant APG pattern.

### Requirement 12: Packaging

**User Story:** As a consuming developer, I want each selection control as a granular import, so that
I only ship the controls I use.

#### Acceptance Criteria

1. THE system SHALL publish the selection controls as secondary entry points of `@ngguide/ui`
   (e.g. `@ngguide/ui/checkbox`), so that each is independently importable.
2. THE system SHALL build cleanly as part of the publishable library, and each published entry point
   SHALL have at least one passing spec on the native test runner.

## Constraints

- **Strict M3 fidelity** — every visual and behavioral choice MUST trace to a specific
  m3.material.io guideline. Where the guideline is ambiguous, the ambiguity is documented as an open
  question rather than guessed. (Project vision.)
- **Built from scratch** — controls MUST NOT wrap Angular Material or MDC Web. (Project non-goal.)
- **Angular 21, standalone, OnPush, signals, zoneless** — controls and their tests MUST NOT depend
  on Zone-based change detection. (Technical constraint.)
- **Reuse the interaction foundation** — hover/focus/pressed state layers, ripple, and focus ring
  MUST come from `m3-interaction-foundation`, not be re-implemented per control.
- **Consume the token contract** — styling MUST key off the `m3-tokens` CSS custom properties.
- **Form integration via the standard Angular forms surfaces** — controls MUST be usable with both
  template-driven and reactive forms (two-way value binding plus validation/disabled participation),
  in addition to signal-based two-way binding.
- **Menu is the shared surface** — the menu control MUST be designed so the existing action-category
  menus (FAB menu, split button) can migrate onto it, giving the kit a single M3 menu
  implementation.
- **Release / verdaccio / Nx release configuration is out of scope** and MUST NOT be changed.

## Non-functional Requirements

- **Accessibility**: meets the WAI-ARIA APG pattern for each control (roles, states, keyboard, focus
  management) and WCAG 2.1 AA color contrast for M3 color roles in both light and dark schemes.
- **SSR-safe**: controls render without a browser environment (no reliance on browser-only globals at
  module/render time), consistent with the zoneless, server-renderable posture of the kit.

## Superseded Behaviors

- **Action-category menus on a private `@angular/cdk/menu` wiring** (FAB menu, split button from the
  `actions` spec) → to be REPLACED BY the shared menu surface defined in Requirement 8. The migration
  itself is sequenced during this spec's design/tasks; the `actions` components keep working until
  they are moved over.
