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

export type GuiButtonVariant =
  | 'elevated'
  | 'filled'
  | 'tonal'
  | 'outlined'
  | 'text';
export type GuiButtonShape = 'round' | 'square';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-button], button[guiButton], a[gui-button], a[guiButton]',
  template: `
    <ng-content select="[guiIcon]" />
    <span class="gui-button-label"><ng-content /></span>
    <ng-content select="[guiSelectedIcon]" />
  `,
  styleUrl: './button.css',
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-selected]': 'isToggleSelected() ? "" : null',
    '[attr.data-toggle]': 'toggle() ? "" : null',
    '[attr.aria-pressed]': 'toggle() ? selected() : null',
    '[attr.disabled]': 'isButton && disabled() ? "" : null',
    '[attr.aria-disabled]': '!isButton && disabled() ? "true" : null',
    '[class.gui-disabled]': 'disabled()',
    // A linkless <a gui-button> has no implicit button role and is not in the
    // tab order, so it cannot be reached by Tab or activated by Space/Enter.
    // Give it role="button" and a tabindex (-1 when disabled) so assistive
    // technology can navigate to and activate it (M3 keyboard navigation).
    '[attr.role]': 'needsButtonRole ? "button" : null',
    '[attr.tabindex]': 'needsButtonRole ? (disabled() ? -1 : 0) : null',
    '(click)': 'onActivate($event)',
    '(keydown)': 'onKeydown($event)',
  },
  exportAs: 'guiButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<GuiButtonVariant>('filled');
  size = input<GuiSize>('sm');
  shape = input<GuiButtonShape>('round');
  disabled = input(false, { transform: booleanAttribute });
  /** When true, the button holds an on/off state (M3 toggle button). */
  toggle = input(false, { transform: booleanAttribute });
  /** Two-way selected state; only meaningful when `toggle` is true. No toggle text button (M3). */
  selected = model(false);

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** True when the host is a <button> (native disabled) vs an <a> (aria-disabled). */
  protected readonly isButton = this.host.tagName === 'BUTTON';

  /**
   * True for an anchor host with no href: such an <a> has no implicit button
   * role and is not focusable, so it needs a synthetic role + tabindex and
   * keyboard activation to be reachable/operable (M3 keyboard navigation).
   */
  protected readonly needsButtonRole =
    !this.isButton && !this.host.hasAttribute('href');

  protected isToggleSelected(): boolean {
    return this.toggle() && this.selected() && this.variant() !== 'text';
  }

  protected onActivate(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle() && this.variant() !== 'text') {
      this.selected.update((v) => !v);
    }
  }

  /**
   * Space/Enter activation for a linkless anchor host (native <button> and a
   * real link already handle their own keyboard activation). Space is consumed
   * to prevent the page scrolling.
   */
  protected onKeydown(event: Event): void {
    if (!this.needsButtonRole || !(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.host.click();
    }
  }
}
