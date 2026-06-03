---
created: 2026-06-03
updated: 2026-06-03
---

# Requirements Document

## Introduction

The **containment** category delivers the Material Design 3 (M3) containment / surface components for
`@ngguide/ui`, published as secondary entry points. These are the surfaces that *hold and group*
content: cards that frame a single subject, dividers that separate content, lists that present a
vertical run of related items, dialogs that interrupt for a focused task or decision, bottom and side
sheets that surface supplementary content from a screen edge, and carousels that present a scrollable
run of visually prominent items.

Every component's anatomy, variants, states, measurements, motion, and accessibility behavior must
trace 1:1 to the published M3 guideline at [m3.material.io](https://m3.material.io/) and the relevant
WAI-ARIA Authoring Practices (APG) pattern. Where M3 is ambiguous, the open question is documented in
research rather than guessed.

This category covers seven component families:
1. **Card** — elevated, filled, and outlined containers for a single piece of content; optionally actionable.
2. **Divider** — a thin line that groups content within a list or container (full-width, inset, middle-inset).
3. **List** — a continuous, vertical run of one-, two-, or three-line rows with leading/trailing elements; optionally interactive and selectable.
4. **Dialog** — a modal surface for a focused task or decision; **basic** (centered) and **full-screen** (compact-window) variants.
5. **Bottom sheet** — a surface anchored to the bottom edge holding supplementary content; **modal** and **standard** variants, with a drag handle and swipe-to-dismiss.
6. **Side sheet** — a surface anchored to a side edge holding supplementary content; **modal** and **standard** variants.
7. **Carousel** — a scrollable run of items in the M3 **multi-browse**, **uncontained**, **hero**, and **full-screen** layouts.

Navigation surfaces (navigation drawer, rail, bar, top app bar, tabs) are explicitly **out of scope**
here — they belong to the `navigation` category. The menu *control* and chips belong to `selection`;
snackbar and tooltips belong to `communication`.

## Glossary

- **Surface**: A container that holds content and carries an M3 color role and (optionally) elevation.
- **Card**: A surface that frames a single, self-contained piece of content and its actions. M3 defines
  three variants — **elevated**, **filled**, **outlined**.
- **Actionable card**: A card whose entire surface (or a primary region of it) responds to interaction
  (hover/focus/press), showing a state layer and acting as a single control.
- **Divider**: A thin, non-interactive line that separates or groups content. M3 variants by inset:
  **full-width**, **inset** (indented on the leading side), **middle-inset** (indented on both sides).
- **List**: A vertical, continuous index of related rows.
- **List item**: One row of a list. M3 supports **one-line**, **two-line**, and **three-line** densities.
- **Leading element**: Content at the start of a list item — icon, avatar, image, or video thumbnail.
- **Trailing element**: Content at the end of a list item — supporting text, icon, or a selection control.
- **Interactive list item**: A list item that responds to hover/focus/press and activates on click/Enter.
- **Selectable list item**: A list item that carries a selection control (checkbox/switch) or a selected state.
- **Dialog**: A modal surface that interrupts the user to communicate information or request a decision.
  **Basic dialog** is centered with optional headline, supporting text, and up to two text actions;
  **full-screen dialog** fills a compact window with a top app bar (close/back + confirm action).
- **Bottom sheet**: A surface that slides up from the bottom edge. **Modal** blocks the rest of the UI
  behind a scrim; **standard** coexists with the content behind it.
- **Side sheet**: A surface that slides in from a side (end) edge. **Modal** blocks behind a scrim;
  **standard** coexists with content.
- **Drag handle**: A small affordance at the top of a bottom sheet indicating it can be dragged/resized/dismissed.
- **Carousel**: A horizontally scrollable run of items sized per an M3 layout strategy.
- **Carousel layouts**: **multi-browse** (mixed large/medium/small items), **uncontained** (uniform items
  that scroll past the edge), **hero** (one large focal item + a peeking next item), **full-screen**
  (one item filling the viewport, vertical on compact).
- **Scrim**: A translucent overlay that dims and blocks the content behind a modal surface.
- **Focus trap**: Keeping keyboard focus within a modal surface while it is open.
- **Restore focus**: Returning focus to the element that opened the surface once it closes.
- **Scroll lock**: Preventing the page behind a modal surface from scrolling while it is open.
- **Reduced motion**: The user preference requesting minimized or eliminated non-essential animation.
- **Compact window**: The M3 compact window size class (narrow viewports, e.g. phones).
- **APG**: WAI-ARIA Authoring Practices Guide.
- **Secondary entry point**: A separately importable sub-path of the published package (e.g. `@ngguide/ui/card`).

## Requirements

### Requirement 1: Card — anatomy and variants

**User Story:** As an app developer, I want an M3 card in elevated, filled, and outlined variants, so
that I can frame a single subject's content and actions consistently with the design system.

#### Acceptance Criteria

1. THE system SHALL provide a card surface in three variants: **elevated**, **filled**, and **outlined**.
2. WHEN the elevated variant is used THEN the system SHALL render the M3 elevated-card container color
   and the M3 resting elevation for an elevated card.
3. WHEN the filled variant is used THEN the system SHALL render the M3 filled-card container color and
   no resting elevation.
4. WHEN the outlined variant is used THEN the system SHALL render the M3 outlined-card container color
   with the M3 outline-variant border and no resting elevation.
5. THE system SHALL apply the M3 card corner-radius shape to every variant.
6. THE system SHALL allow arbitrary content to be placed inside the card (media, text, actions) without
   prescribing a fixed internal layout beyond M3 container padding/shape.
7. THE system SHALL clip card content to the card's rounded corners so that full-bleed media follows the
   card shape.

### Requirement 2: Card — actionable behavior and states

**User Story:** As an app developer, I want an optional actionable card, so that a whole card can behave
as a single control with the correct M3 interaction states.

#### Acceptance Criteria

1. WHEN a card is marked actionable THEN the system SHALL expose it to assistive technology and keyboard
   users as a single activatable control (focusable, activatable with Enter/Space, with an accessible name).
2. WHEN the pointer hovers, focuses, or presses an actionable card THEN the system SHALL display the M3
   hover, focus, and pressed state layers at the M3 state-layer opacities.
3. WHEN an elevated actionable card is hovered or pressed THEN the system SHALL apply the M3 elevation
   change defined for those states.
4. WHEN an actionable card is activated THEN the system SHALL emit an activation event the developer can handle.
5. WHEN a card is disabled THEN the system SHALL present the M3 disabled container/content treatment and
   SHALL NOT emit activation events or show interaction state layers.
6. THE system SHALL NOT add interaction states, focusability, or a control role to a non-actionable card.

### Requirement 3: Divider

**User Story:** As an app developer, I want an M3 divider, so that I can separate or group content within
lists and containers.

#### Acceptance Criteria

1. THE system SHALL provide a divider rendered with the M3 divider thickness and the M3 outline-variant color.
2. THE system SHALL support **full-width**, **inset**, and **middle-inset** variants, applying the M3 inset
   distance on the indicated side(s).
3. THE system SHALL expose the divider to assistive technology as a non-focusable separator that conveys
   it is a divider rather than meaningful content.
4. THE system SHALL NOT make the divider focusable or interactive.

### Requirement 4: List — anatomy and line densities

**User Story:** As an app developer, I want M3 list items in one-, two-, and three-line densities, so that
I can present rows of related content at the correct height and spacing.

#### Acceptance Criteria

1. THE system SHALL provide a list container that arranges its items as a continuous vertical run.
2. THE system SHALL provide list items in **one-line**, **two-line**, and **three-line** densities, each
   rendered at the corresponding M3 minimum row height and internal padding.
3. WHEN a list item has a headline and supporting text THEN the system SHALL render the headline with the
   M3 list headline typescale and the supporting text with the M3 list supporting-text typescale.
4. WHEN supporting text exceeds the lines available for the chosen density THEN the system SHALL truncate
   it per M3 (no overflow past the item's reserved lines).
5. THE system SHALL allow dividers to be placed between list items.

### Requirement 5: List — leading and trailing elements

**User Story:** As an app developer, I want to place leading and trailing elements in a list item, so that
I can show icons, avatars, images, supporting text, or controls in the M3 positions.

#### Acceptance Criteria

1. THE system SHALL support a leading element that is an icon, an avatar, an image, or a video thumbnail,
   positioned and sized per the M3 list anatomy for that element type.
2. THE system SHALL support a trailing element that is supporting text, an icon, or a selection control.
3. THE system SHALL align leading and trailing elements to the M3 vertical alignment for the item's density.
4. WHEN no leading element is present THEN the system SHALL apply the M3 text inset for items without a leading element.

### Requirement 6: List — interactive and selectable items

**User Story:** As an app developer, I want list items that can be interactive or selectable, so that users
can activate rows or choose items with correct M3 states and accessibility.

#### Acceptance Criteria

1. WHEN a list item is marked interactive THEN the system SHALL make it focusable and activatable with
   pointer and keyboard, displaying the M3 hover, focus, and pressed state layers.
2. WHEN an interactive list item is activated THEN the system SHALL emit an activation event the developer can handle.
3. WHEN a list item is selectable THEN the system SHALL communicate its selected/unselected state to
   assistive technology and render the M3 selected-item container treatment when selected.
4. WHEN a list item carries a trailing checkbox or switch THEN the system SHALL keep the control's state and
   the item's selected state in sync, and SHALL expose a single, non-duplicated accessible state to AT.
5. WHEN a list item is disabled THEN the system SHALL present the M3 disabled treatment and SHALL NOT emit
   activation events or show interaction state layers.
6. WHEN keyboard focus moves through an interactive list THEN the system SHALL follow the APG list/listbox
   focus model appropriate to whether the list is a presentation of links/buttons or a selection listbox.

### Requirement 7: Dialog — basic (centered) modal

**User Story:** As an app developer, I want an M3 basic dialog, so that I can interrupt the user for a
focused decision or short message with up to two actions.

#### Acceptance Criteria

1. WHEN a basic dialog is opened THEN the system SHALL present a centered modal surface with the M3 dialog
   container color, corner shape, elevation, and max-width constraints.
2. THE system SHALL support an optional leading icon, an optional headline, optional supporting text/content,
   and an actions area with up to two text actions aligned per M3.
3. WHEN the dialog is opened THEN the system SHALL apply the shared modal overlay behavior of Requirement 12
   (scrim, focus trap, restore focus, Escape to dismiss, scroll lock, dialog semantics).
4. WHEN the user activates an action or dismisses the dialog THEN the system SHALL emit a result that the
   opener receives, indicating which action (or a dismissal) closed the dialog.
5. WHEN dialog content is taller than the available height THEN the system SHALL scroll the content region
   while keeping the headline and actions visible per M3.
6. THE system SHALL allow the dialog to be opened imperatively from developer code and to be closed
   programmatically, returning a result to the caller.

### Requirement 8: Dialog — full-screen

**User Story:** As an app developer, I want an M3 full-screen dialog on compact windows, so that I can host
a longer, self-contained task that needs the whole screen.

#### Acceptance Criteria

1. WHEN a full-screen dialog is opened THEN the system SHALL fill the window with the M3 full-screen dialog
   surface and a top app bar containing a close/back affordance, a title, and a confirming action.
2. WHEN the user activates the close/back affordance or presses Escape THEN the system SHALL close the dialog
   and emit a dismissal result.
3. WHEN the user activates the confirming action THEN the system SHALL emit a confirm result the opener receives.
4. THE system SHALL apply the shared modal overlay behavior of Requirement 12, except the surface fills the
   window rather than presenting a centered card.
5. THE system SHALL scroll the dialog body independently of the fixed top app bar when content overflows.

### Requirement 9: Bottom sheet — modal, standard, and drag

**User Story:** As an app developer, I want an M3 bottom sheet in modal and standard variants, so that I can
surface supplementary content from the bottom edge, optionally draggable.

#### Acceptance Criteria

1. WHEN a modal bottom sheet is opened THEN the system SHALL slide a surface up from the bottom edge with
   the M3 bottom-sheet container color, top corner shape, and elevation, and SHALL apply the shared modal
   overlay behavior of Requirement 12.
2. WHEN a standard bottom sheet is opened THEN the system SHALL present the surface without a scrim and
   without blocking interaction with the content behind it.
3. THE system SHALL optionally render a drag handle at the top of the bottom sheet per M3.
4. WHEN the user drags the sheet (or drag handle) downward beyond the M3 dismissal threshold THEN the system
   SHALL dismiss the sheet; WHEN the drag does not exceed the threshold THEN the system SHALL settle the
   sheet back to its open position.
5. WHEN the sheet content exceeds the available height THEN the system SHALL scroll the content within the
   sheet rather than past the screen edge.
6. WHEN the user swipes/drags to dismiss or activates a dismissal control THEN the system SHALL emit a
   dismissal event the opener receives.
7. WHEN a drag gesture is in progress THEN the system SHALL not select page text or trigger native scroll on
   the page behind the sheet.

### Requirement 10: Side sheet — modal and standard

**User Story:** As an app developer, I want an M3 side sheet in modal and standard variants, so that I can
surface supplementary content from a side edge.

#### Acceptance Criteria

1. WHEN a side sheet is opened THEN the system SHALL slide a surface in from the end edge with the M3
   side-sheet container color, corner shape, elevation, and width constraints.
2. WHEN the modal variant is used THEN the system SHALL apply the shared modal overlay behavior of
   Requirement 12 (scrim, focus trap, restore focus, Escape, scroll lock, dialog semantics).
3. WHEN the standard variant is used THEN the system SHALL present the surface without a scrim and without
   blocking interaction with the content beside it.
4. THE system SHALL support an optional header region (title + close affordance) and an actions region per M3.
5. WHEN the user activates the close affordance or (modal only) presses Escape THEN the system SHALL close
   the side sheet and emit a dismissal event.
6. WHEN side-sheet content overflows THEN the system SHALL scroll the content region within the sheet.

### Requirement 11: Carousel — layouts and items

**User Story:** As an app developer, I want an M3 carousel in its four layouts, so that I can present a
scrollable run of visually prominent items.

#### Acceptance Criteria

1. THE system SHALL provide a carousel that arranges its items horizontally in a scrollable run.
2. THE system SHALL support the **multi-browse**, **uncontained**, **hero**, and **full-screen** layouts,
   sizing items per the M3 strategy for the chosen layout.
3. WHEN the multi-browse or hero layout is used THEN the system SHALL size items into large/medium/small (or
   large + peeking) roles per the M3 sizing rules, including the smaller item peeking at the trailing edge.
4. THE system SHALL clip each carousel item to the M3 carousel item corner shape.
5. WHEN the available width changes THEN the system SHALL re-fit the visible items per the layout's sizing
   strategy without leaving partially-cut items in disallowed positions for that layout.
6. WHEN the full-screen layout is used on a compact window THEN the system SHALL present one item filling the
   viewport and scroll vertically per M3.

### Requirement 12: Shared modal overlay behavior

**User Story:** As a keyboard and screen-reader user, I want every modal containment surface to trap focus,
restore it, and be dismissible, so that modal surfaces are operable and accessible per APG.

#### Acceptance Criteria

1. WHEN any modal surface (basic dialog, full-screen dialog, modal bottom sheet, modal side sheet) opens THEN
   the system SHALL render a scrim that dims and blocks pointer interaction with the content behind it.
2. WHEN a modal surface opens THEN the system SHALL move keyboard focus into the surface and SHALL keep focus
   within the surface (focus trap) until it closes.
3. WHEN a modal surface closes THEN the system SHALL return focus to the element that had focus before it opened.
4. WHEN the user presses Escape while a modal surface is open THEN the system SHALL close it and emit a
   dismissal result, unless the surface is explicitly configured as non-dismissible.
5. WHEN the user clicks the scrim THEN the system SHALL close the surface and emit a dismissal result, unless
   configured as non-dismissible.
6. WHEN a modal surface is open THEN the system SHALL prevent the page behind it from scrolling (scroll lock)
   and restore the prior scroll behavior on close.
7. THE system SHALL expose each modal surface with the appropriate dialog semantics (a dialog role and modal
   state) and an accessible name derived from its headline/title.
8. WHEN multiple modal surfaces are stacked THEN the system SHALL direct Escape and focus trapping to the
   top-most surface and restore focus in reverse order as they close.

### Requirement 13: Token and theming compliance

**User Story:** As a design-system maintainer, I want every containment component styled only from the M3
token contract, so that theming and light/dark switching work without per-component overrides.

#### Acceptance Criteria

1. THE system SHALL derive every color, shape, elevation, typography, and state-layer value from the
   published `--md-sys-*` token contract.
2. THE system SHALL NOT hard-code color, corner-radius, elevation, or typography values that bypass the token contract.
3. WHEN the active theme switches between light and dark (or contrast levels) THEN every containment
   component SHALL update to the new token values without component-level changes.
4. THE system SHALL reuse the shared interaction primitives (state-layer / ripple / focus-ring) for all
   interactive containment surfaces rather than re-implementing interaction states.

### Requirement 14: Accessibility

**User Story:** As a user relying on assistive technology, I want containment components to follow APG and
meet WCAG 2.2 AA, so that I can perceive and operate them.

#### Acceptance Criteria

1. THE system SHALL implement dialogs and modal sheets per the APG Dialog (Modal) pattern, including
   `role`, modal state, labeling, focus management, and Escape handling.
2. THE system SHALL implement interactive/selectable lists per the applicable APG pattern (list of controls
   vs. listbox) including keyboard operation and selection state exposure.
3. THE system SHALL ensure every interactive containment surface is reachable and operable by keyboard alone.
4. THE system SHALL render a visible focus indicator on every focusable containment surface, meeting the
   WCAG 2.2 AA non-text-contrast and focus-appearance requirements.
5. THE system SHALL NOT convey state (selected, disabled, expanded) by color alone.

### Requirement 15: Motion and reduced motion

**User Story:** As a user who is sensitive to motion, I want containment transitions to respect my reduced-
motion preference, so that opening surfaces does not cause discomfort.

#### Acceptance Criteria

1. WHEN a dialog, sheet, or carousel transition plays THEN the system SHALL use the M3 motion duration and
   easing tokens for that transition.
2. WHEN the user has requested reduced motion THEN the system SHALL minimize or remove non-essential
   enter/exit and scroll animations while preserving the open/closed and scroll *state* changes.
3. THE system SHALL keep all open/close and selection behavior fully functional when animations are reduced or removed.

### Requirement 16: Packaging and developer API surface

**User Story:** As an app developer, I want each containment component published as its own importable entry
point, so that I can import only what I use.

#### Acceptance Criteria

1. THE system SHALL publish each containment family as a secondary entry point of the package (e.g.
   `@ngguide/ui/card`, `/divider`, `/list`, `/dialog`, `/bottom-sheet`, `/side-sheet`, `/carousel`).
2. THE system SHALL provide an imperative way to open dialogs and sheets from developer code that returns a
   handle/result, in addition to any declarative usage.
3. THE system SHALL render correctly under server-side rendering and rehydrate without layout shift or errors,
   and SHALL operate without relying on a change-detection zone.
4. THE system SHALL behave deterministically (no reliance on wall-clock time or randomness in its rendered
   output) so that snapshots and server/client output match.

## Constraints

- **M3 fidelity** — every visual and behavioral choice must trace to a specific guideline at
  m3.material.io; ambiguities are recorded as open questions in research, not improvised. (Project rule
  inherited from `vision.md`.)
- **Built from scratch** — components are implemented directly against the M3 spec and the project's own
  token + interaction foundation; they are not wrappers around Angular Material.
- **Token contract** — components must consume the existing `--md-sys-*` token contract defined by the
  `m3-tokens` spec; they must not define their own color/shape/elevation values. (Existing integration.)
- **Interaction foundation** — interactive surfaces and modal/overlay behavior must build on the existing
  `m3-interaction-foundation` primitives (state-layer/ripple/focus-ring and the shared overlay/focus
  utilities) rather than re-implementing them. (Existing integration.)
- **Zoneless + standalone + OnPush + signals** — components must work in a zoneless app, be standalone,
  use OnPush change detection, and use signal inputs, consistent with the rest of the library.
- **Secondary entry points** — each family ships as its own `@ngguide/ui/<name>` entry point, matching the
  established library packaging.

## Non-functional Requirements

- **Accessibility**: Meets WCAG 2.2 AA; dialogs and modal sheets conform to the APG Dialog (Modal) pattern;
  interactive lists conform to the applicable APG list/listbox pattern.
- **SSR safety**: Renders under server-side rendering and rehydrates without errors or layout shift; no use
  of wall-clock time or randomness in rendered output (deterministic).
- **Theming**: Light/dark and contrast-level switching is reflected by all components purely through token
  changes, with no per-component style overrides required.
