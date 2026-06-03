---
created: 2026-06-03
updated: 2026-06-03
---

# Research: Containment Components

## Problem Statement

The `containment` category adds seven M3 component families (card, divider, list, dialog, bottom sheet,
side sheet, carousel) to `@ngguide/ui`. Four of them (dialog × 2, bottom sheet, side sheet) are modal
overlay surfaces that must satisfy the full APG Dialog (Modal) pattern; the carousel needs a non-trivial
M3 keyline sizing engine; the list needs APG-correct interaction/selection semantics. This research
catalogues the implementation variants per decision area, grounded in the existing codebase foundation
(`GuiPickerOverlay`, interaction directives, `createRovingFocus`, the M3 token set) and verified Angular
CDK v21 / M3 spec evidence. No variant is selected here — `spec:design` decides.

**Foundation already in place (verified in code):**
- `GuiPickerOverlay` (`libs/ui/overlay/src/picker-overlay.ts`) exposes `openModal` (scrim
  `gui-overlay-scrim`, `ConfigurableFocusTrapFactory` trap + `focusInitialElementWhenReady`, restore-focus
  via captured `previouslyFocused`, `scrollStrategies.block()`, Escape + backdrop-click close),
  `openDocked`, `openConnected`, `openGlobalBottom`; returns a `GuiOverlayHandle { ref, closed, close() }`.
- Data-into-portal pattern: `Injector.create({ parent, providers:[{provide: GUI_*_DATA…}] })` +
  `new ComponentPortal(Comp, null, injector)` (snackbar, tooltip).
- Interaction primitives: `GuiStateLayerDirective`, `GuiRippleDirective`, `GuiFocusRingDirective`,
  `GuiReducedMotion`, and `createRovingFocus()` (wraps CDK `FocusKeyManager`) — all in `@ngguide/ui/interaction`.
- `@angular/cdk` **21.2.13** installed; overlay/portal/a11y already used; **drag-drop and BreakpointObserver
  not yet used anywhere**.
- Full M3 token set incl. `--md-sys-color-scrim`, `surface-container-*`, `outline-variant`,
  `--md-sys-elevation-level0..5`, `--md-sys-shape-corner-*`, discrete typescale tokens, motion duration/easing.

## Problem Areas

### 1. Modal overlay foundation

_Related requirements: 7, 8, 9, 10, 12_

The shared scrim + focus-trap + restore-focus + scroll-lock + Escape + dialog-semantics + stacking layer
used by basic dialog, full-screen dialog, modal bottom sheet, and modal side sheet.

#### Variant A: Extend the existing `GuiPickerOverlay.openModal`

**How it works:** Reuse `openModal` as-is for centered dialogs; add the missing APG bits in the *content*
components (set `role="dialog"`/`alertdialog`, `aria-modal="true"`, `aria-labelledby` on the surface) and
extend the service with sheet-shaped openers (`openModalSheet({ side:'bottom'|'end' })`) that swap the
global position strategy, mirroring how `openGlobalBottom`/`openConnected` were already added. Stacking is
handled by CDK's overlay container DOM order; Escape/focus already target the active overlay's `keydownEvents`.

**Pros:**
- Smallest new surface; one overlay abstraction for the whole library (consistent with snackbar/tooltip/menu).
- Focus-trap, restore-focus, `block()` scroll-lock, scrim, Escape, backdrop-click already implemented and tested.
- No new dependency footprint.

**Cons:**
- `openModal` currently uses `TemplatePortal`; sheets/dialogs that open imperatively with data need the
  generic-`Portal` treatment (already done for `openGlobalBottom`) — a small refactor.
- APG attributes (`aria-modal`, `role`, labelledby) are not set centrally today — each content component
  must wire them, risking drift; could be centralized via a config like the existing `openModal` `ariaLabel`.
- Multi-modal stacking (Escape routes to top-most, restore in reverse order — Req 12.8) is **not explicitly
  implemented**; relies on CDK DOM-order + per-overlay `keydownEvents`, needs verification.

**Effort:** Low–Medium | **Risk:** Medium (stacking + scroll-lock layout-shift edge cases)
**Codebase fit:** Direct extension of `libs/ui/overlay/src/picker-overlay.ts`; matches the precedent of
adding `openGlobalBottom`/`openConnected` during the communication spec.
**Evidence:** `openModal` body (scrim/trap/block/restore) read in `picker-overlay.ts`. [cdk-overlay]
confirms `OverlayRef.keydownEvents()/backdropClick()/detachments()`, `GlobalPositionStrategy`
(`bottom/end/centerHorizontally`), `scrollStrategies.block()`. Overlay z-index/stacking order is
**needs investigation** (not in fetched CDK docs; DOM-order stacking is inferred). [cdk-blockscroll]
BlockScrollStrategy exact layout-shift mechanism is **needs investigation**.

