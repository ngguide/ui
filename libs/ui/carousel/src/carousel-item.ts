import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';

/**
 * A single M3 carousel item. Its width is assigned by the parent
 * {@link GuiCarousel}'s keyline engine; when unset (SSR / full-screen) it falls
 * back to the inherited large width from CSS. Corner is `extra-large` (28dp).
 */
@Component({
  selector: 'gui-carousel-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './carousel-item.css',
  host: {
    class: 'gui-carousel-item',
    '[style.width.px]': 'width()',
  },
})
export class GuiCarouselItem {
  /** Width in px assigned by the engine, or `null` to use the CSS default. */
  readonly width = signal<number | null>(null);
}
