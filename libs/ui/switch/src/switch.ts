import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { GuiFormControl } from '@ngguide/ui/forms';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

@Component({
  selector: 'gui-switch',
  exportAs: 'guiSwitch',
  template: `
    <span class="gui-switch-track">
      <input
        #native
        type="checkbox"
        role="switch"
        [checked]="control.value() === true"
        [attr.aria-checked]="control.value() === true"
        [disabled]="control.effectiveDisabled()"
        (change)="onToggle(native.checked)"
        (blur)="control.markTouched()"
      />
      <span class="gui-switch-handle" aria-hidden="true">
        <ng-content select="[guiSwitchSelectedIcon]" />
        <ng-content select="[guiSwitchIcon]" />
      </span>
    </span>
    <span class="gui-switch-label"><ng-content /></span>
  `,
  styleUrl: './switch.css',
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
    '[class.gui-disabled]': 'control.effectiveDisabled()',
    '[attr.data-checked]': 'control.value() === true ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  protected readonly control = inject(GuiFormControl<boolean>);

  protected onToggle(checked: boolean): void {
    this.control.emit(checked);
  }
}
