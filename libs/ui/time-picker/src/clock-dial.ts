import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { GuiTime } from '@ngguide/ui/datetime';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

const CX = 128;
const CY = 128;
const OUTER_R = 100;
const INNER_R = 64;
const HOUR_RING_THRESHOLD = (OUTER_R + INNER_R) / 2;

interface DialNumber {
  /** Internal hour (0..23) or minute (0..59) this label commits. */
  unit: number;
  /** Text shown in the SVG. */
  label: string;
  x: number;
  y: number;
  ring: 'outer' | 'inner';
}

/**
 * M3 clock dial. Renders an SVG clock face and lets the user pick an hour or a
 * minute by pointer or keyboard. Drives the shared `value` model; selection
 * snaps to the nearest unit by angle from the dial center.
 */
@Component({
  selector: 'gui-clock-dial',
  templateUrl: './clock-dial.html',
  styleUrl: './clock-dial.css',
  host: {
    'role': 'group',
    '[attr.aria-label]': 'ariaLabel()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(keydown)': 'onKeyDown($event)',
    'tabindex': '0',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockDialComponent {
  private readonly reducedMotion = inject(GuiReducedMotion);
  private readonly hostEl =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly mode = input<'hours' | 'minutes'>('hours');
  readonly hour12 = input(true);
  readonly value = model<GuiTime>();

  private readonly svg =
    viewChild.required<ElementRef<SVGSVGElement>>('svg');

  protected readonly ariaLabel = computed(() =>
    this.mode() === 'hours' ? 'Select hour' : 'Select minute',
  );

  /** Disable the hand transition when the user prefers reduced motion. */
  protected readonly animateHand = computed(
    () => !this.reducedMotion.prefersReducedMotion(),
  );

  /** The numbers rendered on the dial for the current mode. */
  protected readonly numbers = computed<DialNumber[]>(() => {
    if (this.mode() === 'hours') {
      return this.hourNumbers();
    }
    return this.minuteNumbers();
  });

  /** Current internal unit (hours 0..23 or minutes 0..59). */
  protected readonly currentUnit = computed(() => {
    const t = this.value();
    if (!t) return this.mode() === 'hours' ? 0 : 0;
    return this.mode() === 'hours' ? t.hours : t.minutes;
  });

  /** Position of the selector handle at the current unit. */
  protected readonly handle = computed(() => {
    if (this.mode() === 'hours') {
      return this.hourHandle(this.currentUnit());
    }
    return this.minuteHandle(this.currentUnit());
  });

  // --- Geometry --------------------------------------------------------------

  private point(index: number, count: number, radius: number): {
    x: number;
    y: number;
  } {
    const theta = (index / count) * 2 * Math.PI;
    return {
      x: CX + radius * Math.sin(theta),
      y: CY - radius * Math.cos(theta),
    };
  }

  private hourNumbers(): DialNumber[] {
    const out: DialNumber[] = [];
    // Outer ring: 12 at top, then 1..11 clockwise.
    for (let i = 0; i < 12; i++) {
      const p = this.point(i, 12, OUTER_R);
      const unit = i === 0 ? 12 : i;
      out.push({ unit, label: String(unit), x: p.x, y: p.y, ring: 'outer' });
    }
    if (!this.hour12()) {
      // Inner ring: 00, 13..23.
      for (let i = 0; i < 12; i++) {
        const p = this.point(i, 12, INNER_R);
        const unit = i === 0 ? 0 : i + 12;
        out.push({
          unit,
          label: i === 0 ? '00' : String(unit),
          x: p.x,
          y: p.y,
          ring: 'inner',
        });
      }
    }
    return out;
  }

  private minuteNumbers(): DialNumber[] {
    const out: DialNumber[] = [];
    for (let i = 0; i < 12; i++) {
      const p = this.point(i, 12, OUTER_R);
      const unit = i * 5;
      out.push({
        unit,
        label: String(unit).padStart(2, '0'),
        x: p.x,
        y: p.y,
        ring: 'outer',
      });
    }
    return out;
  }

  private hourHandle(hour: number): { x: number; y: number } {
    if (this.hour12()) {
      // 12 maps to top (index 0); 1..11 map to their index.
      const index = hour % 12;
      return this.point(index, 12, OUTER_R);
    }
    // 24h: outer ring 12,1..11 (hour 12 -> index 0); inner ring 0,13..23.
    if (hour === 0) return this.point(0, 12, INNER_R);
    if (hour >= 13) return this.point(hour - 12, 12, INNER_R);
    if (hour === 12) return this.point(0, 12, OUTER_R);
    return this.point(hour, 12, OUTER_R);
  }

  private minuteHandle(minute: number): { x: number; y: number } {
    return this.point(minute / 5, 12, OUTER_R);
  }

  // --- Pointer ---------------------------------------------------------------

  protected onPointerDown(event: PointerEvent): void {
    try {
      (event.target as Element).setPointerCapture?.(event.pointerId);
    } catch {
      /* setPointerCapture unsupported in this environment */
    }
    this.dragging = true;
    this.selectFromClient(event.clientX, event.clientY);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    this.selectFromClient(event.clientX, event.clientY);
  }

  protected onPointerUp(event: PointerEvent): void {
    this.dragging = false;
    try {
      (event.target as Element).releasePointerCapture?.(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  private dragging = false;

  private selectFromClient(clientX: number, clientY: number): void {
    const rect = this.svg().nativeElement.getBoundingClientRect();
    const scaleX = rect.width > 0 ? 256 / rect.width : 1;
    const scaleY = rect.height > 0 ? 256 / rect.height : 1;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const dx = x - CX;
    const dy = y - CY;
    // Angle from 12-o'clock, clockwise, in degrees.
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    const radius = Math.sqrt(dx * dx + dy * dy);
    this.selectFromAngle(deg, radius);
  }

  /**
   * Commit a selection from an angle (degrees, clockwise from 12-o'clock) and an
   * optional radius (dial units, used in 24h hours mode to choose the ring).
   * Exposed at `protected` so specs can drive the engine without pointer
   * geometry (which is unreliable under jsdom).
   */
  protected selectFromAngle(deg: number, radius = OUTER_R): void {
    const norm = ((deg % 360) + 360) % 360;
    if (this.mode() === 'hours') {
      this.selectHourFromAngle(norm, radius);
    } else {
      this.selectMinuteFromAngle(norm);
    }
  }

  private selectHourFromAngle(deg: number, radius: number): void {
    const index = Math.round(deg / 30) % 12;
    let hour: number;
    if (this.hour12()) {
      hour = index === 0 ? 12 : index;
    } else if (radius < HOUR_RING_THRESHOLD) {
      hour = index === 0 ? 0 : index + 12;
    } else {
      hour = index === 0 ? 12 : index;
    }
    this.commit({ ...this.base(), hours: hour });
  }

  private selectMinuteFromAngle(deg: number): void {
    const minute = Math.round(deg / 6) % 60;
    this.commit({ ...this.base(), minutes: minute });
  }

  // --- Keyboard --------------------------------------------------------------

  protected onKeyDown(event: KeyboardEvent): void {
    let delta = 0;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        delta = 1;
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        delta = -1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (this.mode() === 'hours') {
      const max = this.hour12() ? 12 : 24;
      // Map 12h hour into a 1..12 cycle, else 0..23.
      if (this.hour12()) {
        const cur = this.currentUnit() === 0 ? 12 : this.currentUnit();
        const next = ((cur - 1 + delta + 12) % 12) + 1;
        this.commit({ ...this.base(), hours: next });
      } else {
        const next = (this.currentUnit() + delta + max) % max;
        this.commit({ ...this.base(), hours: next });
      }
    } else {
      const next = (this.currentUnit() + delta + 60) % 60;
      this.commit({ ...this.base(), minutes: next });
    }
  }

  // --- Internals -------------------------------------------------------------

  private base(): GuiTime {
    return this.value() ?? { hours: 0, minutes: 0 };
  }

  private commit(t: GuiTime): void {
    this.value.set(t);
    // Keep host focus so subsequent keyboard input lands on the dial.
    if (this.hostEl && typeof this.hostEl.focus === 'function') {
      // Avoid stealing focus from typed inputs; only refocus if already inside.
      if (this.hostEl.contains(document.activeElement)) {
        this.hostEl.focus();
      }
    }
  }
}
