import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { GuiBreakpoint } from '@ngguide/ui/overlay';
import {
  FocusKeyManager,
  FocusableOption,
  GuiReducedMotion,
  createRovingFocus,
} from '@ngguide/ui/interaction';
import {
  GuiCarouselAlignment,
  GuiCarouselLayout,
  arrange,
  maskForOffset,
} from './carousel-keylines';
import { GuiCarouselItem } from './carousel-item';
import { GUI_CAROUSEL, GuiCarouselContext } from './carousel-context';

/**
 * M3 carousel — a horizontally (or, full-screen on compact, vertically)
 * scrolling row of items sized by the keyline engine (Req 11). Native scroll +
 * `scroll-snap` provide momentum and snapping; a `ResizeObserver` tracks the
 * viewport and a scroll listener morphs item widths between keylines and drives
 * the content parallax. Under reduced motion the per-scroll morph and parallax
 * are disabled and every item renders at the same (large) width (Req 11.6, 15).
 * On the server / first frame items fall back to the large width via CSS, so
 * there is no layout shift on hydration.
 *
 * Items — not the container — are the interactive units (the spec keeps focus
 * on items and avoids focusing the container): the carousel runs a single roving
 * tab stop over them (Tab/Arrows to move, Space/Enter to activate), seeds the
 * first item as the initial tab stop, and publishes each item's position/total
 * for assistive tech.
 */
