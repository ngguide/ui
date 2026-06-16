import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Isolated vitrine demo for the Icon primitive (`@ngguide/ui/icon`).
 *
 * `<gui-icon>` is a thin primitive: it projects a Material Symbols *ligature*
 * (e.g. `home`) and exposes a single `size` input that drives the
 * `--gui-comp-icon-size` custom property (default 24dp) — the same token the
 * button / icon-button slots size their glyphs from.
 *
 * Everything else about a Material Symbol — fill, weight, grade, optical size,
 * and color — is font/CSS, not component API: the demo app's global `.sym`
 * class sets the font family and the `FILL`/`wght`/`GRAD`/`opsz` axes via
 * `font-variation-settings`, and the glyph paints in `currentColor`. The demo
 * keeps those two layers distinct so it stays honest about the component's
 * actual surface (just `size`).
 */
@Component({
  selector: 'app-demo-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, IconComponent],
  template: `
    <app-demo-component
      name="Icon"
      entry="@ngguide/ui/icon"
      docHref="https://m3.material.io/styles/icons/overview"
    >
      <!-- Usage: a Material Symbols ligature projected into gui-icon. -->
      <app-demo-block
        heading="Usage"
        hint="Project a Material Symbols ligature name; the .sym class supplies the font."
        [code]="codeUsage"
      >
        <app-demo-specimen label="home">
          <gui-icon class="sym">home</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="favorite">
          <gui-icon class="sym">favorite</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="settings">
          <gui-icon class="sym">settings</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="search">
          <gui-icon class="sym">search</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="delete">
          <gui-icon class="sym">delete</gui-icon>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Size: the component's one input, driving --gui-comp-icon-size. -->
      <app-demo-block
        heading="Size"
        hint="The size input sets --gui-comp-icon-size (px). Default is 24dp."
        [code]="codeSize"
      >
        <app-demo-specimen label="20">
          <gui-icon class="sym" size="20">favorite</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="24 (default)">
          <gui-icon class="sym">favorite</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="40">
          <gui-icon class="sym" size="40">favorite</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="48">
          <gui-icon class="sym" size="48">favorite</gui-icon>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Fill & weight: Material Symbols font axes (CSS, not component API). -->
      <app-demo-block
        heading="Fill & weight"
        hint="Material Symbols axes set via font-variation-settings — a font/CSS feature, not a gui-icon input."
        [code]="codeAxes"
      >
        <app-demo-specimen label="outline (FILL 0)">
          <gui-icon class="sym" size="40">favorite</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="filled (FILL 1)">
          <gui-icon
            class="sym"
            size="40"
            style="font-variation-settings: 'FILL' 1"
            >favorite</gui-icon
          >
        </app-demo-specimen>
        <app-demo-specimen label="weight 700">
          <gui-icon
            class="sym"
            size="40"
            style="font-variation-settings: 'wght' 700"
            >favorite</gui-icon
          >
        </app-demo-specimen>
      </app-demo-block>

      <!-- Color: the glyph paints in currentColor, so it inherits from context. -->
      <app-demo-block
        heading="Color"
        hint="Icons paint in currentColor — set color on the icon or an ancestor."
        [code]="codeColor"
      >
        <app-demo-specimen label="inherited">
          <gui-icon class="sym" size="40">palette</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="primary">
          <gui-icon class="sym icon-primary" size="40">palette</gui-icon>
        </app-demo-specimen>
        <app-demo-specimen label="error">
          <gui-icon class="sym icon-error" size="40">palette</gui-icon>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .icon-primary {
      color: var(--md-sys-color-primary, #6750a4);
    }
    .icon-error {
      color: var(--md-sys-color-error, #b3261e);
    }
  `,
})
export class IconDemo {
  protected readonly codeUsage = `
<gui-icon class="sym">home</gui-icon>
<gui-icon class="sym">favorite</gui-icon>
<gui-icon class="sym">settings</gui-icon>`;

  protected readonly codeSize = `
<gui-icon class="sym" size="20">favorite</gui-icon>
<gui-icon class="sym">favorite</gui-icon>          <!-- 24dp default -->
<gui-icon class="sym" size="40">favorite</gui-icon>
<gui-icon class="sym" size="48">favorite</gui-icon>`;

  protected readonly codeAxes = `
<!-- Material Symbols axes via font-variation-settings (CSS, not a gui-icon input) -->
<gui-icon class="sym" size="40" style="font-variation-settings: 'FILL' 1">favorite</gui-icon>
<gui-icon class="sym" size="40" style="font-variation-settings: 'wght' 700">favorite</gui-icon>`;

  protected readonly codeColor = `
<!-- Paints in currentColor -->
<gui-icon class="sym" style="color: var(--md-sys-color-primary)">palette</gui-icon>`;
}
