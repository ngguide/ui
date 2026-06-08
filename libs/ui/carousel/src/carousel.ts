import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
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
import { GuiBreakpoint } from '@ngguide/ui/overlay';
import { GuiReducedMotion } from '@ngguide/ui/interaction';
import {
  buildStrategy,
  GuiCarouselAlignment,
  GuiCarouselLayout,
  placeItems,
} from './carousel-keylines';
import { GuiCarouselItem } from './carousel-item';
import { GUI_CAROUSEL, GuiCarouselContext } from './carousel-context';

/** Layouts that use the per-scroll keyline size morph (vs uniform flow). */
const MORPH_LAYOUTS: ReadonlySet<GuiCarouselLayout> = new Set([
  'multi-browse',
  'hero',
  'center-aligned-hero',
]);

/**
 * M3 carousel — a horizontally (or, full-screen on compact, vertically)
 * scrolling run of items sized by the keyline engine (Req 11), a faithful port
 * of the Compose Material 3 keyline-strategy model.
 *
 * The morphing layouts (multi-browse / hero / center-aligned hero) render the
 * items on a `position: sticky` "stage" pinned over a native scroll spacer: the
 * native scroller supplies momentum, snapping and accessibility, while the stage
 * positions and sizes each item from the keyline engine + the live scroll
 * offset. Sizing the stage items never changes the scroll spacer, so there is no
 * feedback loop. Uncontained / full-screen use a plain native flow (uniform
 * size, clipped at the edge). Under reduced motion every layout falls back to a
 * uniform flow with no morph or parallax (Req 11.6, 15). On the server / first
 * frame items fall back to the large width via CSS, so hydration does not shift.
 *
 * Items — not the container — are the interactive units: every item is reachable
 * by Tab and the arrow keys (M3 keyboard contract), up/down arrows leave the
 * carousel, and each item publishes its position/total ("Item N of M") for
 * assistive tech.
 */
