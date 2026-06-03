import { ChangeDetectionStrategy, Component } from '@angular/core';

/** An M3 divider between menu items. Exposes `role="separator"`. */
@Component({
  selector: 'gui-menu-divider',
  template: '',
  host: { 'role': 'separator', 'class': 'gui-menu-divider' },
  exportAs: 'guiMenuDivider',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDividerComponent {}
