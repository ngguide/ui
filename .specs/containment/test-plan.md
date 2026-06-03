---
created: 2026-06-03
updated: 2026-06-03
status: executed
---

# Manual Test Plan: Containment Components

## Overview

This plan verifies the seven M3 containment families (card, divider, list, dialog,
bottom-sheet, side-sheet, carousel) **in a real browser** — the layer the zoneless
Vitest suite (294 passing unit tests) cannot exercise: computed layout and item
sizing, pointer drag gestures, focus trap / restore, scroll-lock, scrim behavior,
live theming, real motion + the OS reduced-motion preference, screen-reader output,
and SSR/hydration. Every testable acceptance criterion in `requirements.md` is traced
to at least one case below.

Tests are run against the demo playground (`apps/web`), which has a dedicated section
per family (Card & Divider, List, Dialog, Bottom sheet, Side sheet, Carousel). Where a
behavior is only observable with a tool (screen reader, DevTools, OS setting), the step
says so.

## Prerequisites

- Node + pnpm installed; dependencies installed (`pnpm install`).
- Dev server running: `NX_NO_CLOUD=true pnpm exec nx serve web`, opened in a Chromium-based
  browser **and** at least one of Firefox/Safari for a cross-browser pass.
- Browser DevTools available (to read computed styles / the element tree / emulate
  prefers-reduced-motion and prefers-color-scheme, and to throttle viewport width).
- A screen reader for the a11y group: VoiceOver (macOS) or NVDA (Windows).
- OS controls reachable for: **reduced motion** (Settings → Accessibility), **dark mode**,
  and (optional) **increased contrast**.
- A way to narrow the viewport below 600px (DevTools device toolbar or window resize) for
  the compact-window cases.
- For SSR: a production build to inspect prerendered HTML — `NX_NO_CLOUD=true pnpm exec nx build web`
  then open `dist/apps/web` output (the build prerenders one static route).

## Test Scenarios

- [x] 1. Card — variants, actionability, states
  - [x] 1.1 Three variants render with the correct M3 surface
    - **Preconditions:** Demo open at the "Card & Divider" section.
    - **Steps:**
      1. Locate the row of three cards labelled elevated / filled / outlined.
      2. With DevTools, inspect each card's computed `background-color`, `box-shadow`, and `border`.
    - **Expected:** Elevated = surface-container-low with a resting shadow (elevation level 1);
      filled = surface-container-highest with **no** shadow; outlined = surface with **no** shadow
      and a 1px outline-variant border. All three share the same medium (12dp) corner radius.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 13.1_
  - [x] 1.2 Content clips to the rounded corners
    - **Preconditions:** Demo open.
    - **Steps:**
      1. Inspect a card containing full-bleed content (or temporarily add an image that fills the card).
    - **Expected:** Content is clipped to the card's rounded corners; nothing spills past the radius.
    - _Requirements: 1.6, 1.7_
  - [x] 1.3 Whole-surface clickable card behaves as one control
    - **Preconditions:** Demo open; "Last card action" readout visible.
    - **Steps:**
      1. Hover the "Clickable card" — observe the state layer.
      2. Tab to it with the keyboard — observe the focus ring.
      3. Press Enter, then Space, then click it.
    - **Expected:** Hover/focus/press show M3 state layers; the card is a single Tab stop with a
      visible focus indicator; Enter, Space, and click each set the readout to "clickable card".
    - _Requirements: 2.1, 2.2, 2.4, 13.4, 14.3, 14.4_
  - [x] 1.4 Elevated actionable card raises on hover/press
    - **Preconditions:** Demo open.
    - **Steps:**
      1. Inspect the elevated clickable card's `box-shadow` at rest, then while hovering.
    - **Expected:** The shadow increases on hover (resting level 1 → level 2) per M3.
    - _Requirements: 2.3_
  - [x] 1.5 Primary-action region is independent of card action buttons
    - **Preconditions:** Demo open; the outlined "Primary-action card" with Share/Save buttons.
    - **Steps:**
      1. Click the card body (above the divider). Note the readout.
      2. Click "Share", then "Save".
      3. Tab through the card and confirm the focus order.
    - **Expected:** Body click sets readout to "primary action"; Share/Save set "share"/"save"
      independently; the primary-action region and each button are separately focusable.
    - _Requirements: 2.1, 2.4, 14.3_
  - [s] 1.6 Disabled card suppresses interaction
    - **Preconditions:** Temporarily set `disabled` on the clickable card (or use a disabled demo card).
    - **Steps:**
      1. Observe the card's opacity. 2. Hover and click it. 3. Try to Tab to it.
    - **Expected:** Card shows the 0.38 disabled treatment, emits **no** activation event, shows
      **no** state layer, and is not focusable (skipped in Tab order).
    - _Requirements: 2.5, 2.6_
    - **SKIPPED:** The playground exposes no disabled clickable card and a `disabled` signal input
      can't be driven from the browser (attribute mutation doesn't update the Angular signal). Covered
      by `card.spec.ts`. Needs a demo prop to dogfood in-browser.
  - [x] 1.7 Non-actionable card has no control semantics
    - **Preconditions:** Demo open; the three plain variant cards.
    - **Steps:**
      1. With a screen reader on, navigate onto a plain card. 2. Try to Tab to it.
    - **Expected:** Plain cards are **not** announced as buttons, are not focusable, and show no
      hover/press state layer.
    - _Requirements: 2.6_

