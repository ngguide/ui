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
import { RadioGroupComponent } from './radio-group';

let nextId = 0;

@Component({
  selector: 'gui-radio',
  exportAs: 'guiRadio',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  template: `
    <label class="gui-radio-control">
      <span
        class="gui-radio-state"
        guiStateLayer
        guiRipple
        guiFocusRing
        [monitorDescendants]="true"
        [disabled]="isDisabled()"
      >
        <span class="gui-radio-circle"></span>
        <input
          type="radio"
          class="gui-radio-native"
          [id]="inputId"
          [name]="group.name"
          [value]="value()"
          [checked]="group.isSelected(value())"
          [disabled]="isDisabled()"
          [attr.aria-labelledby]="labelId"
          (change)="group.select(value())"
          (blur)="group.control.markTouched()"
        />
      </span>
    </label>
    <label class="gui-radio-label" [id]="labelId" [for]="inputId">
      <ng-content />
    </label>
  `,
  styleUrl: './radio.css',
  host: {
    '[class.gui-disabled]': 'isDisabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioComponent {
  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly group = inject(RadioGroupComponent);

  /** Stable ids linking the native input to its adjacent `<label>` (no RNG/clock). */
  private readonly uid = nextId++;
  protected readonly inputId = `gui-radio-input-${this.uid}`;
  protected readonly labelId = `gui-radio-label-${this.uid}`;

  protected readonly isDisabled = computed(
    () => this.group.control.effectiveDisabled() || this.disabled(),
  );
}