#### Variant B: Adopt the headless CDK `@angular/cdk/dialog` `Dialog` service

**How it works:** Use CDK's unstyled `Dialog` service as the foundation. `Dialog.open(Component, config)`
returns a `DialogRef`; config carries `hasBackdrop`, `backdropClass`, `disableClose`, `autoFocus`
(`'dialog'|'first-tabbable'|'first-heading'|selector`), `restoreFocus`, `ariaModal`, `ariaLabel`,
`ariaLabelledBy`, `role` (`'dialog'|'alertdialog'`), `scrollStrategy`, `panelClass`, `width/height/maxWidth`,
`data` (injected via `DIALOG_DATA`), `providers`, and **`container`** (swap the container component — one
service can render a dialog container vs a bottom-sheet container vs a side-sheet container). `DialogRef`
exposes `close(result)`, `closed`, `backdropClick`, `keydownEvents`, `outsidePointerEvents`, `disableClose`.

**Pros:**
- APG-complete out of the box: `aria-modal`, `role`, focus trap, restore-focus, Escape, autofocus targeting
  — exactly Req 12 + Req 14.1, maintained by the Angular team.
- `container` swap + `providers` gives dialog/bottom-sheet/side-sheet *one* opener with three styled containers.
- `DIALOG_DATA` + `DialogRef` replace the bespoke `GUI_*_DATA`/controller token plumbing.

**Cons:**
- Introduces a *second* overlay abstraction beside `GuiPickerOverlay` (which would still own picker/tooltip/
  snackbar) — two patterns in one library unless picker is later migrated too.
- Drag-to-dismiss for bottom sheet still must be layered on top (CDK Dialog has no drag).
- Default scroll strategy for CDK Dialog must be set to `block()` explicitly; styling is 100% ours (a plus and a cost).

**Effort:** Medium | **Risk:** Low (battle-tested, already shipped in installed `@angular/cdk` 21.2.13)
**Codebase fit:** New dependency-on-CDK-Dialog; diverges from the single-`GuiPickerOverlay` story but uses
the same underlying CDK overlay the project already depends on.
**Evidence:** Full `DialogConfig`/`DialogRef`/`DIALOG_DATA` surface verified against the `/angular/components`
golden API files. [cdk-dialog] Confirmed present in v21; Escape-closes-by-default; `container`/`providers`
swap confirmed.

#### Variant C: Purpose-built `GuiModalOverlay` from raw CDK Overlay primitives

**How it works:** A new dedicated service composing `Overlay.create` + `ConfigurableFocusTrapFactory` +
`scrollStrategies.block()` + an explicit stack registry (array of open handles; Escape/restore driven by the
registry to satisfy Req 12.8 precisely), with first-class `role`/`aria-modal`/labelledby config and
side-aware position strategies. Essentially a richer sibling of `openModal` built specifically for containment.

**Pros:**
- Total control over stacking order, restore-focus chains, and APG attribute centralization (Req 12.8 done deliberately).
- Single tailored abstraction for all four modal surfaces; no reliance on CDK Dialog's opinions.
- Can host the drag interaction natively (sheet handle integrated).

**Cons:**
- Most code to write and test; re-implements much of what CDK Dialog already does correctly.
- Higher risk of subtle a11y bugs that CDK Dialog has already fixed (focus restoration timing, anchor elements).

**Effort:** High | **Risk:** Medium–High
**Codebase fit:** New file under `libs/ui/overlay/`; conceptually consistent but duplicates CDK Dialog effort.
**Evidence:** Same CDK Overlay/a11y primitives as Variant A. [cdk-overlay][cdk-a11y]

---

### 2. Imperative open API + content projection

_Related requirements: 7.6, 16.2_

How developers open dialogs/sheets and how content + a result channel are wired.

#### Variant A: Bespoke service + `ComponentPortal` + DI tokens (snackbar pattern)

**How it works:** A `GuiDialog`/`GuiBottomSheet` service with `open(Component, config): GuiDialogRef`.
Internally `Injector.create({ parent, providers:[{provide: GUI_DIALOG_DATA, useValue}, {provide:
GUI_DIALOG_REF, useValue: ref}] })` + `new ComponentPortal(Component, null, injector)` handed to the chosen
opener from Area 1. The ref exposes `closed`/`afterDismissed`/`result` Subjects — exactly the snackbar `SnackbarRefImpl` shape.

**Pros:**
- Identical to the already-shipped snackbar/tooltip plumbing; consistent mental model across the library.
- Full control over the ref API surface and naming.

