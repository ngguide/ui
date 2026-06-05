import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkMenu } from '@angular/cdk/menu';
import { GuiFabColor } from '@ngguide/ui/fab';

/**
 * M3 FAB-menu panel — the container of the FAB menu's action items.
 *
 * Hosts CDK's `CdkMenu` (role="menu" + menu keyboard/focus behaviour) as a
 * **host directive**, so a consumer just writes `<gui-fab-menu-list>` with the
 * `gui-fab-menu-item` buttons inside — no manual `cdkMenu` and no styling class.
 *
 * Why a component rather than a styled `<div class="gui-fab-menu-list">`: that
 * div is declared in the *consumer's* template, so it carries the consumer's
 * emulated-encapsulation id — component-scoped CSS can never match it (and the
 * CDK overlay teleports it out of the component's view on top of that). A real
 * component sidesteps both: its `:host` styles ride on the host element via the
 * `_nghost` attribute and apply in the overlay with ordinary emulated
 * encapsulation — no `ViewEncapsulation.None`, no global stylesheet, no
 * `::ng-deep`. The contrasting item color set is published as **inherited CSS
 * custom properties** (`--gui-menu-item-*`) that the shared `.gui-menu-item`
 * reads, so the projected items pick up the FAB-menu look purely through
 * inheritance.
 */
@Component({
  selector: 'gui-fab-menu-list',
  hostDirectives: [CdkMenu],
  template: '<ng-content />',
  styleUrl: './fab-menu-list.css',
  exportAs: 'guiFabMenuList',
  host: {
    '[attr.data-color]': 'color()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabMenuListComponent {
  /** The FAB-menu color set, shared (as a contrasting pair) by the close button
   * (the FAB) and the items. Defaults to the FAB default of primary-container. */
  readonly color = input<GuiFabColor>('primary-container');
}
