import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '@ngguide/ui/icon';
import {
  SegmentedButtonComponent,
  SegmentedButtonGroupComponent,
} from '@ngguide/ui/segmented-button';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Exhaustive vitrine demo for the M3 segmented button
 * (`@ngguide/ui/segmented-button`).
 *
 * Covers every dimension the implemented component supports:
 * - Variants: single-select (`role=radiogroup` / segments `role=radio`) and
 *   multi-select (`role=group` / segments `role=checkbox`).
 * - Anatomy: label only, leading icon + label, icon only, and the optional M3
 *   selected check icon (`showSelectedIcon`).
 * - Sizes: the four M3 density steps (0 / −1 / −2 / −3 → 40/36/32/28dp).
 * - Shape: the fully-rounded pill outer shape (first/last segment corners).
 * - States: unselected, selected, disabled (per-segment), and a fully disabled
 *   group; selection state is live via the two-way `value` model.
 */
@Component({
  selector: 'app-demo-segmented-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Segmented button"
      entry="@ngguide/ui/segmented-button"
      docHref="https://m3.material.io/components/segmented-buttons"
    >
      <!-- VARIANTS: single-select (radio semantics) vs multi-select (checkbox). -->
      <app-demo-block
        heading="Variants"
        hint="Single-select behaves like a radio group; multi-select like checkboxes"
        [code]="codeVariants"
      >
        <app-demo-specimen label="single-select">
          <gui-segmented-buttons [(value)]="single">
            <button gui-segmented-button value="day">Day</button>
            <button gui-segmented-button value="week">Week</button>
            <button gui-segmented-button value="month">Month</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="multi-select">
          <gui-segmented-buttons multiple [(value)]="multi">
            <button gui-segmented-button value="b">Bold</button>
            <button gui-segmented-button value="i">Italic</button>
            <button gui-segmented-button value="u">Underline</button>
          </gui-segmented-buttons>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ANATOMY: label, leading icon + label, icon only, and toggling the
           optional M3 selected check icon. Icons land in the segment's
           [guiIcon] projection slot. -->
      <app-demo-block
        heading="Anatomy"
        hint="Label text, optional leading icon, and the optional selected check icon"
        [code]="codeAnatomy"
      >
        <app-demo-specimen label="label only">
          <gui-segmented-buttons [(value)]="anatomyLabel">
            <button gui-segmented-button value="list">List</button>
            <button gui-segmented-button value="grid">Grid</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="icon + label">
          <gui-segmented-buttons [(value)]="anatomyIcon">
            <button gui-segmented-button value="list">
              <gui-icon guiIcon class="sym">view_list</gui-icon>
              List
            </button>
            <button gui-segmented-button value="grid">
              <gui-icon guiIcon class="sym">grid_view</gui-icon>
              Grid
            </button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="icon only">
          <gui-segmented-buttons [(value)]="anatomyIconOnly">
            <button gui-segmented-button value="left">
              <gui-icon guiIcon class="sym">format_align_left</gui-icon>
            </button>
            <button gui-segmented-button value="center">
              <gui-icon guiIcon class="sym">format_align_center</gui-icon>
            </button>
            <button gui-segmented-button value="right">
              <gui-icon guiIcon class="sym">format_align_right</gui-icon>
            </button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="no selected check (showSelectedIcon=false)">
          <gui-segmented-buttons [(value)]="anatomyNoCheck">
            <button gui-segmented-button value="day" [showSelectedIcon]="false">
              Day
            </button>
            <button gui-segmented-button value="week" [showSelectedIcon]="false">
              Week
            </button>
            <button gui-segmented-button value="month" [showSelectedIcon]="false">
              Month
            </button>
          </gui-segmented-buttons>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SIZES: the four M3 density steps (height only; 40 / 36 / 32 / 28dp). -->
      <app-demo-block
        heading="Sizes (density)"
        hint="Each density step removes 4dp from the 40dp height"
        [code]="codeSizes"
      >
        <app-demo-specimen label="density 0 · 40dp">
          <gui-segmented-buttons [density]="0" [(value)]="density0">
            <button gui-segmented-button value="s">S</button>
            <button gui-segmented-button value="m">M</button>
            <button gui-segmented-button value="l">L</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="density −1 · 36dp">
          <gui-segmented-buttons [density]="-1" [(value)]="densityM1">
            <button gui-segmented-button value="s">S</button>
            <button gui-segmented-button value="m">M</button>
            <button gui-segmented-button value="l">L</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="density −2 · 32dp">
          <gui-segmented-buttons [density]="-2" [(value)]="densityM2">
            <button gui-segmented-button value="s">S</button>
            <button gui-segmented-button value="m">M</button>
            <button gui-segmented-button value="l">L</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="density −3 · 28dp">
          <gui-segmented-buttons [density]="-3" [(value)]="densityM3">
            <button gui-segmented-button value="s">S</button>
            <button gui-segmented-button value="m">M</button>
            <button gui-segmented-button value="l">L</button>
          </gui-segmented-buttons>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SHAPE: the fully-rounded pill; first/last segments carry the rounded
           outer corners, interior dividers collapse to a single 1px line. -->
      <app-demo-block
        heading="Shape"
        hint="Fully-rounded pill — outer corners are corner-full, interior dividers are shared 1px lines"
        [code]="codeShape"
      >
        <app-demo-specimen label="2 segments">
          <gui-segmented-buttons [(value)]="shape2">
            <button gui-segmented-button value="on">On</button>
            <button gui-segmented-button value="off">Off</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="5 segments (M3 max)">
          <gui-segmented-buttons [(value)]="shape5">
            <button gui-segmented-button value="xs">XS</button>
            <button gui-segmented-button value="s">S</button>
            <button gui-segmented-button value="m">M</button>
            <button gui-segmented-button value="l">L</button>
            <button gui-segmented-button value="xl">XL</button>
          </gui-segmented-buttons>
        </app-demo-specimen>
      </app-demo-block>

      <!-- STATES: unselected, selected, per-segment disabled, and a fully
           disabled group. Selected/unselected are seeded into the value model. -->
      <app-demo-block
        heading="States"
        hint="Unselected, selected, disabled segment, and a fully disabled group"
        [code]="codeStates"
      >
        <app-demo-specimen label="unselected">
          <gui-segmented-buttons [(value)]="stateUnselected">
            <button gui-segmented-button value="a">First</button>
            <button gui-segmented-button value="b">Second</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="selected">
          <gui-segmented-buttons [(value)]="stateSelected">
            <button gui-segmented-button value="a">First</button>
            <button gui-segmented-button value="b">Second</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="disabled segment (unselected)">
          <gui-segmented-buttons [(value)]="stateDisabledSegment">
            <button gui-segmented-button value="a">Enabled</button>
            <button gui-segmented-button value="b" disabled>Disabled</button>
            <button gui-segmented-button value="c">Enabled</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="disabled segment (selected)">
          <gui-segmented-buttons [(value)]="stateDisabledSelected">
            <button gui-segmented-button value="a">Enabled</button>
            <button gui-segmented-button value="b" disabled>Disabled</button>
          </gui-segmented-buttons>
        </app-demo-specimen>

        <app-demo-specimen label="all disabled">
          <gui-segmented-buttons [(value)]="stateAllDisabled">
            <button gui-segmented-button value="a" disabled>One</button>
            <button gui-segmented-button value="b" disabled>Two</button>
            <button gui-segmented-button value="c" disabled>Three</button>
          </gui-segmented-buttons>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class SegmentedButtonDemo {
  // Variants
  protected readonly single = signal<string | string[] | null>('week');
  protected readonly multi = signal<string | string[] | null>(['b', 'u']);

  // Anatomy
  protected readonly anatomyLabel = signal<string | string[] | null>('list');
  protected readonly anatomyIcon = signal<string | string[] | null>('grid');
  protected readonly anatomyIconOnly = signal<string | string[] | null>(
    'center',
  );
  protected readonly anatomyNoCheck = signal<string | string[] | null>('week');

  // Sizes (density)
  protected readonly density0 = signal<string | string[] | null>('m');
  protected readonly densityM1 = signal<string | string[] | null>('m');
  protected readonly densityM2 = signal<string | string[] | null>('m');
  protected readonly densityM3 = signal<string | string[] | null>('m');

  // Shape
  protected readonly shape2 = signal<string | string[] | null>('on');
  protected readonly shape5 = signal<string | string[] | null>('m');

  // States
  protected readonly stateUnselected = signal<string | string[] | null>(null);
  protected readonly stateSelected = signal<string | string[] | null>('a');
  protected readonly stateDisabledSegment = signal<string | string[] | null>(
    'a',
  );
  protected readonly stateDisabledSelected = signal<string | string[] | null>(
    'b',
  );
  protected readonly stateAllDisabled = signal<string | string[] | null>('a');

  protected readonly codeVariants = `
<gui-segmented-buttons [(value)]="single">
  <button gui-segmented-button value="day">Day</button>
  <button gui-segmented-button value="week">Week</button>
  <button gui-segmented-button value="month">Month</button>
</gui-segmented-buttons>

<gui-segmented-buttons multiple [(value)]="multi">
  <button gui-segmented-button value="b">Bold</button>
  <button gui-segmented-button value="i">Italic</button>
  <button gui-segmented-button value="u">Underline</button>
</gui-segmented-buttons>`;

  protected readonly codeAnatomy = `
<gui-segmented-buttons [(value)]="view">
  <button gui-segmented-button value="list">
    <gui-icon guiIcon class="sym">view_list</gui-icon>
    List
  </button>
  <button gui-segmented-button value="grid">
    <gui-icon guiIcon class="sym">grid_view</gui-icon>
    Grid
  </button>
</gui-segmented-buttons>`;

  protected readonly codeSizes = `
<gui-segmented-buttons [density]="-1" [(value)]="size">
  <button gui-segmented-button value="s">S</button>
  <button gui-segmented-button value="m">M</button>
  <button gui-segmented-button value="l">L</button>
</gui-segmented-buttons>`;

  protected readonly codeShape = `
<gui-segmented-buttons [(value)]="power">
  <button gui-segmented-button value="on">On</button>
  <button gui-segmented-button value="off">Off</button>
</gui-segmented-buttons>`;

  protected readonly codeStates = `
<gui-segmented-buttons [(value)]="state">
  <button gui-segmented-button value="a">Enabled</button>
  <button gui-segmented-button value="b" disabled>Disabled</button>
  <button gui-segmented-button value="c">Enabled</button>
</gui-segmented-buttons>`;
}
