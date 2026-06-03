import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { RadioGroupComponent } from './radio-group';

@Component({
  selector: 'gui-radio',
  exportAs: 'guiRadio',
  template: `
    <input
      type="radio"
      [name]="group.name"
      [value]="value()"
      [checked]="group.isSelected(value())"
      [disabled]="group.control.effectiveDisabled() || disabled()"
      (change)="group.select(value())"
      (blur)="group.control.markTouched()"
    />
    <span class="gui-radio-circle" aria-hidden="true"></span>
    <span class="gui-radio-label"><ng-content /></span>
  `,
  styleUrl: './radio.css',
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    '[attr.data-error]': 'error() ? "" : null',
    '[class.gui-disabled]': '(group.control.effectiveDisabled() || disabled())',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });

  protected readonly group = inject(RadioGroupComponent);
}
