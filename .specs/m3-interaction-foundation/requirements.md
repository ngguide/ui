---
created: 2026-06-01
updated: 2026-06-01
---

# Requirements Document

## Introduction

`m3-interaction-foundation` is the shared interaction layer consumed by every
`@ngguide/ui` component. It delivers the Material Design 3 **state layer**,
**ripple**, and **focus indicator** behaviors as reusable directives driven by
the `--md-sys-state-*` token contract, plus a small set of generic
accessibility utilities (focus management, roving-tabindex support, and a
reduced-motion signal) that layer on top of Angular's headless ARIA primitives.

It contains **no concrete components**, no token definitions, and no color
scheme generation — only the interaction and a11y primitives that the
component specs (actions, selection, text-inputs, communication, containment,
navigation) reuse to stay visually and behaviorally consistent with M3.

Per the project's guiding principle, every behavior here must trace to a
specific guideline on m3.material.io (interaction states, ripple, focus
indicator, accessibility). Where the guideline is ambiguous, the open question
is documented rather than guessed.

## Glossary

- **State layer**: A semi-transparent overlay applied over an interactive
  element to communicate its current state (enabled, hover, focus, pressed,
  dragged). Its color comes from the element's content color role and its
  opacity from the M3 state token contract.
- **State-layer opacity tokens**: The M3 system tokens for each state's overlay
  opacity (hover, focus, pressed, dragged), exposed as CSS custom properties by
  the token system this spec depends on.
- **Ripple**: The M3 pressed-state animation — a translucent circle that
  expands from the interaction point and fades out, layered above the state
  layer.
- **Focus indicator (focus ring)**: The visible boundary M3 draws around an
  element when it receives keyboard focus.
- **Reduced-motion preference**: The user's operating-system setting requesting
  minimized or disabled non-essential animation (surfaced to the web as
  `prefers-reduced-motion`).
- **Keyboard focus**: Focus arriving via keyboard navigation or programmatic
  focus following keyboard interaction, as opposed to a pointer press
  (the platform `:focus-visible` heuristic).
- **Roving tabindex**: An accessibility pattern in which a composite widget
  (e.g. a toolbar or list of options) exposes a single tab stop, and arrow
  keys move focus between its items.
- **Interactive host**: The DOM element a directive is applied to (button,
  link, list option, etc.) that participates in M3 interaction states.
- **Disabled host**: An interactive host marked unavailable for interaction
  (via the `disabled` attribute/property or `aria-disabled`).
- **Consumer**: A component (in another spec) or an application that applies
  these directives/utilities to its own elements.

## Requirements

### Requirement 1: State-layer overlay

**User Story:** As a component author, I want a directive that renders the M3
state-layer overlay on an interactive element, so that hover, focus, and
pressed feedback is consistent across every component without re-implementing
it.

#### Acceptance Criteria

1. THE system SHALL provide a directive that, when applied to an interactive
   host, renders a state-layer overlay covering the host's interactive area.
2. WHEN the pointer hovers over an enabled interactive host THEN the system
   SHALL display the state layer at the M3 hover-state opacity.
3. WHEN an enabled interactive host has keyboard focus THEN the system SHALL
   display the state layer at the M3 focus-state opacity.
4. WHEN an enabled interactive host is pressed THEN the system SHALL display the
   state layer at the M3 pressed-state opacity.
5. WHEN an enabled interactive host is being dragged THEN the system SHALL
   display the state layer at the M3 dragged-state opacity.
6. THE system SHALL derive the state-layer opacity for each state from the M3
   state-layer opacity token contract, not from hard-coded values.
7. THE system SHALL derive the state-layer color from the host's content color
   role so the overlay tints correctly in both light and dark schemes.
8. WHEN two states apply simultaneously (e.g. focus while hovering) THEN the
   system SHALL combine them following the M3 state-layer guideline rather than
   showing two unrelated overlays.
9. THE system SHALL render the state layer without altering the host's layout
   (size, position, or document flow).

### Requirement 2: Ripple (pressed-state animation)

**User Story:** As a component author, I want the M3 pressed ripple animation,
so that pressing a control gives the spec-accurate animated feedback.

#### Acceptance Criteria

1. WHEN an enabled interactive host is activated by pointer (mouse or touch)
   THEN the system SHALL animate a ripple that originates at the interaction
   point and expands to cover the host, then fades out.
2. WHEN an enabled interactive host is activated by keyboard THEN the system
   SHALL animate a ripple that originates from the center of the host.
3. THE system SHALL render the ripple above the state layer.
4. THE system SHALL derive the ripple color and opacity from the M3 pressed
   state token contract / content color role, not from hard-coded values.
