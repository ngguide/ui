import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { GuiFormControl } from '@ngguide/ui/forms';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

@Component({
  selector: 'gui-checkbox',
  exportAs: 'guiCheckbox',
  template: `
    <input
      #native
      type="checkbox"
      [checked]="control.value() === true"
      [indeterminate]="indeterminate()"
      [attr.aria-checked]="indeterminate() ? 'mixed' : control.value() === true"
      [disabled]="control.effectiveDisabled()"
      (change)="onToggle(native.checked)"
      (blur)="control.markTouched()"
    />
    <span class="gui-checkbox-box" aria-hidden="true"></span>
    <span class="gui-checkbox-label"><ng-content /></span>
  `,
  styleUrl: './checkbox.css',
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: checked', 'disabled'],
      outputs: ['valueChange: checkedChange'],
    },
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    '[attr.data-error]': 'error() ? "" : null',
    '[class.gui-disabled]': 'control.effectiveDisabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });

  protected readonly control = inject(GuiFormControl<boolean>);

  protected onToggle(checked: boolean): void {
    this.control.emit(checked);
  }
}
