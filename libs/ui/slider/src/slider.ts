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
    '[attr.data-discrete]': 'discrete() ? "" : null',
    '[attr.data-range]': 'range() ? "" : null',
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
  readonly discrete = input(false, { transform: booleanAttribute });
  readonly range = input(false, { transform: booleanAttribute });

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

  /** Stop positions (percent) for discrete tick rendering. */
  protected readonly ticks = computed<number[]>(() => {
    if (!this.discrete()) {
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
    const value = this.clientXToValue(event.clientX);
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
    this.commit(thumb, this.clientXToValue(event.clientX));
  }

  protected onPointerUp(): void {
    if (this.dragging() !== null) {
      this.dragging.set(null);
      this.control.markTouched();
    }
  }

  // --- Keyboard --------------------------------------------------------------

  protected onKeyDown(event: KeyboardEvent, thumb: ActiveThumb): void {
    if (this.disabled()) {
      return;
    }
    const step = this.step();
    const page = step * 10;
    let next: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = this.current(thumb) + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = this.current(thumb) - step;
        break;
      case 'PageUp':
        next = this.current(thumb) + page;
        break;
      case 'PageDown':
        next = this.current(thumb) - page;
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

  // --- Internals -------------------------------------------------------------

  /** Current numeric value for a given thumb. */
  private current(thumb: ActiveThumb): number {
    if (thumb === 'single') {
      return this.singleValue();
    }
    return thumb === 'start' ? this.rangeValue()[0] : this.rangeValue()[1];
  }

  /** Map a clientX coordinate to a raw (un-snapped) slider value. */
  private clientXToValue(clientX: number): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
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
