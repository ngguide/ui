import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { GuiSize } from '@ngguide/ui';
import { GuiFormControl } from '@ngguide/ui/forms';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/** Which thumb is currently being driven (range mode). */
type ActiveThumb = 'single' | 'start' | 'end';

/** Slider layout orientation (M3 Expressive). */
export type GuiSliderOrientation = 'horizontal' | 'vertical';

/**
 * M3 slider. Single value (`number`) or, with `range`, a `[number, number]`
 * tuple. Built from a custom track + thumb(s) wired to raw pointer events and
 * keyboard; never wraps a native `<input type=range>`. Composes
 * {@link GuiFormControl} for value/disabled + CVA, and the interaction
 * foundation (state layer / ripple / focus ring) on each thumb.
 */
@Component({
  selector: 'gui-slider',
  exportAs: 'guiSlider',
  templateUrl: './slider.html',
  styleUrl: './slider.css',
  imports: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value', 'disabled'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-stops]': 'showStops() ? "" : null',
    '[attr.data-range]': 'range() ? "" : null',
    '[attr.data-centered]': 'centered() ? "" : null',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-active]': 'active() ? "" : null',
    '[class.gui-disabled]': 'control.effectiveDisabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  readonly control = inject(GuiFormControl<number | [number, number]>);

  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly size = input<GuiSize>('md');

  /**
   * Render stop indicators on the track (M3 "stops" configuration —
   * the former "discrete" slider). Defaults to `No`.
   */
  readonly stops = input(false, { transform: booleanAttribute });

  readonly range = input(false, { transform: booleanAttribute });

  /**
   * Centered variant: the active track fills outward from the track's
   * midpoint instead of the leading edge (standard, single-thumb only).
   */
  readonly centered = input(false, { transform: booleanAttribute });

  /** Layout orientation (M3 Expressive). Defaults to `horizontal`. */
  readonly orientation = input<GuiSliderOrientation>('horizontal');

  /**
   * Show the value indicator (label container) on press/drag/focus.
   * M3 lists this as optional with `No` as the default.
   */
  readonly valueIndicator = input(false, { transform: booleanAttribute });

  /**
   * Accessibility label for the slider handle(s). Per M3 this should match
   * the slider's adjacent UI text. Use {@link ariaLabelledby} to reference
   * that text by id instead of duplicating it.
   */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, {
    alias: 'aria-labelledby',
  });

  /** Effective stop-indicator state. */
  protected readonly showStops = computed(() => this.stops());

  private readonly track =
    viewChild.required<ElementRef<HTMLElement>>('track');

  /** Whichever thumb a pointer drag is currently capturing, else null. */
  private readonly dragging = signal<ActiveThumb | null>(null);
  /** True while a thumb is pressed/dragged/focused — drives the value indicator. */
  protected readonly active = computed(() => this.dragging() !== null);

  protected readonly disabled = computed(() => this.control.effectiveDisabled());

  /** Current single value, defensively coerced to a clamped number. */
  protected readonly singleValue = computed(() => {
    const v = this.control.value();
    const n = typeof v === 'number' ? v : this.min();
    return this.clamp(n);
  });

  /** Current range tuple, defensively coerced and ordered start ≤ end. */
  protected readonly rangeValue = computed<[number, number]>(() => {
    const v = this.control.value();
    let start = Array.isArray(v) ? v[0] : this.min();
    let end = Array.isArray(v) ? v[1] : this.max();
    start = this.clamp(start);
    end = this.clamp(end);
    if (start > end) {
      [start, end] = [end, start];
    }
    return [start, end];
  });

  /** Stop positions (percent) for stop-indicator (tick) rendering. */
  protected readonly ticks = computed<number[]>(() => {
    if (!this.showStops()) {
      return [];
    }
    const step = this.step();
    const min = this.min();
    const max = this.max();
    if (step <= 0 || max <= min) {
      return [];
    }
    const out: number[] = [];
    for (let v = min; v <= max + 1e-9; v += step) {
      out.push(this.valueToPercent(v));
    }
    return out;
  });

  protected valueToPercent(value: number): number {
    const min = this.min();
    const max = this.max();
    if (max <= min) {
      return 0;
    }
    return ((this.clamp(value) - min) / (max - min)) * 100;
  }

  /**
   * Leading edge (percent) of the single active track. For a standard slider
   * this is the track start (0%); for a centered slider it is the midpoint,
   * so the fill grows outward from the center toward the value.
   */
  protected readonly singleActiveStart = computed(() => {
    if (!this.centered()) {
      return 0;
    }
    const valuePct = this.valueToPercent(this.singleValue());
    return Math.min(50, valuePct);
  });

  /** Trailing edge (percent) of the single active track. */
  protected readonly singleActiveEnd = computed(() => {
    const valuePct = this.valueToPercent(this.singleValue());
    return this.centered() ? Math.max(50, valuePct) : valuePct;
  });

  /** Effective min/max for a given thumb (range thumbs clamp to each other). */
  protected thumbMin(thumb: ActiveThumb): number {
    return thumb === 'end' ? this.rangeValue()[0] : this.min();
  }
  protected thumbMax(thumb: ActiveThumb): number {
    return thumb === 'start' ? this.rangeValue()[1] : this.max();
  }

  // --- Pointer ---------------------------------------------------------------

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }
    const value = this.pointerToValue(event);
    const thumb = this.pickThumb(value);
    this.dragging.set(thumb);
    try {
      (event.target as Element).setPointerCapture?.(event.pointerId);
    } catch {
      /* setPointerCapture unsupported in this environment */
    }
    this.commit(thumb, value);
  }

  protected onPointerMove(event: PointerEvent): void {
    const thumb = this.dragging();
    if (thumb === null) {
      return;
    }
    this.commit(thumb, this.pointerToValue(event));
  }

  protected onPointerUp(): void {
    if (this.dragging() !== null) {
      this.dragging.set(null);
      this.control.markTouched();
    }
  }

  // --- Keyboard --------------------------------------------------------------

  /** True while the Space key is held — promotes arrows to interval steps. */
  private readonly spaceHeld = signal(false);

  protected onKeyDown(event: KeyboardEvent, thumb: ActiveThumb): void {
    if (this.disabled()) {
      return;
    }

    // Space modifies the arrow keys (M3 "Space & Arrows"): pressing Space
    // alone is a no-op that arms interval stepping for the next arrow.
    if (event.key === ' ' || event.key === 'Spacebar') {
      this.spaceHeld.set(true);
      event.preventDefault();
      return;
    }

    // "Arrows" move by one value/stop; "Space & Arrows" move by one interval.
    const delta = this.spaceHeld() ? this.interval() : this.step();
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.current(thumb) + delta;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.current(thumb) - delta;
        break;
      case 'Home':
        next = this.thumbMin(thumb);
        break;
      case 'End':
        next = this.thumbMax(thumb);
        break;
      default:
        return;
    }

    event.preventDefault();
    this.commit(thumb, next);
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Spacebar') {
      this.spaceHeld.set(false);
    }
  }

  /** One "interval" for Space-modified arrow stepping (ten steps). */
  private interval(): number {
    return this.step() * 10;
  }

  // --- Internals -------------------------------------------------------------

  /** Current numeric value for a given thumb. */
  private current(thumb: ActiveThumb): number {
    if (thumb === 'single') {
      return this.singleValue();
    }
    return thumb === 'start' ? this.rangeValue()[0] : this.rangeValue()[1];
  }

  /**
   * Map a pointer position to a raw (un-snapped) slider value. Horizontal
   * sliders read clientX along the track width; vertical sliders read clientY
   * along the height with the value increasing upward.
   */
  private pointerToValue(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    let ratio: number;
    if (this.orientation() === 'vertical') {
      ratio = rect.height > 0 ? (rect.bottom - event.clientY) / rect.height : 0;
    } else {
      ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
    }
    return this.min() + ratio * (this.max() - this.min());
  }

  /** In range mode, pick the thumb nearest the target value; else 'single'. */
  private pickThumb(value: number): ActiveThumb {
    if (!this.range()) {
      return 'single';
    }
    const [start, end] = this.rangeValue();
    return Math.abs(value - start) <= Math.abs(value - end) ? 'start' : 'end';
  }

  /** Snap + clamp (against the thumb's effective bounds) and emit. */
  private commit(thumb: ActiveThumb, raw: number): void {
    const snapped = this.snapToStep(raw);
    const value = Math.min(
      Math.max(snapped, this.thumbMin(thumb)),
      this.thumbMax(thumb),
    );
    if (thumb === 'single') {
      this.control.emit(value);
      return;
    }
    const [start, end] = this.rangeValue();
    this.control.emit(thumb === 'start' ? [value, end] : [start, value]);
  }

  private clamp(value: number): number {
    return Math.min(Math.max(value, this.min()), this.max());
  }

  private snapToStep(value: number): number {
    const step = this.step();
    if (step <= 0) {
      return this.clamp(value);
    }
    const min = this.min();
    const snapped = min + Math.round((value - min) / step) * step;
    return this.clamp(snapped);
  }
}
