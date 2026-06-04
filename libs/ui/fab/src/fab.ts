import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/**
 * M3 FAB sizes (container dp): small (40), FAB/baseline (56), medium (80), large (96).
 * `sm` is still available but no longer recommended in M3 Expressive — prefer a larger size.
 */
export type GuiFabSize = 'sm' | 'md' | 'lg' | 'xl';
/** M3 FAB color mappings (default = primary-container; surface FABs are deprecated in M3). */
export type GuiFabColor =
  | 'primary-container'
  | 'secondary-container'
  | 'tertiary-container'
  | 'primary'
  | 'secondary'
  | 'tertiary';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-fab], button[guiFab], a[gui-fab], a[guiFab]',
  template: `<ng-content />`,
  styleUrl: './fab.css',
  hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  host: {
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[class.gui-disabled]': 'disabled()',
  },
  exportAs: 'guiFab',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabComponent {
  color = input<GuiFabColor>('primary-container');
  size = input<GuiFabSize>('md');
  disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
}
