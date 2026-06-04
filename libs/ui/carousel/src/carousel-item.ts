import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
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
 * A single M3 carousel item. Its width is assigned by the parent
 * {@link GuiCarousel}'s keyline engine; when unset (SSR / full-screen) it falls
 * back to the inherited large width from CSS. Corner is `extra-large` (28dp);
 * tapping morphs the shape slightly (Req 12 / spec "Touch").
 *
 * The item is the carousel's interactive unit (the spec keeps focus on items,
 * not the container): it is a {@link FocusableOption} reached through the
 * carousel's roving focus, carries `aria-posinset`/`aria-setsize` so assistive
 * tech reads "item N of M", and renders the shared M3 interaction surface
 * (state layer + pressed ripple + keyboard focus ring). `disabled` models the
 * M3 Disabled state and suppresses activation + feedback.
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
    '[style.width.px]': 'width()',
    // Parallax: the engine feeds a content offset (px) the content layer
    // translates by, so it moves at a different speed than the item frame.
    '[style.--gui-carousel-parallax.px]': 'parallax()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-posinset]': 'position()',
    '[attr.aria-setsize]': 'setSize()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'active() ? 0 : -1',
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

  /** Width in px assigned by the engine, or `null` to use the CSS default. */
  readonly width = signal<number | null>(null);
  /** Content parallax offset (px) assigned by the engine; 0 = no offset. */
  readonly parallax = signal(0);

  /** Whether this item currently holds the carousel's single roving tab stop. */
  private readonly activeState = signal(false);
  protected readonly active = this.activeState.asReadonly();

  /** 1-based position and total, set by the carousel for assistive tech. */
  private readonly positionState = signal<number | null>(null);
  private readonly setSizeState = signal<number | null>(null);
  protected readonly position = this.positionState.asReadonly();
  protected readonly setSize = this.setSizeState.asReadonly();

  /** "Item N of M" — read out so the user knows where they are in the set. */
  protected readonly ariaLabel = computed(() => {
    const pos = this.positionState();
    const size = this.setSizeState();
    return pos != null && size != null ? `Item ${pos} of ${size}` : null;
  });

  /** {@link FocusableOption}: move DOM focus to this item (roving focus). */
  focus(): void {
    this.host.nativeElement.focus();
  }

  /** {@link FocusableOption}: type-ahead label is the visible text. */
  getLabel(): string {
    return this.host.nativeElement.textContent?.trim() ?? '';
  }

  /** Called by the carousel to grant/withdraw the roving tab stop. */
  setActive(active: boolean): void {
    this.activeState.set(active);
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
