import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  DatePickerComponent,
  DateRangePickerComponent,
  CalendarComponent,
} from '@ngguide/ui/date-picker';
import { GuiDateRange } from '@ngguide/ui/datetime';
import { GALLERY_DEMO_UI } from '../demo-block.component';
import { DEMO_TODAY } from '../../core/demo-date';

/**
 * Vitrine demo for the M3 Date pickers (`@ngguide/ui/date-picker`).
 *
 * The entry point ships three implemented surfaces, all exercised here:
 *
 * - `gui-date-picker` — single date. Trigger is an outlined text field + calendar
 *   icon button; the panel is `variant`-driven: `docked` (calendar popover, commit
 *   on pick), `modal` (calendar dialog with OK/Cancel, edit icon flips to text
 *   input), and `modal-input` (dialog opening straight on the text-input mode).
 *   Typing is supported on `docked` + `modal-input`. Form-bound through the shared
 *   `GuiFormControl` host directive — here driven with the `[(date)]` two-way alias
 *   and the `[disabled]` input.
 * - `gui-date-range-picker` — range, modal-only. `variant` is `modal` (calendar)
 *   or `modal-input` (paired start/end text fields). Bound with `[(range)]`
 *   ({ start, end }) and `[disabled]`.
 * - `gui-calendar` — the bare M3 calendar grid (WAI-ARIA date-grid). The
 *   "configurations" surface: day grid + year-selection grid, today/selected/
 *   disabled/range cells. Required `[today]` + `[(activeMonth)]`.
 *
 * Dimensions swept against the real API (no invented inputs):
 * - Variants: docked / modal / modal-input (single) and modal / modal-input (range).
 * - Configurations: day, year, and range selection (calendar block).
 * - States: empty (default), with value, disabled, and error (out-of-range typed
 *   entry) — plus min/max bounds and a `dateFilter` (weekends disabled).
 * - Anatomy options: `label` (a11y label), `dateFormatHint` (helper text),
 *   `locale` (Sunday- vs Monday-first weekdays + formatting).
 *
 * Every date is derived from the fixed {@link DEMO_TODAY} or written as explicit
 * literal y/m/d — no wall clock, no RNG (SSR-safe / deterministic).
 */
