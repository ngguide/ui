---
status: APPROVED
created: 2026-05-28
updated: 2026-05-28
post-implementation-corrections: 2026-05-28
---

# Requirements Document

## Introduction

`m3-tokens` establishes the complete Material Design 3 design-token foundation for the `@ngguide/ui`
kit. Today the kit ships only a partial, light-only set of color, typeface, shape, and elevation
tokens, which leaves components unable to render a correct dark theme, accessible high-contrast
variants, or the full M3 typography and motion vocabulary. This spec delivers the full M3 token set —
color (all roles), typography type scale, shape scale, elevation, state-layer opacities, and motion —
in both light and dark, across all three M3 contrast levels, exposed as a stable, documented token
contract that every component and consuming application styles against.

It is the Phase 1 foundation in the ngguide-ui plan: every other spec depends on this token contract.
Per the project vision, the token values and taxonomy are taken strictly from the published M3
specification — no invented tokens or values.

## Glossary

- **Design token**: A named, themeable design value (e.g. a color role, a type-scale entry, a corner
  radius) that components reference instead of hard-coded values.
- **Reference (ref) token**: A primitive M3 value (e.g. a tonal-palette step, a base typeface) that
  system tokens are derived from.
- **System (sys) token**: A role-based M3 token that components consume directly (e.g. the "primary"
  color role, the "body-large" type-scale entry).
- **Color role**: A named M3 semantic color slot (primary, on-primary, surface, outline, error, etc.).
- **Color scheme**: A complete set of color-role values for one combination of light/dark and contrast.
- **Contrast level**: One of the three M3 accessibility variants — standard, medium, high.
- **Type scale**: The M3 set of typography roles (display/headline/title/body/label × large/medium/small).
- **Shape scale**: The M3 set of corner-radius steps (none → full).
- **Elevation level**: One of the M3 elevation steps (level 0–5).
- **State-layer opacity**: The M3 overlay opacity applied to an element in hover/focus/pressed/dragged.
- **Motion token**: An M3 duration or easing value used for transitions and animations.
- **Token contract**: The published, stable set of token names that consumers and components rely on.
- **Theme mode**: Light or dark.

## Requirements

### Requirement 1: Complete M3 color-role coverage

**User Story:** As an app developer using `@ngguide/ui`, I want every M3 color role available as a
token so that any M3 component can be styled correctly without me defining missing colors.

#### Acceptance Criteria

1. THE system SHALL expose a design token for every color role defined in the M3 color
   specification (including primary/secondary/tertiary and their on-/container/on-container roles,
   surface and surface-container roles, inverse roles, outline roles, error roles, shadow, scrim).
2. THE system SHALL derive system color roles from M3 reference tokens (tonal-palette steps) so the
   reference layer and system layer are both present.
3. THE color-role values SHALL match the published M3 baseline values for the corresponding scheme.
4. THE system SHALL NOT introduce color roles that are absent from the M3 specification.

### Requirement 2: Light and dark schemes

**User Story:** As an app developer, I want both light and dark color schemes so that my app can
present a correct appearance in either mode.

#### Acceptance Criteria

1. THE system SHALL provide a complete light color scheme and a complete dark color scheme, each
   covering every color role from Requirement 1.
2. WHEN the active theme mode is dark THEN the system SHALL resolve color-role tokens to the dark
   scheme values.
3. WHEN the active theme mode is light THEN the system SHALL resolve color-role tokens to the light
   scheme values.

### Requirement 3: All three contrast levels

**User Story:** As a user who needs higher contrast, I want the kit to support M3 standard, medium,
and high contrast so that I can read the interface comfortably.

#### Acceptance Criteria

1. THE system SHALL provide color schemes for all three M3 contrast levels — standard, medium, and
   high — for both light and dark modes.
2. WHEN a contrast level is selected THEN the system SHALL resolve color-role tokens to that contrast
   level's values for the active theme mode.
3. THE contrast-level values SHALL match the published M3 values for the corresponding scheme.

### Requirement 4: Theme selection — system default with manual override

**User Story:** As an app developer, I want the kit to follow the user's OS appearance setting by
default but let me force a specific mode so that I can offer both automatic and explicit theme control.

#### Acceptance Criteria

1. WHEN the consuming application has not forced a theme mode THEN the system SHALL follow the
   operating-system color-scheme preference.
2. WHEN the operating-system color-scheme preference changes AND no mode is forced THEN the system
   SHALL update the resolved color tokens to match the new preference without a page reload.
3. WHEN the consuming application forces a theme mode THEN the system SHALL use that mode regardless
   of the operating-system preference.
4. THE system SHALL allow the forced theme mode to be scoped to a subtree of the page (so a region
   can differ from the rest of the page).

### Requirement 5: Typography type scale

**User Story:** As an app developer, I want the full M3 type scale as tokens so that text in
components and my app matches M3 typography.

#### Acceptance Criteria

