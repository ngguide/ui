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

/** Deterministic, SSR-safe id source for label/input association. */
let nextId = 0;

@Component({
  selector: 'gui-checkbox',
  exportAs: 'guiCheckbox',
  template: `
    <input
      #native
      type="checkbox"
      [id]="inputId"
      [checked]="control.value() === true"
      [indeterminate]="indeterminate()"
      [attr.aria-checked]="indeterminate() ? 'mixed' : control.value() === true"
      [disabled]="control.effectiveDisabled()"
      (change)="onToggle(native.checked)"
      (blur)="control.markTouched()"
    />
    <span class="gui-checkbox-box" aria-hidden="true"></span>
    <!-- M3: the adjacent text label toggles the checkbox. The <label for> binds
         the projected text to the native input so clicking it toggles the box. -->
    <label class="gui-checkbox-label" [attr.for]="inputId"><ng-content /></label>
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

  /** Stable id linking the projected <label> to the native input. */
  protected readonly inputId = `gui-checkbox-${nextId++}`;

  protected readonly control = inject(GuiFormControl<boolean>);

  protected onToggle(checked: boolean): void {
    this.control.emit(checked);
  }
}
