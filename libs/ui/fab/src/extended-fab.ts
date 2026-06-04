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
import { GuiFabColor, GuiFabSize } from './fab';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-extended-fab], button[guiExtendedFab], a[gui-extended-fab], a[guiExtendedFab]',
  template: `
    <ng-content select="[guiIcon]" />
    <span class="gui-extended-fab-label" [hidden]="!expanded()"><ng-content /></span>
  `,
  styleUrl: './extended-fab.css',
  hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  host: {
    '[attr.data-color]': 'color()',
    '[attr.data-size]': 'size()',
    '[attr.data-expanded]': 'expanded() ? "" : null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[class.gui-disabled]': 'disabled()',
  },
  exportAs: 'guiExtendedFab',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtendedFabComponent {
  color = input<GuiFabColor>('primary-container');
  // M3 Expressive deprecates the baseline extended FAB in favour of the small
  // extended FAB (title-medium label, reduced inner padding) — so `sm` is the
  // recommended default.
  size = input<GuiFabSize>('sm');
  expanded = input(true, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });

  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';
}
