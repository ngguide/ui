import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { GuiCarousel, GuiCarouselItem } from '@ngguide/ui/carousel';
import { IconComponent } from '@ngguide/ui/icon';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Exhaustive vitrine demo for the M3 carousel (`@ngguide/ui/carousel`).
 *
 * Covers every dimension the implemented component supports:
 * - Layouts (M3 "Six layouts"): multi-browse, uncontained, uncontained
 *   multi-aspect ratio, hero, center-aligned hero, and full-screen — driven by
 *   the `layout` input.
 * - Alignment: start-aligned vs center-aligned (the `alignment` input; the hero
 *   family honors it, full-screen is always centered).
 * - Sizing: the focal/large keyline width is tuned via `preferredLargeWidth`,
 *   and inter-item gap via `itemSpacing`; the keyline engine derives the
 *   medium/small widths from the large width.
 * - Shape: every item uses the M3 28dp extra-large corner; tapping morphs it.
 * - States: enabled items (hover / focus / pressed ripple via the shared
 *   interaction surface) and per-item `disabled` (kept focusable but inert).
 * - Activation: items are the interactive unit — clicking / Space / Enter emits
 *   the `activated` output, surfaced live below the gallery.
 *
 * Each item projects a colored "image" tile plus a label, the M3 carousel item
 * anatomy (visual + optional label text). Colors are `--md-sys-*` tokens so the
 * specimens re-theme with the shell. No clock / RNG anywhere (SSR-safe).
 */