**Cons:**
- Hand-rolls data injection + ref lifecycle that CDK Dialog provides for free (only worth it if Area 1 ≠ B).
- Component-only content (no inline template content unless a TemplatePortal path is added).

**Effort:** Low–Medium | **Risk:** Low
**Codebase fit:** Mirrors `libs/ui/snackbar/src/snackbar.service.ts`.
**Evidence:** snackbar `Injector.create` + `ComponentPortal` + ref Subjects read in code.

#### Variant B: CDK `Dialog.open()` + `DIALOG_DATA` + `DialogRef`

**How it works:** Thin `GuiDialog.open(Component, {data,…})` delegating to CDK `Dialog`; content components
`inject(DIALOG_DATA)` and `inject(DialogRef)` to read data and `close(result)`. Result flows through
`DialogRef.closed`.

**Pros:**
- Near-zero plumbing; data, ref, result, focus, and a11y all handled.
- `DialogRef.close(result)` → `closed: Observable<result>` is exactly Req 7.4/7.6/16.2.

**Cons:**
- Couples this area to Area 1 Variant B (CDK Dialog foundation).
- Ref API is CDK's, not ours (naming/shape less tailored).

**Effort:** Low | **Risk:** Low
**Codebase fit:** New (CDK Dialog), but reuses installed CDK.
**Evidence:** `Dialog.open` / `DIALOG_DATA` / `DialogRef.close/closed` verified. [cdk-dialog]
**Cross-area:** only makes sense if Area 1 = B.

#### Variant C: Declarative trigger + `TemplatePortal` (rich-tooltip pattern)

**How it works:** A `[guiDialogTrigger]="tpl"` directive (and/or `<gui-dialog><ng-template>…`) projecting an
inline `<ng-template>` via `TemplatePortal(tpl, vcr)` into the opener, like `GuiRichTooltip.createPortal()`.
Content lives in the host component's template; the trigger toggles open/closed.

**Pros:**
- Inline, declarative content with the host's own bindings — no separate component or DI tokens.
- Reuses the confirmed `<ng-content>`-in-`<ng-template>` + `TemplatePortal` projection pattern (rich tooltip).

**Cons:**
- Imperative "open from code and await a result" is awkward; better for static/inline dialogs than dynamic ones.
- Result/handle wiring is less natural than a service ref.

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Mirrors `libs/ui/tooltip/src/rich-tooltip.ts`.
**Evidence:** rich-tooltip `TemplatePortal` projection read in code.

_Note: A and C are not mutually exclusive — a service `open()` for dynamic dialogs plus a declarative trigger
for inline ones is a common combined offering. Listed separately so the design can pick one or both._

---

### 3. Bottom-sheet drag / swipe gesture

_Related requirements: 9.3, 9.4, 9.6, 9.7_

Drag the sheet (or handle) down to dismiss past a threshold, else spring back; suppress page scroll/selection mid-drag.

#### Variant A: CDK drag-drop (`cdkDrag`)

**How it works:** Put `cdkDrag cdkDragLockAxis="y"` on the sheet; `cdkDragConstrainPosition` clamps upward
past the rest position; `cdkDragMoved` drives live `distance.y` (fade the scrim); on `cdkDragEnded` read
`distance.y` — past threshold → `ref.close()`, else `setFreeDragPosition({x:0,y:0})` with a CSS transition for spring-back.

**Pros:**
- Purpose-built gesture engine; `lockAxis`, `distance`, `setFreeDragPosition`, `constrainPosition` all exist.
- Handles pointer capture, touch, and momentum edges the team would otherwise hand-roll.

**Cons:**
- First use of `@angular/cdk/drag-drop` in the repo (new directive surface, but same CDK package).
- Slightly heavyweight for a one-axis drag.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** New CDK module; no existing precedent in the repo.
**Evidence:** `cdkDragLockAxis`, `cdkDragMoved {distance,pointerPosition}`, `cdkDragEnded {distance}`,
`setFreeDragPosition`, `cdkDragConstrainPosition` verified; suited to drag-then-dismiss-or-spring-back. [cdk-dragdrop]

#### Variant B: Raw pointer events (snackbar-swipe pattern)

**How it works:** `pointerdown`/`pointermove`/`pointerup` on the handle/sheet; track `deltaY`; translate the
sheet via `transform`; on release, past threshold → close, else animate back. `touch-action: none` +
`user-select: none` during drag. This is the same approach the snackbar already uses for horizontal swipe (>80px).

**Pros:**
- Zero new dependencies; same technique already in `snackbar.service.ts`.
- Fully deterministic and easy to reason about for SSR/zoneless.