- [x] 2. Divider
  - [x] 2.1 Thickness, color, and the three insets
    - **Preconditions:** Demo open; the divider inset examples (none / inset / middle-inset) and the
      divider inside the primary-action card.
    - **Steps:**
      1. Inspect each divider's height and `background-color`.
      2. Compare the leading/trailing edges of none vs inset vs middle-inset.
    - **Expected:** 1px line in outline-variant; `inset` is indented 16px on the leading edge only;
      `middle-inset` is indented 16px on both edges; `none` is full-width.
    - _Requirements: 3.1, 3.2, 13.1_
  - [x] 2.2 Divider is a non-focusable separator
    - **Preconditions:** Demo open; screen reader on.
    - **Steps:**
      1. Navigate to a divider with the screen reader. 2. Try to Tab to it.
    - **Expected:** Announced as a separator (role=separator), conveys "divider" not content, and is
      not reachable by Tab.
    - _Requirements: 3.3, 3.4, 14.5_

- [x] 3. List — densities, leading/trailing, action vs listbox
  - [x] 3.1 One/two/three-line densities at the correct heights
    - **Preconditions:** Demo open at the "List" section (action list).
    - **Steps:**
      1. Inspect the min-height of the 1-, 2-, and 3-line rows.
    - **Expected:** Heights are 56 / 72 / 88dp respectively; headline uses the body-large typescale,
      supporting text uses body-medium, trailing supporting text uses label-small.
    - _Requirements: 4.1, 4.2, 4.3, 13.1_
  - [x] 3.2 Long supporting text truncates within the reserved lines
    - **Preconditions:** Action list; the 3-line row with a long description.
    - **Steps:**
      1. Narrow the container and observe the supporting text.
    - **Expected:** Supporting text truncates within the row's reserved lines; nothing overflows the row.
    - _Requirements: 4.4_
    - **FIXED & re-tested:** `list-item.css` now clamps the supporting text with `-webkit-line-clamp`
      (1 line for 2-line rows, 2 for 3-line) plus `overflow:hidden`/ellipsis, and the headline is single
      line with ellipsis. Re-test: injecting long text now keeps the 3-line row at **88px** (`scrollHeight
      88`, no overflow, `line-clamp:2`) instead of growing to 168px. (Originally: no clamp, row grew.)
  - [x] 3.3 Leading and trailing elements positioned per M3
    - **Preconditions:** Action list with leading icons and trailing supporting text; dividers between rows.
    - **Steps:**
      1. Confirm leading icons sit at the start with 16dp inset; trailing text at the end.
      2. Confirm the dividers render between rows (inset variant).
    - **Expected:** Leading icon ~24dp at the start, 16dp insets, trailing text aligned to the end;
      dividers separate rows.
    - _Requirements: 4.5, 5.1, 5.2, 5.3_
  - [x] 3.4 Text inset when no leading element
    - **Preconditions:** A list row with no leading element.
    - **Steps:**
      1. Compare the headline start position of a row with a leading icon vs one without.
    - **Expected:** The row without a leading element applies the M3 text inset (headline starts at the
      16dp content inset, not under a missing leading slot).
    - _Requirements: 5.4_
  - [x] 3.5 Action list uses natural tab order
    - **Preconditions:** Action list whose rows host native controls/links.
    - **Steps:**
      1. Tab through the list.
    - **Expected:** Each interactive control is its own Tab stop in document order; the list is `role=list`
      and rows are `role=listitem`; no roving single-tab-stop behavior.
    - _Requirements: 6.1, 6.2, 6.6, 14.2_
  - [x] 3.6 Listbox: roving focus + selection
    - **Preconditions:** Demo open; the selectable listbox (multi-select).
    - **Steps:**
      1. Tab into the listbox (lands on one option only).
      2. Arrow Down/Up through options; press Home/End; type a letter (type-ahead).
      3. Press Enter or Space on options to select; click another.
      4. With a screen reader, confirm selected state is announced.
    - **Expected:** Single Tab stop; arrows move focus (wrapping), Home/End jump, type-ahead matches;
      Enter/Space/click toggle selection; selected rows render the secondary-container treatment and
      expose `aria-selected=true`; multi-select keeps multiple selected.
    - _Requirements: 6.3, 6.6, 14.2, 14.3, 14.5_
    - **PASSED:** Single tab stop ✓, arrows wrap (Date→Apple) ✓, Home/End ✓, Enter/Space/click toggle
      selection ✓, `aria-selected=true` + secondary-container (`#4a4458`) ✓, multi-select keeps
      [Apple,Banana,Cherry] ✓. **Type-ahead works** (`c`→Cherry, `d`→Date with a faithful keydown) — the
      original "type-ahead broken" note was an `agent-browser press` artifact (its CDP key events race
      with the RxJS-debounced type-ahead / focus wasn't on the option); real keyboards move focus.
  - [x] 3.7 Selected state is not conveyed by color alone
    - **Preconditions:** Listbox with a selected option; screen reader on.
    - **Steps:**
      1. Select an option and listen to the announcement.
    - **Expected:** Selection is exposed via `aria-selected` (announced "selected"), not only the
      container color change.
    - _Requirements: 6.3, 14.5_
  - [s] 3.8 Disabled list option stays discoverable but inert
    - **Preconditions:** Add a `disabled` option to the listbox.
    - **Steps:**
      1. Arrow onto the disabled option. 2. Press Enter/Space and click it.
    - **Expected:** Option is still reachable by arrow keys (M3 keeps disabled options discoverable),
      shows the dimmed treatment, exposes `aria-disabled=true`, and does **not** toggle selection.
    - _Requirements: 6.5, 14.5_
    - **SKIPPED:** The playground listbox has no disabled option and `disabled` is a signal input not
      drivable from the browser. Covered by `list-item.spec.ts`. Needs a demo prop to dogfood.

- [x] 4. Dialog — basic and full-screen
  - [x] 4.1 Basic dialog surface and anatomy
    - **Preconditions:** Demo open at "Dialog"; click "Basic dialog".
    - **Steps:**
      1. Inspect the dialog surface color, corner radius, elevation, and max-width.
      2. Confirm the icon, headline, supporting content, and the two end-aligned text actions.
    - **Expected:** Centered surface, surface-container-high, 28dp corners, elevation level 3, max
      width ≈ min(560px, 100%−48px); icon + headline (h2) + content + ≤3 end-aligned text buttons.
    - _Requirements: 7.1, 7.2, 13.1_
  - [x] 4.2 Basic dialog returns a result to the opener
    - **Preconditions:** Basic dialog open. (Optionally watch the console/readout if wired.)
    - **Steps:**
      1. Click "Reset" — note close. 2. Reopen and click "Cancel". 3. Reopen and press Escape.
    - **Expected:** Each path closes the dialog and the opener receives a distinct result
      ("reset" vs undefined for Cancel/Escape) — verify via the returned `closed` value.
    - _Requirements: 7.4, 7.6, 16.2_
  - [x] 4.3 Tall dialog content scrolls; headline + actions stay visible
    - **Preconditions:** Basic dialog with content taller than the viewport (lengthen the demo content).
    - **Steps:**
      1. Open it and scroll the body.
    - **Expected:** Only the content region scrolls; the headline and action row remain visible/pinned.
    - _Requirements: 7.5_
  - [x] 4.4 Full-screen dialog fills the window with a top app bar
    - **Preconditions:** Demo open; click "Full-screen dialog".
    - **Steps:**
      1. Confirm the surface fills the window edge-to-edge with a top bar (close ✕ + title + Save).
      2. Scroll the body if it overflows.
    - **Expected:** Edge-to-edge surface, no corner radius; top app bar with close/back, title, and a
      confirming action; the body scrolls independently of the fixed top bar.
    - _Requirements: 8.1, 8.5_
  - [x] 4.5 Full-screen close vs confirm results
    - **Preconditions:** Full-screen dialog open.
    - **Steps:**
      1. Click ✕ (or press Escape) — note result. 2. Reopen and click "Save".
    - **Expected:** Close/back/Escape emit a dismissal; "Save" emits a confirm result ("saved") to the opener.
    - _Requirements: 8.2, 8.3_
  - [s] 4.6 `fullScreen: 'compact'` auto-selection
    - **Preconditions:** A dialog opened with `fullScreen: 'compact'` (adjust the demo config or add a button).
    - **Steps:**
      1. Open it on a wide viewport. 2. Narrow the window below 600px and reopen.
    - **Expected:** Basic (centered) on the wide viewport; full-screen on the compact viewport.
    - _Requirements: 8.1_
    - **SKIPPED:** No demo button opens a dialog with `fullScreen: 'compact'` (the demo uses
      `'always'`). Covered by `dialog.service.spec.ts`. Needs a demo button to dogfood in-browser.
  - [x] 4.7 Declarative trigger opens the inline template
    - **Preconditions:** Demo open; "Basic dialog" uses `[guiDialogTrigger]`.
    - **Steps:**
      1. Click the trigger button.
    - **Expected:** The inline `<ng-template>` content opens as the dialog without any imperative code.
    - _Requirements: 7.2_

- [x] 5. Bottom sheet — modal, drag, standard
  - [x] 5.1 Modal bottom sheet anatomy
    - **Preconditions:** Demo open at "Bottom sheet"; click "Modal sheet".
    - **Steps:**
      1. Inspect the surface color, top corner shape, elevation, and the drag handle.
    - **Expected:** Surface slides up from the bottom; surface-container-low, 28dp top corners,
      elevation level 1; a 32×4dp drag handle in on-surface-variant; initial height capped ~50%.
    - _Requirements: 9.1, 13.1_
  - [x] 5.2 Drag past threshold dismisses; short drag springs back
    - **Preconditions:** Modal sheet open.
    - **Steps:**
      1. Drag the handle down a small amount (< ~96px) and release.
      2. Drag the handle down a large amount (> ~96px) and release.
      3. During a drag, watch the scrim opacity.
    - **Expected:** Short drag settles back to the open position; long drag dismisses the sheet (closing
      with a `'swipe'` result); the scrim fades proportionally to the downward drag distance.
    - _Requirements: 9.3, 9.4, 9.6_
  - [x] 5.3 No text selection / page scroll during drag
    - **Preconditions:** Modal sheet open over page content.
    - **Steps:**
      1. Drag the handle and observe the page behind and any text under the pointer.
    - **Expected:** No page text gets selected and the page behind does not scroll during the drag.
    - _Requirements: 9.7_
  - [x] 5.4 Sheet content scrolls within the sheet
    - **Preconditions:** Modal sheet with content taller than its ~50% height.
    - **Steps:**
      1. Scroll inside the sheet.
    - **Expected:** Content scrolls within the sheet, not past the screen edge.
    - _Requirements: 9.5_
  - [x] 5.5 Standard bottom sheet coexists with the page
    - **Preconditions:** Demo open; click "Toggle standard sheet".
    - **Steps:**
      1. With the standard sheet open, click/scroll/select text on the page behind it.
      2. Confirm there is no scrim.
      3. Drag the handle down to dismiss; toggle it closed via the button.
    - **Expected:** No scrim; the page behind stays fully interactive and scrollable; dragging down
      dismisses (sets open=false); the toggle button opens/closes it.
    - _Requirements: 9.2, 9.4_
    - **FIXED & re-tested:** `onDragEnded` now calls `event.source.reset()` (instead of
      `setFreeDragPosition({0,0})`), which clears the inline drag transform so the CSS open/closed state
      (`translateY(0)` / `translateY(100%)`) drives the position. Re-test: a past-threshold drag now sets
      `open=false`, clears the inline transform, and the surface slides to `top 900` (off-screen); a
      short drag springs back with the transform cleared. (Originally: dismissed sheet stayed visible.)
  - [s] 5.6 Drag handle can be hidden
    - **Preconditions:** Open a modal sheet with `showDragHandle: false`.
    - **Steps:**
      1. Confirm no handle is rendered.
    - **Expected:** No drag handle; the sheet still opens/closes via scrim/Escape/controls.
    - _Requirements: 9.3_
    - **SKIPPED:** No demo opens a modal sheet with `showDragHandle: false`. The `@if (showDragHandle())`
      gate is covered by the bottom-sheet specs. Needs a demo button to dogfood in-browser.

- [x] 6. Side sheet — modal and standard
  - [x] 6.1 Modal side sheet anatomy
    - **Preconditions:** Demo open at "Side sheet"; click "Modal side sheet".
    - **Steps:**
      1. Inspect the surface — edge, width, corner shape, elevation, header (title + close), actions.
    - **Expected:** Slides in from the end edge; 256–400dp wide; 16dp corners on the inner edge;
      surface-container-low + elevation; header with title + close affordance; actions region.
    - _Requirements: 10.1, 10.4, 13.1_
  - [x] 6.2 Close affordance and Escape dismiss (modal)
    - **Preconditions:** Modal side sheet open.
    - **Steps:**
      1. Click the header ✕. 2. Reopen and press Escape. 3. Reopen and click "Apply".
    - **Expected:** ✕ and Escape close with a dismissal; "Apply" emits a confirm result ("applied").
    - _Requirements: 10.5, 10.6_
  - [x] 6.3 Side-sheet content scrolls within the sheet
    - **Preconditions:** Modal side sheet with overflowing content.
    - **Steps:**
      1. Scroll inside the sheet body.
    - **Expected:** The content region scrolls within the sheet; the header/actions stay in place.
    - _Requirements: 10.6_
    - **FIXED & re-tested:** Added a `GuiSideSheetContent` component
      (`flex:1 1 auto; min-height:0; overflow-y:auto`) — the side-sheet analogue of `gui-dialog-content`
      — and wrapped the demo's content in it. Re-test: tall content now scrolls **within** the content
      region (`overflow-y:auto`, scrollable), the content stays inside the surface, and the header +
      actions remain visible/pinned after scrolling. (Originally: content clipped and pushed actions off.)
  - [x] 6.4 Standard side sheet coexists with the page
    - **Preconditions:** Demo open; click "Toggle standard side sheet".
    - **Steps:**
      1. With it open, interact with the page beside it. 2. Confirm there is no scrim.
      3. Close via the header ✕ / toggle button.
    - **Expected:** No scrim; the page beside it stays interactive; closes via the close affordance/toggle.
    - _Requirements: 10.3_

- [x] 7. Shared modal overlay behavior (APG Dialog)
  - [x] 7.1 Scrim dims and blocks the content behind every modal surface
    - **Preconditions:** Demo open.
    - **Steps:**
      1. Open in turn: basic dialog, full-screen dialog, modal bottom sheet, modal side sheet.
      2. For each, try to click a button on the page behind the scrim.
    - **Expected:** Each shows a scrim at ~32% scrim color; clicks on the page behind are blocked.
    - _Requirements: 12.1_
  - [x] 7.2 Focus moves in and is trapped
    - **Preconditions:** Any modal surface.
    - **Steps:**
      1. Open it. 2. Press Tab repeatedly past the last focusable element; Shift+Tab past the first.
    - **Expected:** Focus moves into the surface on open and cycles **within** it — Tab never lands on
      page content behind the scrim.
    - _Requirements: 12.2, 14.1, 14.3_
  - [x] 7.3 Focus restores to the opener on close
    - **Preconditions:** Focus a known opener button, then open a modal from it.
    - **Steps:**
      1. Open, then close via Escape / scrim / an action.
    - **Expected:** After close, focus returns to the exact opener element.
    - _Requirements: 12.3_
  - [x] 7.4 Escape and scrim-click dismiss
    - **Preconditions:** Any dismissible modal surface.
    - **Steps:**
      1. Press Escape. 2. Reopen and click the scrim outside the surface.
    - **Expected:** Both close the surface and emit a dismissal result.
    - _Requirements: 12.4, 12.5_
  - [s] 7.5 Non-dismissible surface ignores Escape and scrim-click
    - **Preconditions:** Open a dialog with `disableClose: true` (adjust the demo config).
    - **Steps:**
      1. Press Escape. 2. Click the scrim.
    - **Expected:** The surface stays open in both cases; it closes only via an explicit action control.
    - _Requirements: 12.4, 12.5_
    - **SKIPPED:** No demo opens a surface with `disableClose: true`. `normalizeModalConfig` maps it to
      CDK's `disableClose` (unit-tested). Needs a demo button to dogfood in-browser.
  - [x] 7.6 Scroll lock while open, restored on close
    - **Preconditions:** A page tall enough to scroll behind the modal.
    - **Steps:**
      1. Note the page scroll position. 2. Open a modal and try to scroll the page (wheel/trackpad).
      3. Close it and scroll again.
    - **Expected:** The page behind cannot scroll while the modal is open; normal scrolling resumes
      (at the prior position) after close.
    - _Requirements: 12.6_
  - [x] 7.7 Dialog semantics + accessible name
    - **Preconditions:** Screen reader on.
    - **Steps:**
      1. Open each modal surface and listen to how it is announced.
    - **Expected:** Announced as a modal dialog (role=dialog, aria-modal=true) with an accessible name
      from its headline/title (or aria-label).
    - _Requirements: 12.7, 14.1_
  - [s] 7.8 Stacked modals: Escape + focus target the top-most
    - **Preconditions:** Open one modal, then open a second from within it (e.g. a dialog that opens a sheet).
    - **Steps:**
      1. Press Escape once. 2. Observe which surface closes and where focus lands. 3. Press Escape again.
    - **Expected:** Escape closes only the top-most surface; focus trapping applies to the top-most; on
      close focus returns to the surface beneath; closing unwinds in reverse order.
    - _Requirements: 12.8_
    - **SKIPPED:** No demo surface opens a second modal from within it, and page triggers are blocked by
      the scrim while a modal is open, so a stack can't be built in the playground. CDK overlay stacking
      handles top-most Escape/focus. Needs a nested-modal demo to dogfood.

- [x] 8. Carousel — layouts and sizing
  - [x] 8.1 Multi-browse sizes items into large/medium/small with a peek
    - **Preconditions:** Demo open at "Carousel"; "multi-browse" selected.
    - **Steps:**
      1. Inspect the rendered item widths across the row.
      2. Scroll the carousel and watch the items morph between sizes.
    - **Expected:** A large focal item, then medium/small keylines (non-focal capped at two), with the
      smallest item peeking at the trailing edge; sizes morph as you scroll; small items stay within 40–56dp.
    - _Requirements: 11.1, 11.2, 11.3_
  - [x] 8.2 Uncontained uses uniform items with a cut-off trailing item
    - **Preconditions:** "uncontained" selected.
    - **Steps:**
      1. Inspect item widths; confirm the last visible item is partially cut off.
    - **Expected:** Uniform item widths; the trailing item is resized/cut at the edge; scrolls past the edge.
    - _Requirements: 11.2_
    - **FIXED & re-tested:** `applyWidths` now has an `uncontained` branch that assigns every item the
      static `large` width (no `maskForOffset` morph); the trailing item is clipped by the container's
      overflow rather than resized. Re-test: uncontained renders `[186, 186, 186, …]` (uniform), while
      multi-browse/hero still morph (`[180, 62, 56, …]`). (Originally: uncontained was non-uniform.)
  - [x] 8.3 Hero shows one large focal item plus a peek
    - **Preconditions:** "hero" selected.
    - **Steps:**
      1. Inspect the layout.
    - **Expected:** One large focal item fills most of the width with a small peek of the next item.
    - _Requirements: 11.2, 11.3_
  - [x] 8.4 Full-screen: one item fills the viewport; vertical on compact
    - **Preconditions:** "full-screen" selected.
    - **Steps:**
      1. On a wide viewport, confirm one item fills the carousel width and scrolls horizontally.
      2. Narrow the window below 600px and confirm orientation.
    - **Expected:** One item fills the viewport; on a compact window the carousel scrolls **vertically**.
    - _Requirements: 11.1, 11.6_
  - [x] 8.5 Items clip to the 28dp corner shape
    - **Preconditions:** Any layout.
    - **Steps:**
      1. Inspect a carousel item's corner radius and content clipping.
    - **Expected:** Each item clips its content to the extra-large (28dp) corner shape.
    - _Requirements: 11.4, 13.1_
  - [s] 8.6 Resize re-fits without disallowed partial items
    - **Preconditions:** Multi-browse selected.
    - **Steps:**
      1. Slowly drag the window/viewport width from wide to narrow and back.
    - **Expected:** Items re-fit continuously per the layout; no partially-cut items appear in positions
      the layout disallows; no layout jump/flicker beyond the resize.
    - _Requirements: 11.5_
    - **SKIPPED:** The demo's carousel container is fixed at ~480px, so narrowing the viewport (tested
      1280→360px) never changes the track width and the `ResizeObserver` re-fit can't be exercised
      in-browser. The re-fit/`measure()` path is covered by `carousel.spec.ts`. Needs a fluid-width demo
      container to dogfood.

