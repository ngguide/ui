import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 Button (`@ngguide/ui/button`).
 *
 * Exhaustively exercises every dimension the implemented `ButtonComponent`
 * supports: the five color configurations (elevated, filled, tonal, outlined,
 * text), the five Expressive sizes (xs/sm/md/lg/xl), both shapes (round,
 * square), leading icons, the toggle (selection) buttons with their resting
 * shape morph and selected-icon slot, plus enabled/disabled states across
 * both the native `<button>` host and the linkless `<a>` host.
 */
@Component({
  selector: 'app-demo-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, ButtonComponent, IconComponent],
  template: `
    <app-demo-component
      name="Button"
      entry="@ngguide/ui/button"
      docHref="https://m3.material.io/components/buttons"
    >
      <!-- ===== Variants (color configurations) ===== -->
      <app-demo-block
        heading="Variants"
        hint="Five M3 color configurations"
        [code]="codeVariants"
      >
        <app-demo-specimen label="elevated">
          <button gui-button variant="elevated">Elevated</button>
        </app-demo-specimen>
        <app-demo-specimen label="filled (default)">
          <button gui-button variant="filled">Filled</button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal">
          <button gui-button variant="tonal">Tonal</button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined">
          <button gui-button variant="outlined">Outlined</button>
        </app-demo-specimen>
        <app-demo-specimen label="text">
          <button gui-button variant="text">Text</button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Sizes ===== -->
      <app-demo-block
        heading="Sizes"
        hint="xs · sm (default) · md · lg · xl — M3 Expressive scale"
        [code]="codeSizes"
      >
        <app-demo-specimen label="xs">
          <button gui-button variant="filled" size="xs">Extra small</button>
        </app-demo-specimen>
        <app-demo-specimen label="sm (default)">
          <button gui-button variant="filled" size="sm">Small</button>
        </app-demo-specimen>
        <app-demo-specimen label="md">
          <button gui-button variant="filled" size="md">Medium</button>
        </app-demo-specimen>
        <app-demo-specimen label="lg">
          <button gui-button variant="filled" size="lg">Large</button>
        </app-demo-specimen>
        <app-demo-specimen label="xl">
          <button gui-button variant="filled" size="xl">Extra large</button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Shapes ===== -->
      <app-demo-block
        heading="Shapes"
        hint="round (default) and square; the corner radius is size-specific"
        [code]="codeShapes"
      >
        <app-demo-specimen label="round">
          <button gui-button variant="filled" shape="round">Round</button>
        </app-demo-specimen>
        <app-demo-specimen label="square">
          <button gui-button variant="filled" shape="square">Square</button>
        </app-demo-specimen>
        <app-demo-specimen label="round · md">
          <button gui-button variant="tonal" size="md" shape="round">
            Round
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="square · md">
          <button gui-button variant="tonal" size="md" shape="square">
            Square
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Leading icon ===== -->
      <app-demo-block
        heading="Leading icon"
        hint="Optional icon projected into the [guiIcon] slot, 20dp baseline"
        [code]="codeIcon"
      >
        <app-demo-specimen label="elevated">
          <button gui-button variant="elevated">
            <gui-icon guiIcon class="sym">add</gui-icon>
            Create
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled">
          <button gui-button variant="filled">
            <gui-icon guiIcon class="sym">send</gui-icon>
            Send
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal">
          <button gui-button variant="tonal">
            <gui-icon guiIcon class="sym">edit</gui-icon>
            Edit
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined">
          <button gui-button variant="outlined">
            <gui-icon guiIcon class="sym">download</gui-icon>
            Download
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="text">
          <button gui-button variant="text">
            <gui-icon guiIcon class="sym">delete</gui-icon>
            Delete
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="icon · md">
          <button gui-button variant="filled" size="md">
            <gui-icon guiIcon class="sym">favorite</gui-icon>
            Favorite
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Toggle (selection) buttons ===== -->
      <app-demo-block
        heading="Toggle"
        hint="Two-way selected state; resting shape morphs round⇄square. Text style has no toggle (M3)."
        [code]="codeToggle"
      >
        <app-demo-specimen label="elevated · {{ tElevated() ? 'on' : 'off' }}">
          <button gui-button variant="elevated" toggle [(selected)]="tElevated">
            <gui-icon guiIcon class="sym">star_outline</gui-icon>
            <gui-icon guiSelectedIcon class="sym">star</gui-icon>
            Star
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · {{ tFilled() ? 'on' : 'off' }}">
          <button gui-button variant="filled" toggle [(selected)]="tFilled">
            <gui-icon guiIcon class="sym">bookmark_border</gui-icon>
            <gui-icon guiSelectedIcon class="sym">bookmark</gui-icon>
            Save
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · {{ tTonal() ? 'on' : 'off' }}">
          <button gui-button variant="tonal" toggle [(selected)]="tTonal">
            <gui-icon guiIcon class="sym">visibility_off</gui-icon>
            <gui-icon guiSelectedIcon class="sym">visibility</gui-icon>
            Show
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · {{ tOutlined() ? 'on' : 'off' }}">
          <button gui-button variant="outlined" toggle [(selected)]="tOutlined">
            <gui-icon guiIcon class="sym">check</gui-icon>
            <gui-icon guiSelectedIcon class="sym">check</gui-icon>
            Select
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="round → square when selected">
          <button
            gui-button
            variant="filled"
            shape="round"
            toggle
            [(selected)]="tRound"
          >
            <gui-icon guiIcon class="sym">grid_view</gui-icon>
            <gui-icon guiSelectedIcon class="sym">grid_view</gui-icon>
            Grid
          </button>
        </app-demo-specimen>
        <app-demo-specimen label="square → round when selected">
          <button
            gui-button
            variant="filled"
            shape="square"
            toggle
            [(selected)]="tSquare"
          >
            <gui-icon guiIcon class="sym">view_list</gui-icon>
            <gui-icon guiSelectedIcon class="sym">view_list</gui-icon>
            List
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== States ===== -->
      <app-demo-block
        heading="States"
        hint="Enabled and disabled across every variant (hover/focus/pressed are live — interact)"
        [code]="codeStates"
      >
        <app-demo-specimen label="elevated · enabled">
          <button gui-button variant="elevated">Enabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="elevated · disabled">
          <button gui-button variant="elevated" disabled>Disabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · enabled">
          <button gui-button variant="filled">Enabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="filled · disabled">
          <button gui-button variant="filled" disabled>Disabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · enabled">
          <button gui-button variant="tonal">Enabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="tonal · disabled">
          <button gui-button variant="tonal" disabled>Disabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · enabled">
          <button gui-button variant="outlined">Enabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="outlined · disabled">
          <button gui-button variant="outlined" disabled>Disabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="text · enabled">
          <button gui-button variant="text">Enabled</button>
        </app-demo-specimen>
        <app-demo-specimen label="text · disabled">
          <button gui-button variant="text" disabled>Disabled</button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Anchor host ===== -->
      <app-demo-block
        heading="Link button"
        hint="Same component on an <a> host; a linkless anchor gets role=button + keyboard activation"
        [code]="codeLink"
      >
        <app-demo-specimen label="a · href">
          <a gui-button variant="filled" href="#c-button">Link</a>
        </app-demo-specimen>
        <app-demo-specimen label="a · linkless (role=button)">
          <a gui-button variant="outlined">Action</a>
        </app-demo-specimen>
        <app-demo-specimen label="a · disabled">
          <a gui-button variant="tonal" disabled>Disabled</a>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class ButtonDemo {
  // Toggle (selection) state — two-way bound to each toggle button's `selected`.
  protected readonly tElevated = signal(true);
  protected readonly tFilled = signal(false);
  protected readonly tTonal = signal(true);
  protected readonly tOutlined = signal(false);
  protected readonly tRound = signal(false);
  protected readonly tSquare = signal(true);

  protected readonly codeVariants = `
<button gui-button variant="elevated">Elevated</button>
<button gui-button variant="filled">Filled</button>
<button gui-button variant="tonal">Tonal</button>
<button gui-button variant="outlined">Outlined</button>
<button gui-button variant="text">Text</button>`;

  protected readonly codeSizes = `
<button gui-button variant="filled" size="xs">Extra small</button>
<button gui-button variant="filled" size="sm">Small</button>
<button gui-button variant="filled" size="md">Medium</button>
<button gui-button variant="filled" size="lg">Large</button>
<button gui-button variant="filled" size="xl">Extra large</button>`;

  protected readonly codeShapes = `
<button gui-button variant="filled" shape="round">Round</button>
<button gui-button variant="filled" shape="square">Square</button>`;

  protected readonly codeIcon = `
<button gui-button variant="filled">
  <gui-icon guiIcon class="sym">send</gui-icon>
  Send
</button>`;

  protected readonly codeToggle = `
<button gui-button variant="filled" toggle [(selected)]="saved">
  <gui-icon guiIcon class="sym">bookmark_border</gui-icon>
  <gui-icon guiSelectedIcon class="sym">bookmark</gui-icon>
  Save
</button>`;

  protected readonly codeStates = `
<button gui-button variant="filled">Enabled</button>
<button gui-button variant="filled" disabled>Disabled</button>`;

  protected readonly codeLink = `
<a gui-button variant="filled" href="#anchor">Link</a>
<a gui-button variant="outlined">Action</a>`;
}
