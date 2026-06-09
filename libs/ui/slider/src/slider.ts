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

/** Formatter mapping a slider value to a human-readable string. */
export type GuiSliderDisplayWith = (value: number) => string;

/**
 * One visual track segment — an active fill or an inactive remainder pill — with
 * optional handle-adjacent gaps carved at its leading/trailing edge. Percentages
 * run along the value axis (0 = the min/inline-start edge). M3 Expressive renders
 * the active track, the handle and the inactive track as separate pills with a
 * gap on both sides of each handle.
 */
interface GuiSliderSegment {
  kind: 'active' | 'inactive';
  start: number;
  end: number;
  gapStart: boolean;
  gapEnd: boolean;
}

/** One handle descriptor for the unified handle renderer. */
interface GuiSliderHandle {
  thumb: ActiveThumb;
  pos: number;
  value: number;
  min: number;
  max: number;
}

/** Handle travel inset (px) = half the 4dp handle width, so the nub never
 *  overflows the rounded track ends. Mirrors `--gui-slider-track-inset`. */
const HANDLE_INSET_PX = 2;

/**
 * M3 slider. Single value (`number`) or, with `range`, a `[number, number]`
 * tuple. Built from a custom track + thumb(s) wired to raw pointer events and
 * keyboard; never wraps a native `<input type=range>`. Composes
 * {@link GuiFormControl} for value/disabled + CVA, and the interaction
 * foundation (state layer / ripple / focus ring) on each handle's state capsule.
 */
