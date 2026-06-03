import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { CdkMenuItem } from '@angular/cdk/menu';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/**
 * An M3 menu list item. Composes `CdkMenuItem` (which resolves the consumer's
 * `cdkMenu`) plus the interaction foundation, with leading / label / trailing
 * slots. Disabled state is owned by `CdkMenuItem` — consumers set it on the host
 * via `disabled` / `cdkMenuItemDisabled`. The item also works when it carries a
 * `cdkMenuTriggerFor` for cascading submenus.
 *
 * Also matches the legacy `gui-fab-menu-item` selector / `guiFabMenuItem`
 * exportAs so FAB menus route through this single shared M3 implementation
 * (re-exported as `FabMenuItemComponent` from `@ngguide/ui/fab-menu`).
 */
@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-menu-item], a[gui-menu-item], button[gui-fab-menu-item], a[gui-fab-menu-item]',
  template: `<span class="gui-menu-item-leading"
      ><ng-content select="[guiMenuItemLeading]"
    /></span>
    <span class="gui-menu-item-label"><ng-content /></span>
    <span class="gui-menu-item-trailing"
      ><ng-content select="[guiMenuItemTrailing]"
    /></span>`,
  styleUrl: './menu.css',
  // The `.gui-menu` surface and `.gui-menu-divider` are applied to
  // CONSUMER-authored elements (a `<div gui-menu cdkMenu>` and
  // `<gui-menu-divider>`), which the CDK renders into the overlay carrying the
  // consumer's encapsulation id — emulated-scoped rules here would never match
  // them. ViewEncapsulation.None emits the (all `gui-menu*`-namespaced) rules
  // globally so the surface/divider style wherever the overlay places them.
  encapsulation: ViewEncapsulation.None,
  host: { 'class': 'gui-menu-item' },
  hostDirectives: [
    // Expose CdkMenuItem's disabled input (aliased `cdkMenuItemDisabled`) so
    // consumers can set `[disabled]`/`[cdkMenuItemDisabled]` on the host.
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel'],
    },
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  exportAs: 'guiMenuItem, guiFabMenuItem',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {}
