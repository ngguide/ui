import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { FabComponent, GuiFabColor } from '@ngguide/ui/fab';

/**
 * M3 FAB menu. The FAB toggles a menu of related actions. The consumer supplies
 * the menu panel as an `<ng-template>` containing a `<div cdkMenu>` with
 * `gui-fab-menu-item` items (DI-correct: cdkMenu + items share the consumer
 * template, so CdkMenuItem resolves its CdkMenu). When open, the FAB exposes
 * `aria-expanded` and the "Toggle menu" label (M3 close-button semantics).
 */
@Component({
  selector: 'gui-fab-menu',
  imports: [CdkMenuTrigger, FabComponent],
  template: `
    <button
      gui-fab
      [color]="color()"
      [cdkMenuTriggerFor]="menu()"
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
  color = input<GuiFabColor>('primary-container');
  ariaLabel = input<string>('');
  protected readonly opened = signal(false);
  /** Consumer-provided menu panel (`<ng-template>` with cdkMenu + items). */
  protected readonly menu = contentChild.required(TemplateRef);
}
