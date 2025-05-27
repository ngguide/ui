import { Component, input } from '@angular/core';
import { GuiSize } from '@ngguide/ui';

// todo: icon
// todo: toggled
// todo: morph

export type GuiButtonVariant =
  | 'elevated'
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text';

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
  },
})
export class ButtonComponent {
  // elevated, filled, tonal, outlined, and text
  variant = input<GuiButtonVariant>('filled');
  // extra small, small, medium, large, and extra large
  size = input<GuiSize>('sm');
  // round and square
  shape = input<'square' | 'round'>('round');
}
