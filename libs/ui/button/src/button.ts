import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { GuiSize } from '@ngguide/ui';

// todo: icon
// todo: toggled

export type GuiButtonVariant =
  | 'elevated'
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text';

export type GuiButtonShape = 'square' | 'round';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-button], button[guiButton], a[gui-button], a[guiButton]',
  template: ` <ng-content /> `,
  styleUrl: './button.css',
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[class.disabled]': 'disabled()',
  },
  exportAs: 'guiButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<GuiButtonVariant>('filled');
  size = input<GuiSize>('sm');
  shape = input<GuiButtonShape>('round');
  disabled = input(false, {
    transform: booleanAttribute,
  });
}
