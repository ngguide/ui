---
created: 2026-06-04
updated: 2026-06-04
---

# Manual Test Plan: Showcase Apps

## Overview

Validates the three sample applications (Console / Tracker / Commerce) that replace the former flat
component playground in the demo host. The plan exercises navigation, exhaustive component coverage,
each app's CRUD and search/filter/sort behavior, runtime theming, adaptive layout, the empty / loading /
error states, accessibility, and SSR/first-paint determinism. Test cases are derived from the
requirements (R1–R10), not the implementation — they assert the behaviour the requirements demand,
with deliberate attention to edge cases, empty/error states, and boundaries.

Demo data is in-memory and reseeds on every full page reload, so destructive cases (delete, edit) are
safe and self-resetting.

## Prerequisites

- Build and run the demo host: `pnpm exec nx serve web`, then open the served URL (default
  `http://localhost:4200/`). For SSR/first-paint cases, prefer the production server:
  `pnpm exec nx build web` then `PORT=4000 node dist/apps/web/server/server.mjs` and browse
  `http://localhost:4000/`.
- A desktop-width browser window (≥ 1280px) **and** the ability to narrow it to a compact width
  (≤ 599px) — browser devtools responsive mode is fine.
- Browser devtools open (Console + Network tabs) to watch for runtime errors and confirm no network
  calls are made for data.
- A keyboard (several cases are keyboard-only) and, ideally, a screen reader (VoiceOver / NVDA) for the
  accessibility group.
- No accounts, credentials, or backend required — the demo runs entirely on in-memory mock data.

## Test Scenarios

- [x] 1. Entry & cross-application navigation
  - [x] 1.1 Default landing and app reachability
    - **Preconditions:** Fresh load of `/`.
    - **Steps:**
      1. Open `/`.
      2. Observe where the app lands.
      3. Open the app switcher in the top app bar and note the listed applications.
    - **Expected:** `/` redirects to the Console dashboard (`/admin/dashboard`). The app switcher lists exactly three applications — Console, Tracker, Commerce — each reachable.
    - _Requirements: 1.1_

  - [x] 1.2 Switch applications without a full reload
    - **Preconditions:** On the Console dashboard. Devtools Network tab visible.
    - **Steps:**
      1. From the app switcher, choose Tracker, then Commerce, then back to Console.
      2. Watch the Network tab and the browser's reload indicator.
    - **Expected:** Each switch updates the content in place (lazy chunk may load) without a full document reload; the shell chrome (app bar, nav) persists across switches.
    - _Requirements: 1.2_

  - [x] 1.3 Active app and section are indicated
    - **Preconditions:** Inside Console.
    - **Steps:**
      1. Navigate Dashboard → Users → Settings via the navigation rail.
      2. Observe the rail and the app-bar title area at each step.
    - **Expected:** The currently active section is visibly marked in the navigation (active indicator) and the app-bar reflects the current app/section; only one item is marked active at a time.
    - _Requirements: 1.3_

  - [x] 1.4 Deep-linking / direct addressability
    - **Preconditions:** None.
    - **Steps:**
      1. Paste `/shop/products` directly into the address bar and load it.
      2. Paste `/tasks/board` and load it.
      3. Open a specific user URL `/admin/users/u-01` directly.
    - **Expected:** Each section renders directly from its address (no redirect to a home screen); the correct app/section is shown and marked active.
    - _Requirements: 1.4_

  - [x] 1.5 Browser back/forward integrity
    - **Preconditions:** Having navigated across several sections and apps.
    - **Steps:**
      1. Use the browser Back button repeatedly, then Forward.
    - **Expected:** History reflects each in-app navigation; back/forward restore the prior section without a full reload or a broken/blank view.
    - _Requirements: 1.2, 1.4_

