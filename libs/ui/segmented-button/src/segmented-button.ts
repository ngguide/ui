import {
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
    @if (selected()) {
      <span class="gui-segment-check" aria-hidden="true">✓</span>
    }
    <ng-content select="[guiIcon]" />
    <span class="gui-segment-label"><ng-content /></span>
  `,
  styleUrl: './segmented-button.css',
  hostDirectives: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  host: {
    '[attr.role]': 'group.multiple() ? "checkbox" : "radio"',
    '[attr.aria-checked]': 'selected()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '(click)': 'group.toggleValue(value())',
  },
  exportAs: 'guiSegmentedButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedButtonComponent {
  value = input.required<string>();
  protected readonly group = inject(SegmentedButtonGroupComponent);
  protected readonly selected = computed(() => this.group.isSelected(this.value()));
}
