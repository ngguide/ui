---
created: 2026-06-03
updated: 2026-06-03
---

# Research: Communication Components

## Problem Statement

We need to implement the Material Design 3 (M3) **communication** components — badge, progress
indicators (linear/circular), loading indicator, snackbar, and tooltips (plain/rich) — as
secondary entry points of `@ngguide/ui`, strictly per [m3.material.io](https://m3.material.io/) and
the relevant WAI-ARIA APG patterns. The kit already ships a CDK-overlay infrastructure, an M3 token
system, and an interaction foundation; the research question is *how each component family should be
structured on top of that existing infrastructure*, surfacing meaningfully distinct approaches with
honest tradeoffs.

This catalogue presents options only — decisions happen in `spec:design`.

## Problem Areas

### 1. Badge — anchoring and rendering

_Related requirements: 1.1–1.7, 2.1–2.3_

The badge must overlay a host element's corner (icon, icon button, avatar, nav item), render as a
dot (small) or numeric label (large), cap at "999+", and contribute its meaning to the host's
accessible name without becoming a separate focusable node.

#### Variant A: Attribute directive on the host (`[guiBadge]`)

**How it works:** A directive applied directly to the host element. It creates and positions a child
badge element (absolutely positioned in the host's corner), reads inputs (`guiBadge` value,
`guiBadgeMax`, `guiBadgeHidden`, dot vs numeric), and toggles `aria-hidden` on the badge graphic
while leaving the host to own the accessible name. The host needs `position: relative` (the directive
can set it).

**Pros:**
- Zero extra wrapper DOM around the host; cleanest markup (`<button gui-icon-button guiBadge="3">`).
- Matches the kit's attribute-selector convention (button/fab/icon, `guiTextFieldInput`).
- Easy to apply to existing components without changing their template.

**Cons:**
- Directive imperatively injects/positions a DOM node (renderer work), slightly more complex than a
  template.
- Requires care so the injected node doesn't disrupt host flex/grid layout.

**Effort:** Low–Medium | **Risk:** Low
**Codebase fit:** Strong — mirrors the attribute-directive style of `guiTextFieldInput`/`gui-button`
host directives. Inline-SVG/`gui-icon` not needed (badge is text/dot).
**Evidence:** Attribute-directive + host-binding convention confirmed in `libs/ui/button/src/button.ts`
and `libs/ui/text-field/src/text-field-input.ts` [codebase].

#### Variant B: Wrapper component with content projection (`<gui-badge>`)

**How it works:** A component that wraps the host: `<gui-badge value="3"><gui-icon>…</gui-icon></gui-badge>`.
The badge surface is rendered by the component template; the host is `<ng-content>`. The component owns
`position: relative` and corner placement.

**Pros:**
- Fully declarative template; positioning lives in component CSS, no imperative DOM injection.
- Self-contained styling and a11y wiring.

**Cons:**
- Adds a wrapper element around every badged host, which can interfere with parent layout (e.g. a nav
  item expecting the icon as a direct child).
- Less ergonomic for badging an existing button than a single attribute.

**Effort:** Low | **Risk:** Low–Medium
**Codebase fit:** Moderate — projection components exist (`gui-text-field`), but the kit leans toward
attribute selectors for "decorate an existing element" cases.
**Evidence:** Content-projection component pattern in `libs/ui/text-field/src/text-field.ts` [codebase].

#### Variant C: Standalone badge, consumer-positioned

**How it works:** A presentational `<gui-badge>` that only renders the dot/label; the consumer is
responsible for anchoring it (their own `position: relative` container + placing the badge).

**Pros:**
- Maximum flexibility; the component has no opinions about the host.

**Cons:**
- Pushes M3 placement rules onto every consumer → high risk of inconsistent, non-spec placement.
- Contradicts the "spec-literal placement" requirement (1.1).

**Effort:** Low | **Risk:** Medium (placement drift)
**Codebase fit:** Weak — offloads M3 anatomy to consumers, against the project vision.
**Evidence:** —

---

### 2. Progress and loading — rendering and animation

_Related requirements: 3.1–3.6, 4.1–4.5, 5.1–5.4, 6.1–6.5, 14.1–14.2_

Three visuals: linear progress (track + active indicator + gap + stop indicator, rounded ends),
circular progress (arc + track + gap), and the loading indicator (M3's animated morphing 7-shape
sequence). Each progress type has determinate (value 0–1) and indeterminate modes; all must honor
reduced motion and expose progressbar semantics.

#### Variant A: Pure CSS

**How it works:** Linear via nested `<div>`s with `transform: scaleX()` for the active indicator and
CSS `@keyframes` for indeterminate; circular via `conic-gradient` (determinate) and CSS rotation
(indeterminate). Reduced motion via `@media (prefers-reduced-motion)`.

**Pros:**
- No SVG; smallest determinate-linear implementation; GPU-friendly transforms.
- Reduced-motion handled entirely in CSS media query.

**Cons:**
- M3 circular *gap* + *rounded arc ends* are hard to render faithfully with `conic-gradient`
  (rounded caps and the track/indicator gap need extra masking).
- The loading indicator's shape-morph cannot be done in pure CSS faithfully (it is a path morph).
- Stop indicator + gap on linear need careful pseudo-element work.

**Effort:** Medium | **Risk:** Medium (circular fidelity)
**Codebase fit:** Neutral — CSS-token-driven styling is the kit norm.
**Evidence:** Motion/shape tokens exist (`_motion.css`, `_shape.css`); reduced-motion utility
`GuiReducedMotion` in `@ngguide/ui/interaction` [codebase].

#### Variant B: SVG-based for all three

**How it works:** Circular via `<svg><circle>` with `stroke-dasharray`/`stroke-dashoffset` +
`stroke-linecap="round"` for rounded ends and a second circle for the track (gap via dash offset);
linear via SVG rects (or CSS — see Variant C); loading indicator via an `<svg><path>` morph between
the M3 shapes (animated `d` interpolation or a small shape-tween engine, deterministic/no RNG).

**Pros:**
- Faithful M3 circular anatomy: rounded arc ends, precise gap, exact stroke width.
- SVG path morph is the natural fit for the loading indicator's shape sequence.
- Reuses the inline-SVG convention already in the kit (`viewBox`, `fill/stroke=currentColor`).

**Cons:**
- More markup/geometry math than CSS for the simple linear case.
- Path-morph engine for the loading indicator is the most involved piece (must be deterministic and
  SSR-safe — no `Math.random()`/`Date.now()`).

**Effort:** Medium–High | **Risk:** Medium
**Codebase fit:** Strong for SVG (inline-SVG convention in `libs/ui/chip`, `date-picker`,
`time-picker`); the clock-dial in `time-picker` already does trig-driven SVG geometry [codebase].
**Evidence:** Inline-SVG geometry precedent in `libs/ui/time-picker/src/clock-dial.ts` and
`libs/ui/chip/src/chip.ts` [codebase].

#### Variant C: Hybrid — CSS linear, SVG circular + loading

**How it works:** Linear progress as pure CSS (transforms + keyframes, easiest and faithful); circular
progress and loading indicator as SVG (rounded caps, gap, path morph).

**Pros:**
- Each visual uses the technique it's best suited to; faithful across all three.
- Avoids `conic-gradient` rounded-cap/gap pain while keeping linear minimal.

**Cons:**
- Two rendering techniques in one entry-point family (minor cohesion cost).

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Strong — combines the two precedents already in the kit.
**Evidence:** As Variant A + B above [codebase].

> Note: M3's August-2024 "expressive" update adds wavy/variable-height progress tracks. Whether to
> implement classic, expressive, or both is an **open question** (see Open Questions) — it affects
> effort here but not the choice of rendering technique.

---

### 3. Snackbar — service, overlay, queue, and positioning

_Related requirements: 7.1–7.7, 8.1–8.3, 9.1–9.7, 10.1–10.3, 14.1_

Snackbar is invoked programmatically, shows one at a time with a FIFO queue, auto-dismisses
(pausable), supports swipe-dismiss, an optional action and close, reports a close reason, positions
at the bottom (M3 placement, above a declared FAB), and announces via a live region without stealing
focus. The constraint from requirements is to reuse `@angular/cdk/overlay` (as the pickers do).

#### Variant A: Extend the existing `GuiPickerOverlay` service with a global-bottom opener

**How it works:** Add an `openGlobal()` (or `openBottom()`) method to `GuiPickerOverlay` that uses a
CDK `GlobalPositionStrategy` anchored bottom (centered/leading per breakpoint) with a `noop`/
`reposition` scroll strategy and **no backdrop, no focus trap** (snackbar must not steal focus). A
separate `GuiSnackbar` service owns the queue (a signal-backed FIFO), auto-dismiss timer (pausable on
hover/focus per 9.7), `LiveAnnouncer` call, and close-reason plumbing. The snackbar surface is a
component rendered via `TemplatePortal`/`ComponentPortal`.

**Pros:**
- Honors the "reuse CDK overlay infra" constraint literally; one overlay service for the kit.
- Queue/timer/announce logic stays in a focused snackbar service.

**Cons:**
- `GuiPickerOverlay` currently centers (`openModal`) or docks (`openDocked`); adding a third,
  no-focus-trap, bottom-anchored mode widens its responsibility.
- Must ensure the new mode never captures focus (the existing methods do focus management).

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Strong — extends the exact service the constraint points at.
**Evidence:** `GuiPickerOverlay` uses `Overlay`, `GlobalPositionStrategy`, `ScrollStrategyOptions`,
focus capture/trap in `libs/ui/overlay/src/picker-overlay.ts` [codebase]; `LiveAnnouncer` ships in
`@angular/cdk/a11y` (same package already used for `ConfigurableFocusTrapFactory`) [needs version
confirmation via context7].

#### Variant B: Dedicated `GuiSnackbar` service using CDK overlay directly

**How it works:** A new service constructs its own `OverlayRef` via `Overlay.create()` with a
`GlobalPositionStrategy().bottom().centerHorizontally()` (breakpoint-aware), bypassing
`GuiPickerOverlay` entirely. Queue, timer, announce, swipe, and FAB-offset live here.

**Pros:**
- Snackbar's overlay config (no backdrop, no trap, bottom anchor, FAB offset, max-width) is
  self-contained and not constrained by the picker service's shape.
- Clear separation: pickers vs transient feedback.

**Cons:**
- Two places that call `Overlay.create()` directly (some duplication of overlay boilerplate).
- Slightly looser reading of the "reuse the picker overlay service" constraint (still reuses the CDK
  overlay *package*, just not the wrapper service).

**Effort:** Medium | **Risk:** Low
**Codebase fit:** Strong for CDK usage; moderate against the literal "reuse `GuiPickerOverlay`" wording.
**Evidence:** CDK overlay primitives confirmed available and used [codebase, picker-overlay.ts].

#### Variant C: Fixed-position container component, no overlay

**How it works:** A host-rendered `<gui-snackbar-container>` placed once near the app root, with
`position: fixed; bottom`. The service pushes snackbars into the container's signal queue; no CDK
overlay.

**Pros:**
- No overlay layering concerns; trivially simple positioning.

**Cons:**
- Requires the consumer to place the container in their app shell (extra setup, easy to forget).
- Reimplements stacking/z-index/viewport concerns the overlay already solves; ignores the reuse
  constraint.
- FAB-offset and breakpoint placement become bespoke.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Weak — diverges from the established overlay approach and the stated constraint.
**Evidence:** —

> A11y note (applies to all variants): WAI-ARIA APG's *alert* pattern cautions against auto-dismiss
> (WCAG 2.2.3) and uses `role="alert"` (assertive). M3 snackbars *do* auto-dismiss. The reconciling
> approach is `role="status"`/`aria-live="polite"` (or `LiveAnnouncer` polite) **plus** the
> requirement-9.7 timer-pause-on-hover/focus and a reachable action, so the user gets adequate time.
> This is a documented tradeoff, not a variant choice.

---

### 4. Tooltip — overlay positioning and trigger handling (plain + rich)

_Related requirements: 11.1–11.7, 12.1–12.5, 13.1–13.4, 14.1_

Plain tooltip = non-interactive text, shown on hover/focus/long-press, `aria-describedby` on the
trigger, Escape to dismiss. Rich tooltip = subhead + body + optional **interactive** actions,
persistent (stays open when the pointer moves into it), focusable actions. Both anchor to the trigger
and stay in the viewport. Constraint: reuse CDK overlay.

#### Variant A: One directive `[guiTooltip]` for both, via `GuiPickerOverlay.openDocked`

**How it works:** A single directive on the trigger. `guiTooltip="text"` → plain; a
`guiTooltip`-with-template/`[guiRichTooltip]` input → rich. It opens a connected overlay using the
existing docked opener (flexible connected position, preferred above/below), wires hover/focus/
long-press listeners and Escape, and sets `aria-describedby`.

**Pros:**
- Reuses the picker overlay service; single import for consumers.
- Directive-on-trigger matches the kit convention.

**Cons:**
- `openDocked` defaults to *below* dropdown positions; tooltips prefer above-then-below with small
  offsets — needs a tooltip-specific position set (extend the service or pass positions in).
- Plain (non-interactive, `aria-describedby`, no focus) and rich (interactive, focus into actions,
  persistent) have materially different a11y/lifecycles; cramming both into one directive risks a
  muddy API.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Strong (directive + overlay reuse).
**Evidence:** `openDocked` uses `flexibleConnectedTo` + `STANDARD_DROPDOWN_BELOW_POSITIONS` in
`picker-overlay.ts` [codebase].

#### Variant B: Split — `[guiTooltip]` directive (plain) + `<gui-rich-tooltip>` component (rich)

**How it works:** Plain tooltip is a lightweight directive (hover/focus/long-press, `aria-describedby`,
a small connected overlay or even a CSS-only fallback for the simplest case). Rich tooltip is a
component/directive pair driving a connected overlay that contains projected interactive content,
manages "keep open while pointer enters tooltip", and focus handling for actions.

**Pros:**
- Each tooltip type gets the API and a11y lifecycle it actually needs; plain stays tiny, rich owns
  interactivity.
- Mirrors how M3 itself documents plain vs rich as distinct patterns.

**Cons:**
- Two public surfaces instead of one.
- Some shared positioning/trigger logic to factor out (a small internal helper).

**Effort:** Medium–High | **Risk:** Low–Medium
**Codebase fit:** Strong — the kit already splits presentational vs interactive concerns (e.g.
text-field directives vs component).
**Evidence:** Split-surface precedent in `libs/ui/text-field` (input directive + field component)
[codebase].

#### Variant C: CDK `CdkOverlay`/`cdkConnectedOverlay` template approach

**How it works:** Use the CDK `cdkConnectedOverlay` *directive* in templates (not the `GuiPickerOverlay`
service) with explicit `connectedPosition` arrays, wiring triggers in the host component.

**Pros:**
- Maximum positioning control declaratively in templates.

**Cons:**
- Bypasses the `GuiPickerOverlay` service the kit standardized on (looser fit with the reuse
  constraint).
- Pushes overlay wiring into each consumer template rather than encapsulating it in a directive.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Moderate — uses CDK but not the kit's overlay service wrapper.
**Evidence:** —

---

### 5. Shared accessibility — live region and reduced motion

_Related requirements: 6.1–6.5, 10.1–10.3, 13.1–13.4, 14.1–14.2_

Cross-cutting a11y concerns: announcing snackbars to AT without focus theft, progressbar semantics,
tooltip association/Escape, and honoring reduced motion across indeterminate animations.

#### Variant A: Reuse CDK `@angular/cdk/a11y` + interaction foundation utilities

**How it works:** Snackbar announcements via CDK `LiveAnnouncer` (polite). Reduced motion via the
existing `GuiReducedMotion` utility from `@ngguide/ui/interaction` for any JS-driven motion, plus
`@media (prefers-reduced-motion)` in CSS for declarative animations. Progressbar via native
`role="progressbar"` + `aria-valuenow/min/max/valuetext`. Tooltip via `aria-describedby` + Escape
handler.

**Pros:**
- Reuses first-party CDK + the kit's own foundation; no reinvented a11y primitives.
- `LiveAnnouncer` handles the polite live-region element lifecycle for us.

**Cons:**
- Depends on `LiveAnnouncer` behavior (single shared live region) — fine for one-at-a-time snackbars.

**Effort:** Low | **Risk:** Low
**Codebase fit:** Strong — `@angular/cdk/a11y` already a dependency; `GuiReducedMotion` exists.
**Evidence:** `GuiReducedMotion` exported from `@ngguide/ui/interaction`; CDK a11y used in
`picker-overlay.ts` [codebase].

#### Variant B: Custom aria-live region element per surface

**How it works:** Each component manages its own `aria-live` region in its template rather than using
`LiveAnnouncer`; reduced motion handled purely in CSS.

**Pros:**
- No dependency on `LiveAnnouncer`'s shared-region semantics; explicit per-component control.

**Cons:**
- Reimplements what `LiveAnnouncer` already provides; more code, easy to get wrong (timing,
  clearing, atomic).
- Multiple live regions can produce duplicate/disordered announcements.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Neutral.
**Evidence:** —

---

## Verified M3 Measurements (read from live m3.material.io, 2026-06-03)

The exact M3 anatomy below was read directly from the live spec pages via agent-browser (the
measurement/color tables that WebFetch could not extract). Values shown as figures-only on the page
(rather than text/token rows) are flagged `[figure — M3 standard token]` and use the documented M3
component token.

### Badge — `m3.material.io/components/badges/specs`
- **Small badge** (dot): size **6dp** (H×W), corner radius **3dp**.
- **Large badge** (one digit): **16dp** (H×W), corner radius **8dp**.
- **Large badge, max character count**: **16×34dp** (H×W).
- **Large badge padding** between badge and text container: **4dp**.
- **Placement offset** (top-trailing icon corner → bottom-leading badge corner): small badge
  **6×6dp**, large badge **14×12dp**.
- **Color roles**: small badge = **Error**; large badge container = **Error**, label = **On error**;
  max-character-count container = **Error**, label = **On error**.
- **Max-count value**: the spec defines a "maximum character count" container/label but does not state
  the numeric cap as text — "999+" is the conventional default; expose it configurable. _(value still
  open — not given numerically on the page)_

### Progress indicators — `m3.material.io/components/progress-indicators/specs`
- **Linear track thickness**: **4dp** (default); thickness is "Default (4dp) and variable".
- **Linear inset** from the screen edge: **4dp**.
- **Shape**: **flat and wavy** (wavy = M3 Expressive; wavy uses *amplitude* = center-of-rest →
  center-of-peak, and *wavelength* = distance between adjacent peaks).
- **Behavior**: determinate (default) + indeterminate, for both linear and circular.
- **Color roles** (shared): active indicator = **Primary**, track = **Secondary container**, stop
  indicator = **Primary**.
- **Availability**: linear and circular both available in **M3** and **M3 Expressive**. The old
  separate circular/linear token sets are deprecated ("no longer recommended").
- **Circular diameter / stroke / gap**: shown only in the interactive token browser (not
  text-extractable). `[figure]` — use the M3 circular token defaults during implementation (commonly
  **48dp** container, **4dp** active stroke); confirm against the token browser when building.

### Loading indicator — `m3.material.io/components/loading-indicator/specs`
- **Size**: **48dp** overall, with the **shape container 38dp** ("the size is 48dp while the shape
  container is 38dp" — the 48dp gives margins around the 38dp morphing shape).
- **Variants**: default and **Contained**.
- **Color roles**: default = **Primary** (active indicator); **Contained** = active indicator
  **On primary container**, container **Primary container**.
- **Behavior**: "show the progress for a short wait time"; active indicator morphs through the M3
  shape sequence; **single token set**.

### Snackbar — `m3.material.io/components/snackbar/specs`
- **Color roles**: container = **Inverse surface**, supporting text + close icon = **Inverse on
  surface**, action = **Inverse primary**.
- **Variants**: single line, single line with action, two lines, two lines with action, two lines
  with longer action. Optional close icon, optional action.
- **Container shape / elevation / min-max width / padding**: shown as figures, not token rows.
  `[figure — M3 standard token]` — container shape = **corner-extra-small (4dp)**, elevation =
  **level 3**; confirm exact width/padding against the figures during build.

### Tooltips — `m3.material.io/components/tooltips/specs`
- **Plain tooltip**: container = **Inverse surface**, supporting text = **Inverse on surface**;
  **container height 24dp**, **padding 8dp**. Corner `[figure]` = **corner-extra-small (4dp)**.
- **Rich tooltip**: container = **Surface container**, subhead + supporting text = **On surface
  variant**; padding **top 12dp / bottom 8dp / left+right 16dp**. Corner `[figure]` =
  **corner-medium (12dp)**. Configurations: subhead + supporting text + **up to two buttons** (the
  headline and number of buttons are configurable).

### Accessibility (APG, fetched 2026-06-03)
- **Tooltip**: `role="tooltip"`, associate via `aria-describedby` on the trigger, **Escape** dismisses
  while focus stays on the trigger; hover tooltip stays open while pointer is over trigger or tooltip.
- **Snackbar / alert**: `role="alert"` is assertive and APG cautions against auto-dismiss (WCAG
  2.2.3). Reconcile M3's auto-dismiss with `role="status"` / polite **plus** timer-pause-on-hover/focus
  and a reachable action (requirement 9.7).
- **Progressbar**: `role="progressbar"`; `aria-valuenow` **required for determinate**, **omit for
  indeterminate**; `aria-valuemin`/`max` default 0/100; `aria-valuetext` optional.

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. Badge | A: `[guiBadge]` directive on host | Low–Med | Low | Strong (attr-selector convention) |
| 1. Badge | B: `<gui-badge>` wrapper + projection | Low | Low–Med | Moderate |
| 1. Badge | C: Standalone, consumer-positioned | Low | Med | Weak (placement drift) |
| 2. Progress/loading | A: Pure CSS | Med | Med | Neutral |
| 2. Progress/loading | B: SVG for all three | Med–High | Med | Strong (SVG precedent) |
| 2. Progress/loading | C: Hybrid CSS-linear + SVG-circular/loading | Med | Low–Med | Strong |
| 3. Snackbar | A: Extend `GuiPickerOverlay` + queue service | Med | Low–Med | Strong (literal reuse) |
| 3. Snackbar | B: Dedicated service on CDK overlay directly | Med | Low | Strong CDK / moderate vs wording |
| 3. Snackbar | C: Fixed container, no overlay | Med | Med | Weak |
| 4. Tooltip | A: One `[guiTooltip]` via openDocked | Med | Med | Strong |
| 4. Tooltip | B: Split plain directive + rich component | Med–High | Low–Med | Strong |
| 4. Tooltip | C: `cdkConnectedOverlay` templates | Med | Med | Moderate |
| 5. A11y | A: Reuse CDK a11y + GuiReducedMotion | Low | Low | Strong |
| 5. A11y | B: Custom per-surface live regions | Med | Med | Neutral |

## Cross-area dependencies

- **Area 3 (Snackbar) ↔ Area 5 (A11y):** Snackbar's announcement approach (LiveAnnouncer polite +
  timer-pause) depends on picking Area-5 Variant A. Picking Area-5 Variant B would push live-region
  management into the snackbar service itself.
- **Area 3 & 4 ↔ overlay service shape:** Snackbar Variant A and Tooltip Variant A both *extend*
  `GuiPickerOverlay` (new bottom-global opener; tooltip-specific connected positions). If the user
  prefers not to widen that service, Snackbar Variant B / Tooltip Variant C keep it untouched at the
  cost of some duplication. These choices should be made together for overlay consistency.
- **Area 2 (loading indicator):** Whichever rendering variant is chosen, the loading indicator's
  shape-morph effectively requires SVG (Variant B or C), so a pure-CSS Area-2 choice (Variant A)
  still needs an SVG escape hatch for the loading indicator specifically.

## Codebase Insights

- **Overlay service** `GuiPickerOverlay` (`libs/ui/overlay/src/picker-overlay.ts`) wraps CDK
  `Overlay` with `openDocked` (flexible connected, `STANDARD_DROPDOWN_BELOW_POSITIONS`, reposition
  scroll) and `openModal` (global center, block scroll, focus trap + focus restore). It returns
  `GuiOverlayHandle { ref, closed, close() }`. No bottom-anchored, no-focus-trap mode exists yet —
  the snackbar needs one.
- **Overlay CSS** ships manually in `libs/ui/src/styles/overlay.css` (CDK container/backdrop/pane +
  `.gui-overlay-scrim` using `--md-sys-color-scrim`), imported by `theme.css`. New floating surfaces
  inherit this container styling.
- **Tokens** present and sufficient: error/on-error/error-container (badge), primary +
  secondary-container (progress), inverse-surface/inverse-on-surface/inverse-primary (snackbar),
  surface-container roles (tooltip), full motion/shape/elevation/state token sets
  (`libs/ui/src/styles/tokens/_*.css`).
- **Interaction foundation** (`@ngguide/ui/interaction`) exposes `GuiStateLayerDirective`,
  `GuiRippleDirective`, `GuiFocusRingDirective`, `GuiReducedMotion`, and roving-focus helpers.
  `gui-button` already composes the first three — snackbar action and rich-tooltip action buttons can
  just use `gui-button`/`gui-icon-button`.
- **SVG geometry precedent**: `libs/ui/time-picker/src/clock-dial.ts` (trig-driven SVG) and
  `libs/ui/chip/src/chip.ts` (inline Material-Symbols SVG, `viewBox="0 -960 960 960"`,
  `fill="currentColor"`) — directly reusable for progress/loading and snackbar/tooltip icons.
- **Entry-point wiring**: each component is `libs/ui/<name>/{ng-package.json, src/index.ts}`, a
  `tsconfig.base.json` `paths` entry `@ngguide/ui/<name>`, and spec files appended to
  `libs/ui/project.json` `test.options.include`.
- **No CVA**: `GuiFormControl` is irrelevant here — every communication component is presentational/
  feedback, none tracks form input.

## Sources

_M3 component specification pages do not yield their anatomy/measurement tables to WebFetch (JS-driven
token browser + figures). The measurements in the "Verified M3 Measurements" section above were read
directly from the live pages via **agent-browser** on 2026-06-03 (same approach used for text-inputs).
Values shown only as figures are flagged `[figure]` and use the documented M3 standard token._

- [m3-badge] https://m3.material.io/components/badges/specs — read via agent-browser 2026-06-03 (sizes, corners, offsets, error roles)
- [m3-progress] https://m3.material.io/components/progress-indicators/specs — read via agent-browser 2026-06-03 (4dp track, 4dp inset, primary/secondary-container roles, flat+wavy)
- [m3-loading] https://m3.material.io/components/loading-indicator/specs — read via agent-browser 2026-06-03 (48dp/38dp, primary / contained roles)
- [m3-snackbar] https://m3.material.io/components/snackbar/specs — read via agent-browser 2026-06-03 (inverse-surface/on-surface/primary roles, single/two-line variants)
- [m3-tooltips] https://m3.material.io/components/tooltips/specs — read via agent-browser 2026-06-03 (plain 24dp/8dp inverse roles; rich 12/8/16dp surface-container/on-surface-variant, up to two buttons)
- [apg-tooltip] https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/ — fetched 2026-06-03 (role=tooltip, aria-describedby, Escape, focus stays on trigger)
- [apg-alert] https://www.w3.org/WAI/ARIA/apg/patterns/alert/ — fetched 2026-06-03 (role=alert assertive, no focus theft, auto-dismiss caution per WCAG 2.2.3)
- [apg-range] https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/ — fetched 2026-06-03 (progressbar: aria-valuenow required for determinate, omit for indeterminate; valuemin/max default 0/100; valuetext optional)
- [codebase] `libs/ui/overlay/src/picker-overlay.ts`, `libs/ui/src/styles/overlay.css`, `libs/ui/src/styles/tokens/_*.css`, `libs/ui/interaction/src/index.ts`, `libs/ui/button/src/button.ts`, `libs/ui/chip/src/chip.ts`, `libs/ui/time-picker/src/clock-dial.ts`, `libs/ui/text-field/src/*`, `libs/ui/project.json`, `tsconfig.base.json` — read 2026-06-03

## Open Questions

_Most measurement questions were closed by reading the live M3 pages (see "Verified M3 Measurements").
The following remain — they are either figure-only values to confirm at build time or genuine
decisions for `spec:design`._

- [x] Badge measurements / color roles — **closed**: 6dp dot (3dp corner), 16dp large (8dp corner),
  16×34dp max-count, 4–6–14×12dp offsets/padding, Error / On error roles.
- [ ] **Badge max-count value**: the numeric cap is not stated as text on the page; default to "999+"
  and expose configurable. _(value not published; decision)_
- [x] Linear progress — **closed**: 4dp track, 4dp inset, Primary / Secondary container / Primary roles,
  flat + wavy.
- [ ] **Circular progress diameter/stroke/gap**: figure-only on the page; use M3 circular token
  defaults (≈48dp/4dp) and confirm against the token browser at build time. _(figure — confirm)_
- [ ] **Expressive vs classic progress**: implement classic only, expressive (wavy/variable thickness)
  only, or both? Spec lists both as available. _(decision for design)_
- [x] Loading indicator — **closed**: 48dp size / 38dp shape container, default Primary + Contained
  (on-primary-container / primary-container), morphing shapes, single token set.
- [x] Snackbar color roles + variants — **closed**: inverse-surface / inverse-on-surface /
  inverse-primary; single + two-line, optional action + close.
- [ ] **Snackbar dimensions/elevation + timing**: container width/padding/elevation are figure-only
  (use corner-extra-small 4dp + elevation level 3); auto-dismiss duration and FAB-offset are not
  published as text — choose sensible M3-aligned defaults (e.g. ~4–10s, configurable). _(figure + decision)_
- [x] Tooltip measurements/roles — **closed**: plain 24dp height / 8dp padding (inverse-surface /
  inverse-on-surface); rich 12/8/16dp padding (surface-container / on-surface-variant), up to two
  buttons.
- [ ] **Tooltip timing**: M3 hover show/hide delays and long-press threshold are not published as text;
  choose accessible defaults (e.g. ~500ms show) configurable. _(value not published; decision)_
- [ ] **Snackbar role**: confirm `role="status"`/polite (with timer-pause) as the reconciliation of
  M3 auto-dismiss vs APG alert guidance, vs `role="alert"`. _(decision for design, informed by [apg-alert])_

## Next Steps

`spec:design communication` will pick one variant per problem area and produce the technical design.

Several measurements are open questions blocked on reading the live M3 pages in a browser
(agent-browser), as was done for text-inputs. Recommended: close those open questions before/early in
design so the anatomy is spec-literal. Re-run `spec:research communication` (extension mode) if new
directions surface.