**Cons:**
- Hand-rolls velocity/inertia, pointer capture, and multi-touch correctness that CDK already solved.
- More edge-case test surface (cancel, pointercancel, scroll conflict).

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** Mirrors the snackbar swipe handler.
**Evidence:** snackbar pointer-swipe (>80px) read in code; no `Date.now` used there (Req 16.4-safe).

#### Variant C: Native CSS scroll-snap sheet

**How it works:** Render the sheet as a scroll container whose snap points are "open" and "dismissed";
dragging is native scroll; crossing the snap boundary dismisses.

**Pros:**
- Minimal JS; native momentum.

**Cons:**
- Hard to map "scrolled to dismissed snap point" back to a clean `close(reason)` event and scrim fade.
- Drag *handle* affordance and threshold semantics don't map cleanly to scroll-snap; M3 expects a draggable surface.

**Effort:** Low–Medium | **Risk:** Medium–High (behavioral fidelity)
**Codebase fit:** No precedent.
**Evidence:** needs investigation (no fetched source for scroll-snap-driven dismissal ergonomics).

---

### 4. Carousel layout & sizing engine

_Related requirements: 11_

M3 carousel: items continuously resize between large/medium/small as they approach the edges (keyline model),
across multi-browse, uncontained, hero, full-screen layouts.

#### Variant A: CSS scroll-snap, fixed per-layout widths (no keyline masking)

**How it works:** A flex/scroll row with `scroll-snap-type: x mandatory`, items at fixed widths per layout
(large/medium/small computed once via CSS custom properties / container queries), `scroll-snap-align`, items
clipped to the carousel item corner shape. No JS resize as items scroll.

**Pros:**
- Simplest; SSR-safe, deterministic, no scroll listeners.
- Native momentum + snapping.

**Cons:**
- **Diverges from M3**: items don't continuously expand/collapse between sizes (the defining M3 carousel
  behavior). Effectively a styled scroller, not the keyline carousel.
- "Peeking smallest item" and parallax are approximations.

**Effort:** Low | **Risk:** Low (but M3-fidelity gap — conflicts with the strict-M3 rule)
**Codebase fit:** Pure CSS; aligns with the repo's CSS-token approach.
**Evidence:** M3 carousel uses keyline masking (continuous resize), not fixed sizes. [m3-carousel-src]

#### Variant B: Full JS keyline sizing engine (port of the M3 algorithm)

**How it works:** Port the Compose Material3 keyline model: define keylines along the scroll axis; on scroll,
interpolate each item's size/clip between the keyline before and after its center. Implement the verified
sizing rules — small `= clamp(large/3, 40dp, 56dp)`, medium `= (large+small)/2`, multi-browse caps non-focal
items at 2 and drops small below 80dp width; hero start/center-aligned with 1–2 small; uncontained resizes
only the last cut-off item; full-screen = single item, vertical on compact. Drive item width/`clip-path` via a
scroll listener + `ResizeObserver`.

**Pros:**
- True M3 fidelity (the only variant that matches the strict-M3 rule for the carousel's core behavior).
- All four layouts share one engine.

**Cons:**
- Highest effort and the largest test surface in the category; scroll-driven layout math.
- Scroll listeners + zoneless: must update via signals/`afterRenderEffect` without a zone; keep math pure/deterministic.
- SSR: must render a sensible static first frame before the engine runs client-side.

**Effort:** High | **Risk:** High
**Codebase fit:** New; no precedent in the repo for scroll-driven sizing.
**Evidence:** Verified sizing constants and keyline model from Compose Material3 source: small=large/3 clamp
[40dp,56dp], medium=(large+small)/2, multi-browse max 2 non-focal + drop <80dp, hero variants, uncontained
last-item resize, `MinSmallItemSize=40dp`/`MaxSmallItemSize=56dp`, item corner = extra-large/28dp. [m3-carousel-src][mca-carousel]
Parallax multiplier + exact full-screen compact thresholds are **needs investigation** (spec page JS-only).

#### Variant C: Hybrid — CSS scroll-snap + `ResizeObserver` arrangement (discrete sizes, no per-pixel masking)

**How it works:** Native scroll-snap for scrolling/snapping; a `ResizeObserver`-driven arrangement computes
large/medium/small *target* widths per layout (using the verified sizing rules) and assigns each item a size
class by its position, but without continuous per-frame keyline interpolation. Items change size at snap
boundaries rather than every scroll pixel.

**Pros:**
- Much of the M3 visual structure (large + medium + peeking small) without a per-frame scroll engine.
- `ResizeObserver` only (no high-frequency scroll math); easier zoneless/SSR story than Variant B.

**Cons:**
- Not the continuous keyline morph — a partial-fidelity middle ground; still a deviation from strict M3.
- Snap-boundary size changes can look steppy versus M3's smooth interpolation.

**Effort:** Medium | **Risk:** Medium
**Codebase fit:** New, but lighter than B.
**Evidence:** Same verified sizing constants as Variant B. [m3-carousel-src] Continuous-vs-discrete fidelity
tradeoff is inference, not a fetched M3 statement.

---

### 5. List semantics & selection model

_Related requirements: 4, 5, 6_

Anatomy/densities are token-driven; the decision is the interaction/selection semantics.

#### Variant A: Presentation list of controls (APG list + button/link)

**How it works:** `role="list"`/`listitem` (or native `<ul>/<li>`); interactive items render a nested
`<button>`/`<a>` (or apply the interaction directives to a focusable item). Selection is conveyed by the
trailing control's own state (checkbox/switch). Keyboard = natural tab order (or `createRovingFocus` for a
single tab stop with arrow navigation).

