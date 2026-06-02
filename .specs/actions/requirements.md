---
created: 2026-06-02
updated: 2026-06-02
---

# Requirements Document

## Introduction

This specification covers the complete **Material Design 3 (M3) "Actions"** component
catalog for `@ngguide/ui`: common buttons, icon buttons, FAB, extended FAB, FAB menu,
segmented buttons, split button, and button groups. It also **retrofits** the three
existing entry points (`button`, `fab`, `icon`) onto the shared M3 token contract and
the M3 interaction foundation, resolving their open `// todo: icon` and `// todo: toggled`
placeholders.

Every visual and behavioral requirement below traces to the published guidelines at
[m3.material.io](https://m3.material.io/). No variant, size, state, or behavior is in
scope unless M3 defines it; where M3 is ambiguous, the ambiguity is recorded as an open
question rather than guessed. The shipped components consume — but do not define — the M3
color/typography/shape/elevation/state/motion token contract and the M3 interaction
behaviors (state layer, ripple, focus ring) provided by other specs.

## Glossary

- **Action component**: Any interactive M3 control whose primary purpose is to trigger an
  action — the components enumerated in this document.
- **Variant**: A named M3 appearance of a component sharing the same behavior but differing
  in container fill, outline, and color role (e.g. *elevated*, *filled*, *filled tonal*,
  *outlined*, *text* for common buttons).
- **Container**: The visible shape (background, outline, corner radius, elevation) that
  holds a component's label and/or icon.
- **Size scale**: The M3 expressive size steps **extra-small, small, medium, large,
  extra-large**, surfaced through the shared `GuiSize` (`xs | sm | md | lg | xl`) contract,
  affecting height, padding, icon size, label type, and corner radius.
- **State**: An M3 interaction state — enabled, disabled, hovered, focused, pressed, and
  (for toggle components) selected/unselected — each with defined visual treatment.
- **State layer**: The translucent overlay tinting a component on hover/focus/pressed/
  dragged, provided by the M3 interaction foundation.
- **Toggle / selected**: A component that holds an on/off state, switching between
  *unselected* and *selected* appearances when activated.
- **Shape morph**: The M3 expressive change of container corner radius in response to a
  state change (e.g. pressed, or selected), animated per the M3 motion tokens.
- **FAB**: Floating Action Button — a prominent circular/rounded action container available
  in small, regular (baseline), and large sizes and in defined color mappings.
- **Extended FAB**: A FAB that additionally displays a text label beside its icon and can
  collapse to an icon-only FAB.
- **FAB menu**: A FAB that, when activated, reveals a set of related action items.
- **Segmented buttons**: A horizontal set of 2–5 connected segments representing a
  single-select or multi-select choice.
- **Split button**: A two-part action control — a leading primary action plus a trailing
  control that reveals additional choices.
- **Button group**: A set of related buttons displayed together (connected or standard)
  that share grouping behavior and M3 expressive press/shape behavior.
- **Token contract**: The `--md-sys-*` CSS custom properties defined by the `m3-tokens`
  spec that components style against.
- **Demo host**: The unpublished `apps/web` application used to exercise components.

## Requirements

### Requirement 1: Common button variants

**User Story:** As an app developer, I want the five M3 common-button variants so that I can
express action emphasis exactly as the M3 guideline prescribes.

#### Acceptance Criteria

1. THE system SHALL provide common buttons in all five M3 variants: **elevated**, **filled**,
   **filled tonal**, **outlined**, and **text**.
2. Each variant SHALL render the container fill, outline, elevation, label color, and icon
   color defined for that variant by the M3 common-button guideline, sourced from the token
   contract.
3. WHEN a button is rendered as a link (anchor) versus a button element THEN the system
   SHALL preserve identical M3 appearance and states across both.
4. THE system SHALL NOT introduce any common-button variant, fill, or color treatment not
   defined by the M3 common-button guideline.

### Requirement 2: Button size scale (xs–xl)

**User Story:** As an app developer, I want the full M3 expressive button size scale so that
buttons match the height, padding, type, icon size, and corner radius M3 defines per size.

#### Acceptance Criteria

1. THE system SHALL support all five M3 size steps — extra-small, small, medium, large,
   extra-large — selectable through the shared `GuiSize` contract.
2. WHEN a size is selected THEN the system SHALL apply the container height, horizontal
   padding, label type scale, icon size, and default corner radius M3 defines for that size.
3. THE system SHALL default to the M3 baseline size when no size is specified.
4. THE system SHALL NOT expose sizes or per-size measurements absent from the M3 size scale.

### Requirement 3: Toggle / selected behavior

**User Story:** As an app developer, I want buttons and icon buttons that can be toggled so
that I can represent a binary on/off action per M3, replacing the existing `// todo: toggled`.

#### Acceptance Criteria

1. THE system SHALL allow common buttons and icon buttons to be configured as toggleable.
2. WHEN a toggleable component is activated THEN the system SHALL switch between the M3
   *unselected* and *selected* appearances (container fill and color role) defined for that
   component and variant.
3. THE system SHALL expose the current selected state to assistive technology as a pressed/
   toggle state and SHALL emit an observable change when the selected state changes.
4. WHEN a toggleable component is controlled by the consumer THEN the system SHALL reflect
   the externally supplied selected state without overriding it on activation.
5. THE system SHALL NOT apply selected styling to non-toggleable components.

### Requirement 4: Button shape and shape morph

**User Story:** As a design-system owner, I want button corners and the M3 expressive shape
morph so that container shape matches M3 across default, pressed, and selected states.

#### Acceptance Criteria

1. THE system SHALL apply the default container corner radius M3 defines for each component,
   variant, and size from the shape token contract.
2. WHEN a button is pressed THEN the system SHALL morph the container shape to the M3
   pressed-state shape and SHALL return to the resting shape on release.
3. WHEN a toggleable button becomes selected THEN the system SHALL apply the M3
   selected-state shape where the guideline defines one.
4. THE system SHALL animate shape transitions using the M3 motion duration and easing tokens.
5. WHEN the user has requested reduced motion THEN the system SHALL present the end-state
   shape without the morph animation.

### Requirement 5: Button icon slot

**User Story:** As an app developer, I want to place an icon in a button so that I can build
the icon+label and icon-only layouts M3 defines, replacing the existing `// todo: icon`.

#### Acceptance Criteria

1. THE system SHALL allow an optional leading icon alongside a button's text label.
2. WHEN an icon is present THEN the system SHALL size and space it according to the M3
   layout for the active variant and size.
3. THE system SHALL size icons consistently with the M3 icon-size step for the active button
   size.
4. THE system SHALL NOT require an icon for any variant that M3 allows without one.

### Requirement 6: Icon buttons

**User Story:** As an app developer, I want M3 icon buttons so that I can present icon-only
actions in every M3 icon-button variant, width, and size.

#### Acceptance Criteria

1. THE system SHALL provide icon buttons in all M3 icon-button variants (standard, filled,
   filled tonal, outlined).
2. THE system SHALL support the M3 icon-button width options (e.g. narrow / default / wide)
   and the size scale defined by the M3 icon-button guideline.
3. THE system SHALL support toggleable icon buttons with distinct M3 unselected and selected
   appearances (per Requirement 3).
4. THE system SHALL expose an accessible name for every icon button (icon-only controls
   have no visible text label).
5. THE system SHALL NOT render icon-button treatments absent from the M3 icon-button guideline.

### Requirement 7: FAB

**User Story:** As an app developer, I want the M3 FAB in all its sizes and color mappings so
that I can present a primary screen action exactly as M3 specifies.

#### Acceptance Criteria

1. THE system SHALL provide a FAB in the M3 sizes: small, baseline (regular), and large.
2. THE system SHALL provide the M3 FAB color mappings (e.g. surface, primary, secondary,
   tertiary) sourced from the token contract.
3. THE system SHALL apply the container shape, elevation, icon size, and state behavior M3
   defines per FAB size.
4. THE system SHALL expose an accessible name for the FAB.
5. THE system SHALL NOT introduce FAB sizes, colors, or elevations absent from the M3 FAB
   guideline.

### Requirement 8: Extended FAB

**User Story:** As an app developer, I want the M3 extended FAB so that I can show a labeled
primary action that can collapse to an icon-only FAB.

#### Acceptance Criteria

1. THE system SHALL provide an extended FAB displaying an icon and a text label with the M3
   container, type, and spacing.
2. THE system SHALL allow the extended FAB to collapse to and expand from an icon-only FAB.
3. WHEN the extended FAB collapses or expands THEN the system SHALL animate the transition
   using the M3 motion tokens, and SHALL present the end state directly under reduced motion.
4. THE system SHALL apply the M3 color mappings consistent with the FAB (Requirement 7).
5. THE system SHALL NOT introduce extended-FAB treatments absent from the M3 guideline.

### Requirement 9: FAB menu

**User Story:** As an app developer, I want the M3 FAB menu so that activating a FAB can
reveal a set of related actions per M3.

#### Acceptance Criteria

1. THE system SHALL provide a FAB menu that, when its FAB is activated, reveals a set of
   M3-styled action items and hides them when dismissed.
2. WHEN the FAB menu is open THEN the system SHALL convey the expanded/collapsed state to
   assistive technology and SHALL allow keyboard dismissal.
3. THE system SHALL animate opening and closing using the M3 motion tokens, presenting end
   states directly under reduced motion.
4. THE system SHALL style only the FAB and its action items per M3; the overlay/menu
   container behavior is consumed as an external dependency (see Constraints) and SHALL NOT
   be reimplemented here.
5. THE system SHALL NOT introduce FAB-menu treatments absent from the M3 guideline.

### Requirement 10: Segmented buttons

**User Story:** As an app developer, I want M3 segmented buttons so that I can present a
connected single- or multi-select choice of 2–5 options.

#### Acceptance Criteria

1. THE system SHALL render 2 to 5 connected segments as a single horizontal group with the
   M3 container, outline, and shared shape.
2. THE system SHALL support both single-select and multi-select modes per the M3 segmented-
   button guideline.
3. WHEN a segment is selected THEN the system SHALL apply the M3 selected appearance,
   including the selection checkmark where M3 specifies it.
4. THE system SHALL provide keyboard navigation and selection across segments consistent
   with the M3 spec and WAI-ARIA APG, and SHALL expose each segment's selected state to
   assistive technology.
5. THE system SHALL NOT allow fewer than 2 or more than 5 segments, nor selection treatments
   absent from the M3 guideline.

### Requirement 11: Split button

**User Story:** As an app developer, I want the M3 split button so that I can offer a primary
action plus a trailing control that reveals related choices.

#### Acceptance Criteria

1. THE system SHALL render a split button with a leading primary action and a trailing
   control as a single connected M3 container.
2. WHEN the trailing control is activated THEN the system SHALL reveal the related choices
   and convey the expanded/collapsed state to assistive technology.
3. THE system SHALL apply the M3 expressive press behavior (including shape morph per
   Requirement 4) to the split-button parts.
4. THE system SHALL style only the split-button parts and their trigger per M3; the
   overlay/menu container behavior is consumed as an external dependency (see Constraints).
5. THE system SHALL NOT introduce split-button treatments absent from the M3 guideline.

### Requirement 12: Button groups

**User Story:** As an app developer, I want M3 button groups so that I can display related
buttons together with the M3 connected/standard grouping and expressive press behavior.

#### Acceptance Criteria

1. THE system SHALL arrange a set of related buttons as an M3 button group in the connected
   and standard configurations the guideline defines.
2. THE system SHALL apply the M3 group spacing, shared shape, and per-item shape behavior,
   including the expressive press interaction (Requirement 4).
3. THE system SHALL provide keyboard navigation across grouped buttons consistent with the
   M3 spec and WAI-ARIA APG.
4. THE system SHALL NOT introduce grouping configurations or treatments absent from the M3
   button-group guideline.

### Requirement 13: Interaction states

**User Story:** As an a11y-dependent end user, I want consistent hover, focus, and pressed
feedback so that every action component behaves predictably and visibly.

#### Acceptance Criteria

1. THE system SHALL present hover, focus, and pressed feedback on every action component
   using the M3 state-layer, ripple, and focus-ring behaviors from the interaction
   foundation, driven by the `--md-sys-state-*` token contract.
2. WHEN a component receives keyboard focus THEN the system SHALL display the M3 focus
   indicator.
3. THE system SHALL NOT define its own state-layer opacities, ripple, or focus-ring visuals
   independent of the interaction foundation.

### Requirement 14: Disabled state

**User Story:** As an app developer, I want a disabled state on every action component so
that unavailable actions look and behave inert per M3.

#### Acceptance Criteria

1. THE system SHALL render a disabled appearance for every action component using the M3
   disabled container and content opacities from the token contract.
2. WHEN a component is disabled THEN the system SHALL suppress hover, focus, pressed, ripple,
   and activation, and SHALL NOT emit activation or selection-change events.
3. THE system SHALL convey the disabled state to assistive technology.
4. WHEN a disabled component is also toggleable THEN the system SHALL preserve and display
   its current selected/unselected state without allowing it to change.

### Requirement 15: Accessibility and keyboard interaction

**User Story:** As an a11y-dependent end user, I want correct roles, names, and keyboard
operation so that I can use every action component without a pointer.

#### Acceptance Criteria

1. THE system SHALL expose the correct role, accessible name, and state (pressed/expanded/
   selected/disabled) for each component consistent with the M3 spec and WAI-ARIA APG.
2. THE system SHALL make every action component fully operable by keyboard, including
   activation and, for grouped/segmented/split components, navigation between items.
3. THE system SHALL manage focus for composite components (segmented buttons, split button,
   button groups, FAB menu) per the WAI-ARIA APG pattern, including a single group tab stop
   where the pattern requires it.
4. THE system SHALL meet WCAG 2.1 AA color-contrast for component content against its
   container in both light and dark schemes.

### Requirement 16: Theming via the token contract

**User Story:** As a design-system owner, I want components themed only through M3 tokens so
that light/dark and dynamic-color schemes apply without component changes.

#### Acceptance Criteria

1. THE system SHALL derive every color, typography, shape, elevation, state, and motion value
   from the `--md-sys-*` token contract.
2. WHEN the active scheme changes (light ↔ dark, or a dynamically generated scheme) THEN the
   system SHALL reflect the new token values without code changes to the components.
3. THE system SHALL NOT hard-code color, spacing, shape, or motion values outside the token
   contract.

### Requirement 17: Retrofit existing entry points

**User Story:** As the library maintainer, I want the existing `button`, `fab`, and `icon`
entry points retrofitted onto the token + interaction foundation so that the whole Actions
catalog is consistent and the open `// todo` placeholders are resolved.

#### Acceptance Criteria

1. THE system SHALL migrate the existing `button`, `fab`, and `icon` entry points to consume
   the M3 token contract and the M3 interaction foundation.
2. THE system SHALL resolve the existing `// todo: icon` (button icon slot) and
   `// todo: toggled` (toggle/selected) placeholders per Requirements 3 and 5.
3. THE system MAY introduce breaking changes to the public API of the existing entry points
   where required for strict M3 conformance; such changes SHALL be documented for consumers.
4. THE system SHALL keep every existing and new entry point building, linting, and passing
   its specs after the retrofit.

### Requirement 18: Packaging, testing, and demo coverage

**User Story:** As the library maintainer, I want each component shipped as a tested,
demoable secondary entry point so that the catalog stays publishable and verifiable.

#### Acceptance Criteria

1. THE system SHALL expose each component as a secondary entry point under `@ngguide/ui/<name>`
   with its own barrel, build wiring, and at least one passing spec on the native Vitest runner.
2. THE system SHALL exercise each component in the demo host so its variants, sizes, states,
   and toggle/selection behavior can be verified interactively.
3. THE system SHALL keep `lint`, `test`, and `build` green for the `ui` and `web` projects.
4. THE system SHALL keep components SSR-safe (zoneless, no direct DOM/browser-API access at
   construction) consistent with the rest of the library.

## Constraints

- **Strict M3 fidelity** — every anatomy, variant, size, state, measurement, token, and a11y
  behavior must trace to a specific m3.material.io guideline; ambiguities are recorded as open
  questions, not guessed. (Project vision rule.)
- **Token contract is consumed, not defined** — components style only against the `m3-tokens`
  `--md-sys-*` contract; dynamic scheme generation belongs to `m3-dynamic-color`.
- **Interaction behaviors are consumed, not defined** — state layer, ripple, and focus ring
  come from `m3-interaction-foundation`.
- **Menu/overlay is an external dependency** — FAB menu and split button rely on the M3 menu
  overlay (positioning, dismissal, container) which belongs to the `selection` spec; this spec
  styles only the action trigger and items and integrates with that overlay as a dependency
  (or a temporary stand-in until it exists).
- **Angular 21 / zoneless / single publishable library with secondary entry points** — the
  established library conventions (standalone, OnPush, signal inputs, attribute selectors,
  host-driven attributes, native Vitest, enforced module boundaries) apply unchanged.
- **Release/verdaccio and Nx release configuration are not changed** by this spec.

## Non-functional Requirements

- **Accessibility**: Interactive components meet WCAG 2.1 AA color contrast for M3 color roles
  in both light and dark schemes, and are fully keyboard-operable with roles/names/states
  consistent with the M3 spec and WAI-ARIA APG.
- **Rendering safety**: Components are SSR-safe and zoneless — no reliance on Zone-based change
  detection and no browser-only API access during construction/server render.
- **Build health**: `pnpm exec nx run-many -t lint test build` is green for `ui` and `web`, and
  `pnpm exec nx build ui` produces a clean ng-packagr build with all entry points.

## Superseded Behaviors

- Existing `button`/`fab`/`icon` ad-hoc styling not sourced from the M3 token contract →
  REPLACED BY Requirement 16 (theming via the token contract) and Requirement 17 (retrofit).
- Existing `// todo: icon` placeholder (no button icon slot) → REPLACED BY Requirement 5.
- Existing `// todo: toggled` placeholder (no toggle/selected behavior) → REPLACED BY
  Requirement 3 (and Requirement 6 for icon buttons).
