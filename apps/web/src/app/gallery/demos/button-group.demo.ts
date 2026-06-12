import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonGroupComponent } from '@ngguide/ui/button-group';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Button group vitrine demo — exhaustive M3 specimen wall for
 * `@ngguide/ui/button-group`.
 *
 * The group is an invisible container (`<gui-button-group>`) that projects
 * `gui-button` / `gui-icon-button` children and drives their arrangement,
 * padding and connected-edge shapes from its own inputs:
 *   - connected: false (standard, spaced) | true (connected, shared edges)
 *   - size:      xs | sm | md | lg | xl  (M3 Expressive sizes)
 *   - shape:     round | square          (default outer shape, connected only)
 *   - selection: none | single | multi   (advertised via role / aria)
 *
 * Selection/disabled state lives on the child toggle buttons, so the toggle,
 * selected and disabled blocks are demonstrated on the projected buttons.
 */
@Component({
  selector: 'app-demo-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    ButtonGroupComponent,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Button group"
      entry="@ngguide/ui/button-group"
      docHref="https://m3.material.io/components/button-groups"
    >
      <!-- VARIANTS: standard (spaced) vs connected (shared edges) -->
      <app-demo-block
        heading="Variants"
        hint="Standard (spaced) and connected (shared-edge) arrangements"
        [code]="codeVariants"
      >
        <app-demo-specimen label="standard">
          <gui-button-group>
            <button gui-button variant="outlined" size="md">One</button>
            <button gui-button variant="outlined" size="md">Two</button>
            <button gui-button variant="outlined" size="md">Three</button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="connected">
          <gui-button-group connected>
            <button gui-button variant="outlined" size="md">One</button>
            <button gui-button variant="outlined" size="md">Two</button>
            <button gui-button variant="outlined" size="md">Three</button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SIZES (standard): XS, S, M, L, XL — size drives inner padding -->
      <app-demo-block
        heading="Sizes — standard"
        hint="size = xs | sm | md | lg | xl · inner padding adapts per size (48dp target)"
        [column]="true"
        [code]="codeSizesStandard"
      >
        @for (s of sizes; track s) {
          <app-demo-specimen [label]="'size=' + s">
            <gui-button-group [size]="s">
              <button gui-button variant="tonal" [size]="s">Reply</button>
              <button gui-button variant="tonal" [size]="s">Forward</button>
              <button gui-button variant="tonal" [size]="s">Archive</button>
            </gui-button-group>
          </app-demo-specimen>
        }
      </app-demo-block>

      <!-- SIZES (connected): XS, S, M, L, XL -->
      <app-demo-block
        heading="Sizes — connected"
        hint="Connected uses 2dp padding at every size; per-size inner corners"
        [column]="true"
        [code]="codeSizesConnected"
      >
        @for (s of sizes; track s) {
          <app-demo-specimen [label]="'size=' + s">
            <gui-button-group connected [size]="s">
              <button gui-button variant="outlined" [size]="s">Day</button>
              <button gui-button variant="outlined" [size]="s">Week</button>
              <button gui-button variant="outlined" [size]="s">Month</button>
            </gui-button-group>
          </app-demo-specimen>
        }
      </app-demo-block>

      <!-- SHAPES (connected): round vs square outer caps, across every size -->
      <app-demo-block
        heading="Shapes — connected"
        hint="shape = round (full outer caps) | square (per-size outer corners)"
        [column]="true"
        [code]="codeShapes"
      >
        @for (s of sizes; track s) {
          <app-demo-specimen [label]="'round · ' + s">
            <gui-button-group connected shape="round" [size]="s">
              <button gui-button variant="tonal" [size]="s">A</button>
              <button gui-button variant="tonal" [size]="s">B</button>
              <button gui-button variant="tonal" [size]="s">C</button>
            </gui-button-group>
          </app-demo-specimen>
          <app-demo-specimen [label]="'square · ' + s">
            <gui-button-group connected shape="square" [size]="s">
              <button gui-button variant="tonal" [size]="s">A</button>
              <button gui-button variant="tonal" [size]="s">B</button>
              <button gui-button variant="tonal" [size]="s">C</button>
            </gui-button-group>
          </app-demo-specimen>
        }
      </app-demo-block>

      <!-- COMMON LAYOUTS / COLOR: button variants the group accepts -->
      <app-demo-block
        heading="Color configurations"
        hint="Groups have no color of their own — child buttons supply filled / tonal / outlined / elevated"
        [column]="true"
        [code]="codeColors"
      >
        <app-demo-specimen label="filled">
          <gui-button-group connected>
            <button gui-button variant="filled" size="md">Bold</button>
            <button gui-button variant="filled" size="md">Italic</button>
            <button gui-button variant="filled" size="md">Underline</button>
          </gui-button-group>
        </app-demo-specimen>
        <app-demo-specimen label="tonal">
          <gui-button-group connected>
            <button gui-button variant="tonal" size="md">Bold</button>
            <button gui-button variant="tonal" size="md">Italic</button>
            <button gui-button variant="tonal" size="md">Underline</button>
          </gui-button-group>
        </app-demo-specimen>
        <app-demo-specimen label="outlined">
          <gui-button-group connected>
            <button gui-button variant="outlined" size="md">Bold</button>
            <button gui-button variant="outlined" size="md">Italic</button>
            <button gui-button variant="outlined" size="md">Underline</button>
          </gui-button-group>
        </app-demo-specimen>
        <app-demo-specimen label="elevated">
          <gui-button-group>
            <button gui-button variant="elevated" size="md">Bold</button>
            <button gui-button variant="elevated" size="md">Italic</button>
            <button gui-button variant="elevated" size="md">Underline</button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- COMMON LAYOUTS: label buttons, label + icon, icon-button groups -->
      <app-demo-block
        heading="Common layouts"
        hint="Mix label buttons and icon buttons (M3 anatomy)"
        [column]="true"
        [code]="codeLayouts"
      >
        <app-demo-specimen label="label buttons">
          <gui-button-group connected>
            <button gui-button variant="outlined" size="md">Left</button>
            <button gui-button variant="outlined" size="md">Center</button>
            <button gui-button variant="outlined" size="md">Right</button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="label + icon buttons">
          <gui-button-group connected>
            <button gui-button variant="tonal" size="md">
              <gui-icon guiIcon class="sym">edit</gui-icon>
              Edit
            </button>
            <button gui-icon-button variant="tonal" size="md" label="Favorite">
              <gui-icon class="sym">favorite</gui-icon>
            </button>
            <button gui-icon-button variant="tonal" size="md" label="Delete">
              <gui-icon class="sym">delete</gui-icon>
            </button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="extra small icon buttons">
          <gui-button-group connected size="xs">
            <button gui-icon-button variant="tonal" size="xs" label="Bold">
              <gui-icon class="sym">format_bold</gui-icon>
            </button>
            <button gui-icon-button variant="tonal" size="xs" label="Italic">
              <gui-icon class="sym">format_italic</gui-icon>
            </button>
            <button
              gui-icon-button
              variant="tonal"
              size="xs"
              label="Underline"
            >
              <gui-icon class="sym">format_underlined</gui-icon>
            </button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="large icon buttons">
          <gui-button-group connected size="lg">
            <button gui-icon-button variant="filled" size="lg" label="Previous">
              <gui-icon class="sym">skip_previous</gui-icon>
            </button>
            <button gui-icon-button variant="filled" size="lg" label="Play">
              <gui-icon class="sym">play_arrow</gui-icon>
            </button>
            <button gui-icon-button variant="filled" size="lg" label="Next">
              <gui-icon class="sym">skip_next</gui-icon>
            </button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SELECTION: single-select (radiogroup) on a connected group -->
      <app-demo-block
        heading="Single-select"
        hint="selection=single → role=radiogroup · toggle children carry the selected shape morph"
        [column]="true"
        [code]="codeSingleSelect"
      >
        <app-demo-specimen label="connected · single">
          <gui-button-group connected selection="single">
            <button
              gui-button
              toggle
              variant="tonal"
              size="md"
              [selected]="view() === 'list'"
              (click)="view.set('list')"
            >
              List
            </button>
            <button
              gui-button
              toggle
              variant="tonal"
              size="md"
              [selected]="view() === 'grid'"
              (click)="view.set('grid')"
            >
              Grid
            </button>
            <button
              gui-button
              toggle
              variant="tonal"
              size="md"
              [selected]="view() === 'feed'"
              (click)="view.set('feed')"
            >
              Feed
            </button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="standard · single">
          <gui-button-group selection="single">
            <button
              gui-button
              toggle
              variant="outlined"
              size="md"
              [selected]="align() === 'left'"
              (click)="align.set('left')"
            >
              Left
            </button>
            <button
              gui-button
              toggle
              variant="outlined"
              size="md"
              [selected]="align() === 'center'"
              (click)="align.set('center')"
            >
              Center
            </button>
            <button
              gui-button
              toggle
              variant="outlined"
              size="md"
              [selected]="align() === 'right'"
              (click)="align.set('right')"
            >
              Right
            </button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SELECTION: multi-select (aria-multiselectable) -->
      <app-demo-block
        heading="Multi-select"
        hint="selection=multi → aria-multiselectable=true · each toggle button is independent"
        [column]="true"
        [code]="codeMultiSelect"
      >
        <app-demo-specimen label="connected · multi">
          <gui-button-group connected selection="multi">
            <button gui-button toggle variant="tonal" size="md" [(selected)]="bold">
              Bold
            </button>
            <button gui-button toggle variant="tonal" size="md" [(selected)]="italic">
              Italic
            </button>
            <button gui-button toggle variant="tonal" size="md" [(selected)]="underline">
              Underline
            </button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="icon buttons · multi">
          <gui-button-group connected selection="multi">
            <button
              gui-icon-button
              toggle
              variant="tonal"
              size="md"
              label="Mute"
              [(selected)]="mute"
            >
              <gui-icon class="sym">volume_off</gui-icon>
            </button>
            <button
              gui-icon-button
              toggle
              variant="tonal"
              size="md"
              label="Star"
              [(selected)]="star"
            >
              <gui-icon class="sym">star</gui-icon>
            </button>
            <button
              gui-icon-button
              toggle
              variant="tonal"
              size="md"
              label="Bookmark"
              [(selected)]="bookmark"
            >
              <gui-icon class="sym">bookmark</gui-icon>
            </button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>

      <!-- STATES: selected (static), disabled child, fully disabled group -->
      <app-demo-block
        heading="States"
        hint="Selected, disabled child, and a fully disabled group (state lives on the children)"
        [column]="true"
        [code]="codeStates"
      >
        <app-demo-specimen label="selected">
          <gui-button-group connected selection="single">
            <button gui-button toggle variant="tonal" size="md">Off</button>
            <button gui-button toggle variant="tonal" size="md" [selected]="true">On</button>
            <button gui-button toggle variant="tonal" size="md">Off</button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="disabled child">
          <gui-button-group connected>
            <button gui-button variant="outlined" size="md">Enabled</button>
            <button gui-button variant="outlined" size="md" disabled>Disabled</button>
            <button gui-button variant="outlined" size="md">Enabled</button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="all disabled">
          <gui-button-group connected>
            <button gui-button variant="tonal" size="md" disabled>One</button>
            <button gui-button variant="tonal" size="md" disabled>Two</button>
            <button gui-button variant="tonal" size="md" disabled>Three</button>
          </gui-button-group>
        </app-demo-specimen>

        <app-demo-specimen label="disabled + selected">
          <gui-button-group connected selection="single">
            <button gui-button toggle variant="tonal" size="md" disabled>Off</button>
            <button gui-button toggle variant="tonal" size="md" disabled [selected]="true">On</button>
            <button gui-button toggle variant="tonal" size="md" disabled>Off</button>
          </gui-button-group>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class ButtonGroupDemo {
  /** All M3 Expressive sizes the group supports. */
  protected readonly sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  // Single-select demos.
  protected readonly view = signal<'list' | 'grid' | 'feed'>('grid');
  protected readonly align = signal<'left' | 'center' | 'right'>('left');

  // Multi-select (label) demo.
  protected readonly bold = signal(true);
  protected readonly italic = signal(false);
  protected readonly underline = signal(false);

  // Multi-select (icon) demo.
  protected readonly mute = signal(false);
  protected readonly star = signal(true);
  protected readonly bookmark = signal(false);

  protected readonly codeVariants = `
<gui-button-group>
  <button gui-button variant="outlined" size="md">One</button>
  <button gui-button variant="outlined" size="md">Two</button>
</gui-button-group>
<gui-button-group connected>
  <button gui-button variant="outlined" size="md">One</button>
  <button gui-button variant="outlined" size="md">Two</button>
</gui-button-group>`;

  protected readonly codeSizesStandard = `
<gui-button-group size="md">
  <button gui-button variant="tonal" size="md">Reply</button>
  <button gui-button variant="tonal" size="md">Forward</button>
  <button gui-button variant="tonal" size="md">Archive</button>
</gui-button-group>`;

  protected readonly codeSizesConnected = `
<gui-button-group connected size="md">
  <button gui-button variant="outlined" size="md">Day</button>
  <button gui-button variant="outlined" size="md">Week</button>
  <button gui-button variant="outlined" size="md">Month</button>
</gui-button-group>`;

  protected readonly codeShapes = `
<gui-button-group connected shape="round" size="md">
  <button gui-button variant="tonal" size="md">A</button>
  <button gui-button variant="tonal" size="md">B</button>
</gui-button-group>
<gui-button-group connected shape="square" size="md">
  <button gui-button variant="tonal" size="md">A</button>
  <button gui-button variant="tonal" size="md">B</button>
</gui-button-group>`;

  protected readonly codeColors = `
<gui-button-group connected>
  <button gui-button variant="filled" size="md">Bold</button>
  <button gui-button variant="filled" size="md">Italic</button>
  <button gui-button variant="filled" size="md">Underline</button>
</gui-button-group>`;

  protected readonly codeLayouts = `
<gui-button-group connected>
  <button gui-button variant="tonal" size="md">
    <gui-icon guiIcon class="sym">edit</gui-icon>
    Edit
  </button>
  <button gui-icon-button variant="tonal" size="md" label="Favorite">
    <gui-icon class="sym">favorite</gui-icon>
  </button>
</gui-button-group>`;

  protected readonly codeSingleSelect = `
<gui-button-group connected selection="single">
  <button gui-button toggle variant="tonal" size="md"
    [selected]="view() === 'list'" (click)="view.set('list')">
    List
  </button>
  <button gui-button toggle variant="tonal" size="md"
    [selected]="view() === 'grid'" (click)="view.set('grid')">
    Grid
  </button>
</gui-button-group>`;

  protected readonly codeMultiSelect = `
<gui-button-group connected selection="multi">
  <button gui-button toggle variant="tonal" size="md" [(selected)]="bold">
    Bold
  </button>
  <button gui-button toggle variant="tonal" size="md" [(selected)]="italic">
    Italic
  </button>
</gui-button-group>`;

  protected readonly codeStates = `
<gui-button-group connected>
  <button gui-button variant="outlined" size="md">Enabled</button>
  <button gui-button variant="outlined" size="md" disabled>Disabled</button>
  <button gui-button variant="outlined" size="md">Enabled</button>
</gui-button-group>`;
}