@Component({
  selector: 'gui-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gui-carousel-viewport" #viewport (scroll)="onScroll()">
      <div class="gui-carousel-extent" [style.width.px]="extent() || null">
        @if (mode() === 'morph') {
          @for (snap of snapOffsets(); track $index) {
            <i class="gui-carousel-snap" [style.left.px]="snap"></i>
          }
        }
        <div class="gui-carousel-stage" #stage><ng-content /></div>
      </div>
    </div>
  `,
  styleUrl: './carousel.css',
  host: {
    class: 'gui-carousel',
    role: 'group',
    'aria-roledescription': 'carousel',
    '[attr.data-layout]': 'effectiveLayout()',
    '[attr.data-alignment]': 'effectiveAlignment()',
    '[attr.data-orientation]': 'vertical() ? "vertical" : "horizontal"',
    '[attr.data-mode]': 'mode()',
    '[style.--gui-carousel-large.px]': 'preferredLargeWidth()',
    '[style.--gui-carousel-gap.px]': 'itemSpacing()',
    '[style.--gui-carousel-height.px]': 'heightPx() || null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [
    { provide: GUI_CAROUSEL, useExisting: forwardRef(() => GuiCarousel) },
  ],
})
export class GuiCarousel implements GuiCarouselContext {
  private readonly breakpoint = inject(GuiBreakpoint);
  private readonly reducedMotion = inject(GuiReducedMotion);

  readonly layout = input<GuiCarouselLayout>('multi-browse');
  readonly alignment = input<GuiCarouselAlignment>('start');
  readonly preferredLargeWidth = input(186, { transform: numberAttribute });
  readonly itemSpacing = input(8, { transform: numberAttribute });

  /** Emits the activated item (click / Space / Enter on an enabled item). */
  readonly activated = output<GuiCarouselItem>();

  private readonly viewport =
    viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly items = contentChildren(GuiCarouselItem);

  /** Last measured viewport main-axis size (px); 0 until first measure / SSR. */
  private readonly viewportSize = signal(0);
  /** Live scroll offset (px) read from the native scroller. */
  private readonly scrollOffset = signal(0);
  /** Measured stage height (px) — reserves space for the absolute items. */
  protected readonly heightPx = signal(0);

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

  /**
   * Render mode: `morph` runs the keyline size morph on a sticky stage; `flow`
   * lays items out uniformly in the native scroller. Reduced motion forces flow
   * (items no longer expand; same size — Req 15).
   */
  protected readonly mode = computed<'morph' | 'flow'>(() =>
    MORPH_LAYOUTS.has(this.layout()) &&
    !this.reducedMotion.prefersReducedMotion()
      ? 'morph'
      : 'flow',
  );

  /** Leading / trailing inline padding (px) per layout (M3 measurements). */
  private readonly padding = computed<{ leading: number; trailing: number }>(
    () => {
      switch (this.layout()) {
        case 'full-screen':
          return { leading: 0, trailing: 0 };
        case 'uncontained':
        case 'uncontained-multi-aspect':
          return { leading: 16, trailing: 0 };
        default:
          return { leading: 16, trailing: 16 };
      }
    },
  );

  /** Keyline strategy derived purely from the inputs + measured width. */
  private readonly strategy = computed(() =>
    buildStrategy(this.effectiveLayout(), this.viewportSize(), {
      preferredLargeWidth: this.preferredLargeWidth(),
      itemSpacing: this.itemSpacing(),
      itemCount: this.items().length,
      alignment: this.effectiveAlignment(),
      leadingPadding: this.padding().leading,
      trailingPadding: this.padding().trailing,
    }),
  );

  /** Native scroll extent (px) the spacer exposes in morph mode. */
  protected readonly extent = computed(() =>
    this.mode() === 'morph' ? Math.round(this.strategy().contentExtent) : 0,
  );

  /** Per-item snap offsets (px) — markers in the scroll spacer. */
  protected readonly snapOffsets = computed(() =>
    this.mode() === 'morph' ? this.strategy().snapOffsets : [],
  );

  constructor() {
    afterNextRender(() => {
      const el = this.viewport().nativeElement;
      const measure = (box?: { width: number; height: number }) => {
        const horizontal = !this.vertical();
        const size = horizontal
          ? (box?.width ?? el.clientWidth)
          : (box?.height ?? el.clientHeight);
        // Never clobber a good measurement with a pre-layout 0.
        if (size > 0) {
          this.viewportSize.set(Math.round(size));
        }
        this.measureHeight();
      };
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver((entries) =>
          measure(entries[0]?.contentRect),
        );
        observer.observe(el);
      }
      measure();
      // The viewport may not be laid out on the first synchronous read; pick the
      // size up on the next frame as a fallback to the ResizeObserver.
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => measure());
      }
      this.publishPositions();
    });

    // Re-place items whenever the strategy, scroll offset, mode or item set
    // change. Pure signal reads — runs zonelessly.
    effect(() => {
      this.strategy();
      this.scrollOffset();
      this.mode();
      this.items();
      this.applyPlacements();
    });

    // Re-publish positions when the projected item set changes.
    effect(() => {
      this.items();
      this.publishPositions();
    });
  }

  /** Test / imperative hook: set the measured viewport main-axis size. */
  protected measure(viewportSize: number): void {
    this.viewportSize.set(viewportSize);
  }

  /** {@link GuiCarouselContext}: activate an item (click / Space / Enter). */
  activate(item: GuiCarouselItem): void {
    if (item.disabled()) {
      return;
    }
    this.activated.emit(item);
  }

  protected onScroll(): void {
    const el = this.viewport().nativeElement;
    this.scrollOffset.set(this.vertical() ? el.scrollTop : el.scrollLeft);
  }

  /**
   * Keyboard navigation (M3): Left/Right (and Home/End) move focus between items
   * and scroll the target onto the focal keyline; Up/Down are left to the
   * browser so they *leave* the carousel; Space/Enter activate (handled per
   * item). Tab also walks items (every item is in the tab order).
   */
  protected onKeydown(event: KeyboardEvent): void {
    const items = this.items();
    if (items.length === 0) {
      return;
    }
    const current = items.findIndex(
      (it) => it.element === (event.target as HTMLElement),
    );
    if (current < 0) {
      return;
    }
    let next = current;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        // Down only navigates inside a vertical (full-screen) carousel; in a
        // horizontal carousel it is left to the browser to leave the carousel.
        if (event.key === 'ArrowDown' && !this.vertical()) {
          return;
        }
        next = Math.min(items.length - 1, current + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        if (event.key === 'ArrowUp' && !this.vertical()) {
          return;
        }
        next = Math.max(0, current - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.focusItem(next);
  }

  private focusItem(index: number): void {
    const items = this.items();
    const item = items[index];
    if (!item) {
      return;
    }
    item.focus();
    // Bring the focused item onto the focal keyline.
    const el = this.viewport().nativeElement;
    const offset = this.strategy().snapOffsets[index];
    if (offset != null && this.mode() === 'morph' && typeof el.scrollTo === 'function') {
      el.scrollTo({ left: offset, behavior: 'smooth' });
    } else if (typeof item.element.scrollIntoView === 'function') {
      item.element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /** Publish each item's 1-based position and the total for assistive tech. */
  private publishPositions(): void {
    const items = this.items();
    const total = items.length;
    items.forEach((item, index) => item.setPosition(index + 1, total));
  }

  /** Reserve host height from the tallest item (absolute items have no flow). */
  private measureHeight(): void {
    const items = this.items();
    let max = 0;
    for (const item of items) {
      max = Math.max(max, item.element.offsetHeight);
    }
    if (max > 0) {
      this.heightPx.set(max);
    }
  }

  /** Assign every item its geometry (size / placement / mask) from the engine. */
  private applyPlacements(): void {
    const items = this.items();
    const mode = this.mode();

    if (mode === 'flow') {
      const layout = this.effectiveLayout();
      // Full-screen fills the viewport (CSS drives width/height): width stays
      // null. Uncontained / reduced-motion lay out a uniform large width.
      const uniform =
        layout === 'full-screen'
          ? null
          : Math.min(this.preferredLargeWidth(), this.viewportSize() || Infinity);
      for (const item of items) {
        item.placeX.set(null);
        item.hidden.set(false);
        item.width.set(uniform != null && isFinite(uniform) ? uniform : null);
        item.contentWidth.set(uniform != null && isFinite(uniform) ? uniform : null);
        item.maskInset.set(0);
      }
      return;
    }

    const strategy = this.strategy();
    if (strategy.large <= 0) {
      return;
    }
    const placements = placeItems(
      strategy,
      this.scrollOffset(),
      this.viewportSize(),
    );
    items.forEach((item, index) => {
      const p = placements[index];
      if (!p) {
        return;
      }
      item.width.set(p.size);
      item.placeX.set(p.center - p.size / 2);
      item.contentWidth.set(strategy.large);
      item.maskInset.set(p.maskInset);
      item.hidden.set(p.offscreen);
    });
  }
}
