---
status: DRAFT
created: 2026-05-29
updated: 2026-05-29
---

# Requirements Document

## Introduction

`@ngguide/ui` already ships a complete **static** M3 token system (spec `m3-tokens`): the
`--md-sys-color-*` roles are pre-generated from a single fixed baseline seed and shipped as CSS.
This spec adds **dynamic color** — the ability to generate a full M3 color scheme from an
*arbitrary* source color (and optional custom brand colors) at runtime, using the M3 HCT /
tonal-palette algorithm, and to apply that scheme by writing the same `--md-sys-color-*` token
contract the components already style against.

The outcome: a consuming Angular app can theme the entire UI Kit from a brand seed color, pick any
M3 scheme variant and contrast level, add harmonized custom colors, switch light/dark via the OS,
and read the computed scheme values programmatically — all while staying strictly within the M3
color specification (no invented roles, no improvised blends).

## Glossary

- **Source color (seed):** A single color (expressed as a hex string) from which the entire scheme
  is derived.
- **Custom color (extended color):** An additional named color (e.g. a brand "success" color) that
  is folded into the scheme as its own set of M3 roles, alongside the source-derived roles.
- **HCT:** The M3 color space (Hue, Chroma, Tone) used to derive tonal palettes from a source color.
- **Tonal palette:** A set of tones (0–100) for a given hue/chroma, from which color roles are mapped.
- **Color role:** A semantic M3 token (e.g. `primary`, `on-primary`, `surface-container-high`,
  `outline-variant`) that components reference. The full set is defined by the **token contract**.
- **Token contract:** The canonical set of `--md-sys-color-*` CSS custom-property names defined by
  the `m3-tokens` spec. Dynamic color writes values for exactly these names.
- **Scheme variant:** One of the M3-defined generation strategies — Tonal Spot, Vibrant, Expressive,
  Neutral, Monochrome, Fidelity, Content, Rainbow, Fruit Salad.
- **Contrast level:** One of the M3 contrast settings — standard, medium, high — affecting tone
  selection for accessibility.
- **Harmonization:** The M3 operation that rotates a custom color's hue toward the source color's hue
  so it sits cohesively within the scheme.
- **Scheme:** The complete computed mapping of every color role to a concrete color value, for a
  given (source color, variant, contrast, mode) combination.
- **Apply / runtime application:** Writing the computed scheme as `--md-sys-color-*` values onto the
  document so the live UI re-themes.

## Requirements

### Requirement 1: Generate a scheme from a source color

**User Story:** As an app developer, I want to generate a complete M3 color scheme from a single
source color, so that the whole UI Kit can be themed from one brand seed.

#### Acceptance Criteria

1. THE system SHALL accept a single source color, expressed as a hex string, as the basis for scheme
   generation.
2. THE system SHALL derive color values using the M3 HCT / tonal-palette algorithm as published at
   m3.material.io — no other color-derivation method.
3. THE system SHALL produce a value for every color role defined in the `m3-tokens` token contract,
   with no role omitted and no role added beyond that contract (custom-color roles per Requirement 5
   excepted).
4. THE system SHALL produce, for a given input, color values identical to the M3 reference algorithm
   for that same input (so output is verifiable against M3, not improvised).

### Requirement 2: Select any M3 scheme variant

**User Story:** As an app developer, I want to choose which M3 scheme variant is used, so that I can
match the intended expressiveness of my brand.

#### Acceptance Criteria

1. THE system SHALL support every M3 scheme variant: Tonal Spot, Vibrant, Expressive, Neutral,
   Monochrome, Fidelity, Content, Rainbow, and Fruit Salad.
2. WHEN no variant is specified THEN the system SHALL use Tonal Spot, matching the static
   `m3-tokens` baseline.
3. WHEN a variant is specified THEN the system SHALL generate role values according to that variant's
   M3 definition.
4. THE system SHALL NOT expose any scheme variant that is not part of the published M3 specification.

### Requirement 3: Select a contrast level

**User Story:** As an app developer, I want to choose an M3 contrast level, so that the theme can meet
the contrast needs of my users.

#### Acceptance Criteria

1. THE system SHALL support the M3 contrast levels: standard, medium, and high.
2. WHEN no contrast level is specified THEN the system SHALL use standard.
3. WHEN a contrast level is specified THEN the system SHALL adjust the generated role tones according
   to that level's M3 definition.

### Requirement 4: Light and dark schemes with OS-driven switching

**User Story:** As an end user, I want the theme to follow my device's light/dark preference, so that
the app matches my system without the developer wiring extra logic.

#### Acceptance Criteria

1. WHEN a scheme is generated and applied THEN the system SHALL produce both the light and the dark
   role values for the same source color, variant, and contrast level.
2. WHEN both light and dark values are applied AND the developer has not forced a fixed mode THEN the
   active mode SHALL follow the operating-system / browser light-dark preference, and SHALL change
   when that preference changes, without the developer re-invoking generation.
3. WHEN the developer forces a fixed mode (light or dark) THEN the system SHALL apply that mode
   regardless of the operating-system preference.
4. THE light/dark switching behavior SHALL be consistent with the `m3-tokens` static baseline so that
   a dynamic scheme and the static baseline behave the same way with respect to mode.

### Requirement 5: Custom (extended) colors

**User Story:** As an app developer, I want to add named brand colors to the scheme, so that
non-primary brand colors (e.g. a "success" green) are themed cohesively with the rest of the UI.

#### Acceptance Criteria

1. THE system SHALL accept zero or more custom colors, each with a name and a hex value.
2. WHEN a custom color is provided THEN the system SHALL emit its full M3 role set — the base color
   role, its on-color role, its container role, and its on-container role — for both light and dark.
