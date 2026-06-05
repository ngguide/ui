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
 * the menu panel as an `<ng-template>` containing a `<gui-fab-menu-list>` with
 * `gui-fab-menu-item` items. `gui-fab-menu-list` hosts `CdkMenu` as a host
 * directive, so the items resolve their menu through it (no manual `cdkMenu`).
 * When open, the FAB exposes `aria-expanded` and the "Toggle menu" label (M3
 * close-button semantics).
 *
 * The FAB trigger is pinned to the medium FAB size (56dp) — M3 requires the
 * close button to always be 56dp. The `color` input is the FAB-menu color set
 * for the close button (the FAB); `gui-fab-menu-list` takes the matching `color`
 * for the panel + items so the close button and items read as one coupled,
 * contrasting color set. The panel carries its own (`:host`-scoped) styling, so
 * no `ViewEncapsulation.None` / global stylesheet is needed for the overlay.
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
  /** Consumer-provided menu panel (`<ng-template>` with `gui-fab-menu-list`). */
  protected readonly menu = contentChild.required(TemplateRef);
}
