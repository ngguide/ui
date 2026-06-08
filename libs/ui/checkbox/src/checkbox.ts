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

/** Deterministic, SSR-safe id source for label/input association (no RNG/clock). */
let nextId = 0;

@Component({
  selector: 'gui-checkbox',
  exportAs: 'guiCheckbox',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  template: `
    <!-- 48dp target (M3 "Target size | 48dp"): a <label> wrapping the control so
         a pointer anywhere in the target toggles the box. The interaction
         directives sit on the 40dp .gui-checkbox-state circle below — and
         monitorDescendants drives the focus ring/tint off keyboard focus that
         lands on the nested native input, not the host. -->
    <label class="gui-checkbox-control">
      <span
        class="gui-checkbox-state"
        guiStateLayer
        guiRipple
        guiFocusRing
        [monitorDescendants]="true"
        [disabled]="control.effectiveDisabled()"
      >
        <span class="gui-checkbox-box"></span>
        <input
          #native
          type="checkbox"
          class="gui-checkbox-native"
          [id]="inputId"
          [checked]="control.value() === true"
          [indeterminate]="indeterminate()"
          [attr.aria-checked]="
            indeterminate() ? 'mixed' : control.value() === true
          "
          [attr.aria-invalid]="error() ? 'true' : null"
          [attr.aria-labelledby]="labelId"
          [disabled]="control.effectiveDisabled()"
          (change)="onToggle(native.checked)"
          (blur)="control.markTouched()"
        />
      </span>
    </label>
    <!-- M3: the adjacent text label toggles the checkbox and is its accessible
         name (linked via for/id + aria-labelledby). Its color stays on-surface
         in every state, per the M3 "adjacent text label" color rule. -->
    <label class="gui-checkbox-label" [id]="labelId" [for]="inputId">
      <ng-content />
    </label>
  `,
  styleUrl: './checkbox.css',
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: checked', 'disabled'],
      outputs: ['valueChange: checkedChange'],
    },
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

  /** Stable ids linking the projected <label> to the native input (no RNG/clock). */
  private readonly uid = nextId++;
  protected readonly inputId = `gui-checkbox-input-${this.uid}`;
  protected readonly labelId = `gui-checkbox-label-${this.uid}`;

  protected readonly control = inject(GuiFormControl<boolean>);

  protected onToggle(checked: boolean): void {
    this.control.emit(checked);
  }
}