**Pros:**
- Simple, robust; matches "a list of actions/links".
- Trailing checkbox/switch carry their own a11y state — no custom selection role needed.

**Cons:**
- Not a single-select "listbox"; for choose-one-of-many semantics this isn't the APG-correct role.
- Must avoid double-announcing (item + control) — keep one accessible name (Req 6.4).

**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Reuses interaction directives + optional `createRovingFocus` (chip-set precedent).
**Evidence:** `createRovingFocus` (FocusKeyManager) read in `chip-set.ts`; APG list/button. [apg-dialog reference set]; list token values (56/72/88dp, leading 24/40/56dp, body-large/body-medium, 16dp insets) verified. [m3-list-src]

#### Variant B: Listbox (`role="listbox"`/`option`)

**How it works:** `role="listbox"` container + `role="option"` items with `aria-selected`; single/multi-select
managed via CDK `ListKeyManager`/`ActiveDescendantKeyManager` (active-descendant) or `FocusKeyManager`
(roving). Selected items render the M3 secondary-container treatment.

**Pros:**
- APG-correct for selection lists (single/multi); first-class `aria-selected` state.
- CDK key managers provide typeahead, wrap, home/end, page up/down.

**Cons:**
- Listbox options shouldn't contain independently-focusable controls — conflicts with trailing checkbox/switch
  rows (Req 5.2/6.4) unless modeled as multi-select options rather than nested controls.
- More semantics to get right; overkill for plain link/action lists.

**Effort:** Medium–High | **Risk:** Medium
**Codebase fit:** Reuses CDK `ListKeyManager` family (re-exported from `@ngguide/ui/interaction`).
**Evidence:** `ListKeyManager`/`FocusKeyManager`/`ActiveDescendantKeyManager` full surface verified. [cdk-a11y]

#### Variant C: Unopinionated structure + opt-in behavior directives

**How it works:** Ship the list/list-item as pure structure + tokens (heights, leading/trailing slots, dividers,
selected styling via `[attr.aria-selected]`/`data-selected`), and expose interaction as opt-in (`interactive`,
`selectable` inputs) that the consumer or a higher-level component wires to the right role. Provide both an
"action list" mode (Variant A semantics) and a "listbox" mode (Variant B semantics) behind a `mode` input.

**Pros:**
- One component covers links, action rows, and selection lists; consumer picks semantics.
- Avoids forcing one APG pattern onto all uses.

**Cons:**
- Larger API; must document which mode maps to which APG pattern to avoid misuse.
- More test matrix (both modes).

**Effort:** Medium–High | **Risk:** Medium
**Codebase fit:** Combines A and B; reuses interaction + key managers.
**Evidence:** Same as A and B.

---

### 6. Static surfaces — card & divider (and actionable-card a11y)

_Related requirements: 1, 2, 3_

Divider is trivial (`role="separator"`, 1dp `outline-variant`, inset variants). The real decision is how an
*actionable* card exposes itself without nesting interactive controls illegally.

#### Variant A: Whole-surface control (card is one button/anchor)

**How it works:** Actionable card host is the control: `<a gui-card>` for navigation or `role="button"` +
`tabindex` + Enter/Space activation for actions, with `hostDirectives:[StateLayer,Ripple,FocusRing]` (the
button precedent). Emits an activation event.

**Pros:**
- Simplest; one focus stop; matches the button component pattern exactly.
- Clean for cards whose entire surface is a single action (e.g. a tappable media card).

**Cons:**
- **Nesting violation**: interactive elements (buttons/links) inside a card that is itself a button/link is
  invalid and breaks AT. Unsuitable for cards that contain their own action buttons (a common M3 card).