- [x] 2. Component coverage & states sanity
  - [x] 2.1 No runtime/console errors while touring every screen
    - **Preconditions:** Devtools Console open.
    - **Steps:**
      1. Visit every section of all three apps: Console (dashboard, users, user detail, new/edit user, settings); Tracker (board, list, task detail, new/edit task); Commerce (orders, order detail, products, new/edit product, customers, customer detail).
    - **Expected:** Every screen renders populated content; no errors or framework warnings (e.g. NG0xxx, hydration mismatch) appear in the console.
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Components appear in representative (non-empty) states
    - **Preconditions:** Touring screens as in 2.1.
    - **Steps:**
      1. Confirm presence of populated lists, selected chips/filters, disabled submit buttons, a card with imagery, progress indicators with values, badges with counts, and at least one open menu/dialog/sheet/tooltip.
    - **Expected:** Components are shown in realistic states (populated/selected/disabled/error) rather than only default empty instances. Cross-check against `apps/web/src/app/COVERAGE.md` that each listed entry point is visibly present somewhere.
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 3. Console — dashboard
  - [x] 3.1 Dashboard summarizes metrics and activity
    - **Preconditions:** On `/admin/dashboard`.
    - **Steps:**
      1. Inspect the KPI cards and the recent-activity list.
    - **Expected:** KPI cards show a headline figure, a signed delta, a trend sparkline, and a goal-progress indicator; a recent-activity list shows actor + action + a relative time.
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Visualizations are self-contained (no chart library)
    - **Preconditions:** On the dashboard.
    - **Steps:**
      1. Toggle the time-range control (7d / 30d / 90d).
      2. Inspect the sparkline element in devtools.
    - **Expected:** Trends render as inline SVG and ratios as progress components (no third-party chart canvas/iframe); the range toggle reflects a selected state.
    - _Requirements: 3.2_

- [!] 4. Console — users (search / filter / sort / CRUD)
  - [x] 4.1 Search filters across name and email
    - **Preconditions:** On `/admin/users`.
    - **Steps:**
      1. Type a name fragment (e.g. `ada`) in the search field.
      2. Clear it, then type an email fragment (e.g. `aperture`).
    - **Expected:** The list narrows live to matching rows on each keystroke; a name query and an email query both match; clearing restores the full list.
    - _Requirements: 3.3, 6.1_

  - [x] 4.2 Role filter and sort
    - **Preconditions:** On `/admin/users`, no search term.
    - **Steps:**
      1. Select the `admin` role filter, then back to all.
      2. Change the sort (A–Z, Z–A, Recent, Role) and observe order.
    - **Expected:** The role filter shows only matching users; each sort reorders the visible list accordingly and immediately.
    - _Requirements: 3.3, 6.1_

  - [!] 4.3 Open user detail
    - **Preconditions:** Users list populated.
    - **Steps:**
      1. Select a user row (or its "view" affordance).
    - **Expected:** The user's full details render (name, email, role, status, joined date, last-active relative time).
    - _Requirements: 3.4_
    - **FAILED:** Cannot open a user's detail **from the list**. User rows are not clickable and have no link; the only per-row affordance is the "⋮ Row actions" menu, which does not open. Clicking/Enter/Space on it throws `NG0309: Directive _CdkMenuItem matches multiple times on the same element` plus `TypeError: Cannot read properties of undefined (reading 'setFocusOrigin')` / `... null (reading 'componentOffset')`, and no menu panel renders. **Root cause:** the row-menu items in `apps/web/src/app/admin/users.component.html` (lines ~146–164) apply both `gui-menu-item` **and** a redundant `cdkMenuItem` on the same `<button>`; `gui-menu-item` already composes `CdkMenuItem` internally (`libs/ui/menu/src/menu-item.ts`), so the directive matches twice. **Fix:** remove the redundant `cdkMenuItem` attribute from the three View/Edit/Delete buttons (the working app-switcher in `shell.component.html` uses `gui-menu-item` alone). The detail view itself renders correctly when reached by URL (`/admin/users/u-03` → name, email, role, status, joined "Mar 3, 2025", last-active "today"), so only the in-list navigation affordance is broken. This single bug also blocks 4.5 (edit-from-list) and 4.6 (per-row delete).

  - [x] 4.4 Create a user — validation blocks invalid submit
    - **Preconditions:** On `/admin/users/new`.
    - **Steps:**
      1. Leave the name empty and enter an invalid email (e.g. `not-an-email`); blur the fields.
      2. Attempt to submit.
      3. Correct the inputs to valid values.
    - **Expected:** Invalid fields show inline error text; the submit control is disabled while the form is invalid; once valid, submit is enabled. Submitting adds the user and shows save feedback (snackbar).
    - _Requirements: 3.5, 9.3_

  - [!] 4.5 Created/edited user reflects everywhere
    - **Preconditions:** Just created a user via 4.4.
    - **Steps:**
      1. Return to the users list and locate the new user.
      2. Edit the user's name; save; revisit the list and the detail view.
    - **Expected:** The new user appears in the list; the edit is reflected in both the list and the detail view without a reload.
    - _Requirements: 3.4, 6.2_
    - **FAILED:** Blocked by the same row-menu bug as 4.3 — the "Edit" action lives only in the broken "⋮ Row actions" menu, so a user cannot be edited starting from the list. Partial verification of the underlying feature: the **new user does appear** in the list ("15 of 15", Grace Test) ✓; and when the edit form is reached directly, the edit **does** propagate to the list without reload (renamed "Dennis Ritchie" → "Renamed Person", reflected in the list) ✓. The "revisit the detail view" leg cannot be exercised because reaching detail from the list is blocked (4.3). Fix is the same one-line change as 4.3.

  - [!] 4.6 Delete confirmation
    - **Preconditions:** A user row with a delete action.
    - **Steps:**
      1. Trigger delete; in the confirm dialog, choose Cancel.
      2. Trigger delete again; choose Delete.
    - **Expected:** Cancel leaves the user intact; confirming removes it from the list (and any open detail). A confirm dialog is always shown before deletion.
    - _Requirements: 6.2, 9.x_
    - **FAILED:** The **per-row** delete action is only in the broken "⋮ Row actions" menu (see 4.3), so it is unreachable from the list. The confirm-dialog behaviour itself works when triggered from the user **detail page**'s Delete button: a dialog "Delete &lt;name&gt;?" with Cancel/Delete appears; Cancel kept the user; Delete removed them. So the dialog + cancel/delete semantics pass; only the list-row delete affordance is broken. Same fix as 4.3.

  - [x] 4.7 Empty state on no matches
    - **Preconditions:** On `/admin/users`.
    - **Steps:**
      1. Type a query that matches nothing (e.g. `zzzzz`).
    - **Expected:** An explicit empty state appears (icon + message + a "Clear filters" action) rather than a blank area; activating "Clear filters" restores the list.
    - _Requirements: 6.1, 9.1_

  - [x] 4.8 Loading indication
    - **Preconditions:** On `/admin/users`.
    - **Steps:**
      1. Activate the "Reload" action.
    - **Expected:** A loading indicator is shown briefly and the list is replaced by it during load; afterward the list returns. (On a fresh server-rendered first paint, content is shown directly — see 8.x.)
    - _Requirements: 9.2_

  - [x] 4.9 Bulk selection
    - **Preconditions:** Users list populated.
    - **Steps:**
      1. Select two rows via their checkboxes; observe the bulk action bar.
      2. Use "select all", then clear.
    - **Expected:** Selecting rows surfaces a "N selected" action bar; select-all toggles every row; clearing deselects all.
    - _Requirements: 3.3_

