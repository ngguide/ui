import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@ngguide/ui/icon';
import { SliderComponent } from '@ngguide/ui/slider';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 slider (`@ngguide/ui/slider`).
 *
 * Per the strict-M3 reference (m3.material.io/components/sliders) the slider has
 * three variants (standard / centered / range), five sizes (XS, S, M, L, XL),
 * two orientations (horizontal / vertical), an optional inset icon (standard
 * only, size M+), optional stop indicators (the M3 "stops"/discrete config),
 * an optional value indicator, and the enabled/disabled states (hover/focus/
 * pressed are interaction-driven and shown live).
 *
 * The implemented {@link SliderComponent} (selector `gui-slider`) drives every
 * one of those through real inputs:
 *
 * - `centered` / `range` — the non-standard variants.
 * - `size` (`GuiSize`: xs|sm|md|lg|xl) — the M3 size ladder; the track corner
 *   shape is derived per size, so the Sizes block also covers Shape.
 * - `orientation` (horizontal|vertical) — M3 Expressive layout.
 * - `stops` (canonical) / `discrete` (legacy alias) — stop indicators.
 * - `valueIndicator` — the label container shown on press/drag/focus.
 * - `min` / `max` / `step` — the value domain.
 * - `disabled` — the M3 disabled treatment.
 * - `[gui-slider-icon]` content slot — the optional inset icon (standard only).
 *
 * Value is form-bound through `GuiFormControl` (ControlValueAccessor): bind a
 * reactive `FormControl`, `[(ngModel)]`, or `[(value)]`. Single sliders carry a
 * `number`; range sliders a `[number, number]` tuple.
 *
 * All state is local signals / form controls — no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    SliderComponent,
    IconComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Slider"
      entry="@ngguide/ui/slider"
      docHref="https://m3.material.io/components/sliders"
    >
      <!-- The three M3 variants. -->
      <app-demo-block
        heading="Variants"
        hint="Standard, centered and range — the three M3 slider variants"
        [column]="true"
      >
        <app-demo-specimen label="standard" class="fill">
          <gui-slider [(value)]="standard" aria-label="Standard slider" />
        </app-demo-specimen>
        <app-demo-specimen label="centered" class="fill">
          <gui-slider centered [(value)]="centered" aria-label="Centered slider" />
        </app-demo-specimen>
        <app-demo-specimen label="range" class="fill">
          <gui-slider range [(value)]="rangeValue" aria-label="Range slider" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- The M3 size ladder (XS, S, M, L, XL). Track corner shape varies per
           size, so this block also demonstrates Shape. -->
      <app-demo-block
        heading="Sizes"
        hint="XS, S, M, L, XL — track height and corner shape scale per size"
        [column]="true"
      >
        <app-demo-specimen label="xs (16dp / 8dp)" class="fill">
          <gui-slider size="xs" [(value)]="sizeXs" aria-label="Extra small slider" />
        </app-demo-specimen>
        <app-demo-specimen label="sm (24dp / 8dp)" class="fill">
          <gui-slider size="sm" [(value)]="sizeSm" aria-label="Small slider" />
        </app-demo-specimen>
        <app-demo-specimen label="md (40dp / 12dp)" class="fill">
          <gui-slider size="md" [(value)]="sizeMd" aria-label="Medium slider" />
        </app-demo-specimen>
        <app-demo-specimen label="lg (56dp / 16dp)" class="fill">
          <gui-slider size="lg" [(value)]="sizeLg" aria-label="Large slider" />
        </app-demo-specimen>
        <app-demo-specimen label="xl (96dp / 28dp)" class="fill">
          <gui-slider size="xl" [(value)]="sizeXl" aria-label="Extra large slider" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Orientation (M3 Expressive). Vertical sliders increase upward. -->
      <app-demo-block
        heading="Orientation"
        hint="Horizontal (default) and vertical layout (M3 Expressive)"
      >
        <app-demo-specimen label="horizontal">
          <div style="inline-size: 14rem">
            <gui-slider
              orientation="horizontal"
              [(value)]="horizontal"
              aria-label="Horizontal slider"
            />
          </div>
        </app-demo-specimen>
        <app-demo-specimen label="vertical">
          <div style="block-size: 12rem">
            <gui-slider
              orientation="vertical"
              [(value)]="vertical"
              aria-label="Vertical slider"
            />
          </div>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Stop indicators (the M3 "stops" / former "discrete" configuration). -->
      <app-demo-block
        heading="Stops"
        hint="Stop indicators at every step — the M3 stops (discrete) configuration"
        [column]="true"
      >
        <app-demo-specimen label="continuous (no stops)" class="fill">
          <gui-slider [(value)]="continuous" aria-label="Continuous slider" />
        </app-demo-specimen>
        <app-demo-specimen label="stops (step 10)" class="fill">
          <gui-slider
            stops
            [step]="10"
            [(value)]="stepped"
            aria-label="Stepped slider"
          />
        </app-demo-specimen>
        <app-demo-specimen label="discrete (legacy alias, step 25)" class="fill">
          <gui-slider
            discrete
            [step]="25"
            [(value)]="discrete"
            aria-label="Discrete slider"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Value indicator: the label container shown on press / drag / focus. -->
      <app-demo-block
        heading="Value indicator"
        hint="Optional label container — drag or focus a thumb to reveal it"
        [column]="true"
      >
        <app-demo-specimen label="value indicator (standard)" class="fill">
          <gui-slider
            valueIndicator
            [(value)]="indicated"
            aria-label="Slider with value indicator"
          />
        </app-demo-specimen>
        <app-demo-specimen label="value indicator (range)" class="fill">
          <gui-slider
            range
            valueIndicator
            [(value)]="indicatedRange"
            aria-label="Range slider with value indicator"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Optional inset icon (standard slider only; M3 sizes M, L, XL). -->
      <app-demo-block
        heading="Inset icon"
        hint="Optional leading icon, standard slider only (M3 sizes M, L, XL)"
        [column]="true"
      >
        <app-demo-specimen label="md + inset icon" class="fill">
          <gui-slider size="md" [(value)]="iconMd" aria-label="Volume">
            <gui-icon gui-slider-icon class="sym">volume_up</gui-icon>
          </gui-slider>
        </app-demo-specimen>
        <app-demo-specimen label="lg + inset icon" class="fill">
          <gui-slider size="lg" [(value)]="iconLg" aria-label="Brightness">
            <gui-icon gui-slider-icon class="sym">brightness_6</gui-icon>
          </gui-slider>
        </app-demo-specimen>
        <app-demo-specimen label="xl + inset icon" class="fill">
          <gui-slider size="xl" [(value)]="iconXl" aria-label="Speed">
            <gui-icon gui-slider-icon class="sym">speed</gui-icon>
          </gui-slider>
        </app-demo-specimen>
      </app-demo-block>

      <!-- States: enabled vs. the M3 disabled treatment (hover/focus/pressed
           are interaction-driven — hover or tab to a thumb above). -->
      <app-demo-block
        heading="States"
        hint="Enabled vs. disabled (hover / focus / pressed are interaction-driven)"
        [column]="true"
      >
        <app-demo-specimen label="enabled" class="fill">
          <gui-slider [(value)]="enabled" aria-label="Enabled slider" />
        </app-demo-specimen>
        <app-demo-specimen label="disabled" class="fill">
          <gui-slider disabled [value]="40" aria-label="Disabled slider" />
        </app-demo-specimen>
        <app-demo-specimen label="disabled range" class="fill">
          <gui-slider
            range
            disabled
            [value]="[25, 75]"
            aria-label="Disabled range slider"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive forms binding — fully operable, live value readout. -->
      <app-demo-block
        heading="Reactive form"
        hint="Bound to a FormControl via ControlValueAccessor"
        [column]="true"
      >
        <app-demo-specimen label="FormControl (drag me)" class="fill">
          <gui-slider [formControl]="volume" aria-label="Volume" />
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ volume.value }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ngModel binding with a custom domain and stops. -->
      <app-demo-block
        heading="Custom domain (ngModel)"
        hint="min/max/step define the domain; ngModel writes the value back"
        [column]="true"
      >
        <app-demo-specimen label="0–10, step 1, stops (ngModel)" class="fill">
          <gui-slider
            stops
            [min]="0"
            [max]="10"
            [step]="1"
            [(ngModel)]="rating"
            aria-label="Rating"
          />
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ rating }}</code>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class SliderDemo {
  // Variants.
  protected readonly standard = signal(30);
  protected readonly centered = signal(70);
  protected readonly rangeValue = signal<[number, number]>([25, 75]);

  // Sizes.
  protected readonly sizeXs = signal(40);
  protected readonly sizeSm = signal(40);
  protected readonly sizeMd = signal(40);
  protected readonly sizeLg = signal(40);
  protected readonly sizeXl = signal(40);

  // Orientation.
  protected readonly horizontal = signal(50);
  protected readonly vertical = signal(60);

  // Stops.
  protected readonly continuous = signal(45);
  protected readonly stepped = signal(40);
  protected readonly discrete = signal(50);

  // Value indicator.
  protected readonly indicated = signal(60);
  protected readonly indicatedRange = signal<[number, number]>([30, 80]);

  // Inset icon.
  protected readonly iconMd = signal(55);
  protected readonly iconLg = signal(55);
  protected readonly iconXl = signal(55);

  // States.
  protected readonly enabled = signal(40);

  // Reactive form.
  protected readonly volume = new FormControl(35);

  // ngModel custom domain.
  protected rating = 7;
}
