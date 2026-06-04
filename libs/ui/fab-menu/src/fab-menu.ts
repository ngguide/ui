import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { FabComponent, GuiFabColor } from '@ngguide/ui/fab';

/**
 * M3 FAB-menu placement. The menu expands from the FAB's top trailing edge with
 * the FAB acting as the close button that stays in place. The panel is anchored
 * so its bottom-trailing corner sits above the FAB's top-trailing corner, with
 * the M3-recommended 4dp gap (offsetY). A flipped fallback keeps the menu
 * on-screen when there is no room above the FAB.
 */
const FAB_MENU_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
];

/**
 * M3 FAB menu. The FAB toggles a menu of related actions. The consumer supplies
 * the menu panel as an `<ng-template>` containing a `<div cdkMenu>` with
 * `gui-fab-menu-item` items (DI-correct: cdkMenu + items share the consumer
 * template, so CdkMenuItem resolves its CdkMenu). When open, the FAB exposes
 * `aria-expanded` and the "Toggle menu" label (M3 close-button semantics).
 *
 * The FAB trigger is pinned to the medium FAB size (56dp) — M3 requires the
 * close button to always be 56dp. The `color` input is the single FAB-menu
 * color set for the close button (the FAB). The consumer's menu panel adopts
 * the matching color set by mirroring it as `data-color` on the
 * `.gui-fab-menu-list` element, which `fab-menu.css` styles so the close button
 * and items read as one coupled, contrasting color set.
 */
@Component({
  selector: 'gui-fab-menu',
  imports: [CdkMenuTrigger, FabComponent],
  template: `
    <button
      gui-fab
      size="md"
      [color]="color()"
      [cdkMenuTriggerFor]="menu()"
      [cdkMenuPosition]="positions"
      [attr.aria-label]="opened() ? 'Toggle menu' : ariaLabel()"
      [attr.aria-expanded]="opened()"
      (cdkMenuOpened)="opened.set(true)"
      (cdkMenuClosed)="opened.set(false)"
    >
      <ng-content select="[guiFabIcon]" />
    </button>
  `,
  styleUrl: './fab-menu.css',
  exportAs: 'guiFabMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabMenuComponent {
  /** The FAB-menu color set, shared by the close button (FAB) and the items. */
  color = input<GuiFabColor>('primary-container');
  ariaLabel = input<string>('');
  protected readonly opened = signal(false);
  /** M3 top-trailing anchor with the recommended 4dp gap. */
  protected readonly positions = FAB_MENU_POSITIONS;
  /** Consumer-provided menu panel (`<ng-template>` with cdkMenu + items). */
  protected readonly menu = contentChild.required(TemplateRef);
}