- [x] 9. Tokens, theming, and motion
  - [x] 9.1 Light/dark switch updates every component via tokens
    - **Preconditions:** Demo open with all containment sections visible.
    - **Steps:**
      1. Toggle the OS (or app) theme between light and dark.
      2. Optionally switch contrast level.
    - **Expected:** Cards, dividers, lists, dialog/sheet surfaces, and carousel items all recolor purely
      from `--md-sys-*` tokens — no element keeps a stale/hard-coded color.
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 9.2 Transitions use M3 motion; reduced-motion removes them
    - **Preconditions:** Reduced motion **off**, then **on** (OS Accessibility setting).
    - **Steps:**
      1. With motion on, open a dialog, a bottom sheet, a side sheet — watch the enter animation; scroll the carousel.
      2. Enable reduced motion and repeat.
    - **Expected:** With motion on, surfaces animate in with M3 easing/duration and the carousel morphs on
      scroll. With reduced motion on, enter/scroll animations are removed/minimized but open/close and
      scroll **state** still work; items render at their arranged sizes.
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 10. Accessibility sweep (keyboard + screen reader)
  - [x] 10.1 Full keyboard-only operation
    - **Preconditions:** Mouse unplugged / not used; demo open.
    - **Steps:**
      1. Using only the keyboard, operate: clickable card, listbox selection, open/close every dialog and
         sheet, switch carousel layouts.
    - **Expected:** Every interactive containment surface is reachable and operable by keyboard alone.
    - _Requirements: 14.3_
  - [x] 10.2 Visible focus indicator everywhere
    - **Preconditions:** Keyboard navigation.
    - **Steps:**
      1. Tab through every focusable containment surface and watch the focus ring.
    - **Expected:** A visible focus indicator appears on each focusable surface, meeting WCAG 2.2 AA
      focus-appearance / non-text-contrast.
    - _Requirements: 14.4_
    - **FIXED & re-tested:** `GuiListItem` now applies `GuiFocusRingDirective` (keyboard focus → the
      `.gui-focus-visible` class via CDK FocusMonitor), and `list-item.css` draws the M3 focus indicator
      on `:host(.gui-focus-visible)` (3dp `currentColor` outline, inset so it isn't clipped; suppressed
      for disabled options). Re-test: arrowing to an option now shows `outline: solid 3px #e6e0e9`,
      offset −3px. (Originally: no ring/tint at all on focused options.)
  - [x] 10.3 Screen-reader semantics
    - **Preconditions:** Screen reader on.
    - **Steps:**
      1. Navigate cards (plain vs actionable), the listbox, dividers, and each modal surface.
    - **Expected:** Actionable cards = buttons; plain cards = no control role; listbox/options with
      selected state; dividers = separators; modals = dialog (modal) with a name; nothing conveys state
      by color alone.
    - _Requirements: 14.1, 14.2, 14.5_

