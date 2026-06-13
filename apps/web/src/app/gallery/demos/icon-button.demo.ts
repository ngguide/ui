import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the icon button (`@ngguide/ui/icon-button`).
 *
 * Exercises every dimension the implemented `IconButtonComponent` supports:
 * the four color variants (standard / filled / tonal / outlined), the five M3
 * sizes (xs / sm / md / lg / xl), the two shapes (round / square), the three
 * widths (narrow / default / wide), the disabled state, the anchor host, and
 * the toggle variant with its round->square shape morph and `[guiSelectedIcon]`
 * glyph swap. State is plain template-driven `selected` models — no clock, no
 * RNG — so server and client renders are byte-identical.
 */
@Component({
  selector: 'app-demo-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, IconButtonComponent, IconComponent],
  template: `
    <app-demo-component
      name="Icon button"
      entry="@ngguide/ui/icon-button"
      docHref="https://m3.material.io/components/icon-buttons"
    >
      <!-- ── Variants: the four M3 color configurations (default, enabled) ── -->
      <app-demo-block
        heading="Variants"
        hint="Four color configurations — standard, filled, tonal, outlined"
        [code]="codeVariants"
      >
        <app-demo-specimen label="standard">
          <button gui-icon-button variant="standard" label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled">
          <button gui-icon-button variant="filled" label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal">
          <button gui-icon-button variant="tonal" label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined">
          <button gui-icon-button variant="outlined" label="Add">
            <gui-icon class="sym">add</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Sizes: the M3 size ladder (filled to make container size legible) ── -->
      <app-demo-block
        heading="Sizes"
        hint="Five sizes — extra small, small (default), medium, large, extra large"
        [code]="codeSizes"
      >
        <app-demo-specimen label="xs">
          <button gui-icon-button variant="filled" size="xs" label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="sm (default)">
          <button gui-icon-button variant="filled" size="sm" label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="md">
          <button gui-icon-button variant="filled" size="md" label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="lg">
          <button gui-icon-button variant="filled" size="lg" label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="xl">
          <button gui-icon-button variant="filled" size="xl" label="Edit">
            <gui-icon class="sym">edit</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Shapes: round (default) and square resting container ── -->
      <app-demo-block
        heading="Shapes"
        hint="Round (default) and square resting container shapes — size md for legibility"
        [code]="codeShapes"
      >
        <app-demo-specimen label="round">
          <button
            gui-icon-button
            variant="tonal"
            size="md"
            shape="round"
            label="Star"
          >
            <gui-icon class="sym">star</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="square">
          <button
            gui-icon-button
            variant="tonal"
            size="md"
            shape="square"
            label="Star"
          >
            <gui-icon class="sym">star</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Widths: narrow / default / wide horizontal sizing ── -->
      <app-demo-block
        heading="Widths"
        hint="Three widths — narrow, default, wide (size md)"
        [code]="codeWidths"
      >
        <app-demo-specimen label="narrow">
          <button
            gui-icon-button
            variant="outlined"
            size="md"
            width="narrow"
            label="Search"
          >
            <gui-icon class="sym">search</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="default">
          <button
            gui-icon-button
            variant="outlined"
            size="md"
            width="default"
            label="Search"
          >
            <gui-icon class="sym">search</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="wide">
          <button
            gui-icon-button
            variant="outlined"
            size="md"
            width="wide"
            label="Search"
          >
            <gui-icon class="sym">search</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── States: enabled vs disabled, across all four variants ── -->
      <app-demo-block
        heading="States"
        hint="Enabled and disabled per variant — hover / focus / pressed state layers render live"
        [code]="codeStates"
      >
        <app-demo-specimen label="standard · enabled">
          <button gui-icon-button variant="standard" label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="standard · disabled">
          <button gui-icon-button variant="standard" disabled label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · enabled">
          <button gui-icon-button variant="filled" label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · disabled">
          <button gui-icon-button variant="filled" disabled label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · enabled">
          <button gui-icon-button variant="tonal" label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · disabled">
          <button gui-icon-button variant="tonal" disabled label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · enabled">
          <button gui-icon-button variant="outlined" label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · disabled">
          <button gui-icon-button variant="outlined" disabled label="Favorite">
            <gui-icon class="sym">favorite</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Toggle: selection variant, unselected vs selected, per variant.
           The [guiSelectedIcon] slot swaps the filled glyph in when selected
           (M3: outlined icon unselected, filled icon selected). Round resting
           shape morphs to square when selected. Click each to toggle. ── -->
      <app-demo-block
        heading="Toggle (selection)"
        hint="Click to toggle — outlined glyph unselected, filled glyph selected; round morphs to square when selected"
        [code]="codeToggle"
      >
        <app-demo-specimen label="standard · toggle">
          <button gui-icon-button variant="standard" toggle label="Favorite">
            <gui-icon class="sym">favorite_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · toggle">
          <button gui-icon-button variant="filled" toggle label="Favorite">
            <gui-icon class="sym">favorite_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · toggle">
          <button gui-icon-button variant="tonal" toggle label="Favorite">
            <gui-icon class="sym">favorite_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>favorite</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · toggle">
          <button gui-icon-button variant="outlined" toggle label="Favorite">
            <gui-icon class="sym">favorite_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>favorite</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Toggle, pre-selected + disabled: resting selected appearance and
           the disabled treatment of a selected toggle. ── -->
      <app-demo-block
        heading="Toggle states"
        hint="Pre-selected (resting selected colors + square morph) and disabled toggle"
        [code]="codeToggleStates"
      >
        <app-demo-specimen label="filled · unselected">
          <button gui-icon-button variant="filled" toggle label="Bookmark">
            <gui-icon class="sym">bookmark_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>bookmark</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · selected">
          <button
            gui-icon-button
            variant="filled"
            toggle
            [selected]="true"
            label="Bookmark"
          >
            <gui-icon class="sym">bookmark_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>bookmark</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · selected">
          <button
            gui-icon-button
            variant="outlined"
            toggle
            [selected]="true"
            label="Bookmark"
          >
            <gui-icon class="sym">bookmark_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>bookmark</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="selected · disabled">
          <button
            gui-icon-button
            variant="filled"
            toggle
            [selected]="true"
            disabled
            label="Bookmark"
          >
            <gui-icon class="sym">bookmark_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>bookmark</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Square-resting toggle: M3 inversion — a square resting shape morphs
           to round when selected. ── -->
      <app-demo-block
        heading="Square toggle morph"
        hint="Square resting shape inverts to round when selected (M3 shape morph)"
        [code]="codeSquareToggle"
      >
        <app-demo-specimen label="square · unselected">
          <button
            gui-icon-button
            variant="tonal"
            size="md"
            shape="square"
            toggle
            label="Star"
          >
            <gui-icon class="sym">star_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>star</gui-icon>
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="square · selected">
          <button
            gui-icon-button
            variant="tonal"
            size="md"
            shape="square"
            toggle
            [selected]="true"
            label="Star"
          >
            <gui-icon class="sym">star_border</gui-icon>
            <gui-icon class="sym" guiSelectedIcon>star</gui-icon>
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ── Anchor host: <a gui-icon-button> renders the same and gets a
           synthetic button role/tabindex when it has no href. ── -->
      <app-demo-block
        heading="Link host"
        hint="<a gui-icon-button> renders identically; linkless anchors get a synthetic button role"
        [code]="codeLink"
      >
        <app-demo-specimen label="a · href">
          <a gui-icon-button variant="filled" href="#c-icon-button" label="Open">
            <gui-icon class="sym">open_in_new</gui-icon>
          </a>
        </app-demo-specimen>
        <app-demo-specimen label="a · no href (button role)">
          <a gui-icon-button variant="outlined" label="Share">
            <gui-icon class="sym">share</gui-icon>
          </a>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class IconButtonDemo {
  protected readonly codeVariants = `
<button gui-icon-button variant="standard" label="Add">
  <gui-icon class="sym">add</gui-icon>
</button>
<button gui-icon-button variant="filled" label="Add">
  <gui-icon class="sym">add</gui-icon>
</button>
<button gui-icon-button variant="tonal" label="Add">
  <gui-icon class="sym">add</gui-icon>
</button>
<button gui-icon-button variant="outlined" label="Add">
  <gui-icon class="sym">add</gui-icon>
</button>`;

  protected readonly codeSizes = `
<button gui-icon-button variant="filled" size="xs" label="Edit">
  <gui-icon class="sym">edit</gui-icon>
</button>
<button gui-icon-button variant="filled" size="lg" label="Edit">
  <gui-icon class="sym">edit</gui-icon>
</button>`;

  protected readonly codeShapes = `
<button gui-icon-button variant="tonal" size="md" shape="round" label="Star">
  <gui-icon class="sym">star</gui-icon>
</button>
<button gui-icon-button variant="tonal" size="md" shape="square" label="Star">
  <gui-icon class="sym">star</gui-icon>
</button>`;

  protected readonly codeWidths = `
<button gui-icon-button variant="outlined" size="md" width="narrow" label="Search">
  <gui-icon class="sym">search</gui-icon>
</button>
<button gui-icon-button variant="outlined" size="md" width="wide" label="Search">
  <gui-icon class="sym">search</gui-icon>
</button>`;

  protected readonly codeStates = `
<button gui-icon-button variant="filled" label="Favorite">
  <gui-icon class="sym">favorite</gui-icon>
</button>
<button gui-icon-button variant="filled" disabled label="Favorite">
  <gui-icon class="sym">favorite</gui-icon>
</button>`;

  protected readonly codeToggle = `
<button gui-icon-button variant="filled" toggle label="Favorite">
  <gui-icon class="sym">favorite_border</gui-icon>
  <gui-icon class="sym" guiSelectedIcon>favorite</gui-icon>
</button>`;

  protected readonly codeToggleStates = `
<button gui-icon-button variant="filled" toggle [selected]="true" label="Bookmark">
  <gui-icon class="sym">bookmark_border</gui-icon>
  <gui-icon class="sym" guiSelectedIcon>bookmark</gui-icon>
</button>`;

  protected readonly codeSquareToggle = `
<button gui-icon-button variant="tonal" size="md" shape="square" toggle label="Star">
  <gui-icon class="sym">star_border</gui-icon>
  <gui-icon class="sym" guiSelectedIcon>star</gui-icon>
</button>`;

  protected readonly codeLink = `
<a gui-icon-button variant="filled" href="#anchor" label="Open">
  <gui-icon class="sym">open_in_new</gui-icon>
</a>
<a gui-icon-button variant="outlined" label="Share">
  <gui-icon class="sym">share</gui-icon>
</a>`;
}
