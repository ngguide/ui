import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent } from '@ngguide/ui/checkbox';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 checkbox (`@ngguide/ui/checkbox`).
 *
 * Per the strict-M3 reference (m3.material.io/components/checkbox) the checkbox
 * is a SINGLE visual variant: there is no size, shape, or color-configuration
 * enumeration to sweep — the container is a fixed 18dp box with a 2dp corner and
 * a 48dp target. What DOES vary is the selection state and the error/disabled
 * treatments. The implemented `CheckboxComponent` exposes exactly four knobs:
 *
 * - `checked`  — selection value (form-bound via `GuiFormControl`; two-way as
 *                `[(checked)]` / `(checkedChange)`, or driven by `[(ngModel)]` /
 *                a reactive `FormControl`).
 * - `indeterminate` — the M3 "mixed" / parent-of-a-group state.
 * - `error` — the M3 error treatment (error-role outline + fill).
 * - `disabled` — the M3 disabled treatment.
 *
 * The projected `<ng-content>` is the adjacent text label, which (per M3) also
 * toggles the box. Each block below exercises one of those dimensions, all wired
 * to real signal / form state so every specimen is operable.
 *
 * All state is local signals / form controls — no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    CheckboxComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Checkbox"
      entry="@ngguide/ui/checkbox"
      docHref="https://m3.material.io/components/checkbox"
    >
      <!-- The three M3 selection states (the component's core variants). -->
      <app-demo-block
        heading="States"
        hint="The three M3 selection states — unselected, selected, indeterminate"
      >
        <app-demo-specimen label="unselected">
          <gui-checkbox [(checked)]="unselected">Option</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="selected">
          <gui-checkbox [(checked)]="selected">Option</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="indeterminate">
          <gui-checkbox indeterminate>Option</gui-checkbox>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Disabled mirrors every selection state. -->
      <app-demo-block
        heading="Disabled"
        hint="The M3 disabled treatment across all three states"
      >
        <app-demo-specimen label="unselected">
          <gui-checkbox disabled>Option</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="selected">
          <gui-checkbox disabled checked>Option</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="indeterminate">
          <gui-checkbox disabled indeterminate>Option</gui-checkbox>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Error treatment (error-role outline + fill) across the states. -->
      <app-demo-block
        heading="Error"
        hint="M3 error states for unselected, selected and indeterminate"
      >
        <app-demo-specimen label="unselected">
          <gui-checkbox error [(checked)]="errorUnselected">
            Accept terms
          </gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="selected">
          <gui-checkbox error [(checked)]="errorSelected">
            Accept terms
          </gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="indeterminate">
          <gui-checkbox error indeterminate>Accept terms</gui-checkbox>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Label vs. no label: the adjacent text label also toggles the box. -->
      <app-demo-block
        heading="Label"
        hint="The adjacent text label is optional and toggles the box (M3)"
      >
        <app-demo-specimen label="with label">
          <gui-checkbox [(checked)]="labelled">Subscribe to updates</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="no label">
          <gui-checkbox [(checked)]="bare" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive forms binding — fully operable, live value readout. -->
      <app-demo-block
        heading="Reactive form"
        hint="Bound to a FormControl via ControlValueAccessor"
        [column]="true"
      >
        <app-demo-specimen label="FormControl (toggle me)" class="fill">
          <gui-checkbox [formControl]="agree">I agree</gui-checkbox>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ agree.value }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ngModel binding — the parent/child group pattern from the M3 spec. -->
      <app-demo-block
        heading="Group (parent / children)"
        hint="Parent goes indeterminate when only some children are checked (M3)"
        [column]="true"
      >
        <app-demo-specimen label="parent" class="fill">
          <gui-checkbox
            [checked]="allChecked()"
            [indeterminate]="someChecked()"
            (checkedChange)="toggleAll($event)"
          >
            Select all
          </gui-checkbox>
        </app-demo-specimen>
        @for (child of children; track child.label) {
          <app-demo-specimen [label]="child.label" class="fill">
            <gui-checkbox [(ngModel)]="child.value">{{ child.label }}</gui-checkbox>
          </app-demo-specimen>
        }
      </app-demo-block>
    </app-demo-component>
  `,
})
export class CheckboxDemo {
  // Independent state-block specimens.
  protected readonly unselected = signal(false);
  protected readonly selected = signal(true);

  // Error-block specimens.
  protected readonly errorUnselected = signal(false);
  protected readonly errorSelected = signal(true);

  // Label-block specimens.
  protected readonly labelled = signal(true);
  protected readonly bare = signal(false);

  // Reactive form specimen.
  protected readonly agree = new FormControl(false);

  // Parent/child group (ngModel). Plain mutable objects so [(ngModel)] writes back.
  protected readonly children = [
    { label: 'Email', value: true },
    { label: 'SMS', value: false },
    { label: 'Push', value: false },
  ];

  protected allChecked(): boolean {
    return this.children.every((c) => c.value);
  }

  protected someChecked(): boolean {
    return !this.allChecked() && this.children.some((c) => c.value);
  }

  protected toggleAll(checked: boolean | null): void {
    for (const c of this.children) {
      c.value = checked === true;
    }
  }
}