@Component({
  selector: 'app-demo-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    DatePickerComponent,
    DateRangePickerComponent,
    CalendarComponent,
  ],
  template: `
    <app-demo-component
      name="Date picker"
      entry="@ngguide/ui/date-picker"
      docHref="https://m3.material.io/components/date-pickers"
    >
      <!-- ===== Variants (the three M3 single-date forms) ===== -->
      <app-demo-block
        heading="Variants"
        hint="Docked (calendar popover), modal (calendar dialog), modal input (text-entry dialog). Click the calendar icon."
        [column]="true"
      >
        <app-demo-specimen label="docked" class="fill">
          <gui-date-picker
            variant="docked"
            label="Docked date"
            [(date)]="docked"
          />
        </app-demo-specimen>

        <app-demo-specimen label="modal" class="fill">
          <gui-date-picker
            variant="modal"
            label="Modal date"
            [(date)]="modal"
          />
        </app-demo-specimen>

        <app-demo-specimen label="modal-input" class="fill">
          <gui-date-picker
            variant="modal-input"
            label="Modal date input"
            [(date)]="modalInput"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== States ===== -->
      <app-demo-block
        heading="States"
        hint="Empty, prefilled, and disabled (trigger inert, panel won't open)."
        [column]="true"
      >
        <app-demo-specimen label="empty (default)" class="fill">
          <gui-date-picker variant="docked" label="Empty" [(date)]="empty" />
        </app-demo-specimen>

        <app-demo-specimen label="with value" class="fill">
          <gui-date-picker
            variant="docked"
            label="Selected"
            [(date)]="prefilled"
          />
        </app-demo-specimen>

        <app-demo-specimen label="disabled" class="fill">
          <gui-date-picker
            variant="docked"
            label="Disabled"
            [date]="prefilled()"
            [disabled]="true"
          />
        </app-demo-specimen>

        <app-demo-specimen label="error (type an out-of-range date)" class="fill">
          <gui-date-picker
            variant="docked"
            label="Bounded"
            [min]="minDate"
            [max]="maxDate"
            [(date)]="bounded"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Bounds & filtering ===== -->
      <app-demo-block
        heading="Bounds & filtering"
        hint="min/max clamp the grid; dateFilter disables weekends. Out-of-range cells are non-selectable."
        [column]="true"
      >
        <app-demo-specimen label="min / max (this month only)" class="fill">
          <gui-date-picker
            variant="docked"
            label="Within bounds"
            [min]="minDate"
            [max]="maxDate"
            [(date)]="boundedB"
          />
        </app-demo-specimen>

        <app-demo-specimen label="dateFilter (weekdays only)" class="fill">
          <gui-date-picker
            variant="docked"
            label="Weekdays only"
            [dateFilter]="weekdaysOnly"
            [(date)]="weekday"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Anatomy: label, helper text, locale ===== -->
      <app-demo-block
        heading="Anatomy & locale"
        hint="label (a11y) · dateFormatHint (helper text) · locale (weekday order + formatting)."
        [column]="true"
      >
        <app-demo-specimen label="custom hint (YYYY-MM-DD)" class="fill">
          <gui-date-picker
            variant="docked"
            label="Event date"
            dateFormatHint="YYYY-MM-DD"
            [(date)]="hinted"
          />
        </app-demo-specimen>

        <app-demo-specimen label="locale en-GB (Monday-first, DD/MM/YYYY)" class="fill">
          <gui-date-picker
            variant="docked"
            label="Reservation date"
            locale="en-GB"
            dateFormatHint="DD/MM/YYYY"
            [(date)]="localized"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Date range picker (modal-only) ===== -->
      <app-demo-block
        heading="Date range"
        hint="gui-date-range-picker — modal (calendar) and modal-input (paired fields). Pick start then end in the dialog."
        [column]="true"
      >
        <app-demo-specimen label="range · modal" class="fill">
          <gui-date-range-picker
            variant="modal"
            label="Trip dates"
            [(range)]="range"
          />
        </app-demo-specimen>

        <app-demo-specimen label="range · modal-input" class="fill">
          <gui-date-range-picker
            variant="modal-input"
            label="Stay dates"
            [(range)]="rangeInput"
          />
        </app-demo-specimen>

        <app-demo-specimen label="range · with value" class="fill">
          <gui-date-range-picker
            variant="modal"
            label="Booked"
            [(range)]="rangeFilled"
          />
        </app-demo-specimen>

        <app-demo-specimen label="range · disabled" class="fill">
          <gui-date-range-picker
            variant="modal"
            label="Locked"
            [range]="rangeFilled()"
            [disabled]="true"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Calendar grid (configurations) ===== -->
      <app-demo-block
        heading="Calendar grid"
        hint="gui-calendar — the bare M3 grid. Header menus flip to year selection; arrows/PageUp/Down/Home/End navigate. Today is ringed; out-of-bounds days are inert."
      >
        <app-demo-specimen label="day & year selection">
          <gui-calendar
            [(activeMonth)]="calMonth"
            [selected]="calSelected()"
            [today]="today"
            (dateSelected)="onCalendarPick($event)"
          />
        </app-demo-specimen>

        <app-demo-specimen label="bounded (min/max)">
          <gui-calendar
            [(activeMonth)]="calMonthBounded"
            [selected]="calSelected()"
            [min]="minDate"
            [max]="maxDate"
            [today]="today"
            (dateSelected)="onCalendarPick($event)"
          />
        </app-demo-specimen>

        <app-demo-specimen label="range preview">
          <gui-calendar
            [(activeMonth)]="calMonthRange"
            [rangeStart]="rangeStart"
            [rangeEnd]="rangeEnd"
            [today]="today"
          />
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class DatePickerDemo {
  /** Fixed "now" for the demo (June 4, 2026) — never the wall clock. */
  protected readonly today = DEMO_TODAY;

  // --- Single date pickers (two-way [(date)] via the GuiFormControl alias) ---
  protected readonly docked = signal<Date | null>(null);
  protected readonly modal = signal<Date | null>(null);
  protected readonly modalInput = signal<Date | null>(null);

  protected readonly empty = signal<Date | null>(null);
  protected readonly prefilled = signal<Date | null>(new Date(2026, 5, 12));
  protected readonly bounded = signal<Date | null>(null);
  protected readonly boundedB = signal<Date | null>(new Date(2026, 5, 18));
  protected readonly weekday = signal<Date | null>(null);
  protected readonly hinted = signal<Date | null>(new Date(2026, 5, 9));
  protected readonly localized = signal<Date | null>(new Date(2026, 5, 9));

  /** Bounds: the current demo month (June 2026). */
  protected readonly minDate = new Date(2026, 5, 1);
  protected readonly maxDate = new Date(2026, 5, 30);

  /** dateFilter: Saturday (6) and Sunday (0) are non-selectable. */
  protected readonly weekdaysOnly = (d: Date): boolean => {
    const day = d.getDay();
    return day !== 0 && day !== 6;
  };

  // --- Date range pickers (two-way [(range)]) ---
  protected readonly range = signal<GuiDateRange>({ start: null, end: null });
  protected readonly rangeInput = signal<GuiDateRange>({
    start: null,
    end: null,
  });
  protected readonly rangeFilled = signal<GuiDateRange>({
    start: new Date(2026, 5, 10),
    end: new Date(2026, 5, 17),
  });

  // --- Bare calendar grid ---
  protected readonly calMonth = signal<Date>(new Date(2026, 5, 1));
  protected readonly calMonthBounded = signal<Date>(new Date(2026, 5, 1));
  protected readonly calMonthRange = signal<Date>(new Date(2026, 5, 1));
  protected readonly calSelected = signal<Date | null>(new Date(2026, 5, 15));

  /** Range-preview endpoints for the bare calendar specimen. */
  protected readonly rangeStart = new Date(2026, 5, 8);
  protected readonly rangeEnd = new Date(2026, 5, 22);

  protected onCalendarPick(date: Date): void {
    this.calSelected.set(date);
  }
}
