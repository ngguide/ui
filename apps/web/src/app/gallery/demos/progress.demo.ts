import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  GuiLinearProgress,
  GuiCircularProgress,
} from '@ngguide/ui/progress';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 progress indicators (`@ngguide/ui/progress`).
 *
 * Exhaustively exercises both implemented variants (linear + circular) across
 * every configuration the source actually supports:
 * - Behavior: determinate (`value` 0..1) and indeterminate (`value` null).
 * - Track thickness: the M3 baseline 4dp plus variable thicker tracks.
 * - Shape: flat (default) and the M3 Expressive `wavy` shape (amplitude/wavelength).
 *
 * The components have no disabled input and no error/leading-icon/selected
 * configurations, so those M3 dimensions are intentionally absent.
 */
@Component({
  selector: 'app-demo-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, GuiLinearProgress, GuiCircularProgress],
  template: `
    <app-demo-component
      name="Progress indicators"
      entry="@ngguide/ui/progress"
      docHref="https://m3.material.io/components/progress-indicators"
    >
      <!-- VARIANTS: the two M3 variants, each in both behaviors. -->
      <app-demo-block
        heading="Variants"
        hint="Linear and circular — the two M3 progress variants"
        [code]="codeVariants"
      >
        <app-demo-specimen label="linear · determinate" class="fill">
          <gui-linear-progress [value]="0.6" label="Loading page" />
        </app-demo-specimen>
        <app-demo-specimen label="linear · indeterminate" class="fill">
          <gui-linear-progress [value]="null" label="Loading page" />
        </app-demo-specimen>
        <app-demo-specimen label="circular · determinate">
          <gui-circular-progress [value]="0.6" label="Loading page" />
        </app-demo-specimen>
        <app-demo-specimen label="circular · indeterminate">
          <gui-circular-progress [value]="null" label="Loading page" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- BEHAVIOR / STATES: determinate progression + indeterminate. -->
      <app-demo-block
        heading="States"
        hint="Determinate value progression and indeterminate (loading) — value 0..1, null ⇒ indeterminate"
        [code]="codeStates"
      >
        <app-demo-specimen label="0%" class="fill">
          <gui-linear-progress [value]="0" label="0 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="25%" class="fill">
          <gui-linear-progress [value]="0.25" label="25 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="50%" class="fill">
          <gui-linear-progress [value]="0.5" label="50 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="75%" class="fill">
          <gui-linear-progress [value]="0.75" label="75 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="100%" class="fill">
          <gui-linear-progress [value]="1" label="100 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="indeterminate" class="fill">
          <gui-linear-progress [value]="null" label="Loading" />
        </app-demo-specimen>
        <app-demo-specimen label="circular 0%">
          <gui-circular-progress [value]="0" label="0 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="circular 25%">
          <gui-circular-progress [value]="0.25" label="25 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="circular 50%">
          <gui-circular-progress [value]="0.5" label="50 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="circular 75%">
          <gui-circular-progress [value]="0.75" label="75 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="circular 100%">
          <gui-circular-progress [value]="1" label="100 percent" />
        </app-demo-specimen>
        <app-demo-specimen label="circular indeterminate">
          <gui-circular-progress [value]="null" label="Loading" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- SIZES: track thickness — M3 baseline 4dp + variable thicker tracks. -->
      <app-demo-block
        heading="Sizes"
        hint="Track thickness — 4dp M3 baseline plus variable (Expressive) thicker tracks"
        [code]="codeSizes"
      >
        <app-demo-specimen label="linear · 4dp (default)" class="fill">
          <gui-linear-progress [value]="0.6" label="4 dp track" />
        </app-demo-specimen>
        <app-demo-specimen label="linear · 8dp" class="fill">
          <gui-linear-progress [value]="0.6" [thickness]="8" label="8 dp track" />
        </app-demo-specimen>
        <app-demo-specimen label="linear · 12dp" class="fill">
          <gui-linear-progress
            [value]="0.6"
            [thickness]="12"
            label="12 dp track"
          />
        </app-demo-specimen>
        <app-demo-specimen label="circular · 4dp (default)">
          <gui-circular-progress [value]="0.6" label="4 dp stroke" />
        </app-demo-specimen>
        <app-demo-specimen label="circular · 6dp">
          <gui-circular-progress
            [value]="0.6"
            [thickness]="6"
            label="6 dp stroke"
          />
        </app-demo-specimen>
        <app-demo-specimen label="circular · 8dp">
          <gui-circular-progress
            [value]="0.6"
            [thickness]="8"
            label="8 dp stroke"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- SHAPES: flat (default) + wavy (M3 Expressive), determinate & indeterminate. -->
      <app-demo-block
        heading="Shapes"
        hint="Flat (default) and the M3 Expressive wavy active indicator"
        [code]="codeShapes"
      >
        <app-demo-specimen label="linear · flat" class="fill">
          <gui-linear-progress [value]="0.6" shape="flat" label="Flat" />
        </app-demo-specimen>
        <app-demo-specimen label="linear · wavy · determinate" class="fill">
          <gui-linear-progress [value]="0.6" shape="wavy" label="Wavy" />
        </app-demo-specimen>
        <app-demo-specimen label="linear · wavy · indeterminate" class="fill">
          <gui-linear-progress
            [value]="null"
            shape="wavy"
            label="Wavy loading"
          />
        </app-demo-specimen>
        <app-demo-specimen label="circular · flat">
          <gui-circular-progress [value]="0.6" shape="flat" label="Flat" />
        </app-demo-specimen>
        <app-demo-specimen label="circular · wavy · determinate">
          <gui-circular-progress [value]="0.6" shape="wavy" label="Wavy" />
        </app-demo-specimen>
        <app-demo-specimen label="circular · wavy · indeterminate">
          <gui-circular-progress
            [value]="null"
            shape="wavy"
            label="Wavy loading"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- WAVE TUNING: amplitude / wavelength drive the wavy shape. -->
      <app-demo-block
        heading="Wave tuning"
        hint="Amplitude (peak height) and wavelength (peak spacing) shape the wavy indicator"
        [code]="codeWaveTuning"
      >
        <app-demo-specimen label="linear · amp 2 / wl 60" class="fill">
          <gui-linear-progress
            [value]="0.6"
            shape="wavy"
            [amplitude]="2"
            [wavelength]="60"
            label="Low amplitude"
          />
        </app-demo-specimen>
        <app-demo-specimen label="linear · amp 5 / wl 24" class="fill">
          <gui-linear-progress
            [value]="0.6"
            shape="wavy"
            [amplitude]="5"
            [wavelength]="24"
            label="High amplitude"
          />
        </app-demo-specimen>
        <app-demo-specimen label="circular · amp 1 / wl 18">
          <gui-circular-progress
            [value]="0.6"
            shape="wavy"
            [amplitude]="1"
            [wavelength]="18"
            label="Low amplitude"
          />
        </app-demo-specimen>
        <app-demo-specimen label="circular · amp 3 / wl 8">
          <gui-circular-progress
            [value]="0.6"
            shape="wavy"
            [amplitude]="3"
            [wavelength]="8"
            label="High amplitude"
          />
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class ProgressDemo {
  protected readonly codeVariants = `
<gui-linear-progress [value]="0.6" label="Loading page" />
<gui-linear-progress [value]="null" label="Loading page" />
<gui-circular-progress [value]="0.6" label="Loading page" />
<gui-circular-progress [value]="null" label="Loading page" />`;

  protected readonly codeStates = `
<gui-linear-progress [value]="0.25" label="25 percent" />
<gui-linear-progress [value]="null" label="Loading" />`;

  protected readonly codeSizes = `
<gui-linear-progress [value]="0.6" [thickness]="8" label="8 dp track" />
<gui-circular-progress [value]="0.6" [thickness]="6" label="6 dp stroke" />`;

  protected readonly codeShapes = `
<gui-linear-progress [value]="0.6" shape="wavy" label="Wavy" />
<gui-circular-progress [value]="0.6" shape="wavy" label="Wavy" />`;

  protected readonly codeWaveTuning = `
<gui-linear-progress
  [value]="0.6"
  shape="wavy"
  [amplitude]="5"
  [wavelength]="24"
  label="High amplitude"
/>`;
}