5. THE system SHALL confine the ripple to the bounds of the host's interactive
   area (the ripple does not visibly overflow the host's shape).
6. WHEN multiple activations occur in quick succession THEN the system SHALL
   render each ripple without leaving a stuck or never-fading overlay.
7. THE system SHALL complete and clean up the ripple animation so no residual
   overlay remains once the interaction ends.

### Requirement 3: Focus indicator

**User Story:** As a keyboard user, I want a visible focus ring on interactive
elements, so that I can always see which control is focused.

#### Acceptance Criteria

1. WHEN an enabled interactive host receives keyboard focus THEN the system
   SHALL display a visible focus indicator around it.
2. WHEN an enabled interactive host receives focus from a pointer press THEN the
   system SHALL NOT display the focus indicator (keyboard focus only).
3. WHEN a focused host loses focus THEN the system SHALL remove the focus
   indicator.
4. THE system SHALL style the focus indicator from the M3 token contract (color
   role and shape), not from hard-coded values.
5. THE system SHALL render the focus indicator so it remains visible against
   both light and dark schemes.

### Requirement 4: Disabled state suppression

**User Story:** As a component author, I want interaction feedback to disappear
when a control is disabled, so that disabled controls correctly read as
non-interactive.

#### Acceptance Criteria

1. WHEN an interactive host is disabled THEN the system SHALL NOT display the
   state layer for any state.
2. WHEN an interactive host is disabled THEN the system SHALL NOT animate or
   display a ripple in response to activation attempts.
3. WHEN an interactive host is disabled THEN the system SHALL NOT display the
   focus indicator.
4. THE system SHALL recognize the disabled condition from either the host's
   `disabled` attribute/property or `aria-disabled`.
5. WHEN a host transitions from disabled to enabled (or back) at runtime THEN
   the system SHALL begin or stop producing interaction feedback accordingly
   without requiring re-creation of the element.

### Requirement 5: Reduced-motion preference

**User Story:** As a user who is sensitive to motion, I want animations to honor
my reduced-motion setting, so that interacting with components does not trigger
unwanted motion.

#### Acceptance Criteria

1. WHEN the user has expressed a reduced-motion preference THEN the system SHALL
   suppress or minimize the ripple expansion animation while still conveying the
   pressed state (e.g. via the state layer).
2. WHEN the user has expressed a reduced-motion preference THEN the system SHALL
   suppress or minimize non-essential transition animation on state changes.
3. WHEN the reduced-motion preference changes at runtime THEN the system SHALL
   reflect the new preference on subsequent interactions without requiring a
   reload.
4. THE system SHALL expose the current reduced-motion preference to consumers as
   a reusable utility so component specs can honor it consistently.

### Requirement 6: Generic accessibility utilities

**User Story:** As a component author, I want shared focus-management and
roving-tabindex helpers, so that every component implements keyboard navigation
and focus behavior consistently with WAI-ARIA APG and M3.

#### Acceptance Criteria

1. THE system SHALL provide a focus-management utility that lets a consumer move
   keyboard focus to a chosen element among a set (e.g. first, last, next,
   previous).
2. THE system SHALL provide a roving-tabindex utility that maintains a single
   tab stop across a set of related items and moves focus between them on arrow
   navigation, consistent with WAI-ARIA APG.
3. WHEN focus moves between items in a roving-tabindex set THEN the system SHALL
   keep exactly one item in the tab order at a time.
4. THE system SHALL provide these utilities in a form reusable by any component
   spec without that spec re-implementing the focus logic.
5. THE system SHALL NOT bind these utilities to any single ARIA pattern; pattern
   wiring (listbox, menu, tabs, combobox) remains the responsibility of the
   consuming component spec.

### Requirement 7: Reusable, composable API surface

**User Story:** As a component author, I want to apply the interaction and a11y
primitives to my own host elements, so that I can build M3 components on a
shared foundation rather than duplicating interaction code.

#### Acceptance Criteria

1. THE system SHALL expose the state-layer, ripple, and focus-indicator
   behaviors as primitives that a consumer can apply to its own host elements.
2. THE system SHALL allow these primitives to be applied to a component's host
   element so the component presents a single public selector to its users
   (the interaction primitives are an implementation detail of the component).
3. THE system SHALL function under the project's zoneless change-detection model
   (no dependency on Zone-based change detection).
4. THE system SHALL render correctly when the host application is
   server-side-rendered and then hydrated, without producing duplicated or
   orphaned overlay elements.
5. THE system SHALL be published as part of the `@ngguide/ui` package as a
   secondary entry point, importable independently of any concrete component.
6. THE system SHALL NOT define color/typography/shape/elevation/state token
   values (it consumes the existing token contract) and SHALL NOT generate color
   schemes.

## Constraints

- **Strict M3 fidelity** — Every interaction behavior (state-layer opacities,
  ripple, focus indicator) and accessibility pattern must trace to a specific
  m3.material.io guideline (and WAI-ARIA APG for keyboard/ARIA behavior). No
  improvised values or behaviors. Ambiguities are documented as open questions.
- **Consumes the existing M3 token contract** — State-layer opacities, color
  roles, and shape come from the `--md-sys-*` custom properties defined by the
  already-shipped `m3-tokens` spec; this spec does not define or duplicate them.
- **Builds on Angular's headless ARIA primitives** — Accessibility behavior
  layers on top of the project's chosen headless ARIA layer rather than
  re-implementing ARIA patterns from scratch.
- **Zoneless + SSR-safe** — Must operate without Zone-based change detection and
  must be safe under server-side rendering and hydration, consistent with the
  rest of the library.
- **Single publishable library** — Ships as a secondary entry point of
  `@ngguide/ui`, not a separate package.

## Non-functional Requirements

- **Accessibility**: Keyboard focus is always visible for keyboard users
  (Requirement 3); the focus indicator and state-layered content meet WCAG 2.1
  AA contrast in both light and dark schemes. Keyboard navigation utilities
  conform to WAI-ARIA APG.
- **Motion**: Honors `prefers-reduced-motion` (Requirement 5).

## Out of Scope

- Any concrete M3 component (buttons, chips, tabs, dialogs, etc.) — those live
  in specs 4–9.
- M3 token definitions (color/typography/shape/elevation/state) — owned by
  `m3-tokens`.
- Color-scheme generation from a source color — owned by `m3-dynamic-color`.
- Per-ARIA-pattern styled wrappers (listbox/menu/tabs/combobox) — each consuming
  component spec wires its own pattern using the generic utilities here.
