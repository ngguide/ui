---
created: 2026-06-03
updated: 2026-06-03
---

# Requirements Document

## Introduction

The **communication** category delivers the Material Design 3 (M3) feedback and communication
components for `@ngguide/ui`, published as secondary entry points. These are the surfaces that tell
the user *what is happening* or *what changed*: status badges, progress and loading indicators,
transient action feedback (snackbar), and contextual help (tooltips).

Every component's anatomy, variants, states, measurements, motion, and accessibility behavior must
trace 1:1 to the published M3 guideline at [m3.material.io](https://m3.material.io/) and the relevant
WAI-ARIA Authoring Practices (APG) pattern. Where M3 is ambiguous, the open question is documented in
research rather than guessed.

This category covers five component families:
1. **Badge** — small (dot) and large (numeric) status markers anchored to a host.
2. **Progress indicators** — linear and circular, each with determinate and indeterminate modes.
3. **Loading indicator** — the M3 loading indicator (animated morphing shape), distinct from circular progress.
4. **Snackbar** — transient, queued action feedback with optional action and dismissal.
5. **Tooltips** — plain (text-only) and rich (header + body + optional actions).

Dialogs are explicitly **out of scope** here — they belong to the `containment` category.

## Glossary

- **Badge**: A small marker overlaid on a host element (icon, icon button, avatar, navigation item)
  indicating unread count or a state needing attention. M3 defines a *small* badge (a dot, no label)
  and a *large* badge (a numeric label).
- **Host element**: The element a badge or tooltip is attached to / anchored to.
- **Linear progress indicator**: A horizontal track + active indicator showing progress along a line.
- **Circular progress indicator**: A circular arc/ring showing progress around a circle.
- **Determinate**: The indicator reflects a known completion value between 0 and 1 (0–100%).
- **Indeterminate**: The indicator animates continuously without communicating a specific value
  (the amount of work is unknown).
- **Loading indicator**: The M3 component that displays an animated, morphing shape while content
  loads; distinct from the circular progress indicator.
- **Snackbar**: A brief message at the bottom of the screen providing lightweight feedback about an
  operation, optionally with a single action and/or a close affordance. M3 shows one snackbar at a time.
- **Snackbar queue**: The mechanism by which multiple requested snackbars are shown sequentially,
  one at a time, in request order.
- **Plain tooltip**: A short, non-interactive text label describing an element, shown on hover, focus,
  or long-press.
- **Rich tooltip**: A larger tooltip containing an optional subhead/title, body text, and optional
  action buttons; it can persist while the pointer moves into it.
- **Trigger**: The element whose interaction (hover/focus/long-press/click) causes a tooltip to appear.
- **Reduced motion**: The user preference, exposed to the system, requesting minimized or eliminated
  non-essential animation.
- **APG**: WAI-ARIA Authoring Practices Guide.

## Requirements

### Requirement 1: Badge — anatomy and variants

**User Story:** As an app developer, I want to attach an M3 badge to an icon, icon button, avatar, or
navigation item, so that I can communicate counts or attention states without adding extra layout.

#### Acceptance Criteria

1. THE system SHALL provide a badge that can be anchored to a host element so the badge overlays the
   host's corner per M3 badge placement.
2. THE system SHALL support a **small badge** variant that renders as a dot with no label.
3. THE system SHALL support a **large badge** variant that renders a numeric label.
4. WHEN the numeric value exceeds the configured maximum THEN the system SHALL display the maximum
   followed by a plus sign (e.g. "999+"), where the maximum is configurable and defaults to the M3
   value.
5. WHEN the badge is configured as hidden or its value is zero/absent in dot-less numeric mode THEN
   the system SHALL not render a visible badge.
6. THE system SHALL apply M3 badge measurements (small dot size, large badge height, horizontal
   padding, label typography, corner radius) exactly as published.
7. THE system SHALL color the badge using M3 color roles (error container / on-error per the M3 badge
   spec) so it adapts to light and dark schemes.

### Requirement 2: Badge — accessibility

**User Story:** As an assistive-technology user, I want a badge's meaning conveyed to me, so that I
know there is unread or attention-needing content.

#### Acceptance Criteria

1. THE system SHALL allow the host's accessible name to incorporate the badge's meaning (e.g. an
   accessible label such as "Notifications, 3 unread") so the count is announced.
2. THE system SHALL NOT expose the badge as a separate interactive or focusable element.
3. WHEN the badge is purely decorative (small dot with externally described meaning) THEN the system
   SHALL hide the badge graphic from the accessibility tree to avoid redundant announcements.

### Requirement 3: Linear progress indicator

**User Story:** As an app developer, I want a linear progress indicator, so that I can show the
progress of an operation along a horizontal track.

#### Acceptance Criteria

1. THE system SHALL provide a linear progress indicator with **determinate** and **indeterminate** modes.
2. WHEN in determinate mode THEN the system SHALL render the active indicator proportional to a value
   between 0 and 1 (clamped to that range).
3. WHEN in indeterminate mode THEN the system SHALL animate continuously without representing a
   specific value.
4. THE system SHALL render the M3 linear anatomy — active indicator, track, the gap between active
   indicator and track, the stop indicator, and rounded ends — with M3 thickness and measurements as
   published.
5. THE system SHALL color the active indicator, track, and stop indicator using M3 color roles
   (primary / secondary-container per the M3 progress spec).
6. WHEN the value changes in determinate mode THEN the system SHALL animate the active indicator to
   the new value per M3 motion.

### Requirement 4: Circular progress indicator

**User Story:** As an app developer, I want a circular progress indicator, so that I can show progress
in a compact circular form.

#### Acceptance Criteria

1. THE system SHALL provide a circular progress indicator with **determinate** and **indeterminate** modes.
2. WHEN in determinate mode THEN the system SHALL render an arc proportional to a value between 0 and 1.
3. WHEN in indeterminate mode THEN the system SHALL animate continuously (rotation/arc sweep) without
   representing a specific value.
4. THE system SHALL render the M3 circular anatomy — active indicator arc, track, gap, and rounded
   ends — with M3 size and stroke thickness as published.
5. THE system SHALL color the indicator using the M3 color roles defined for circular progress.

### Requirement 5: Loading indicator

**User Story:** As an app developer, I want the M3 loading indicator, so that I can show an
expressive, animated loading state distinct from a progress ring.

#### Acceptance Criteria

1. THE system SHALL provide a loading indicator that renders the M3 animated morphing-shape loading
   visual.
2. THE system SHALL animate the loading indicator continuously while active, per M3 motion.
3. THE system SHALL render the loading indicator at the M3-published size(s) and color it with the
   M3 color roles for the loading indicator.
4. THE system SHALL keep the loading indicator distinct from the circular progress indicator (it is
   not a determinate ring and exposes no progress value).

### Requirement 6: Progress and loading — accessibility

**User Story:** As an assistive-technology user, I want progress and loading states announced, so I
understand that the system is busy and how far along it is.

#### Acceptance Criteria

1. THE system SHALL expose each progress indicator with the progressbar accessibility role.
2. WHEN a progress indicator is determinate THEN the system SHALL expose the current value, minimum,
   and maximum to assistive technology.
3. WHEN a progress indicator is indeterminate THEN the system SHALL expose it as a busy/indeterminate
   progressbar without a current value.
4. THE system SHALL allow an accessible label to be associated with each progress/loading indicator
   so its purpose is announced.
5. THE system SHALL communicate the loading indicator's busy state to assistive technology.

### Requirement 7: Snackbar — content and variants

**User Story:** As an app developer, I want to show a snackbar with a message and an optional action,
so that I can give brief, non-blocking feedback about an operation.

#### Acceptance Criteria

1. THE system SHALL display a snackbar containing a text message.
2. THE system SHALL support a **single-line** layout and a **two-line** layout for longer messages,
   per M3.
3. THE system SHALL support an optional single **action** affordance with a caller-provided label.
4. WHEN the user activates the action THEN the system SHALL notify the caller and dismiss the snackbar.
5. THE system SHALL support an optional **close** affordance that dismisses the snackbar when activated.
6. THE system SHALL render the M3 snackbar anatomy (container, supporting text, action, optional close
   icon), measurements, shape, and elevation as published.
7. THE system SHALL color the snackbar using the M3 color roles for snackbar (inverse-surface /
   inverse-on-surface / inverse-primary for the action) so it adapts to light and dark schemes.

### Requirement 8: Snackbar — positioning

**User Story:** As an app developer, I want snackbars positioned per M3, so that they don't obscure
key UI and follow platform conventions.

#### Acceptance Criteria

1. THE system SHALL position the snackbar at the bottom of the screen by default, following M3
   placement (centered on compact widths, leading-aligned on wider widths) as published.
2. WHEN a floating action button or comparable bottom-anchored element is present and declared THEN
   the system SHALL offset the snackbar so it appears above that element rather than overlapping it.
3. THE system SHALL constrain the snackbar to the M3 maximum width on wide viewports.

### Requirement 9: Snackbar — dismissal and queue

**User Story:** As an app developer, I want snackbars shown one at a time with automatic dismissal,
so that rapid feedback events don't stack or overwhelm the user.

#### Acceptance Criteria

1. THE system SHALL provide a programmatic way to request a snackbar (open with message, optional
   action, and options) and to dismiss it.
2. THE system SHALL display at most one snackbar at a time.
3. WHEN a snackbar is requested while another is showing THEN the system SHALL queue the new request
   and show it after the current snackbar is dismissed, preserving request order.
4. THE system SHALL automatically dismiss a snackbar after a timeout, with a configurable duration and
   the ability to disable auto-dismiss for snackbars requiring user action.
5. WHEN the user performs a dismissal gesture (swipe) on the snackbar THEN the system SHALL dismiss it.
6. THE system SHALL report why a snackbar closed (action, dismiss affordance, timeout, or gesture) to
   the caller.
7. WHEN auto-dismiss is active and the user's pointer/focus is on the snackbar or its action THEN the
   system SHALL pause the auto-dismiss timer until interaction ends, per M3/accessibility guidance.

### Requirement 10: Snackbar — accessibility

**User Story:** As an assistive-technology user, I want snackbar messages announced without stealing
focus, so I'm informed but not interrupted.

#### Acceptance Criteria

1. WHEN a snackbar appears THEN the system SHALL announce its message to assistive technology via a
   live region without moving focus to the snackbar.
2. THE system SHALL make the action and close affordances keyboard-focusable and operable when present.
3. THE system SHALL allow the user to reach the snackbar's action via the keyboard before it
   auto-dismisses (consistent with Requirement 9.7).

### Requirement 11: Plain tooltip

**User Story:** As an app developer, I want a plain tooltip on an element, so that I can show a short
descriptive label on hover, focus, or long-press.

#### Acceptance Criteria

1. THE system SHALL display a plain tooltip containing short text anchored to its trigger element.
2. WHEN the pointer hovers the trigger THEN the system SHALL show the tooltip after the M3 show delay.
3. WHEN the trigger receives keyboard focus THEN the system SHALL show the tooltip.
4. WHEN the user long-presses the trigger on a touch device THEN the system SHALL show the tooltip.
5. WHEN the pointer leaves the trigger, the trigger loses focus, or the user presses Escape THEN the
   system SHALL hide the tooltip.
6. THE system SHALL render the M3 plain-tooltip anatomy (container, supporting text), measurements,
   shape, and color roles as published.
7. THE system SHALL position the tooltip adjacent to the trigger and keep it within the viewport.

### Requirement 12: Rich tooltip

**User Story:** As an app developer, I want a rich tooltip with a title, body, and optional actions,
so that I can provide more detailed, optionally interactive contextual help.

#### Acceptance Criteria

1. THE system SHALL display a rich tooltip that may contain an optional subhead/title, body text, and
   optional action buttons.
2. WHEN the rich tooltip contains actions THEN the system SHALL keep the tooltip visible while the
   user moves the pointer from the trigger into the tooltip, so the actions can be used (persistent
   behavior per M3).
3. WHEN the user activates a rich-tooltip action, presses Escape, or moves focus/pointer away without
   entering the tooltip THEN the system SHALL hide the tooltip.
4. THE system SHALL render the M3 rich-tooltip anatomy (container, subhead, supporting text, action
   row), measurements, shape, elevation, and color roles as published.
5. THE system SHALL position the rich tooltip adjacent to the trigger and keep it within the viewport.

### Requirement 13: Tooltip — accessibility

**User Story:** As an assistive-technology user, I want tooltips associated with their triggers, so
that the descriptive content is announced.

#### Acceptance Criteria

1. THE system SHALL associate a plain tooltip with its trigger so the tooltip text contributes to the
   trigger's accessible description.
2. THE system SHALL expose the tooltip surface with the tooltip accessibility role where appropriate.
3. WHEN the user presses Escape while a tooltip is visible THEN the system SHALL hide it without
   moving focus away from the trigger.
4. WHEN a rich tooltip contains interactive actions THEN the system SHALL make those actions
   keyboard-focusable and operable.

### Requirement 14: Reduced motion

**User Story:** As a motion-sensitive user, I want animations minimized when I've asked the system to
reduce motion, so that the UI doesn't trigger discomfort.

#### Acceptance Criteria

1. WHEN the user has expressed a reduced-motion preference THEN the system SHALL reduce or remove
   non-essential animation in indeterminate progress indicators, the loading indicator, and snackbar
   enter/exit, without losing the conveyed meaning (busy/visible states remain perceivable).
2. THE system SHALL still communicate determinate progress value changes when reduced motion is active
   (the value updates remain correct even if transition animation is removed).

### Requirement 15: Theming, sizing, and tokens

**User Story:** As a design-system owner, I want these components driven by M3 tokens, so that they
stay in sync with the theme and dynamic color.

#### Acceptance Criteria

1. THE system SHALL derive all colors, shapes, elevations, and motion of these components from the M3
   token system (sys color roles, shape, elevation, state, motion) rather than hard-coded values.
2. WHEN the active theme or color scheme changes (including dynamic color) THEN the system SHALL
   reflect the change without code changes by consuming the token custom properties.
3. THE system SHALL meet WCAG 2.1 AA contrast for text/iconography against their containers in both
   light and dark schemes for every component in this category.

### Requirement 16: Packaging and conventions

**User Story:** As a consumer of `@ngguide/ui`, I want each communication component as a tree-shakable
entry point following the kit's conventions, so that imports stay granular and consistent.

#### Acceptance Criteria

1. THE system SHALL publish the communication components as secondary entry points under
   `@ngguide/ui/*`, each independently importable.
2. THE system SHALL follow the established kit conventions: standalone, OnPush, signal-based inputs/
   outputs, zoneless-safe, host-driven theming attributes.
3. THE system SHALL provide at least one passing spec per published entry point on the native Angular
   Vitest runner.
4. THE system SHALL keep `lint`, `test`, and `build` green for `ui` and `web`.

## Constraints

- **Strict M3 fidelity** — every anatomy, measurement, state, motion value, and color role must trace
  to the published M3 guideline; no improvised styling or behavior (project vision: "no invented
  behavior").
- **Built from scratch** — not a wrapper around Angular Material or MDC; M3 styling is implemented
  on Angular 21 primitives.
- **Reuse the existing CDK overlay infrastructure** — floating components (tooltip, snackbar) are to be
  built on the `@angular/cdk/overlay` infrastructure already adopted by the `text-inputs` pickers
  (the `GuiPickerOverlay` service / overlay container CSS), rather than introducing a new positioning
  stack. *(Stated preference for research/design to honor or push back on.)*
- **Depends on** the M3 token system (`m3-tokens`) and the interaction foundation
  (`m3-interaction-foundation`) being available.
- **Release/verdaccio and Nx release configuration are not changed** as part of this feature.

## Non-functional Requirements

- **Accessibility**: Meets WCAG 2.1 AA color contrast for M3 color roles in both light and dark
  schemes; all interactive affordances (snackbar action/close, rich-tooltip actions) fully
  keyboard-operable; progress/loading expose correct progressbar semantics; snackbar announced via a
  live region without focus theft; behavior consistent with the relevant WAI-ARIA APG patterns
  (tooltip, alert/status, progressbar).
- **Determinism / SSR-safety**: Component logic must be zoneless-safe and free of nondeterministic
  time sources in pure/reusable logic (no `Date.now()`, `Math.random()`, or argless `new Date()` in
  pure functions), consistent with the kit's conventions.
- **Motion**: Honors the user's reduced-motion preference for non-essential animation (Requirement 14).

## Out of Scope

- **Dialogs** — covered by the `containment` category.
- **Menus** — the menu control lives in `selection`.
