import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { GuiSize } from '@ngguide/ui';

/**
 * M3 split button: a leading primary action + a trailing toggle that opens a
 * menu of related choices. The consumer supplies the menu panel as an
 * `<ng-template>` (a `<div cdkMenu>` with `cdkMenuItem` buttons), kept DI-correct.
 * Focus order is leading → trailing; the trailing button announces expanded state
 * and morphs its corners when open.
 */
@Component({
  selector: 'gui-split-button',
  imports: [ButtonComponent, CdkMenuTrigger],
  template: `
    <button
      gui-button
      [variant]="variant()"
      [size]="size()"
      class="gui-split-leading"
      (click)="action.emit()"
    >
      <ng-content select="[guiLeading]" />
    </button>
    <button
      gui-button
      [variant]="variant()"
      [size]="size()"
      class="gui-split-trailing"
      [cdkMenuTriggerFor]="menu()"
      [attr.aria-expanded]="opened()"
      [attr.aria-haspopup]="'menu'"
      [attr.data-open]="opened() ? '' : null"
      (cdkMenuOpened)="opened.set(true)"
      (cdkMenuClosed)="opened.set(false)"
    >
      <ng-content select="[guiTrailingIcon]" />
    </button>
  `,
  styleUrl: './split-button.css',
  host: { 'role': 'group' },
  exportAs: 'guiSplitButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitButtonComponent {
  variant = input<GuiButtonVariant>('tonal');
  size = input<GuiSize>('sm');
  action = output<void>();
  protected readonly opened = signal(false);
  /** Consumer-provided menu panel (`<ng-template>` with cdkMenu + cdkMenuItem buttons). */
  protected readonly menu = contentChild.required(TemplateRef);
}