@Component({
  selector: 'gui-slider',
  exportAs: 'guiSlider',
  templateUrl: './slider.html',
  styleUrl: './slider.css',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value', 'disabled'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-range]': 'range() ? "" : null',
    '[attr.data-centered]': 'effectiveCentered() ? "" : null',
    '[attr.data-orientation]': 'orientation()',
    '[class.gui-disabled]': 'control.effectiveDisabled()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  readonly control = inject(GuiFormControl<number | [number, number]>);

  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  /** M3 names XS as the slider's default size. */
  readonly size = input<GuiSize>('xs');

  /**
   * Render stop indicators on the track (M3 "stops" configuration —
   * the former "discrete" slider). Defaults to `No`.
   */
  readonly stops = input(false, { transform: booleanAttribute });

  readonly range = input(false, { transform: booleanAttribute });

  /**
   * Centered variant: the active track fills outward from the track's midpoint
   * instead of the leading edge. Standard, single-thumb only — `range` takes
   * precedence, so `centered` has no effect when `range` is set (see
   * {@link effectiveCentered}).
   */
  readonly centered = input(false, { transform: booleanAttribute });

  /** Layout orientation (M3 Expressive). Defaults to `horizontal`. */
  readonly orientation = input<GuiSliderOrientation>('horizontal');

  /**
   * Show the value indicator (label container) on hover/press/drag/focus.
   * M3 lists this as optional with `No` as the default.
   */
  readonly valueIndicator = input(false, { transform: booleanAttribute });

  /**
   * Optional formatter for the value-indicator label and `aria-valuetext`
   * (e.g. `v => v + '%'`). When omitted the raw number is shown and
   * `aria-valuetext` is dropped so assistive tech falls back to `aria-valuenow`
   * (no redundant echo).
   */
  readonly displayWith = input<GuiSliderDisplayWith | null>(null);

  /**
   * Accessibility label for the slider handle(s). Per M3 this should match
   * the slider's adjacent UI text. Use {@link ariaLabelledby} to reference
   * that text by id instead of duplicating it. In `range` mode each handle is
   * auto-suffixed ("<label> start" / "<label> end") unless
   * {@link ariaLabelStart}/{@link ariaLabelEnd} are set.
   */
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, {
    alias: 'aria-labelledby',
  });
  /** Explicit per-handle accessible names for the range variant (bound as
   *  `[ariaLabelStart]` / `[ariaLabelEnd]`). */
  readonly ariaLabelStart = input<string | null>(null);
  readonly ariaLabelEnd = input<string | null>(null);

  /** Centered only applies to the single-thumb variant (M3 — range wins). */
  protected readonly effectiveCentered = computed(
    () => this.centered() && !this.range(),
  );

  /**
   * Inset icon is the standard variant only (not range, not centered) and only
   * at sizes M/L/XL (M3 measurements table — XS/S have no inset icon).
   */
  protected readonly canInsetIcon = computed(
    () =>
      !this.range() &&
      !this.effectiveCentered() &&
      (this.size() === 'md' || this.size() === 'lg' || this.size() === 'xl'),
  );

  private readonly track =
    viewChild.required<ElementRef<HTMLElement>>('track');

  /** Whichever thumb a pointer drag is currently capturing, else null. */
  private readonly dragging = signal<ActiveThumb | null>(null);

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

  /** Unified handle list (one for standard/centered, two for range). */
  protected readonly handles = computed<GuiSliderHandle[]>(() => {
    if (this.range()) {
      const [s, e] = this.rangeValue();
      return [
        { thumb: 'start', pos: this.valueToPercent(s), value: s, min: this.min(), max: e },
        { thumb: 'end', pos: this.valueToPercent(e), value: e, min: s, max: this.max() },
      ];
    }
    const v = this.singleValue();
    return [
      { thumb: 'single', pos: this.valueToPercent(v), value: v, min: this.min(), max: this.max() },
    ];
  });

  /** [lo, hi] percent span covered by the active fill (for tick classification). */
  private readonly activeSpan = computed<[number, number]>(() => {
    if (this.range()) {
      const [s, e] = this.rangeValue();
      return [this.valueToPercent(s), this.valueToPercent(e)];
    }
    const v = this.valueToPercent(this.singleValue());
    if (this.effectiveCentered()) {
      return [Math.min(50, v), Math.max(50, v)];
    }
    return [0, v];
  });

  /** Visual track segments (active + inactive pills) with handle-adjacent gaps. */
  protected readonly segments = computed<GuiSliderSegment[]>(() => {
    const segs: GuiSliderSegment[] = [];
    if (this.range()) {
      const [s, e] = this.rangeValue();
      const sp = this.valueToPercent(s);
      const ep = this.valueToPercent(e);
      segs.push({ kind: 'inactive', start: 0, end: sp, gapStart: false, gapEnd: true });
      segs.push({ kind: 'active', start: sp, end: ep, gapStart: true, gapEnd: true });
      segs.push({ kind: 'inactive', start: ep, end: 100, gapStart: true, gapEnd: false });
    } else if (this.effectiveCentered()) {
      const v = this.valueToPercent(this.singleValue());
      if (v >= 50) {
        segs.push({ kind: 'inactive', start: 0, end: 50, gapStart: false, gapEnd: false });
        segs.push({ kind: 'active', start: 50, end: v, gapStart: false, gapEnd: true });
        segs.push({ kind: 'inactive', start: v, end: 100, gapStart: true, gapEnd: false });
      } else {
        segs.push({ kind: 'inactive', start: 0, end: v, gapStart: false, gapEnd: true });
        segs.push({ kind: 'active', start: v, end: 50, gapStart: true, gapEnd: false });
        segs.push({ kind: 'inactive', start: 50, end: 100, gapStart: false, gapEnd: false });
      }
    } else {
      const v = this.valueToPercent(this.singleValue());
      segs.push({ kind: 'active', start: 0, end: v, gapStart: false, gapEnd: true });
      segs.push({ kind: 'inactive', start: v, end: 100, gapStart: true, gapEnd: false });
    }
    // Drop collapsed segments so an empty pill never renders at the extremes.
    return segs.filter((seg) => seg.end - seg.start > 1e-4);
  });

  /** Stop positions (percent) plus whether each sits over the active fill. */
  protected readonly ticks = computed<{ pos: number; active: boolean }[]>(() => {
    if (!this.stops()) {
      return [];
    }
    const step = this.step();
    const min = this.min();
    const max = this.max();
    if (step <= 0 || max <= min) {
      return [];
    }
    const [lo, hi] = this.activeSpan();
    const out: { pos: number; active: boolean }[] = [];
    for (let v = min; v <= max + 1e-9; v += step) {
      const pos = this.valueToPercent(v);
      out.push({ pos, active: pos >= lo - 1e-9 && pos <= hi + 1e-9 });
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

  /** Human-readable value text (uses the formatter when provided). */
  protected display(value: number): string {
    const f = this.displayWith();
    return f ? f(value) : String(value);
  }

  /** aria-valuetext: only when a formatter is set (else null → valuenow stands). */
  protected valueText(value: number): string | null {
    return this.displayWith() ? this.display(value) : null;
  }

  /** Accessible name for a given handle (range auto-suffixes start/end). */
  protected thumbAriaLabel(thumb: ActiveThumb): string | null {
    const base = this.ariaLabel();
    if (thumb === 'start') {
      return this.ariaLabelStart() ?? (base ? `${base} start` : null);
    }
    if (thumb === 'end') {
      return this.ariaLabelEnd() ?? (base ? `${base} end` : null);
    }
    return base;
  }

  /** aria-labelledby only when this handle has no explicit aria-label. */
  protected thumbAriaLabelledby(thumb: ActiveThumb): string | null {
    return this.thumbAriaLabel(thumb) ? null : this.ariaLabelledby();
  }

  protected isDragging(thumb: ActiveThumb): boolean {
    return this.dragging() === thumb;
  }

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
    // In RTL the inline arrows mirror: ArrowLeft increases, ArrowRight decreases.
    const inline = this.isRtl() ? -delta : delta;
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowUp':
        next = this.current(thumb) + delta;
        break;
      case 'ArrowDown':
        next = this.current(thumb) - delta;
        break;
      case 'ArrowRight':
        next = this.current(thumb) + inline;
        break;
      case 'ArrowLeft':
        next = this.current(thumb) - inline;
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

  /** True when the slider is laid out right-to-left. */
  private isRtl(): boolean {
    return (
      getComputedStyle(this.track().nativeElement).direction === 'rtl'
    );
  }

  /**
   * Map a pointer position to a raw (un-snapped) slider value. The handle travel
   * is inset by {@link HANDLE_INSET_PX} on each end (so the nub never overflows
   * the rounded track ends), and the pointer maps across that same inset region
   * so the handle tracks the cursor exactly. Horizontal sliders read clientX
   * (mirrored in RTL); vertical sliders read clientY with the value increasing
   * upward.
   */
  private pointerToValue(event: PointerEvent): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const inset = HANDLE_INSET_PX;
    let ratio: number;
    if (this.orientation() === 'vertical') {
      const usable = rect.height - 2 * inset;
      ratio = usable > 0 ? (rect.bottom - inset - event.clientY) / usable : 0;
    } else {
      const usable = rect.width - 2 * inset;
      ratio = usable > 0 ? (event.clientX - rect.left - inset) / usable : 0;
      if (this.isRtl()) {
        ratio = 1 - ratio;
      }
    }
    ratio = Math.min(1, Math.max(0, ratio));
    return this.min() + ratio * (this.max() - this.min());
  }

  /** In range mode, pick the thumb nearest the target value; else 'single'. */
  private pickThumb(value: number): ActiveThumb {
    if (!this.range()) {
      return 'single';
    }
    const [start, end] = this.rangeValue();
    if (start === end) {
      // Collapsed range: choose by drag direction so a fully-closed range can
      // be reopened by pointer (otherwise the start thumb is clamped and the
      // end thumb is never selectable).
      return value >= start ? 'end' : 'start';
    }
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
