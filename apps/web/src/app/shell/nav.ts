/**
 * Static navigation model for the demo host. The Shell renders the app switcher
 * and the per-app navigation from this structure, and derives the active app /
 * section by matching the router URL against `basePath` / `path`.
 *
 * `icon` values are Material Symbols ligature names (rendered via the `.sym`
 * class projected into `gui-icon`).
 */

export interface NavItem {
  label: string;
  /** Material Symbols ligature name. */
  icon: string;
  /** Absolute route path, e.g. `/admin/users`. */
  path: string;
}

export interface DemoApp {
  id: 'admin' | 'tasks' | 'shop' | 'gallery';
  label: string;
  subtitle: string;
  /** Material Symbols ligature name. */
  icon: string;
  /** Route prefix that identifies this app, e.g. `/admin`. */
  basePath: string;
  nav: NavItem[];
}

export const DEMO_APPS: readonly DemoApp[] = [
  {
    id: 'admin',
    label: 'Console',
    subtitle: 'Administration',
    icon: 'admin_panel_settings',
    basePath: '/admin',
    nav: [
      { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
      { label: 'Users', icon: 'group', path: '/admin/users' },
      { label: 'Settings', icon: 'settings', path: '/admin/settings' },
    ],
  },
  {
    id: 'tasks',
    label: 'Tracker',
    subtitle: 'Task management',
    icon: 'task_alt',
    basePath: '/tasks',
    nav: [
      { label: 'Board', icon: 'view_kanban', path: '/tasks/board' },
      { label: 'List', icon: 'format_list_bulleted', path: '/tasks/list' },
    ],
  },
  {
    id: 'shop',
    label: 'Commerce',
    subtitle: 'Store admin',
    icon: 'storefront',
    basePath: '/shop',
    nav: [
      { label: 'Orders', icon: 'receipt_long', path: '/shop/orders' },
      { label: 'Products', icon: 'inventory_2', path: '/shop/products' },
      { label: 'Customers', icon: 'people', path: '/shop/customers' },
    ],
  },
  {
    id: 'gallery',
    label: 'Gallery',
    subtitle: 'Component showcase',
    icon: 'widgets',
    basePath: '/gallery',
    nav: [
      // Terse single-word rail labels — the 88px M3 nav rail can't wrap a long
      // word like "Communication"; the full category name is the page title.
      { label: 'Actions', icon: 'touch_app', path: '/gallery/actions' },
      { label: 'Comms', icon: 'notifications_active', path: '/gallery/communication' },
      { label: 'Layout', icon: 'dashboard', path: '/gallery/containment' },
      { label: 'Selection', icon: 'check_box', path: '/gallery/selection' },
      { label: 'Inputs', icon: 'edit_note', path: '/gallery/text-inputs' },
    ],
  },
];
