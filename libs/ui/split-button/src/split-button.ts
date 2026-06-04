import {
  booleanAttribute,
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
 * Color styles M3 lists for split buttons: Elevated, Filled, Tonal, Outlined.
 * `text` is a button-only color style and is not an M3 split-button configuration,
 * so it is excluded here.
 */
export type GuiSplitButtonVariant = Exclude<GuiButtonVariant, 'text'>;

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
      [attr.aria-label]="triggerLabel()"
      [attr.aria-expanded]="opened()"
      [attr.aria-haspopup]="'menu'"
      [attr.data-open]="opened() ? '' : null"
      [attr.data-split-selected]="selected() ? '' : null"
      (cdkMenuOpened)="opened.set(true)"
      (cdkMenuClosed)="opened.set(false)"
    >
      <span class="gui-split-trailing-icon">
        <ng-content select="[guiTrailingIcon]" />
      </span>
    </button>
  `,
  styleUrl: './split-button.css',
  host: { 'role': 'group' },
  exportAs: 'guiSplitButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitButtonComponent {
  /** M3 split-button color style — Elevated, Filled, Tonal, or Outlined (no `text`). */
  variant = input<GuiSplitButtonVariant>('tonal');
  size = input<GuiSize>('sm');
  /**
   * Accessible name for the trailing menu trigger, e.g. `"More watch options"`.
   * M3 requires the icon-only trailing button to convey that more options are
   * available; combined with `aria-expanded` it announces the menu state.
   */
  triggerLabel = input<string>('More options');
  /**
   * Persistent M3 "Selected" state of the trailing button. Per M3 the split
   * button color does not change when selected — only a state layer is applied —
   * and the menu icon is optically centered (its unselected offset is removed).
   */
  selected = input(false, { transform: booleanAttribute });
  action = output<void>();
  protected readonly opened = signal(false);
  /** Consumer-provided menu panel (`<ng-template>` with cdkMenu + cdkMenuItem buttons). */
  protected readonly menu = contentChild.required(TemplateRef);
}