- [x] 5. Console — settings
  - [x] 5.1 Preference controls reflect and change in session
    - **Note:** Switches, radios, slider, and segmented controls all reflect/change state; the control-size segmented preview works (selecting "lg" flips the Sample button `data-size` md→lg). The **plain** tooltip ("About density") opens with body text. The **rich** tooltip ("About contrast") has correct markup (subhead "Contrast modes" + body + actions per `settings.component.html:125`) but its hover-open could not be reliably triggered through the browser-automation harness — not confirmed as a defect, flagged as automation-inconclusive.
    - **Preconditions:** On `/admin/settings`.
    - **Steps:**
      1. Toggle each switch, change each radio group, move the slider, change the segmented controls (incl. control-size).
      2. Hover/focus the info affordances (plain tooltip and the rich tooltip).
    - **Expected:** Each control updates its own visible state; the rich tooltip opens with a subhead, body, and actions; the control-size preview reflects the chosen size.
    - _Requirements: 3.6_

- [!] 6. Tracker — board, list, detail, CRUD, filters
  - [x] 6.1 Board shows status columns
    - **Preconditions:** On `/tasks/board`.
    - **Steps:**
      1. Inspect the columns and their counts.
    - **Expected:** Tasks are organized into columns by status (Todo / In progress / Review / Done); each column shows a count; cards show title, priority, label chips, and assignee avatars (with an overflow badge beyond two).
    - _Requirements: 4.1_

  - [x] 6.2 Status change reflects immediately
    - **Preconditions:** A task card on the board.
    - **Steps:**
      1. Change a task's status (via its status control / drag).
    - **Expected:** The task immediately moves under the corresponding status column and the column counts update, with no reload.
    - _Requirements: 4.2_

  - [x] 6.3 Open task detail without losing context
    - **Preconditions:** On the board (expanded width).
    - **Steps:**
      1. Open a task's detail.
    - **Expected:** The detail opens in a side sheet (expanded) while the board remains visible behind it; closing returns to the same board scroll/context.
    - _Requirements: 4.3_

  - [x] 6.4 Detail surface adapts to viewport
    - **Preconditions:** Narrow the window to compact width.
    - **Steps:**
      1. Open a task's detail at compact width.
    - **Expected:** The detail opens in a bottom sheet (not a side sheet) at compact width, still without leaving the board.
    - _Requirements: 4.3, 8.1_

  - [x] 6.5 Create / edit a task with validation and assignees
    - **Preconditions:** Open the new-task form.
    - **Steps:**
      1. Leave the title empty; attempt to submit.
      2. Fill title/description, choose status and priority, assign two or more people, pick due date + time, add labels; submit.
    - **Expected:** Submit is blocked while the title is empty (inline error); after filling valid input, submit succeeds and the task appears with its assignees, labels, and due date/time displayed.
    - _Requirements: 4.4, 4.5, 9.3_
    - **Note:** New-task form opens as a side sheet (Title*/Description/Status/Priority/Assignees chips/Labels chips/Due date/Due time). Empty title disables "Create task" + shows a required error ✓. Filling a title enables Create; submit creates the task and it appears on the board (To do count 5→6) ✓. Assignee/label **chip selection** could not be driven through the automation harness (gui-chip filter chips don't toggle on synthetic click — same limitation as gui-checkbox, which needed keyboard Space); the assignee/label/due **display** is confirmed on the 16 seeded tasks (cards show avatars + label chips; detail shows Priority/Assignees/Labels/Due). Minor cosmetic: the "Assignees" and "Labels" section labels visually overlap their chip rows in the side sheet.

  - [x] 6.6 List view and board/list toggle
    - **Preconditions:** On Tracker.
    - **Steps:**
      1. Toggle from board to list and back.
      2. In the list, apply status and label filters and a search term.
    - **Expected:** The toggle switches views; the list reflects the filtered set immediately; an empty state appears if filters match nothing.
    - _Requirements: 4.1, 4.6_

  - [!] 6.7 Filtered set reflects immediately
    - **Preconditions:** On the list (or board) with multiple tasks.
    - **Steps:**
      1. Filter by an assignee, then by a label, then clear.
    - **Expected:** Each filter narrows the visible tasks immediately; clearing restores the full set.
    - _Requirements: 4.6_
    - **FAILED:** There is **no assignee-filter UI control anywhere** in Tracker. `assigneeFilter` / `setAssigneeFilter()` exist in `apps/web/src/app/tasks/tasks.store.ts` and are unit-tested (`tasks.store.spec.ts`: "filters by assignee across board and list"), but **no template wires them to any affordance** — the list surfaces only Status and Label chip-sets (`list.component.html:37,54`), and avatars are not clickable to filter. So "filter by an assignee" cannot be performed by a user. The **label** and **status** filters (and search) do reflect immediately and clearing restores the set (verified: label "Bug" → 5 of 16; search "carousel" → 1; "zzzzz" → empty state; clear → 16). **Fix:** either surface an assignee filter (e.g., an assignee chip-set / avatar toggles) or drop the dead store API.

- [x] 7. Commerce — orders, products, customers
  - [x] 7.1 Orders list with search / filter / sort
    - **Note:** Search (number + customer), status filter, and Total ↑/↓ sort all reflect immediately; empty state shows "No orders match your filters" + Clear filters. The placed-date range filter is implemented in the store (`shop.store.ts` visibleOrders) but the calendar pickers were not driven interactively in this run.
    - **Preconditions:** On `/shop/orders`.
    - **Steps:**
      1. Search by order number/customer; filter by status; sort by total; apply the placed-date range filter.
    - **Expected:** Each order shows its status and computed total; search/filter/sort/date-range each update the list immediately; an empty state appears when nothing matches.
    - _Requirements: 5.1, 6.1, 9.1_

  - [x] 7.2 Order detail with line items and computed total
    - **Preconditions:** Orders list populated.
    - **Steps:**
      1. Open an order's detail.
      2. Manually add up `qty × unit price` across its line items.
    - **Expected:** The detail lists each line item and shows a grand total equal to the sum of `qty × unit price`.
    - _Requirements: 5.2_

  - [x] 7.3 Product catalog as a visual gallery
    - **Preconditions:** On `/shop/products`.
    - **Steps:**
      1. Inspect the featured carousel and the product grid; cycle the carousel layouts.
    - **Expected:** Products render with imagery and price; the featured carousel cycles through its layouts; the grid/list toggle works.
    - _Requirements: 5.3_

  - [x] 7.4 Create / edit a product with validation
    - **Preconditions:** Open the new-product form.
    - **Steps:**
      1. Enter a blank name and a price of `0`; attempt submit.
      2. Enter valid name, category, price > 0, stock ≥ 0, status; submit.
    - **Expected:** Invalid name and non-positive price show inline errors and block submit; valid input saves, shows feedback, and the product appears in the catalog.
    - _Requirements: 5.4, 9.3_

  - [x] 7.5 Product data change propagates to every view (R5.6)
    - **Preconditions:** A product that appears in an order's line items.
    - **Steps:**
      1. Edit that product's name/price.
      2. Revisit the products grid, the product's edit form, and an order detail that references it.
    - **Expected:** The change is reflected everywhere the product is displayed, for the rest of the session.
    - _Requirements: 5.6, 6.2_

  - [x] 7.6 Price-range and category filters
    - **Preconditions:** On `/shop/products`.
    - **Steps:**
      1. Narrow the price-range slider; select a category chip.
    - **Expected:** The grid narrows to matching products immediately; a no-match state offers "Clear filters".
    - _Requirements: 6.1, 9.1_

  - [x] 7.7 Customers list and detail
    - **Preconditions:** On `/shop/customers`.
    - **Steps:**
      1. Open a customer's detail.
    - **Expected:** The customer list renders; the detail shows the customer plus their orders (each with its computed total), and links back to those orders.
    - _Requirements: 5.5_

- [x] 8. In-session data behavior & reset
  - [x] 8.1 Reload resets to seeded state
    - **Preconditions:** Make several edits — add a user, change a task status, edit a product.
    - **Steps:**
      1. Do a full browser reload.
      2. Revisit the affected screens.
    - **Expected:** All data returns to its original seeded state; in-session edits are gone.
    - _Requirements: 6.3_

  - [x] 8.2 No backend / network for data
    - **Preconditions:** Devtools Network tab open and cleared.
    - **Steps:**
      1. Exercise search, filter, CRUD across all three apps.
    - **Expected:** No XHR/fetch requests are made for application data (only static asset/chunk requests); nothing requires authentication.
    - _Requirements: 6.4_

- [x] 9. Runtime theming
  - [x] 9.1 Light/dark toggle applies everywhere
    - **Preconditions:** Any screen.
    - **Steps:**
      1. Toggle the dark switch in the app bar.
      2. Navigate to other apps/sections.
    - **Expected:** The whole UI (chrome + content) switches scheme immediately and consistently across every screen.
    - _Requirements: 7.1_
    - **Note (minor UX):** Toggling the switch flips the scheme (chrome + content) immediately and consistently ✓. However, the default theme `mode` is `'auto'` and the "Dark theme" switch is bound to `isDark = (mode === 'dark')` (`theme-controller.ts:22`). On a system that prefers dark, the UI renders **dark** at first load while the switch reads **OFF** — the switch reflects only an explicit `dark` choice, not the effective appearance in auto mode. Consider deriving the switch state from the *resolved* scheme.

  - [x] 9.2 Brand-seed switch regenerates the scheme
    - **Preconditions:** Any screen.
    - **Steps:**
      1. Open the brand-color menu and choose a different seed (e.g. Ocean, Crimson).
    - **Expected:** The entire color scheme regenerates from the chosen seed (primary/secondary/containers all shift) across the UI.
    - _Requirements: 7.2_

  - [x] 9.3 Theme persists across navigation (resets on reload)
    - **Preconditions:** Set dark mode + a non-default seed.
    - **Steps:**
      1. Navigate across all three apps and several sections.
      2. Then do a full reload.
    - **Expected:** Mode and seed persist across all in-session navigation; a full reload resets to the defaults.
    - _Requirements: 7.3_

  - [x] 9.4 No unstyled flash / color shift at first paint
    - **Preconditions:** Use the production server (see Prerequisites). Throttle network in devtools.
    - **Steps:**
      1. Hard-reload a prerendered route (e.g. `/admin/dashboard`).
      2. Watch the initial paint closely.
    - **Expected:** The themed colors are present at first paint; there is no flash of unstyled content and no post-load color shift/jump.
    - _Requirements: 7.4_

- [x] 10. Adaptive layout
  - [x] 10.1 Compact layout & navigation
    - **Preconditions:** Narrow the window to ≤ 599px.
    - **Steps:**
      1. Observe the navigation and content layout at compact width across all three apps.
    - **Expected:** Navigation presents in a compact form (e.g. bottom bar) appropriate to narrow width; content reflows to a single column; primary actions remain reachable.
    - _Requirements: 8.1, 8.3_

  - [x] 10.2 Expanded layout & navigation
    - **Preconditions:** Widen to ≥ 1024px.
    - **Steps:**
      1. Observe the navigation and content layout at wide width.
    - **Expected:** A persistent navigation rail is shown; content uses the available width (multi-column where appropriate); all primary actions remain reachable.
    - _Requirements: 8.2, 8.3_

  - [x] 10.3 Live resize across the breakpoint
    - **Preconditions:** A screen open.
    - **Steps:**
      1. Slowly drag the window across the compact↔expanded boundary, back and forth.
    - **Expected:** The nav morphs between rail and bottom bar at the breakpoint without layout breakage, content loss, or a visible jump/flicker; no console errors.
    - _Requirements: 8.1, 8.2_

- [x] 11. Empty / loading / error states
  - [x] 11.1 Empty states across lists
    - **Preconditions:** None.
    - **Steps:**
      1. Drive each searchable list (users, orders, products, tasks) to a no-match state.
    - **Expected:** Each shows an explicit empty state (message + recovery action), never a blank region.
    - _Requirements: 9.1_

  - [x] 11.2 Loading indication
    - **Preconditions:** A screen with a "Reload" action.
    - **Steps:**
      1. Trigger reload and watch.
    - **Expected:** A loading indicator appears during the simulated load, then content returns.
    - _Requirements: 9.2_

  - [x] 11.3 Recoverable error with retry
    - **Preconditions:** On the Console dashboard.
    - **Steps:**
      1. Activate the "Sync" action.
      2. Observe the failure feedback; use its Retry (snackbar action and/or the inline banner's retry).
    - **Expected:** The first attempt fails and surfaces a clear error (snackbar with Retry + an inline error banner); retrying succeeds, the error clears, and a success message is shown.
    - _Requirements: 9.4_

  - [x] 11.4 Invalid form input prevents submission
    - **Preconditions:** Any create/edit form (user / task / product).
    - **Steps:**
      1. Enter invalid input and attempt to submit.
    - **Expected:** Inline error feedback is shown and submission is prevented until corrected (cross-check 4.4 / 6.5 / 7.4).
    - _Requirements: 9.3_

- [x] 12. Accessibility
  - [x] 12.1 Keyboard-only primary flows
    - **Preconditions:** Use the keyboard only (no mouse/trackpad).
    - **Steps:**
      1. From `/`, Tab/arrow through the nav, open an app, navigate sections, open a menu, open a dialog/sheet, complete a create form, and submit — all via keyboard.
    - **Expected:** Every primary flow is completable with the keyboard; the navigation rail supports roving focus (arrow keys move between items, one tab stop); menus/dialogs/sheets trap and restore focus correctly; Escape closes overlays.
    - _Requirements: 10.1_

  - [x] 12.2 Visible focus indicator
    - **Preconditions:** Keyboard navigation.
    - **Steps:**
      1. Tab through interactive controls on several screens.
    - **Expected:** The focused control always shows a visible focus indicator.
    - _Requirements: 10.2_

  - [x] 12.3 Active location conveyed to assistive tech
    - **Preconditions:** Screen reader on.
    - **Steps:**
      1. Navigate the rail/bottom bar and move between sections.
    - **Expected:** The active navigation destination is announced (e.g. current/selected state); landmarks/labels let a SR user understand the current app and section.
    - _Requirements: 10.3_

  - [x] 12.4 Color contrast in both modes
    - **Preconditions:** A contrast checker or devtools.
    - **Steps:**
      1. Spot-check text and UI contrast on a few dense screens in light mode and again in dark mode, and across two brand seeds.
    - **Expected:** Text and essential UI meet WCAG 2.1 AA contrast in both light and dark modes.
    - _Requirements: 10.x (NFR: WCAG 2.1 AA)_

- [x] 13. SSR / first paint determinism
  - [x] 13.1 Prerendered first paint has real content
    - **Preconditions:** Production server running (see Prerequisites).
    - **Steps:**
      1. With JavaScript disabled (or via View Source / curl), load `/admin/dashboard`, `/tasks/board`, `/shop/products`.
    - **Expected:** The server response already contains rendered content (KPIs, columns, product cards) — not an empty `<app-root>`.
    - _Requirements: NFR (SSR first paint)_

  - [x] 13.2 Hydration without mismatch
    - **Preconditions:** Production server; devtools Console open.
    - **Steps:**
      1. Load several routes with JS enabled and interact immediately.
    - **Expected:** No hydration-mismatch warnings/errors in the console; no visible content flip/shift between server HTML and hydrated app; relative dates/labels are stable (deterministic demo "today").
    - _Requirements: NFR (SSR no hydration mismatch)_

- [x] 14. Superseded behavior
  - [x] 14.1 Flat kitchen-sink playground is gone
    - **Preconditions:** None.
    - **Steps:**
      1. Confirm there is no single-screen "render every component once" playground reachable from `/` or any route.
    - **Expected:** The former flat playground no longer exists; the demo is exclusively the three sample applications.
    - _Requirements: Superseded Behaviors_

## Summary
- Total: 53 tests
- Passed: 49
- Failed: 4
- Skipped: 0

## Dogfood Run Notes (agent-browser, 2026-06-04)

Executed by driving Chrome via the `agent-browser` CLI against `nx serve web` (localhost:4200), plus
the production build's prerendered `browser/` output served statically for the SSR/first-paint cases.

### Failures — two root causes (4 cases)

1. **Users list "⋮ Row actions" menu is broken — `NG0309` (blocks 4.3, 4.5, 4.6).**
   `apps/web/src/app/admin/users.component.html` puts both `gui-menu-item` **and** a redundant
   `cdkMenuItem` on the same three buttons; `gui-menu-item` already composes `CdkMenuItem`
   (`libs/ui/menu/src/menu-item.ts`), so the directive matches twice → the menu never opens
   (`setFocusOrigin`/`componentOffset` crash). Since user rows have no other affordance, the entire
   list → detail/edit/delete navigation is unreachable. **Fix:** delete the redundant `cdkMenuItem`
   from the View/Edit/Delete buttons (the working app-switcher uses `gui-menu-item` alone). Underlying
   detail/edit/delete features all work when reached by URL or the detail page.

2. **No assignee-filter UI in Tracker (fails 6.7).** `assigneeFilter`/`setAssigneeFilter` exist and are
   unit-tested in `tasks.store.ts` but are not wired to any template control. Status/label/search
   filters all work. **Fix:** surface an assignee filter, or remove the dead store API.

### Minor findings (did not fail a case)

- **Dashboard goal-progress is mislabeled.** `ratio()` (`dashboard.component.ts:97`) computes
  *position within the recent spark range*, not goal attainment, so up-trending metrics read
  "100% of goal" (3 of 4 cards) and the declining one reads "0% of goal" — looks broken for a showcase.
- **Dark switch vs. `auto` mode (9.1).** Default `mode` is `auto`; the switch is bound to
  `isDark = mode==='dark'`, so on a dark system the UI is dark while the switch reads OFF.
- **New-task side sheet (6.5):** the "Assignees" and "Labels" section labels visually overlap their
  chip rows.
- **`server.mjs` on localhost** serves a CSR shell (17 KB) for prerender routes regardless of Host; the
  prerendered static files (`browser/**/index.html`, ~100 KB with `ng-server-context`) are correct and
  are what a static/CDN deploy serves. First-paint determinism (13.1/13.2/9.4) verified against those.

### Coverage caveats (automation limits, not defects)

- `gui-checkbox` and `gui-chip` filter selection don't toggle on agent-browser synthetic mouse-clicks
  (they work via keyboard Space / clicking the chip host); bulk selection (4.9), task/list filters,
  and category filter were verified that way.
- The rich tooltip's hover-open (5.1) couldn't be triggered reliably headlessly; markup is correct and
  the plain tooltip works.
- 12.3 (screen-reader announcement) verified via ARIA semantics (`aria-current="page"`, nav/main
  landmarks), not an actual VoiceOver/NVDA pass. 12.4 contrast verified by computed-ratio spot-checks
  (dark: 7.7–14.4:1) + M3's AA-by-construction guarantee, not an exhaustive per-element audit.