**Effort:** Low | **Risk:** Medium (misuse when consumers add inner buttons)
**Codebase fit:** Mirrors `button.ts` (hostDirectives + activation).
**Evidence:** button activation + hostDirectives read in code; APG forbids interactive-in-interactive (inferred from APG dialog/general APG nesting guidance — [apg]).

#### Variant B: Primary-action region (clickable area + separate actions)

**How it works:** The card stays a non-interactive container; a designated **primary-action region**
(`[guiCardPrimaryAction]`, e.g. media + headline) is the single control (button/anchor with the interaction
directives), while action buttons live in a separate, non-overlapping region of the card. This is the M3
"card with a primary action plus supplemental actions" structure.

**Pros:**
- APG-correct: no nested interactive controls; supports cards with their own action buttons.
- Matches M3 actionable-card guidance (primary action + secondary actions).

**Cons:**
- Slightly more structure/markup; consumers must place content in the right slot.

**Effort:** Medium | **Risk:** Low
**Codebase fit:** New slotting convention; interaction directives reused on the region.
**Evidence:** Card variant tokens (elevated=surface-container-low/level1, hover level2, dragged level4;
filled=surface-container-highest/level0; outlined=surface/level0 + outline-variant 1dp; corner-medium 12dp)
verified. [m3-card-src] Nesting rule [apg].

#### Variant C: Offer both modes

**How it works:** Support a fully-clickable card (Variant A) for simple cases *and* a primary-action region
(Variant B) for cards with inner actions, selected by how the consumer composes the card.

**Pros:** Covers both M3 actionable-card shapes.
**Cons:** Two code paths + docs to prevent the nesting mistake.
**Effort:** Medium | **Risk:** Low–Medium
**Codebase fit:** Union of A and B.
**Evidence:** As A and B.

_Component-vs-directive sub-choice (orthogonal): `gui-card` element + `gui-divider` element (host data-attrs,
matches most existing components) vs `[guiCard]`/`[guiDivider]` attribute directives (matches badge). Low-stakes;
design can pick to match the prevailing convention._

---

### 7. Responsive / compact-window detection

_Related requirements: 8 (full-screen dialog is compact-only), 11.6 (carousel full-screen vertical on compact)_

#### Variant A: CSS-only (media / container queries)

**How it works:** Express compact-window differences purely in CSS (`@media (max-width: 599px)` or container
queries). Full-screen dialog styling and carousel full-screen vertical layout are CSS-driven; no JS branch.

**Pros:**
- SSR-safe and deterministic (Req 16.3/16.4); no `matchMedia` on the server.
- Zero runtime cost; aligns with the repo's CSS-token approach.

**Cons:**
- Component *logic* can't branch on the breakpoint (e.g. "auto-pick full-screen vs basic dialog by window size")
  — only styling differs. If the design wants logic branches, CSS alone is insufficient.

**Effort:** Low | **Risk:** Low
**Codebase fit:** Pure CSS.
**Evidence:** M3 compact breakpoint < 600dp verified. [m3-breakpoints]

#### Variant B: CDK `BreakpointObserver` / `MediaMatcher` signal

**How it works:** A reactive signal of the compact breakpoint (reusing the `GuiReducedMotion` `MediaMatcher`
precedent, or CDK `BreakpointObserver.observe(Breakpoints.Handset)`), letting components branch logic (choose
dialog type, switch carousel orientation) reactively.

**Pros:**
- Enables logic branches, not just styling; one source of truth for "is compact".
- `MediaMatcher` already used SSR-safely in `reduced-motion.ts` (server → non-match, re-evaluates on client).

**Cons:**
- SSR returns non-matching first frame → must avoid layout shift on hydration (Req 16.3).
- Slightly more machinery than CSS for cases CSS already covers.

**Effort:** Low–Medium | **Risk:** Low–Medium (hydration shift)
**Codebase fit:** Mirrors `GuiReducedMotion` (`MediaMatcher` signal).
**Evidence:** `BreakpointObserver.observe/isMatched` + `Breakpoints.Handset` verified; SSR behavior inferred,
**needs investigation** for exact server matcher. [cdk-breakpoints] `MediaMatcher` SSR-safe usage read in `reduced-motion.ts`.

#### Variant C: Hybrid (CSS for styling, signal for the few logic branches)

**How it works:** Use CSS for all pure-styling responsive differences; introduce a compact signal only where a
component genuinely needs to *branch behavior* (e.g. carousel orientation, optional auto-full-screen dialog).

