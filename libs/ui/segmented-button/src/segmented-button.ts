import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { SegmentedButtonGroupComponent } from './segmented-button-group';

@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-segmented-button]',
  template: `
    @if (selected() && showSelectedIcon()) {
      <svg
        class="gui-segment-check"
        viewBox="0 -960 960 960"
        focusable="false"
        aria-hidden="true"
      >
        <path
          d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
          fill="currentColor"
        />
      </svg>
    } @else {
      <!-- M3: the leading icon belongs to the unselected state; when the
           selected checkmark shows it REPLACES the icon, never sits beside it.
           With showSelectedIcon=false the check is suppressed and the icon
           keeps showing (the consumer's escape hatch). -->
      <ng-content select="[guiIcon]" />
    }
    <span class="gui-segment-label"><ng-content /></span>
  `,
  styleUrl: './segmented-button.css',
  hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  host: {
    '[attr.role]': 'group.multiple() ? "checkbox" : "radio"',
    '[attr.aria-checked]': 'selected()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.disabled]': 'disabled() ? "" : null',
    '[class.gui-disabled]': 'disabled()',
    '(click)': 'onActivate()',
  },
  exportAs: 'guiSegmentedButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedButtonComponent {
  value = input.required<string>();
  disabled = input(false, { transform: booleanAttribute });
  /** M3: the leading check icon is optional. Shown by default when selected. */
  showSelectedIcon = input(true, { transform: booleanAttribute });

  protected readonly group = inject(SegmentedButtonGroupComponent);
  protected readonly selected = computed(() => this.group.isSelected(this.value()));

  protected onActivate(): void {
    if (this.disabled()) {
      return;
    }
    this.group.toggleValue(this.value());
  }
}
