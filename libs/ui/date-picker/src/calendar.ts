import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import {
  addDays,
  addMonths,
  buildMonthGrid,
  clampDate,
  compareDate,
  firstDayOfWeek,
  isSameDay,
  monthNames,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from '@ngguide/ui/datetime';

/**
 * M3 calendar grid (WAI-ARIA APG date-grid pattern). Pure-presentational over
 * the @ngguide/ui/datetime helpers — it owns no "now" (the host passes `today`).
 */
@Component({
  selector: 'gui-calendar',
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  imports: [GuiStateLayerDirective, GuiRippleDirective, GuiFocusRingDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'role': 'grid',
    '[attr.aria-label]': 'monthYearLabel()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class CalendarComponent {
  /** First-of-month currently displayed. Two-way so navigation flips months. */
  readonly activeMonth = model.required<Date>();
  readonly selected = input<Date | null>(null);
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateFilter = input<((d: Date) => boolean) | null>(null);
  readonly locale = input('en-US');
  readonly today = input.required<Date>();

  readonly dateSelected = output<Date>();

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly weekdays = computed(() => {
    const fdow = firstDayOfWeek(this.locale());
    const names = weekdayNames(this.locale(), 'narrow');
    const wide = weekdayNames(this.locale(), 'long');
    const out: { narrow: string; long: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = (fdow + i) % 7;
      out.push({ narrow: names[idx], long: wide[idx] });
    }
    return out;
  });

  protected readonly cells = computed(() => {
    const month = this.activeMonth();
    return buildMonthGrid(
      month.getFullYear(),
      month.getMonth(),
      firstDayOfWeek(this.locale()),
    );
  });

  /** Day cells split into weeks of 7 for the grid rows. */
  protected readonly weeks = computed(() => {
    const cells = this.cells();
    const rows: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    return rows;
  });

  protected readonly monthYearLabel = computed(() => {
    const month = this.activeMonth();
    return `${monthNames(this.locale())[month.getMonth()]} ${month.getFullYear()}`;
  });

  /**
   * Date holding the roving tabindex; lives inside the active month.
   * Re-derives when the month changes, but stays writable for key navigation.
   */
  protected readonly focusedDate = linkedSignal<Date, Date>({
    source: this.activeMonth,
    computation: (month, previous) => {
      // Keep a prior in-month focus when only an unrelated input changed.
      if (
        previous &&
        previous.value.getFullYear() === month.getFullYear() &&
        previous.value.getMonth() === month.getMonth()
      ) {
        return previous.value;
      }
      const candidate = this.selected() ?? this.today();
      if (
        candidate.getFullYear() === month.getFullYear() &&
        candidate.getMonth() === month.getMonth()
      ) {
        return startOfDay(candidate);
      }
      return startOfMonth(month);
    },
  });

  protected isDisabled(date: Date, inCurrentMonth: boolean): boolean {
    if (!inCurrentMonth) return true;
    const min = this.min();
    if (min && compareDate(date, min) < 0) return true;
    const max = this.max();
    if (max && compareDate(date, max) > 0) return true;
    const filter = this.dateFilter();
    if (filter && !filter(date)) return true;
    return false;
  }

  protected isFocused(date: Date): boolean {
    return isSameDay(date, this.focusedDate());
  }

  protected isSelected(date: Date): boolean {
    const sel = this.selected();
    return sel != null && isSameDay(date, sel);
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, this.today());
  }

  protected onCellClick(date: Date, inCurrentMonth: boolean): void {
    if (this.isDisabled(date, inCurrentMonth)) return;
    this.dateSelected.emit(startOfDay(date));
  }

  protected onKeydown(event: KeyboardEvent): void {
    let next: Date | null = null;
    const current = this.focusedDate();

    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, -1);
        break;
      case 'ArrowRight':
        next = addDays(current, 1);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'Home':
        next = this.weekBoundary(current, 'start');
        break;
      case 'End':
        next = this.weekBoundary(current, 'end');
        break;
      case 'PageUp':
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
      case 'Spacebar': {
        event.preventDefault();
        const month = this.activeMonth();
        const inMonth =
          current.getFullYear() === month.getFullYear() &&
          current.getMonth() === month.getMonth();
        if (!this.isDisabled(current, inMonth)) {
          this.dateSelected.emit(startOfDay(current));
        }
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    const clamped = clampDate(next, this.min(), this.max());
    this.moveFocus(clamped);
  }

  private weekBoundary(date: Date, edge: 'start' | 'end'): Date {
    const fdow = firstDayOfWeek(this.locale());
    const offset = ((date.getDay() - fdow) % 7 + 7) % 7;
    const weekStart = addDays(date, -offset);
    return edge === 'start' ? weekStart : addDays(weekStart, 6);
  }

  private moveFocus(date: Date): void {
    const target = startOfDay(date);
    const month = this.activeMonth();
    // Flip the month first so the linkedSignal recompute can't clobber focus.
    if (
      target.getFullYear() !== month.getFullYear() ||
      target.getMonth() !== month.getMonth()
    ) {
      this.activeMonth.set(startOfMonth(target));
    }
    this.focusedDate.set(target);
    // Focus the matching cell after the view reflects the new month.
    queueMicrotask(() => this.focusCell(target));
  }

  private focusCell(date: Date): void {
    const ts = startOfDay(date).getTime();
    const buttons =
      this.host.querySelectorAll<HTMLButtonElement>('button[data-ts]');
    buttons.forEach((btn) => {
      if (Number(btn.dataset['ts']) === ts) {
        btn.focus();
      }
    });
  }

  /** Epoch ms at local midnight — stable cell key for focus lookup. */
  protected cellKey(date: Date): number {
    return startOfDay(date).getTime();
  }
}
