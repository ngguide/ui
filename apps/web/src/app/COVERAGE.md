# Component Coverage Manifest

This demo host (`apps/web`) is a showcase + idiomatic reference + dogfooding surface for the
`@ngguide/ui` component library. Requirement **R2.1** demands that the three sample applications
(Console / Tracker / Commerce), taken together, use **every** published entry point at least once;
**R2.4** demands that coverage be verifiable. This table is that checklist — each entry point maps to a
concrete in-context home. Verify with:

```bash
grep -rl "@ngguide/ui/<entry>'" apps/web/src/app
```

| Entry point | Used for | Representative home(s) |
|---|---|---|
| `@ngguide/ui` (`GuiSize`) | shared size scale (type import) | `admin/settings.component.ts` (control-size preference) |
| `badge` | app-bar notifications; assignee overflow | `shell/shell.component`, `tasks/board.component` |
| `button` | actions across forms, headers, dialogs | everywhere (`tasks/*`, `shop/*`, `admin/*`) |
| `button-group` | dashboard time-range toggle | `admin/dashboard.component` |
| `bottom-sheet` | task detail on compact viewports | `tasks/board.component` |
| `card` | KPI cards, task/product cards, detail panels | `admin/dashboard`, `tasks/board`, `shop/orders` |
| `carousel` | featured-products strip (4 layouts) | `shop/products.component` |
| `checkbox` | bulk row select; form booleans | `admin/users.component` |
| `chip` | labels, status, filter chips | `tasks/board`, `tasks/list`, `shop/orders`, `admin/users` |
| `date-picker` / `date-range-picker` | join/due dates; order-date range filter | `admin/user-form`, `tasks/task-form`, `shop/orders` |
| `datetime` (`GuiTime`, `GuiDateRange`) | typed picker values | `core/models`, `tasks/task-form`, `shop/orders` |
| `dialog` | confirm-delete flows | `admin/users`, `admin/user-detail` |
| `divider` | list/section separators | everywhere |
| `fab` | Tracker "new task" | `tasks/board.component` |
| `fab-menu` | Console multi-action "create" FAB | `admin/dashboard.component` |
| `forms` (`GuiFormControl`) | **transitive** — the CVA backing every reactive-form control | `admin/user-form`, `tasks/task-form`, `shop/product-form`, `admin/settings` |
| `icon` | every icon (Material Symbols ligatures) | everywhere |
| `icon-button` | app-bar + row actions, text-field trailing | `shell/shell`, `tasks/board`, `tasks/list` |
| `interaction` | nav-rail items (state layer + ripple + focus ring + `createRovingFocus`) | `shell/shell.component`, `shell/nav-rail-item.component` |
| `list` | users, customers, settings rows, sheet contents | `admin/users`, `shop/customers`, `tasks/list` |
| `loading-indicator` | reload loading state | `admin/users.component` |
| `menu` | app switcher / brand / account / row context menus | `shell/shell`, `tasks/board`, `shop/orders` |
| `overlay` (`GuiBreakpoint`) | choose side-sheet vs bottom-sheet for task detail | `tasks/board.component` |
| `progress` | dashboard ratios (linear + circular) | `admin/dashboard.component` |
| `radio` | user role; product status; settings | `admin/user-form`, `shop/product-form`, `admin/settings` |
| `segmented-button` | board↔list toggle; sort; grid/list; control size | `tasks/tracker`, `shop/orders`, `admin/settings` |
| `side-sheet` | task detail on expanded viewports | `tasks/board.component` |
| `slider` | price-range filter; items-per-page | `shop/products`, `admin/settings` |
| `snackbar` | save feedback; recoverable error + retry | `shop/product-form`, `admin/user-form`, `admin/dashboard` |
| `split-button` | Commerce "Publish" (primary + menu) | `shop/products.component` |
| `switch` | dark-mode toggle; settings; form booleans | `shell/shell`, `admin/settings`, `admin/user-form` |
| `text-field` | every form + search field (filled/outlined, leading/trailing, error, multiline) | `tasks/task-form`, `tasks/list`, `shell/shell` |
| `theme` (`M3ThemeService`) | runtime dark + brand-seed controls | `shell/theme-controller`, `app.config` |
| `time-picker` | task due time | `tasks/task-form.component` |
| `tooltip` (plain + rich) | icon-button tooltips; settings info affordance | `shell/shell`, `admin/settings` |

**Notes**

- `forms` is infrastructure: its public `GuiFormControl` directive is host-applied inside every CVA
  component (`gui-checkbox`/`-switch`/`-radio-group`/`-slider`/`-chip-set`/pickers), so it is exercised
  by every `[formControl]`/`[(ngModel)]` binding in the four reactive forms above. It is intentionally
  not imported directly in app code.
- Navigation chrome (top app bar, navigation rail/bottom bar, tabs) is hand-built from the interaction
  primitives + the `--md-sys-*` token contract because the M3 navigation components are not yet
  published — an acknowledged, deliberate gap (requirements Constraints; Decision 2A).