**Pros:** Minimizes JS; keeps SSR-sensitive logic to the few places that need it.
**Cons:** Two mechanisms to keep coherent.
**Effort:** Low–Medium | **Risk:** Low
**Codebase fit:** CSS + the `GuiReducedMotion` pattern.
**Evidence:** As A and B.

## Variant Catalogue at a glance

| Problem Area | Variant | Effort | Risk | Codebase fit |
|-------------|---------|--------|------|--------------|
| 1. Modal foundation | A: Extend `GuiPickerOverlay.openModal` | L–M | M | Direct extension of overlay service |
| 1. Modal foundation | B: CDK headless `Dialog` service | M | L | New CDK-Dialog use; same installed CDK |
| 1. Modal foundation | C: New `GuiModalOverlay` from raw CDK | H | M–H | New, duplicates CDK Dialog |
| 2. Open API | A: Bespoke service + ComponentPortal + DI tokens | L–M | L | Snackbar precedent |
| 2. Open API | B: CDK `Dialog.open` + `DIALOG_DATA` + `DialogRef` | L | L | Needs Area 1=B |
| 2. Open API | C: Declarative trigger + `TemplatePortal` | M | L–M | Rich-tooltip precedent |
| 3. Sheet drag | A: CDK drag-drop | M | L | New CDK module |
| 3. Sheet drag | B: Raw pointer events | M | M | Snackbar swipe precedent |
| 3. Sheet drag | C: CSS scroll-snap | L–M | M–H | No precedent |
| 4. Carousel | A: CSS scroll-snap fixed widths | L | L (M3-gap) | Pure CSS |
| 4. Carousel | B: Full JS keyline engine | H | H | New scroll-driven sizing |
| 4. Carousel | C: Hybrid scroll-snap + ResizeObserver | M | M | New, lighter than B |
| 5. List | A: Presentation list of controls | M | L–M | Interaction dirs + roving |
| 5. List | B: Listbox role + key manager | M–H | M | CDK ListKeyManager |
| 5. List | C: Unopinionated + opt-in modes | M–H | M | Union of A+B |
| 6. Card/divider | A: Whole-surface control | L | M | Button precedent |
| 6. Card/divider | B: Primary-action region | M | L | New slotting |
| 6. Card/divider | C: Both modes | M | L–M | Union |
| 7. Responsive | A: CSS-only | L | L | Pure CSS |
| 7. Responsive | B: BreakpointObserver/MediaMatcher signal | L–M | L–M | ReducedMotion precedent |
| 7. Responsive | C: Hybrid | L–M | L | CSS + signal |

## Cross-area dependencies

- **Area 2 Variant B** (CDK `Dialog.open` + `DIALOG_DATA`) only makes sense if **Area 1 = Variant B** (CDK
  Dialog foundation); the CDK ref/data come from that service. If Area 1 ≠ B, use Area 2 Variant A or C.
- **Area 1 Variant B** largely *resolves* Area 2 for free (CDK Dialog gives data injection + ref + result).
- **Area 3** (sheet drag) layers on whatever Area 1 picks — CDK Dialog (1B) has no drag, so the drag variant
  (3A/3B) is additive regardless.
- **Area 7 Variant B/C** (compact signal) is what lets **Area 8/full-screen dialog** auto-select by window size
  and **carousel full-screen** (Area 4) switch orientation; if Area 7 = A (CSS-only), those become styling-only.

## Codebase Insights

- `GuiPickerOverlay.openModal` already implements the hard 80% of APG modal (trap, restore, scrim, block,
  Escape, backdrop). The gap is centralizing `role`/`aria-modal`/labelledby and **multi-modal stacking order**
  (Req 12.8), which is currently implicit in CDK overlay DOM order — verify or make explicit.
- The snackbar (`Injector.create` + `ComponentPortal` + ref Subjects) and rich-tooltip (`TemplatePortal`
  projection) give two proven content-projection templates to copy.
- `createRovingFocus` (FocusKeyManager) is already used by `chip-set.ts` for horizontal roving — directly
  reusable for lists.
- `GuiReducedMotion` shows the SSR-safe `MediaMatcher` signal pattern to copy for compact-window detection.
- `@angular/cdk/drag-drop` and `@angular/cdk/layout` (BreakpointObserver) are installed but unused — first use
  here; no module wiring needed for standalone directives.
- Every required token exists (`--md-sys-color-scrim`, `surface-container-*`, `outline-variant`,
  `elevation-level0..5`, `shape-corner-*`, discrete typescale, motion). No new tokens needed.
- Global component CSS for directive-only surfaces ships via `libs/ui/src/styles/*.css` `@import`ed in
  `theme.css` (overlay.css/badge.css precedent) — applies to scrim/sheet/dialog global styles.

## Sources

