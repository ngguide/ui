import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { GUI_CAROUSEL } from './carousel-context';

/**
 * A single M3 carousel item. Its geometry (width, placement, content mask) is
 * assigned by the parent {@link GuiCarousel}'s keyline engine; when unset
 * (SSR / first frame) it falls back to the inherited large width from CSS, so
 * there is no hydration layout shift. Corner is `extra-large` (28dp); pressing
 * morphs the shape slightly (M3 "Touch").
 *
 * The item is the carousel's interactive unit (the spec keeps focus on items,
 * not the container): it is reachable by Tab and the arrow keys, carries the
 * APG "carousel item" slide semantics with an "Item N of M" label, and renders
 * the shared M3 interaction surface (state layer + pressed ripple + keyboard
 * focus ring). `disabled` models the M3 Disabled state — the item stays
 * focusable / discoverable but is not activatable.
 *
 * Content parallax: in the morphing layouts the projected content is laid out at
 * the *large* width and the frame is narrowed to the keyline width, so the frame
 * crops a centered window of the (full-size) content. As the frame shrinks the
 * content is cropped equally on both sides — it moves at a different speed than
 * the frame and is never shifted out of view.
 */
@Component({
  selector: 'gui-carousel-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="gui-carousel-item-content"><ng-content /></span>`,
  styleUrl: './carousel-item.css',
  hostDirectives: [
    GuiFocusRingDirective,
    { directive: GuiStateLayerDirective, inputs: ['disabled'] },
    { directive: GuiRippleDirective, inputs: ['disabled'] },
  ],
  host: {
    class: 'gui-carousel-item',
    role: 'group',
    'aria-roledescription': 'carousel item',
    // Geometry from the engine. `width`/`placeX` null => CSS fallback (SSR).
    '[style.width.px]': 'width()',
    '[style.position]': "placeX() !== null ? 'absolute' : null",
    '[style.left.px]': 'placeX()',
    '[style.top]': "placeX() !== null ? '0' : null",
    '[style.visibility]': "hidden() ? 'hidden' : null",
    // Content-mask vars: the content is laid out at `contentWidth` (large) and
    // shifted by `maskInset` so the narrowed frame crops it symmetrically.
    '[style.--gui-carousel-content-width.px]': 'contentWidth()',
    '[style.--gui-carousel-mask-inset.px]': 'maskInset()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    // Tab AND the arrow keys navigate items (M3 keyboard contract), so every
    // item is in the tab order; disabled items stay focusable (discoverable).
    tabindex: '0',
    '[attr.data-disabled]': 'disabled() ? "" : null',
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onActivate()',
    '(keydown.space)': 'onActivate()',
  },
})
export class GuiCarouselItem {
  /** Disabled items stay focusable (discoverable) but are not activatable. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly carousel = inject(GUI_CAROUSEL, { optional: true });

  /** Rendered main-axis size (px), or `null` to use the CSS default. */
  readonly width = signal<number | null>(null);
  /** Absolute left placement (px) in morphing layouts, or `null` for flow. */
  readonly placeX = signal<number | null>(null);
  /** Width (px) the content is laid out at (the large size) for the mask. */
  readonly contentWidth = signal<number | null>(null);
  /** Symmetric content crop (px) each side — the M3 parallax. */
  readonly maskInset = signal(0);
  /** Whether the item is fully outside the viewport (visually hidden). */
  readonly hidden = signal(false);

  /** 1-based position and total, set by the carousel for assistive tech. */
  private readonly positionState = signal<number | null>(null);
  private readonly setSizeState = signal<number | null>(null);

  /** "Item N of M" — read out so the user knows where they are in the set. */
  protected readonly ariaLabel = computed(() => {
    const pos = this.positionState();
    const size = this.setSizeState();
    return pos != null && size != null ? `Item ${pos} of ${size}` : null;
  });

  /** Move DOM focus to this item (arrow / Tab navigation). */
  focus(): void {
    this.host.nativeElement.focus();
  }

  /** The item's host element — used by the carousel to scroll it into focus. */
  get element(): HTMLElement {
    return this.host.nativeElement;
  }

  /** Type-ahead / readout label is the visible text. */
  getLabel(): string {
    return this.host.nativeElement.textContent?.trim() ?? '';
  }

  /** Called by the carousel to publish this item's 1-based position / total. */
  setPosition(position: number, total: number): void {
    this.positionState.set(position);
    this.setSizeState.set(total);
  }

  protected onActivate(): void {
    if (this.disabled()) {
      return;
    }
    this.carousel?.activate(this);
  }
}