@Component({
  selector: 'app-demo-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    GuiCarousel,
    GuiCarouselItem,
    IconComponent,
    ButtonComponent,
  ],
  template: `
    <app-demo-component
      name="Carousel"
      entry="@ngguide/ui/carousel"
      docHref="https://m3.material.io/components/carousel"
    >
      <!-- LAYOUTS: the six M3 carousel layouts. Each is start-aligned and shows
           the same set of item tiles so the keyline arrangement differences are
           visible. Scroll a carousel to see items morph between keylines. -->
      <app-demo-block
        heading="Layouts"
        hint="The six M3 layouts — scroll horizontally; items morph between keylines"
        [column]="true"
      >
        <app-demo-specimen label="multi-browse" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="uncontained" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="uncontained"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="uncontained multi-aspect ratio" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="uncontained-multi-aspect"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="hero" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="hero"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="center-aligned hero" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="center-aligned-hero"
            alignment="center"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="full-screen (always centered)" class="fill">
          <gui-carousel
            class="demo-carousel demo-carousel--fullscreen"
            layout="full-screen"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile tile--full" [style.background]="item.color">
                  <span class="tile-label">{{ item.label }}</span>
                </span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ALIGNMENT: start vs center for the hero layout (the alignment input
           only changes the hero family; full-screen forces center). -->
      <app-demo-block
        heading="Alignment"
        hint="start-aligned vs center-aligned (hero layout)"
        [column]="true"
      >
        <app-demo-specimen label="hero · start" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="hero"
            alignment="start"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="hero · center" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="hero"
            alignment="center"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SIZES: the focal (large) keyline width is set via preferredLargeWidth;
           the engine derives medium = (large+small)/2 and small = clamp(large/3,
           40, 56). itemSpacing controls the gap between items. -->
      <app-demo-block
        heading="Sizes"
        hint="preferredLargeWidth tunes the focal item; the engine derives medium/small widths"
        [column]="true"
      >
        <app-demo-specimen label="preferredLargeWidth 120" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            [preferredLargeWidth]="120"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="preferredLargeWidth 186 (default)" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            [preferredLargeWidth]="186"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="preferredLargeWidth 260" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            [preferredLargeWidth]="260"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="itemSpacing 24" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            [itemSpacing]="24"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>
      </app-demo-block>

      <!-- SHAPE: every carousel item carries the M3 28dp extra-large corner;
           tapping morphs the shape slightly (pressed). -->
      <app-demo-block
        heading="Shape"
        hint="Items use the M3 28dp extra-large corner; pressing morphs the shape"
        [column]="true"
      >
        <app-demo-specimen label="extra-large corner (28dp)" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>
      </app-demo-block>

      <!-- STATES: enabled items respond to hover / focus / press (the shared
           interaction surface). A disabled item stays focusable / discoverable
           but does not activate or show feedback. Items also carry optional
           label text + a leading icon as the M3 item anatomy. -->
      <app-demo-block
        heading="States"
        hint="Enabled (hover/focus/press) and disabled (focusable but inert)"
        [column]="true"
      >
        <app-demo-specimen label="enabled · with label + leading icon" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color">
                  <gui-icon class="sym tile-icon">image</gui-icon>
                </span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>

        <app-demo-specimen label="disabled item (2nd, focusable but inert)" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id; let i = $index) {
              <gui-carousel-item [disabled]="i === 1">
                <span class="tile" [style.background]="item.color">
                  @if (i === 1) {
                    <gui-icon class="sym tile-icon">block</gui-icon>
                  }
                </span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ACTIVATION: items are the interactive unit; click / Space / Enter
           emits the carousel activated output. -->
      <app-demo-block
        heading="Activation"
        hint="Items emit the activated output on click / Space / Enter"
        [column]="true"
      >
        <app-demo-specimen label="last activated" class="fill">
          <p class="activation-readout">
            @if (lastActivated()) {
              Activated: <strong>{{ lastActivated() }}</strong>
            } @else {
              Click or press Space/Enter on an item above to activate it.
            }
          </p>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ACCESSIBILITY: on vertically-scrolling pages M3 recommends a "Show
           all" affordance BELOW the carousel (not inside it) that opens a
           dedicated vertically-scrolling view of every item. This lives in the
           app, not the carousel component (M3: keep buttons out of the
           container). -->
      <app-demo-block
        heading="Show all (accessibility)"
        hint="M3 recommends a 'Show all' control below the carousel to view every item without horizontal scrolling"
        [column]="true"
      >
        <app-demo-specimen label="carousel + Show all" class="fill">
          <gui-carousel
            class="demo-carousel"
            layout="multi-browse"
            (activated)="onActivate($event)"
          >
            @for (item of items; track item.id) {
              <gui-carousel-item>
                <span class="tile" [style.background]="item.color"></span>
                <span class="caption">{{ item.label }}</span>
              </gui-carousel-item>
            }
          </gui-carousel>
          <div class="show-all-row">
            <button gui-button variant="text" size="sm" (click)="toggleShowAll()">
              {{ showAll() ? 'Hide all' : 'Show all' }}
            </button>
          </div>
          @if (showAll()) {
            <ul class="show-all-grid">
              @for (item of items; track item.id) {
                <li class="show-all-cell">
                  <span class="tile" [style.background]="item.color"></span>
                  <span class="caption">{{ item.label }}</span>
                </li>
              }
            </ul>
          }
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
  styles: `
    .demo-carousel {
      width: 100%;
    }
    .demo-carousel--fullscreen {
      height: 220px;
    }
    .tile {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 140px;
      border-radius: var(--md-sys-shape-corner-extra-large, 28px);
      color: var(--md-sys-color-on-primary-container, #21005d);
    }
    .tile--full {
      height: 100%;
      border-radius: 0;
    }
    .tile-icon {
      font-size: 32px;
      opacity: 0.7;
    }
    .tile-label {
      font-family: var(--md-sys-typescale-title-medium-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-title-medium-size, 1rem);
      color: #fff;
    }
    .caption {
      display: block;
      margin-top: 0.375rem;
      color: var(--md-sys-color-on-surface-variant, #49454e);
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    }
    .activation-readout {
      margin: 0;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }
    .show-all-row {
      display: flex;
      justify-content: flex-end;
      /* M3: the Show all button has 4dp of padding. */
      padding: 4px;
    }
    .show-all-grid {
      list-style: none;
      margin: 0.5rem 0 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
      gap: 0.75rem;
    }
    .show-all-cell {
      margin: 0;
    }
  `,
})
export class CarouselDemo {
  /** Seeded tiles (deterministic — no RNG): label + token-derived color. */
  protected readonly items = [
    { id: 1, label: 'River', color: 'var(--md-sys-color-primary-container, #eaddff)' },
    { id: 2, label: 'Forest', color: 'var(--md-sys-color-secondary-container, #e8def8)' },
    { id: 3, label: 'Coast', color: 'var(--md-sys-color-tertiary-container, #ffd8e4)' },
    { id: 4, label: 'Desert', color: 'var(--md-sys-color-primary-container, #eaddff)' },
    { id: 5, label: 'Canyon', color: 'var(--md-sys-color-secondary-container, #e8def8)' },
    { id: 6, label: 'Glacier', color: 'var(--md-sys-color-tertiary-container, #ffd8e4)' },
    { id: 7, label: 'Valley', color: 'var(--md-sys-color-primary-container, #eaddff)' },
    { id: 8, label: 'Lagoon', color: 'var(--md-sys-color-secondary-container, #e8def8)' },
  ];

  /** Label of the most recently activated item (via the `activated` output). */
  protected readonly lastActivated = signal<string | null>(null);

  /** Whether the "Show all" accessibility view (vertical list) is expanded. */
  protected readonly showAll = signal(false);

  protected toggleShowAll(): void {
    this.showAll.update((open) => !open);
  }

  protected onActivate(item: GuiCarouselItem): void {
    // `getLabel()` is the item's visible text (the M3 type-ahead label). It may
    // also include any leading icon's ligature text, so match the first known
    // item label out of it; fall back to the raw label, then a generic string.
    const raw = item.getLabel();
    const known = this.items.find((i) => raw.includes(i.label))?.label;
    this.lastActivated.set(known ?? raw.trim() ?? 'item');
  }
}
