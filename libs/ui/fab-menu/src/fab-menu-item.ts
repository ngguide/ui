/**
 * A FAB-menu action item. This is the single shared M3 menu item
 * (`MenuItemComponent` from `@ngguide/ui/menu`), re-exported under the legacy
 * `FabMenuItemComponent` name. The shared class also matches the
 * `button[gui-fab-menu-item]` selector and the `guiFabMenuItem` exportAs, so
 * existing FAB-menu consumers keep working while routing through one
 * implementation (R8.7).
 */
export { MenuItemComponent as FabMenuItemComponent } from '@ngguide/ui/menu';
