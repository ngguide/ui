import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GuiLoadingIndicator } from '@ngguide/ui/loading-indicator';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 loading indicator (`@ngguide/ui/loading-indicator`).
 *
 * The component is an indeterminate, always-busy SVG indicator that morphs
 * between two deterministic "cookie" shapes while spinning. Its full public
 * API is two inputs:
 * - `variant: 'default' | 'contained'` — the M3 containment configuration.
 * - `label?: string` — the `aria-label` (progress-bar role), defaults to
 *   "Loading".
 *
 * There is no size/shape input (M3 fixes the size at 48dp with a 38dp shape
 * container), no determinate mode, no outputs, no content projection and it is
 * not form- or service-driven — so this demo exercises the two variants, both
 * of their M3 color roles, the fixed 48dp/38dp measurement, the accessible
 * label, and the always-on indeterminate/busy state (whose reduced-motion
 * resting variant is OS-driven via `prefers-reduced-motion`, with no input to
 * toggle it).
 *
 * Deterministic by construction: the shape path is pure trig (no clock/RNG),
 * so it is SSR-safe and stable across renders.
 */
@Component({
  selector: 'app-demo-loading-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, GuiLoadingIndicator],
  template: `
    <app-demo-component
      name="Loading indicator"
      entry="@ngguide/ui/loading-indicator"
      docHref="https://m3.material.io/components/loading-indicator"
    >
      <app-demo-block
        heading="Variants"
        hint="The two M3 containment configurations"
      >
        <app-demo-specimen label="default">
          <gui-loading-indicator variant="default" />
        </app-demo-specimen>
        <app-demo-specimen label="contained">
          <gui-loading-indicator variant="contained" />
        </app-demo-specimen>
      </app-demo-block>

      <app-demo-block
        heading="Color roles"
        hint="Default uses primary; contained uses primary-container + on-primary-container"
      >
        <app-demo-specimen label="default · primary">
          <gui-loading-indicator variant="default" />
        </app-demo-specimen>
        <app-demo-specimen label="contained · primary-container">
          <gui-loading-indicator variant="contained" />
        </app-demo-specimen>
      </app-demo-block>

      <app-demo-block
        heading="Size"
        hint="Fixed 48dp overall size with a 38dp shape container (M3 measurements)"
      >
        <app-demo-specimen label="48dp · default">
          <gui-loading-indicator variant="default" />
        </app-demo-specimen>
        <app-demo-specimen label="48dp · contained">
          <gui-loading-indicator variant="contained" />
        </app-demo-specimen>
      </app-demo-block>

      <app-demo-block
        heading="States"
        hint="Indeterminate, always-busy (role=progressbar, aria-busy, no aria-valuenow). Under prefers-reduced-motion the morph/spin rest at a static shape while the surface stays visible and busy (OS-driven — no input to toggle)."
      >
        <app-demo-specimen label="indeterminate · default">
          <gui-loading-indicator variant="default" />
        </app-demo-specimen>
        <app-demo-specimen label="indeterminate · contained">
          <gui-loading-indicator variant="contained" />
        </app-demo-specimen>
      </app-demo-block>

      <app-demo-block
        heading="Accessible label"
        hint="label sets the progress-bar aria-label; defaults to 'Loading'"
      >
        <app-demo-specimen label="default 'Loading'">
          <gui-loading-indicator variant="default" />
        </app-demo-specimen>
        <app-demo-specimen label="label='Loading news'">
          <gui-loading-indicator variant="default" label="Loading news" />
        </app-demo-specimen>
        <app-demo-specimen label="label='Refreshing page'">
          <gui-loading-indicator
            variant="contained"
            label="Refreshing page"
          />
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class LoadingIndicatorDemo {}