1. THE system SHALL expose tokens for every M3 type-scale role across all sizes (display, headline,
   title, body, and label, each in large, medium, and small).
2. EACH type-scale role SHALL expose its constituent values (font family, weight, size, line height,
   and letter spacing) as tokens.
3. THE type-scale values SHALL match the published M3 values.

### Requirement 6: Overridable typeface defaulting to Roboto

**User Story:** As an app developer, I want Roboto by default but the ability to substitute my own
typeface so that the kit looks correct out of the box yet supports brand fonts.

#### Acceptance Criteria

1. THE system SHALL default the brand and plain typefaces to Roboto, per M3.
2. THE system SHALL allow the consuming application to override the typeface tokens without modifying
   component styles, and all type-scale roles SHALL then use the overridden typeface.

### Requirement 7: Shape scale

**User Story:** As an app developer, I want the M3 shape scale as tokens so that component corners
follow M3.

#### Acceptance Criteria

1. THE system SHALL expose a token for every M3 shape-scale step (none, extra-small, small, medium,
   large, extra-large, full, and the documented increased steps).
2. THE shape-scale values SHALL match the published M3 values.

### Requirement 8: Elevation

**User Story:** As an app developer, I want the M3 elevation levels as tokens so that component
shadows follow M3.

#### Acceptance Criteria

1. THE system SHALL expose a token for each M3 elevation level (0 through 5).
2. THE elevation values SHALL match the published M3 elevation definitions and SHALL respond to the
   active scheme's shadow color.

### Requirement 9: State-layer opacities

**User Story:** As a component author, I want M3 state-layer opacity tokens so that hover/focus/
pressed/dragged overlays are consistent and spec-correct across all components.

#### Acceptance Criteria

1. THE system SHALL expose state-layer opacity tokens for the hover, focus, pressed, and dragged
   states.
2. THE state-layer opacity values SHALL match the published M3 state values.

### Requirement 10: Motion tokens

**User Story:** As a component author, I want M3 motion tokens so that transitions and animations use
spec-correct durations and easing.

#### Acceptance Criteria

1. THE system SHALL expose tokens for the M3 motion duration set and the M3 motion easing set.
2. THE motion values SHALL match the published M3 motion specification.

### Requirement 11: Stable, documented token contract

**User Story:** As an app developer and as a component author, I want a documented, stable set of
token names so that I can theme the kit and build components against a contract that does not shift
unexpectedly.

#### Acceptance Criteria

1. THE system SHALL publish the token names following the M3 reference/system naming taxonomy.
2. THE system SHALL allow a consuming application to retheme the kit solely by setting token values,
   without editing any component's styles.
3. THE token contract SHALL be documented so consumers can discover every available token and its
   purpose.

### Requirement 12: No regression for existing components

**User Story:** As a maintainer, I want the existing button, fab, and icon components to keep
rendering correctly after the token system is expanded so that the upgrade is non-breaking.

#### Acceptance Criteria

1. THE system SHALL preserve the canonical M3 token names already in use, treating the current tokens
   as a subset of the full set.
2. THE existing components SHALL render with the same intended appearance under the standard
   light scheme after this change as before it.
3. THE system SHALL NOT remove or rename any token currently relied upon by a shipped component
   without an explicit superseded-behavior entry.

## Constraints

- Token values and the token taxonomy must come strictly from the published M3 specification at
  m3.material.io — no invented tokens or values. (Project vision: strict-M3 directive.)
- Tokens are delivered as CSS custom properties using the canonical `--md-ref-*` / `--md-sys-*`
  naming. (Project shared architectural decision; also required by existing component CSS.)
- The kit is zoneless; theme resolution and OS-preference reactivity must not depend on Zone-based
  change detection. (Project technical constraint.)

## Non-functional Requirements

- **Accessibility**: Standard-contrast color-role pairings (foreground role on its matching
  background role) SHALL meet WCAG 2.1 AA contrast; high-contrast pairings SHALL meet or exceed the
  contrast targets defined by the M3 high-contrast scheme.
- **Theme switch latency**: WHEN the theme mode or contrast level changes, the resolved appearance
  SHALL update within one animation frame (no reload, no full re-style flash).

## Superseded Behaviors

- Partial, light-only token set in the current `theme.css` (incomplete color roles, no dark scheme,
  no type scale, no state/motion tokens) → REPLACED BY Requirements 1–10 (complete M3 token set,
  light + dark, all contrast levels). Existing token names are retained per Requirement 12.
- 2021 M3 baseline color hex values (e.g. `--md-sys-color-primary: #6750a4`) → REPLACED BY the 2025 M3
  color-spec values produced by `@material/material-color-utilities` 0.4.0 (e.g. standard-light
  `primary` = `#65558f`). This resolves the tension between Requirement 12.2 ("same intended
  appearance") and the project's strict-M3 directive: **Requirement 12.2 guarantees token *names* and
  semantic roles are preserved, NOT exact hex values** — values track the current published M3 spec.
