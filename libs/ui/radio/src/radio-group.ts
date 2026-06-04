import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
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
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupComponent {
  /**
   * Accessible name for the group, typically its category title (M3:
   * "Label the radio group based on the category title"). Use `ariaLabelledby`
   * instead when the title is rendered as a visible element.
   */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, {
    alias: 'aria-labelledby',
  });

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