- [cdk-dialog] `@angular/cdk/dialog` `Dialog`/`DialogConfig`/`DialogRef`/`DIALOG_DATA` — context7 `/angular/components`
  golden `goldens/cdk/dialog/index.api.md` + `src/cdk/dialog/dialog.md` — fetched 2026-06-03
- [cdk-overlay] CDK Overlay `Overlay.create`/`OverlayConfig`/`OverlayRef`/`GlobalPositionStrategy`/`ScrollStrategyOptions` —
  context7 `/angular/components` `goldens/cdk/overlay/index.api.md` + `src/cdk/overlay/*.md` — fetched 2026-06-03
- [cdk-a11y] CDK A11y `ConfigurableFocusTrapFactory`/`FocusTrap`/`FocusMonitor`/`ListKeyManager`/`FocusKeyManager`/
  `ActiveDescendantKeyManager`/`LiveAnnouncer` — context7 `/angular/components` `goldens/cdk/a11y/index.api.md` — fetched 2026-06-03
- [cdk-dragdrop] CDK Drag-Drop `cdkDrag`/`cdkDragLockAxis`/`cdkDragMoved`/`cdkDragEnded`/`setFreeDragPosition`/
  `cdkDragConstrainPosition` — context7 `/angular/components` `goldens/cdk/drag-drop/index.api.md` — fetched 2026-06-03
- [cdk-breakpoints] CDK Layout `BreakpointObserver`/`Breakpoints` — context7 `/angular/components` `goldens/cdk/layout/index.api.md` — fetched 2026-06-03
- [cdk-blockscroll] CDK `BlockScrollStrategy` — context7 `/angular/components` `src/cdk/overlay/scroll/scroll-strategy.md` — fetched 2026-06-03
- [m3-card-src] M3 card tokens (Elevated/Filled/Outlined CardTokens, ElevationTokens) — AndroidX Compose Material3
  `…/tokens/{Elevated,Filled,Outlined}CardTokens.kt`, `ElevationTokens.kt` — fetched 2026-06-03
- [m3-list-src] M3 list tokens (`ListTokens.kt`, `ListItem.kt`) — AndroidX Compose Material3 — fetched 2026-06-03
- [m3-carousel-src] M3 carousel keyline model + sizing (`carousel/Carousel.kt`, `Keylines.kt`) — AndroidX Compose Material3 — fetched 2026-06-03
- [mca-carousel] Material Components Android Carousel docs — https://github.com/material-components/material-components-android/blob/master/docs/components/Carousel.md — fetched 2026-06-03
- [m3-divider-src] M3 `DividerTokens.kt` + Material Web divider docs — AndroidX Compose Material3 /
  https://github.com/material-components/material-web/blob/main/docs/components/divider.md — fetched 2026-06-03
- [m3-dialog-tok] M3 dialog/sheet tokens (Material Web `_md-comp-dialog.scss`, Compose `SheetBottomTokens.kt`, MDC SideSheet/Dialog docs) — fetched 2026-06-03
- [m3-breakpoints] M3 breakpoints (compact < 600dp) — https://m3.material.io/foundations/layout/breakpoints/overview — fetched 2026-06-03
- [apg] WAI-ARIA APG Modal Dialog + Alert Dialog patterns — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ and /alertdialog/ — fetched 2026-06-03

## Open Questions

- [ ] M3 dialog / sheet **motion durations** (exact enter/exit duration tokens) — only the easing pairing
      (emphasized decelerate enter / accelerate exit) is verified; durations are inferred (≈400ms/200ms). Confirm in design.
- [ ] **Overlay stacking / z-index order** for nested modals (Req 12.8) — CDK DOM-order stacking is inferred,
      not documented; verify whether an explicit stack registry is needed.
- [ ] **BlockScrollStrategy** exact layout-shift behavior (does it set `position:fixed` on `<html>`?) — confirm to avoid hydration/scrollbar jump.
- [ ] Carousel **parallax multiplier** and **full-screen compact vertical-scroll thresholds** — not fetchable
      from the JS-rendered spec page; would need the agent-browser skill or design-time decision.
- [ ] Bottom-sheet **drag-to-dismiss numeric threshold** and **larger-screen max-width** — implementation-defined
      in M3; pick a concrete value in design.
- [ ] Dialog **scrim color role** exact name on m3.material.io (token `--md-sys-color-scrim` exists; M3 page prose unfetched).
- [ ] Side-sheet **default edge** (end assumed) and **motion** specifics — confirm against M3 page in design.

## Next Steps

`spec:design containment` will pick one variant per problem area and produce the technical design.

If new directions surface during design, run `spec:research containment` again — it will extend this
catalogue rather than overwrite it.
