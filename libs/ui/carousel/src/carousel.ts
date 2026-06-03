import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { GuiBreakpoint } from '@ngguide/ui/overlay';
import { GuiReducedMotion } from '@ngguide/ui/interaction';
import {
  GuiCarouselLayout,
  arrange,
  maskForOffset,
} from './carousel-keylines';
import { GuiCarouselItem } from './carousel-item';

/**
 * M3 carousel — a horizontally (or, full-screen on compact, vertically)
 * scrolling row of items sized by the keyline engine (Req 11). Native scroll +
 * `scroll-snap` provide momentum and snapping; a `ResizeObserver` tracks the
 * viewport and a scroll listener morphs item widths between keylines. Under
 * reduced motion the per-scroll morph is disabled — items render at their
 * arranged sizes (Req 11.6, 15). On the server / first frame items fall back to
 * the large width via CSS, so there is no layout shift on hydration.
 */
@Component({
  selector: 'gui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gui-carousel-track" #track><ng-content /></div>`,
  styleUrl: './carousel.css',
  host: {
    class: 'gui-carousel',
    role: 'group',
    'aria-roledescription': 'carousel',
    '[attr.data-layout]': 'effectiveLayout()',
    '[attr.data-orientation]': 'vertical() ? "vertical" : "horizontal"',
    '[style.--gui-carousel-large.px]': 'preferredLargeWidth()',
  },
})
export class GuiCarousel {
  private readonly breakpoint = inject(GuiBreakpoint);
  private readonly reducedMotion = inject(GuiReducedMotion);

  readonly layout = input<GuiCarouselLayout>('multi-browse');
  readonly preferredLargeWidth = input(186, { transform: numberAttribute });
  readonly itemSpacing = input(8, { transform: numberAttribute });

  private readonly track =
    viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly items = contentChildren(GuiCarouselItem);

  /** Last measured viewport width (px); 0 until the first measurement / on SSR. */
  private readonly viewportWidth = signal(0);

  /**
   * The full-screen layout switches to a vertical orientation in the compact
   * window class (Req 11.6); other layouts stay horizontal.
   */
  readonly vertical = computed(
    () => this.layout() === 'full-screen' && this.breakpoint.isCompact(),
  );
  readonly effectiveLayout = computed(() => this.layout());

  /** Keyline arrangement derived purely from the inputs + measured width. */
  private readonly arrangement = computed(() =>
    arrange(this.effectiveLayout(), this.viewportWidth(), {
      preferredLargeWidth: this.preferredLargeWidth(),
      itemSpacing: this.itemSpacing(),
      itemCount: this.items().length,
    }),
  );

  constructor() {
    afterNextRender(() => {
      const el = this.track().nativeElement;
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver((entries) => {
          this.viewportWidth.set(
            entries[0]?.contentRect.width ?? el.clientWidth,
          );
        });
        observer.observe(el);
      }
      el.addEventListener('scroll', () => this.applyWidths(), { passive: true });
      this.viewportWidth.set(el.clientWidth);
    });

    // Re-apply item widths whenever the arrangement or motion preference change.
    effect(() => {
      this.arrangement();
      this.reducedMotion.prefersReducedMotion();
      this.applyWidths();
    });
  }

  /** Test/IMPERATIVE hook: set the measured viewport width. */
  protected measure(viewportWidth: number): void {
    this.viewportWidth.set(viewportWidth);
  }

  /** Assign each item its width from the current arrangement. */
  private applyWidths(): void {
    const arr = this.arrangement();
    const items = this.items();

    // Full-screen items fill the viewport — let CSS drive (width stays null).
    if (this.effectiveLayout() === 'full-screen' || arr.large <= 0) {
      for (const item of items) {
        item.width.set(null);
      }
      return;
    }

    // Uncontained lays out items of a *uniform* width; native scroll + the
    // container's overflow clip the trailing item. There is no per-scroll
    // keyline morph here (that is the multi-browse/hero behavior) — every item
    // renders at the large width (Req 11.2).
    if (this.effectiveLayout() === 'uncontained') {
      for (const item of items) {
        item.width.set(arr.large);
      }
      return;
    }

    const reduced = this.reducedMotion.prefersReducedMotion();
    const scrollOffset = reduced ? 0 : this.track().nativeElement.scrollLeft;

    items.forEach((item, index) => {
      if (reduced) {
        // Static arranged sizes — focal large, then medium, then small.
        let width = arr.small || arr.large;
        if (index < arr.largeCount) {
          width = arr.large;
        } else if (index < arr.largeCount + arr.mediumCount) {
          width = arr.medium || arr.large;
        }
        item.width.set(width);
      } else {
        item.width.set(maskForOffset(arr, scrollOffset, index).width);
      }
    });
  }
}