- [x] 11. Packaging, SSR, and zoneless
  - [x] 11.1 Each family imports from its own entry point
    - **Preconditions:** Source/editor available.
    - **Steps:**
      1. Confirm the demo imports from `@ngguide/ui/{card,divider,list,dialog,bottom-sheet,side-sheet,carousel}`.
      2. Build the library: `NX_NO_CLOUD=true pnpm exec nx build ui`.
    - **Expected:** Each family resolves as its own secondary entry point and the library builds with all
      seven entry points emitted.
    - _Requirements: 16.1_
  - [x] 11.2 Imperative open returns a handle/result
    - **Preconditions:** Demo open.
    - **Steps:**
      1. Trigger the imperative full-screen dialog and the modal sheets (service `open()` calls).
    - **Expected:** Each `open()` returns a ref whose `closed` emits the result; closing programmatically works.
    - _Requirements: 16.2_
  - [x] 11.3 SSR renders without errors and hydrates without layout shift
    - **Preconditions:** `NX_NO_CLOUD=true pnpm exec nx build web` (prerenders one route).
    - **Steps:**
      1. Inspect the prerendered HTML for the containment sections (cards, list, carousel items).
      2. Serve the build and load it; watch for hydration errors in the console and visible reflow.
    - **Expected:** Server HTML renders the static surfaces (carousel items at the large fallback width);
      no console errors; no visible layout shift on hydration; the app runs zoneless (no zone.js).
    - _Requirements: 16.3, 16.4_
    - **PASSED (with note):** Prerendered HTML renders the containment surfaces (26 `gui-card`, 18
      `gui-divider`, 64 `gui-list-item`, 26 `gui-carousel-item`), carousel items fall back to the CSS
      `--gui-carousel-large` width, and there are **no** `zone.js` references (zoneless). Console has **no
      hydration errors** (no NG0xxx / mismatch) and **no containment-component errors**. The only console
      error was a pre-existing `ChipSetComponent` issue (`createRovingFocus` enables type-ahead but chips
      didn't implement `getLabel` → `ListKeyManager … must implement the getLabel method`). **Now fixed:**
      `GuiChip` implements `getLabel()` (explicit `label` input or visible text). Re-test on a fresh
      browser session: **0 console errors**.

## Summary
- Total: 56 tests
- Passed: 49
- Failed: 0
- Skipped: 7

### Run notes
Dogfooded in a real headless Chromium via `agent-browser` against the dev server
(`nx serve web`, port 4300), driving real clicks/keyboard/pointer-drag gestures and reading
computed styles, ARIA, and CDP media emulation (`prefers-color-scheme`, `prefers-reduced-motion`).
Screen-reader cases (1.7, 2.2, 3.7, 7.7, 10.3) were verified by their **ARIA semantics** as a proxy
— true VoiceOver/NVDA narration still warrants a manual pass.

**All 5 originally-failed cases were fixed and re-verified in the browser:**
- **3.2** — `list-item.css` clamps supporting text (`-webkit-line-clamp`) + single-line headline; the
  3-line row stays 88px under long text.
- **5.5** — `onDragEnded` now `reset()`s the CdkDrag transform, so a drag-dismissed standard sheet slides
  off-screen (CSS `translateY(100%)`).
- **6.3** — new `GuiSideSheetContent` (`flex:1; min-height:0; overflow-y:auto`) gives the side sheet a
  scrollable content region; header/actions stay pinned.
- **8.2** — carousel `applyWidths` renders uncontained items at a uniform `large` width (no morph);
  multi-browse/hero still morph.
- **10.2** — `GuiListItem` applies `GuiFocusRingDirective`; focused options show a 3dp inset ring.

**Fixed beyond the 5 (during this pass):**
- listbox **type-ahead** in fact works (`c`→Cherry) — the original 3.6 note was an `agent-browser press`
  artifact, not a product defect.
- pre-existing **`ChipSetComponent` console error** fixed by adding `getLabel()` to `GuiChip`; a fresh
  session now logs **0 errors**.

**Skipped (7):** 1.6, 3.8, 4.6, 5.6, 7.5, 7.8 (need a demo prop/button to exercise a config the
playground doesn't expose), 8.6 (demo carousel container is fixed-width). All are covered by unit tests.
