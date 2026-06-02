import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { CdkMenuItem } from '@angular/cdk/menu';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/** A flat M3 FAB-menu action item. Composes CdkMenuItem (resolves the consumer's
 * cdkMenu) plus the interaction foundation. Min 48dp target. */
@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-fab-menu-item]',
  template: `<ng-content select="[guiIcon]" /><span class="gui-fab-menu-item-label"><ng-content /></span>`,
  styleUrl: './fab-menu.css',
  hostDirectives: [CdkMenuItem, GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  exportAs: 'guiFabMenuItem',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabMenuItemComponent {}
