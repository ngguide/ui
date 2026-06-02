import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GuiFormControl } from '@ngguide/ui/forms';

let nextId = 0;

/**
 * M3 radio group. Carries the shared GuiFormControl<string | null> and a
 * generated `name` so the wrapped native radios form a single browser radio
 * group (which provides the APG radio-group keyboard model for free).
 */
@Component({
  selector: 'gui-radio-group',
  exportAs: 'guiRadioGroup',
  template: `<ng-content />`,
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value', 'disabled'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    'role': 'radiogroup',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent {
  /** Shared form control — read by child radios for value/disabled/touched. */
  readonly control = inject(GuiFormControl<string | null>);

  /** Unique `name` shared by every native radio in the group. */
  readonly name = 'gui-radio-' + nextId++;

  select(value: string): void {
    this.control.emit(value);
  }

  isSelected(value: string): boolean {
    return this.control.value() === value;
  }
}