3. THE system SHALL allow each custom color to opt into or out of harmonization toward the source
   color independently, per the M3 custom-color specification.
4. WHEN a contrast level is selected THEN the system SHALL apply that contrast level to custom-color
   roles in the same way it applies to core roles.
5. THE custom-color role names SHALL be derived from the custom color's name in a consistent,
   documented pattern, and SHALL NOT collide with or overwrite any core token-contract role.

### Requirement 6: Apply a scheme globally at runtime

**User Story:** As an app developer, I want an applied scheme to re-theme my whole app, so that every
component using the token contract reflects the brand instantly.

#### Acceptance Criteria

1. WHEN a scheme is applied THEN the system SHALL write the computed values to the `--md-sys-color-*`
   token-contract names at the document root scope.
2. WHEN a scheme is applied THEN every component that styles against the token contract SHALL reflect
   the new scheme without any change to that component.
3. WHEN a scheme is applied over a previously applied scheme THEN the system SHALL fully replace the
   prior dynamic values.
4. WHEN no scheme has been applied THEN the static `m3-tokens` baseline SHALL remain in effect.
5. THE applied dynamic values SHALL override the static baseline for the roles they set.

### Requirement 7: Configure dynamic color at application startup

**User Story:** As an app developer, I want to declare my theme once when the app boots, so that the
app starts already themed from my brand seed.

#### Acceptance Criteria

1. THE system SHALL provide a way to configure dynamic color at application bootstrap with at least:
   a source color, an optional variant, an optional contrast level, an optional fixed mode, and
   optional custom colors.
2. WHEN the application starts with a dynamic-color configuration THEN the configured scheme SHALL be
   in effect for the first render the user sees.
3. THE system SHALL provide a way to change the active scheme after startup (e.g. a brand-color
   picker), and applying the change SHALL re-theme the running app.

### Requirement 8: Read computed scheme values programmatically

**User Story:** As an app developer, I want to read the generated color values directly, so that I can
use them outside CSS (charts, canvas, exporting a theme).

#### Acceptance Criteria

1. THE system SHALL provide a way to obtain the computed mapping of color role to color value for a
   generated scheme, without requiring it to be applied to the document.
2. THE returned mapping SHALL cover every core role and every custom-color role for the requested
   mode(s) and contrast level.
3. THE returned color values SHALL equal the values that would be written to the token contract when
   applying the same scheme.

### Requirement 9: Fail fast on invalid color input

**User Story:** As an app developer, I want misconfigured colors to be reported immediately, so that I
catch theming mistakes at development time instead of shipping a broken theme.

#### Acceptance Criteria

1. WHEN the source color is not a parseable color value THEN the system SHALL raise a descriptive
   error identifying the offending input.
2. WHEN a custom color's value is not a parseable color value THEN the system SHALL raise a
   descriptive error identifying which custom color is invalid.
3. THE system SHALL NOT silently substitute a default color for an invalid input.

### Requirement 10: Server-side rendering safety

**User Story:** As an app developer using server-side rendering, I want dynamic color to work without
a browser, so that my server-rendered pages are themed and do not crash.

#### Acceptance Criteria

1. THE system SHALL compute a scheme (Requirements 1–5, 8) without requiring a browser DOM.
2. WHEN running in an environment without a DOM THEN applying a scheme SHALL NOT throw, and SHALL
   degrade gracefully (no error, no broken render).
3. WHEN the same configuration is used on the server and in the browser THEN the resulting scheme
   values SHALL be identical, so there is no visible theme shift on hydration.

### Requirement 11: Token-contract fidelity

**User Story:** As a maintainer, I want dynamic color to use exactly the same role names as the static
tokens, so that switching between static and dynamic theming requires no component changes.

#### Acceptance Criteria

1. THE core role names written/returned by dynamic color SHALL be exactly the `--md-sys-color-*` names
   defined by the `m3-tokens` token contract — same spelling, same set.
2. THE system SHALL NOT introduce a core color role that is absent from the `m3-tokens` contract, and
   SHALL NOT omit one that is present.
3. WHEN the `m3-tokens` contract changes THEN any divergence in the dynamic-color role set SHALL be
   detectable (so the two stay in lockstep).

## Constraints

- **Must consume the existing `m3-tokens` token contract** — dynamic color writes/returns the exact
  `--md-sys-color-*` role names already shipped; it does not redefine the static token files.
- **Must be SSR-safe** consistent with the rest of `@ngguide/ui` (Angular SSR / no-DOM rendering).
- **Strict M3 adherence** — scheme generation, variants, contrast, custom-color roles, and
  harmonization must trace to m3.material.io. No invented roles, blends, variants, or values. Where
  M3 is ambiguous, document the open question rather than improvising.

## Non-functional Requirements

- **Accessibility:** Generated schemes at the **standard** contrast level SHALL meet WCAG 2.1 AA
  contrast for text/background role pairings in both light and dark, as guaranteed by the M3
  algorithm; the **medium** and **high** levels SHALL provide progressively higher contrast per M3.
- **Determinism:** For a given (source color, variant, contrast, mode, custom colors) input, the
  computed scheme SHALL be deterministic — identical inputs always yield identical outputs.

## Superseded Behaviors

- **Static-only theming (single fixed baseline seed from `m3-tokens`)** → EXTENDED (not removed) by
  this spec. The static baseline remains the default when no dynamic scheme is configured
  (Requirement 6.4); dynamic color overrides it at runtime when used (Requirement 6.5).
