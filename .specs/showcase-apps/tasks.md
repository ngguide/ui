---
created: 2026-06-04
updated: 2026-06-04
---

# Implementation Plan: Showcase Apps

## Overview

Replace the flat component playground in `apps/web` with three lazily-loaded sample applications
(Console / Tracker / Commerce) under one shared Shell, on plain-signal stores, with Material Symbols
icons, runtime theming, CSS adaptivity, and full `@ngguide/ui` coverage.

The plan is split into 6 groups in dependency order. Each group is independently mergeable — `lint`,
`test`, and `build` for `web` stay green with only that group (and earlier ones) applied. There are
**no cutovers**: `apps/web` is the unpublished demo host, so the one destructive step (replacing the
flat playground's root with the Shell, Group B) is a plain wholesale swap, not a production cutover —
revert is `git restore` of the root files.

### Shippable groups

| Group | Name | Blast radius | Depends on |
|---|---|---|---|
| A | Shared foundation | safe (additive, inert; flat demo untouched) | — |
| B | Shell + root swap (Console dashboard lands) | replaces flat demo root with Shell+Console; revert = restore root files from git | A |
| C | Console complete (users + settings) | safe (additive screens behind `/admin`) | B |
| D | Tracker app | safe (additive `/tasks` branch) | A, B |
| E | Commerce app | safe (additive `/shop` branch) | A, B |
| F | Cross-cutting states + full coverage audit | safe (additive states + manifest) | B, C, D, E |

### Load-bearing decision

The flat playground and the new apps cannot coexist on the same root: the old `AppComponent` renders
its template **directly** (no `<router-outlet>`), so activating the router means gutting it. Group B
performs that single swap and immediately lands a working screen (Console dashboard via
`/` → `/admin/dashboard`), so `main` is never left on a blank root. Groups A and C–F are purely
additive around that one swap.

## Tasks

### Group A — Shared foundation (additive, inert)

New shared scaffolding consumed by every later group. Nothing here is wired into the running app, so
the existing flat demo keeps rendering unchanged. Blast radius: safe.

- [x] 1. Core models, theme config, and demo date constant
  - Create `apps/web/src/app/core/models.ts`: interfaces + unions for `User`/`UserRole`/`UserStatus`, `Metric`, `ActivityEntry`, `Task`/`TaskStatus`/`TaskPriority`, `Member`, `Label`, `Product`/`ProductStatus`, `Order`/`OrderStatus`/`OrderLine`, `Customer` (per design "Data Models").
  - Create `apps/web/src/app/core/theme-config.ts`: `BASE_THEME` (`Omit<M3ThemeConfig,'sourceColor'|'mode'>`), `BRAND_SEEDS`, `DEFAULT_SEED`.
  - Create `apps/web/src/app/core/demo-date.ts`: `export const DEMO_TODAY = new Date(2026, 5, 4)` (fixed, SSR-deterministic).
  - _Requirements: 3.1, 4.4, 5.1, 7.2_

- [x] 2. Deterministic formatters + unit test
  - Create `apps/web/src/app/core/formatters.ts`: `formatCurrency`, `formatNumber`, `formatDate(d)`, `formatRelative(from, to)`, `initials(name)` — using only explicit Date getters; no `Date.now()`/`Math.random()`/argless `new Date()`.
  - Create `apps/web/src/app/core/formatters.spec.ts`: assert `$1,234.50` grouping, `Jun 4, 2026` date format, relative label vs `DEMO_TODAY`, two-letter initials.
  - _Requirements: 5.2; NFR (SSR determinism)_

- [x] 3. Navigation model + theme controller
  - Create `apps/web/src/app/shell/nav.ts`: `NavItem`, `DemoApp`, `DEMO_APPS` (Console/Tracker/Commerce + their sections; icons are Material Symbols ligature names).
  - Create `apps/web/src/app/shell/theme-controller.ts`: root-provided `ThemeController` with `mode`/`seed` signals and `setMode`/`toggleDark`/`setSeed` calling `M3ThemeService.setTheme({ ...BASE_THEME, sourceColor, mode })`.
  - _Requirements: 1.1, 7.1, 7.2, 7.3_

- [x] 4. Material Symbols font + `.sym` icon class
  - Modify `apps/web/src/styles.css`: add the Material Symbols `@import` (after the Roboto import, before `@import 'tailwindcss'`) and a `.sym` rule (font-family + variation settings + `font-size: var(--gui-comp-icon-size, 24px)`). Do **not** add global body restyle here (keep the flat demo visually unchanged; shell base layout lives in `shell.component.css`).
  - _Requirements: 5 (iconography); Decision 5A_

- [x] 5. Checkpoint — Group A verification
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web`.
  - Confirm `formatters.spec.ts` passes; new files type-check; the flat demo at `/` still renders unchanged (Material Symbols/`.sym` are unused so far).

### Group B — Shell + root swap (Console dashboard lands)

Builds the Shell chrome, the Console store + dashboard, then performs the single swap that replaces
the flat playground root with the router-mounted Shell landing on Console. After this group `/`
redirects to `/admin/dashboard`, theming/adaptivity work, and the flat playground is gone.
Blast radius: replaces the demo root — revert = `git restore` of `app.component.*`, `app.routes.ts`,
`app.component.spec.ts` and re-add `interaction-demo.component.ts`.

- [x] 6. Shell component (app bar + adaptive navigation + theme controls)
  - Create `apps/web/src/app/shell/shell.component.ts` / `.html` / `.css`: top app bar (app-switcher `gui-menu`, search `gui-text-field`, dark `gui-switch`, brand-seed `gui-menu`, notifications `[guiBadge]` + `gui-icon-button`, avatar `gui-menu`, `guiTooltip`s); navigation rail (expanded) ↔ bottom bar / drawer (compact) via CSS `container-type: inline-size` + `@container`; custom nav items carry `guiStateLayer`/`guiRipple`/`guiFocusRing` with a roving tab stop (`createRovingFocus`); `<router-outlet/>`; `activeApp`/`activeSection` computed from `Router` URL via `toSignal(NavigationEnd)`.
  - Use `ThemeController` for dark toggle + brand-seed selection.
  - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.3, 8.1, 8.2, 8.3; interaction coverage (R2)_

- [x] 7. Shell unit test
  - Create `apps/web/src/app/shell/shell.component.spec.ts`: `activeApp()` resolves from a set URL; the template renders `<router-outlet>`; toggling dark calls `ThemeController.toggleDark`.
  - _Requirements: 1.3, 7.1_

- [x] 8. Console store + fixtures + unit test
  - Create `apps/web/src/app/admin/admin.store.ts` (`@Injectable`, plain signals): `data` (users), `query`/`role`/`sort`/`loading` signals, `visible` computed (search+filter+sort), `isEmpty`, `add`/`update`/`remove`/`byId`.
  - Create `apps/web/src/app/admin/fixtures.ts`: `seedUsers()`, `seedMetrics()`, `seedActivity()` — deterministic (fixed dates via `new Date(2026, m, d)`, stable ids).
  - Create `apps/web/src/app/admin/admin.store.spec.ts`: search across name+email, role filter, sort, add/update/remove reflect in `visible()`, `isEmpty` true on no match.
  - _Requirements: 3.3, 3.4, 6.1, 6.2, 6.3, 9.1_

- [ ] 9. Console dashboard screen
  - Create `apps/web/src/app/admin/dashboard.component.ts` / `.html` / `.css`: KPI `gui-card`s (number via `formatNumber`/`formatCurrency` + delta + `gui-circular-progress`/`gui-linear-progress` ratio); a small inline-SVG `sparkline.component.ts` (polyline from `number[]`, `role="img"` + `aria-label`); recent-activity `gui-list`; a `gui-button-group` range toggle.
  - _Requirements: 3.1, 3.2, 10.1, 10.2_

- [ ] 10. Console feature routes (dashboard + placeholders)
  - Create `apps/web/src/app/admin/admin.routes.ts`: `providers: [AdminStore]`; children `''→'dashboard'`, `dashboard` (loadComponent). Leave `users`/`settings` for Group C (do not reference not-yet-created files).
  - _Requirements: 1.4_

- [ ] 11. Switch the root to the Shell (remove the flat playground)
  - Modify `apps/web/src/app/app.routes.ts`: `{ path: '', loadComponent: ShellComponent, children: [ {'' → 'admin'}, {'admin', loadChildren admin.routes} ] }`.
  - Gut `apps/web/src/app/app.component.ts` to a router host (`template: '<router-outlet />'`, `imports: [RouterOutlet]`, `OnPush`, selector `app-root` preserved); remove all flat-demo imports/state.
  - Replace `apps/web/src/app/app.component.html` with `<router-outlet />` (or inline + delete the file); empty/remove `app.component.css` (`bg-lines`); delete `apps/web/src/app/interaction-demo.component.ts` (its `interaction` coverage moved to the shell nav).
  - Update `apps/web/src/app/app.component.spec.ts`: replace the `[gui-button]` assertion with a `router-outlet` presence assertion.
  - _Requirements: 1.1, 1.4; Superseded Behaviors_

- [ ] 12. Checkpoint — Group B verification
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web`.
  - Confirm: `/` → `/admin/dashboard` renders the Shell + dashboard; dark toggle and brand-seed switch re-theme all chrome; nav rail (wide) ↔ bottom bar/drawer (narrow) on resize; flat playground no longer reachable; `app.component.spec` + `shell.spec` + `admin.store.spec` green; `nx serve web` boots and prerender/hydration is error-free.

### Group C — Console complete (users + settings)

Additive screens behind `/admin`; the Console store already exists. Blast radius: safe.

- [ ] 13. Users list screen (search / filter / sort / bulk-select / states)
  - Create `apps/web/src/app/admin/users.component.*`: `gui-text-field` search (leading `gui-icon`, trailing clear `gui-icon-button`), `gui-chip-set`/`gui-segmented-buttons` filters, a `gui-list` of users with `gui-divider`s, per-row `gui-icon-button` + `gui-menu`, `gui-checkbox` bulk-select, an explicit empty state (`store.isEmpty`) with a "Clear filters" `gui-button`, a "Reload" loading sim using `gui-loading-indicator`.
  - _Requirements: 3.3, 6.1, 9.1, 9.2_

- [ ] 14. User detail + create/edit form (validation + feedback)
  - Create `apps/web/src/app/admin/user-detail.component.*` and `apps/web/src/app/admin/user-form.component.*`: reactive form with `gui-text-field` (`error`/`errorText`, required), `gui-radio-group` (role), `gui-switch` (status), `gui-date-picker` (joined date); submit disabled until valid; `gui-snackbar` save feedback; delete via `gui-dialog` confirm.
  - _Requirements: 3.4, 3.5, 6.2, 9.3, 9.4_

- [ ] 15. Settings surface
  - Create `apps/web/src/app/admin/settings.component.*`: `gui-switch`/`gui-radio-group`/`gui-slider`/`gui-segmented-buttons` preference rows (incl. dark-mode + contrast + brand-seed echoing `ThemeController`), `guiTooltip`/`gui-rich-tooltip` info affordance.
  - _Requirements: 3.6, 7.1, 7.2_

- [ ] 16. Wire Console child routes
  - Modify `apps/web/src/app/admin/admin.routes.ts`: add `users`, `users/new`, `users/:id`, `settings` (loadComponent).
  - _Requirements: 1.4_

- [ ] 17. Checkpoint — Group C verification
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web`.
  - Confirm: users search/filter/sort update live; create/edit/delete reflect across list + detail; invalid form blocks submit with inline errors; empty + loading states show; settings controls work; reload resets data.

### Group D — Tracker (tasks) app

Additive `/tasks` branch. Blast radius: safe.

- [ ] 18. Tasks store + fixtures + unit test
  - Create `apps/web/src/app/tasks/tasks.store.ts`: `tasks`/`members`/`labels` signals, `query`/`statusFilter`/`assigneeFilter`/`labelFilter` signals, `byStatus` computed (board columns), `visibleList` computed, `add`/`update`/`remove`/`moveStatus`.
  - Create `apps/web/src/app/tasks/fixtures.ts` (deterministic) and `apps/web/src/app/tasks/tasks.store.spec.ts` (filter by status/assignee/label; `moveStatus`; CRUD reflect).
  - _Requirements: 4.1, 4.2, 4.6, 6.1, 6.2, 6.3_

- [ ] 19. Board view (status columns)
  - Create `apps/web/src/app/tasks/board.component.*`: status columns from `byStatus`; task cards (`gui-card`) with label/assignee `gui-chip`s, assignee-overflow `[guiBadge]`, priority; status change reflects immediately (default: `@angular/cdk/drag-drop` between columns — see Notes; a status `gui-menu`/`gui-segmented-buttons` is an acceptable alternative); `gui-fab` "new task".
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 20. List view + board/list toggle
  - Create `apps/web/src/app/tasks/list.component.*`: filterable task table/`gui-list` with `gui-chip-set` filters; a `gui-segmented-buttons` board↔list toggle hosted in the Tracker root.
  - _Requirements: 4.1, 4.6_

- [ ] 21. Task detail + create/edit form
  - Create `apps/web/src/app/tasks/task-detail.component.*` (opens in a `gui-side-sheet` on expanded / `gui-bottom-sheet` on compact, chosen via `GuiBreakpoint`, without leaving the board) and `apps/web/src/app/tasks/task-form.component.*`: title/description (`gui-text-field`), status, assignees (multi `gui-chip-set`), due `gui-date-picker` + `gui-time-picker`, labels; validation.
  - _Requirements: 4.3, 4.4, 4.5, 9.3; overlay/side-sheet/bottom-sheet coverage_

- [ ] 22. Tracker routes + wire into app routing
  - Create `apps/web/src/app/tasks/tasks.routes.ts` (`providers: [TasksStore]`; children board/list/detail/new). Modify `apps/web/src/app/app.routes.ts` to add `{ path: 'tasks', loadChildren: tasks.routes }`.
  - _Requirements: 1.2, 1.4_

- [ ] 23. Checkpoint — Group D verification
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web`.
  - Confirm: board + list render; status change moves a task and persists in-session; detail opens without losing board context; create/edit/filter work; `tasks.store.spec` green; `/tasks` reachable from the shell.

### Group E — Commerce (shop) app

Additive `/shop` branch. Blast radius: safe.

- [ ] 24. Shop store + fixtures + unit test
  - Create `apps/web/src/app/shop/shop.store.ts`: `products`/`orders`/`customers` signals, filter/sort/search signals, `visibleOrders`/`visibleProducts` computed, `totalOf(order)` computed helper, CRUD.
  - Create `apps/web/src/app/shop/fixtures.ts` (deterministic) and `apps/web/src/app/shop/shop.store.spec.ts` (filter/sort orders; order total; product CRUD reflect).
  - _Requirements: 5.1, 5.2, 5.6, 6.1, 6.2, 6.3_

- [ ] 25. Orders list + order detail
  - Create `apps/web/src/app/shop/orders.component.*` and `order-detail.component.*`: orders `gui-list`/table with status `gui-chip`s + totals, search/filter/sort, `gui-date-range-picker` order-date filter; detail shows line items + computed total.
  - _Requirements: 5.1, 5.2, 6.1_

- [ ] 26. Products gallery + grid + product form
  - Create `apps/web/src/app/shop/products.component.*` and `product-form.component.*`: a `gui-carousel` featured strip (exercise multiple layouts), a `gui-card` product grid (deterministic CSS-gradient imagery from `imageHue`, price), a validated product edit form, a `gui-split-button` "Publish", a `gui-slider` price-range filter.
  - _Requirements: 5.3, 5.4, 6.2, 9.3; carousel/split-button/slider coverage_

- [ ] 27. Customers list + detail
  - Create `apps/web/src/app/shop/customers.component.*` and `customer-detail.component.*`.
  - _Requirements: 5.5_

- [ ] 28. Shop routes + wire into app routing
  - Create `apps/web/src/app/shop/shop.routes.ts` (`providers: [ShopStore]`; children orders/orders/:id, products/products/:id, customers/customers/:id). Modify `apps/web/src/app/app.routes.ts` to add `{ path: 'shop', loadChildren: shop.routes }`.
  - _Requirements: 1.2, 1.4_

- [ ] 29. Checkpoint — Group E verification
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web`.
  - Confirm: orders/products/customers render; order totals compute; product create/edit reflects everywhere; carousel layouts work; `/shop` reachable; `shop.store.spec` green.

### Group F — Cross-cutting states + full coverage audit

Closes the empty/loading/error story across all apps and guarantees every entry point is used.
Blast radius: safe (additive states + a coverage manifest doc).

- [ ] 30. Empty / loading / error states pass
  - Ensure every list/result in all three apps has an explicit empty state, a loading indication (`gui-loading-indicator`/`gui-linear-progress`) on an explicit "Reload" action (client-only; SSR renders the loaded state), and at least one recoverable error: a "Sync" action that fails first then succeeds, surfaced via a `gui-snackbar` with `Retry` and/or an inline error banner.
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 31. Coverage audit + fill gaps
  - Walk the design's coverage manifest against the implemented apps; add any missing entry-point usages (e.g. `gui-fab-menu` create menu, `gui-rich-tooltip`, additional `[guiBadge]` spots, `gui-divider`, `gui-loading-indicator`). Confirm `forms` (`GuiFormControl` via reactive forms), `datetime` (`GuiTime`/`GuiDateRange`), `overlay` (`GuiBreakpoint`), and root `GuiSize` are each consumed.
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 32. Coverage manifest document
  - Create `apps/web/src/app/COVERAGE.md` (or `.specs/showcase-apps/coverage.md`): table mapping each `@ngguide/ui/*` entry point → the concrete file/component where it is used, for test-plan verification.
  - _Requirements: 2.4_

- [ ] 33. Final checkpoint — everything green
  - Run: `NX_NO_CLOUD=true pnpm exec nx run-many -t lint test build -p web` and `pnpm exec nx run-many -t lint test build -p ui` (ensure the library is untouched/green).
  - Manual: all three apps work end-to-end; theming (dark + brand) persists across navigation; adaptivity at compact/expanded; empty/loading/error states; every entry point in the coverage manifest is present; `nx serve web` boots and prerender/hydration is error-free.
  - Confirm every requirement (R1–R10) traces to a shipped task.

## Notes

### Scope boundaries

- **No real authentication or backend.** All data is in-memory mock; profile/sign-out menus are non-functional affordances. (R6.4)
- **No third-party UI/chart library.** Dashboard visuals are `gui-progress` + hand-built inline SVG. (Decision 4C)
- **Navigation chrome is hand-built from primitives** because M3 navigation components are not yet published — this is an acknowledged gap, not a deviation. (Decision 2A; requirements Constraints)
- **English content only.**

### Open question carried from design

- **Board status change (task 19, R4.2):** default to `@angular/cdk/drag-drop` (already a dependency, used by `libs/ui/bottom-sheet`) for drag-between-columns; a status `gui-menu`/`gui-segmented-buttons` control is an equally acceptable, simpler implementation. The implementer chooses; both satisfy R4.2.

### Codebase verification findings

- `apps/web/src/app/app.component.spec.ts` currently asserts a `[gui-button]` renders in `AppComponent` — it MUST be updated in task 11 (the flat template is removed), else the `web` test target fails.
- `apps/web/vitest.config.ts` **exists** (inlines `@material/material-color-utilities`); keep it. Specs are auto-discovered via `src/**/*.spec.ts` (`apps/web/tsconfig.spec.json`), so new `*.spec.ts` files need no config change. The native runner has no `passWithNoTests`, so `web` must always keep ≥1 spec (satisfied throughout).
- `@nx/enforce-module-boundaries` uses a catch-all `*` constraint (`eslint.config.mjs`), so new `apps/web` folders importing `@ngguide/ui/*` pass lint.
- `gui-text-field` is **not** a `ControlValueAccessor` (deviation D1): the reactive control lives on the projected `<input [guiTextFieldInput]>`, not the wrapper.
