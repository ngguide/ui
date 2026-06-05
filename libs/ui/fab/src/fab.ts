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
 * M3 FAB sizes, monotonic small→large. The M3 Expressive recommended set is
 * FAB / Medium / Large; the 40dp small FAB (no longer recommended) was dropped,
 * so the ladder maps `sm`→FAB (56), `md`→Medium (80), `lg`→Large (96).
 * For the extended FAB the same letters map to Small / Medium / Large extended
 * FAB (56 / 80 / 96) — the deprecated baseline extended FAB was dropped too.
 */
export type GuiFabSize = 'sm' | 'md' | 'lg';
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
  // Default = the standard 56dp FAB (smallest recommended size in M3 Expressive).
  size = input<GuiFabSize>('sm');
  disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
}
