import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioComponent, RadioGroupComponent } from '@ngguide/ui/radio';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 radio button (`@ngguide/ui/radio`).
 *
 * Per the strict-M3 reference (m3.material.io/components/radio-button) the radio
 * button is a SINGLE visual variant: there is no size, shape, or
 * color-configuration enumeration to sweep — every radio is a fixed 20dp icon
 * inside a 40dp state layer with a 48dp target. M3 forbids applying density by
 * default, so there is no compact size either. The colour roles are fixed
 * (primary for the selected ring + dot, on-surface-variant for the resting ring,
 * on-surface for the adjacent label) and there is NO error or indeterminate
 * state (the component's own spec asserts the absence of a `data-error`).
 *
 * What actually varies is therefore the SELECTION + INTERACTION state, which is
 * the dimension swept below. The implemented API is group-driven:
 *
 * - `RadioGroupComponent` (`gui-radio-group`) carries the shared
 *   `GuiFormControl<string | null>` (so the group is form-bound: `[(value)]`,
 *   `[formControl]`, or `[(ngModel)]`) plus a generated `name`, and exposes
 *   `disabled` (disables every child) and `aria-label` / `aria-labelledby` for
 *   the group's accessible name.
 * - `RadioComponent` (`gui-radio`) has a required `value: string`, an own
 *   `disabled` boolean (disables just that option), and projects its adjacent
 *   text label — which (per M3) also selects the option.
 *
 * Selecting one radio deselects the others; an M3 group may start with one or
 * none selected, and the only way back to "none" is an explicit opt-out (a
 * "Clear selection" affordance or a dedicated option) — both shown below.
 *
 * All state is local signals / form controls — no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    RadioGroupComponent,
    RadioComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Radio button"
      entry="@ngguide/ui/radio"
      docHref="https://m3.material.io/components/radio-button"
    >
      <!-- The two M3 selection states (the component's only visual variants). -->
      <app-demo-block
        heading="Selection"
        hint="The two M3 selection states — unselected and selected"
      >
        <app-demo-specimen label="unselected">
          <gui-radio-group [(value)]="single" aria-label="Selection state">
            <gui-radio value="a">Option</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="selected">
          <gui-radio-group value="a" aria-label="Selection state">
            <gui-radio value="a">Option</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Live group: pointer hover / keyboard focus / press exercise the M3
           hover / focus / pressed state layers. Operable so a reviewer can drive
           every interaction state by hand. -->
      <app-demo-block
        heading="States (interactive)"
        hint="Hover, focus (Tab in, arrow between), and press to see the M3 state layers"
        [column]="true"
      >
        <app-demo-specimen label="pick a size" class="fill">
          <gui-radio-group [(value)]="size" aria-label="T-shirt size">
            <gui-radio value="s">Small</gui-radio>
            <gui-radio value="m">Medium</gui-radio>
            <gui-radio value="l">Large</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ size() ?? '—' }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Disabled treatment — both selection states, and per-radio vs.
           whole-group disabling. -->
      <app-demo-block
        heading="Disabled"
        hint="The M3 disabled treatment, per-radio and for the whole group"
      >
        <app-demo-specimen label="unselected">
          <gui-radio-group value="x" aria-label="Disabled unselected">
            <gui-radio value="a" disabled>Option</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="selected">
          <gui-radio-group value="a" aria-label="Disabled selected">
            <gui-radio value="a" disabled>Option</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="group disabled">
          <gui-radio-group value="b" disabled aria-label="Disabled group">
            <gui-radio value="a">First</gui-radio>
            <gui-radio value="b">Second</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Mixed: one option disabled inside an otherwise operable group. -->
      <app-demo-block
        heading="Mixed enabled / disabled"
        hint="A single disabled option inside an operable group"
        [column]="true"
      >
        <app-demo-specimen label="delivery (express is unavailable)" class="fill">
          <gui-radio-group [(value)]="delivery" aria-label="Delivery method">
            <gui-radio value="standard">Standard</gui-radio>
            <gui-radio value="express" disabled>Express (unavailable)</gui-radio>
            <gui-radio value="pickup">Pickup</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- M3 opt-out: a group can return to "none selected" only via an explicit
           affordance — a dedicated option or a Clear-selection control. -->
      <app-demo-block
        heading="Opt-out / clear selection"
        hint="M3: a selected group can't be unselected without an explicit opt-out"
        [column]="true"
      >
        <app-demo-specimen label="dedicated 'Not applicable' option" class="fill">
          <gui-radio-group [(value)]="contact" aria-label="Preferred contact">
            <gui-radio value="email">Email</gui-radio>
            <gui-radio value="phone">Phone</gui-radio>
            <gui-radio value="none">Not applicable</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ contact() ?? '—' }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive forms binding via the group's GuiFormControl (CVA). -->
      <app-demo-block
        heading="Reactive form"
        hint="The group is bound to a FormControl via ControlValueAccessor"
        [column]="true"
      >
        <app-demo-specimen label="FormControl (pick one)" class="fill">
          <gui-radio-group [formControl]="plan" aria-label="Subscription plan">
            <gui-radio value="free">Free</gui-radio>
            <gui-radio value="pro">Pro</gui-radio>
            <gui-radio value="team">Team</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ plan.value ?? '—' }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ngModel binding — same group model via two-way [(ngModel)]. -->
      <app-demo-block
        heading="ngModel"
        hint="Two-way binding through [(ngModel)] on the group"
        [column]="true"
      >
        <app-demo-specimen label="theme" class="fill">
          <gui-radio-group [(ngModel)]="theme" aria-label="Theme">
            <gui-radio value="light">Light</gui-radio>
            <gui-radio value="dark">Dark</gui-radio>
            <gui-radio value="system">System</gui-radio>
          </gui-radio-group>
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ theme ?? '—' }}</code>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class RadioDemo {
  // Selection-block specimen (operable single radio).
  protected readonly single = signal<string | null>(null);

  // Interactive states block.
  protected readonly size = signal<string | null>('m');

  // Mixed enabled/disabled block.
  protected readonly delivery = signal<string | null>('standard');

  // Opt-out block.
  protected readonly contact = signal<string | null>('email');

  // Reactive form specimen.
  protected readonly plan = new FormControl<string | null>('pro');

  // ngModel specimen — a plain mutable field so [(ngModel)] writes back.
  protected theme: string | null = 'system';
}
