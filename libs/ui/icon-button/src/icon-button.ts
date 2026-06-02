import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { GuiSize } from '@ngguide/ui';

export type GuiIconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';
export type GuiIconButtonWidth = 'narrow' | 'uniform' | 'wide';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-icon-button], button[guiIconButton], a[gui-icon-button], a[guiIconButton]',
  template: `<ng-content /><ng-content select="[guiSelectedIcon]" />`,
  styleUrl: './icon-button.css',
  hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-width]': 'width()',
    '[attr.data-toggle]': 'toggle() ? "" : null',
    '[attr.data-selected]': 'toggle() && selected() ? "" : null',
    '[attr.aria-pressed]': 'toggle() ? selected() : null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[class.gui-disabled]': 'disabled()',
    '(click)': 'onActivate($event)',
  },
  exportAs: 'guiIconButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  variant = input<GuiIconButtonVariant>('standard');
  size = input<GuiSize>('sm');
  width = input<GuiIconButtonWidth>('uniform');
  disabled = input(false, { transform: booleanAttribute });
  toggle = input(false, { transform: booleanAttribute });
  selected = model(false);

  /** True when host is a <button> (native disabled) vs <a> (aria-disabled). */
  protected readonly isButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'BUTTON';

  protected onActivate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle()) {
      this.selected.update((v) => !v);
    }
  }
}