@Component({
  selector: 'gui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gui-carousel-track" #track><ng-content /></div>`,
  styleUrl: './carousel.css',
  host: {
    class: 'gui-carousel',
    // The carousel container role (no literal ARIA "container" role exists; the
    // M3 "container" maps to a labelled group described as a carousel).
    role: 'group',
    'aria-roledescription': 'carousel',
    '[attr.data-layout]': 'effectiveLayout()',
    '[attr.data-alignment]': 'effectiveAlignment()',
    '[attr.data-orientation]': 'vertical() ? "vertical" : "horizontal"',
    '[style.--gui-carousel-large.px]': 'preferredLargeWidth()',
    '[style.--gui-carousel-gap.px]': 'itemSpacing()',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [
    { provide: GUI_CAROUSEL, useExisting: forwardRef(() => GuiCarousel) },
  ],
})
export class GuiCarousel implements GuiCarouselContext {
  private readonly breakpoint = inject(GuiBreakpoint);
  private readonly reducedMotion = inject(GuiReducedMotion);
  private readonly destroyRef = inject(DestroyRef);

  readonly layout = input<GuiCarouselLayout>('multi-browse');
  readonly alignment = input<GuiCarouselAlignment>('start');
  readonly preferredLargeWidth = input(186, { transform: numberAttribute });
  readonly itemSpacing = input(8, { transform: numberAttribute });

  /** Emits the activated item (click / Space / Enter on an enabled item). */
  readonly activated = output<GuiCarouselItem>();

  private readonly track =
    viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly items = contentChildren(GuiCarouselItem);

  /** Last measured viewport width (px); 0 until the first measurement / on SSR. */
  private readonly viewportWidth = signal(0);

  // Typed over the CDK `FocusableOption`: `GuiCarouselItem` cannot be the type
  // argument directly because its `disabled` signal input collides with
  // `FocusableOption.disabled?: boolean` (same constraint as the list/chip set).
  private manager?: FocusKeyManager<FocusableOption>;
  private changeSub?: Subscription;

  /**
   * The full-screen layout switches to a vertical orientation in the compact
   * window class (Req 11.6); other layouts stay horizontal.
   */
  readonly vertical = computed(
    () => this.layout() === 'full-screen' && this.breakpoint.isCompact(),
  );
  readonly effectiveLayout = computed(() => this.layout());

  /** Full-screen is always centered; otherwise honor the `alignment` input. */
  readonly effectiveAlignment = computed<GuiCarouselAlignment>(() =>
    this.layout() === 'full-screen' ? 'center' : this.alignment(),
  );

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
      this.rebuildManager();
    });

    // Re-apply item widths whenever the arrangement or motion preference change.
    effect(() => {
      this.arrangement();
      this.reducedMotion.prefersReducedMotion();
      this.applyWidths();
    });

    // The roving manager is built over a static snapshot; rebuild + re-publish
    // positions when the projected items change.
    effect(() => {
      this.items();
      this.publishPositions();
      if (this.manager) {
        this.rebuildManager();
      }
    });
  }

  /** Test/IMPERATIVE hook: set the measured viewport width. */
  protected measure(viewportWidth: number): void {
    this.viewportWidth.set(viewportWidth);
  }

  /** {@link GuiCarouselContext}: activate an item (click / Space / Enter). */
  activate(item: GuiCarouselItem): void {
    if (item.disabled()) {
      return;
    }
    this.activated.emit(item);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Activation is handled per-item (keydown.enter/.space on the item); the
    // carousel only drives roving navigation (Tab/Arrows/Home/End).
    this.manager?.onKeydown(event);
  }

  /** Publish each item's 1-based position and the total for assistive tech. */
  private publishPositions(): void {
    const items = this.items();
    const total = items.length;
    items.forEach((item, index) => item.setPosition(index + 1, total));
  }

  private rebuildManager(): void {
    this.changeSub?.unsubscribe();
    const items = this.items();
    this.manager = createRovingFocus(
      // The `disabled` signal input collides with `FocusableOption.disabled`, so
      // widen through `unknown` before narrowing to the option type.
      items as readonly unknown[] as readonly FocusableOption[],
      // Items are laid out along the scroll axis; arrows + Tab move between them.
      { orientation: this.vertical() ? 'vertical' : 'horizontal' },
      // Disabled items stay reachable (M3 keeps them discoverable).
    ).skipPredicate(() => false);

    // Mirror the manager's active index onto each item so exactly one carries
    // the roving tab stop (tabindex=0); the rest are -1.
    const syncActive = (index: number | null) => {
      items.forEach((item, i) => item.setActive(i === index));
    };
    this.changeSub = this.manager.change
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(syncActive);

    // Set initial focus target on the first item (the initial tab stop) without
    // stealing focus, and avoid making the container itself a tab stop (spec).
    if (items.length > 0) {
      this.manager.updateActiveItem(0);
      syncActive(0);
    }
  }

  /** Assign each item its width (and parallax offset) from the arrangement. */
  private applyWidths(): void {
    const arr = this.arrangement();
    const items = this.items();

    // Full-screen items fill the viewport — let CSS drive (width stays null).
    if (this.effectiveLayout() === 'full-screen' || arr.large <= 0) {
      for (const item of items) {
        item.width.set(null);
        item.parallax.set(0);
      }
      return;
    }

    const reduced = this.reducedMotion.prefersReducedMotion();

    // Under reduced motion every item is the same size and there is no parallax
    // or per-scroll expansion (Req 15 / spec "Reduced motion: all items are the
    // same size"). The largest keyline (`large`) is used so visuals reach the
    // window edge without clipping.
    if (reduced) {
      for (const item of items) {
        item.width.set(arr.large);
        item.parallax.set(0);
      }
      return;
    }

    // Uncontained / multi-aspect lay out items of a *uniform* width; native
    // scroll + the container's overflow clip the trailing item. There is no
    // per-scroll keyline morph here (that is the multi-browse/hero behavior).
    if (
      this.effectiveLayout() === 'uncontained' ||
      this.effectiveLayout() === 'uncontained-multi-aspect'
    ) {
      for (const item of items) {
        item.width.set(arr.large);
        item.parallax.set(0);
      }
      return;
    }

    const scrollOffset = this.track().nativeElement.scrollLeft;

    items.forEach((item, index) => {
      const mask = maskForOffset(arr, scrollOffset, index);
      item.width.set(mask.width);
      // The content moves at a different speed than its (shrinking) frame: as an
      // item narrows by `2 * clipInset`, its content shifts by `clipInset`,
      // producing the M3 parallax. Focal items render at full width => 0 offset.
      item.parallax.set(mask.clipInset);
    });
  }
}
