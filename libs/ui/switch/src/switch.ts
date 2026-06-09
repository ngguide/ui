import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { GuiFormControl } from '@ngguide/ui/forms';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/** Deterministic, SSR-safe id source for label/input association (no RNG/clock). */
let nextId = 0;

@Component({
  selector: 'gui-switch',
  exportAs: 'guiSwitch',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  template: `
    <!-- 48dp target (M3 "Target size | 48dp"): a <label> wrapping the track so a
         pointer ANYWHERE over the track — including directly on the handle —
         toggles the switch. The handle is a non-interactive child of this label,
         so it can no longer absorb the click (the old layout let the handle eat
         pointer events, so only the bare track toggled). -->
    <label class="gui-switch-control">
      <span class="gui-switch-track">
        <!-- 40dp M3 state layer / focus ring / ripple, centered on the handle and
             sliding with it. The interaction directives mount HERE (not on the
             host) with monitorDescendants so CDK FocusMonitor sees keyboard focus
             land on the nested <input> — that is what makes the focus ring and
             focus state-layer tint fire on Tab. Mirrors radio/checkbox; adapted
             for the moving handle (the circle, the handle and the tint are one
             unit, so the state layer tracks the handle in every state). -->
        <span
          class="gui-switch-state"
          guiStateLayer
          guiRipple
          guiFocusRing
          [monitorDescendants]="true"
          [disabled]="control.effectiveDisabled()"
        >
          <input
            #native
            type="checkbox"
            role="switch"
            class="gui-switch-native"
            [id]="inputId"
            [checked]="control.value() === true"
            [attr.aria-checked]="control.value() === true"
            [attr.aria-label]="ariaLabel()"
            [attr.aria-labelledby]="ariaLabel() ? null : labelId"
            [disabled]="control.effectiveDisabled()"
            (change)="onToggle(native.checked)"
            (keydown.enter)="onEnter($event, native)"
            (blur)="control.markTouched()"
          />
          <span class="gui-switch-handle" aria-hidden="true">
            <ng-content select="[guiSwitchSelectedIcon]" />
            <ng-content select="[guiSwitchIcon]" />
          </span>
        </span>
      </span>
    </label>
    <!-- M3: the adjacent text label is the switch's accessible name and toggles
         it (linked via for/id; aria-labelledby points the role=switch input at
         it). Its color stays on-surface in every state. Hidden when empty so the
         aria-label-only configuration leaves no dangling gap. -->
    <label class="gui-switch-label" [id]="labelId" [for]="inputId">
      <ng-content />
    </label>
  `,
  styleUrl: './switch.css',
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: checked', 'disabled'],
      outputs: ['valueChange: checkedChange'],
    },
  ],
  host: {
    '[class.gui-disabled]': 'control.effectiveDisabled()',
    '[attr.data-checked]': 'control.value() === true ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  /**
   * Host `aria-label`, delegated onto the role=switch input (M3: the accessible
   * name must sit on the element that carries the role, not the host). When set,
   * it supplies the name and the input drops `aria-labelledby`; when absent, the
   * adjacent text label names the switch via `aria-labelledby`.
   */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  /** Stable ids linking the projected <label> to the native input (no RNG/clock). */
  private readonly uid = nextId++;
  protected readonly inputId = `gui-switch-input-${this.uid}`;
  protected readonly labelId = `gui-switch-label-${this.uid}`;

  protected readonly control = inject(GuiFormControl<boolean>);

  protected onToggle(checked: boolean): void {
    this.control.emit(checked);
  }

  /**
   * M3 keyboard contract: the switch toggles on Space *or* Enter. A native
   * checkbox already toggles on Space, but the browser does not fire `change`
   * for Enter, so we handle it explicitly: flip the value and stop the default
   * (which would otherwise submit an enclosing form).
   */
  protected onEnter(event: Event, native: HTMLInputElement): void {
    if (this.control.effectiveDisabled()) {
      return;
    }
    event.preventDefault();
    this.onToggle(!native.checked);
  }
}
