import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GuiSize } from '@ngguide/ui';

export type GuiFabColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'tonal-primary'
  | 'tonal-secondary'
  | 'tonal-tertiary';
export type GuiFabVariant = 'default' | 'tonal';

// todo: add extended variant
@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-fab], button[guiFab]',
  template: ` <ng-content /> `,
  styleUrl: './fab.css',
  host: {
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
  },
  exportAs: 'guiFab',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabComponent {
  color = input<GuiFabColor>('tonal-primary');
  size = input<Exclude<GuiSize, 'xs' | 'xl'>>('md');
}
