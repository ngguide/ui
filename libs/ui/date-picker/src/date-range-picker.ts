import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import {
  GuiDateRange,
  compareDate,
  formatDate,
  monthNames,
  parseDate,
  startOfDay,
} from '@ngguide/ui/datetime';
import { GuiFormControl } from '@ngguide/ui/forms';
import { IconComponent } from '@ngguide/ui/icon';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { GuiOverlayHandle, GuiPickerOverlay } from '@ngguide/ui/overlay';
import {
  TextFieldComponent,
  TextFieldInputDirective,
} from '@ngguide/ui/text-field';
import { CalendarComponent } from './calendar';

export type GuiDateRangePickerVariant = 'modal' | 'modal-input';

/**
 * M3 date-range picker. Composes the shared GuiFormControl<GuiDateRange> so it
 * works with reactive/template forms. Range selection is modal-only: the
 * trigger is a row of start/end fields plus a calendar icon button that opens a
 * modal dialog. Successive calendar picks set start then end (swapped so that
 * start <= end), committed on OK.
 */
@Component({
  selector: 'gui-date-range-picker',
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.css',
  imports: [
    TextFieldComponent,
    TextFieldInputDirective,
    IconButtonComponent,
    IconComponent,
    ButtonComponent,
    CalendarComponent,
  ],
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: range', 'disabled'],
      outputs: ['valueChange: rangeChange'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerComponent {
  protected readonly control = inject(GuiFormControl<GuiDateRange>);
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly variant = input<GuiDateRangePickerVariant>('modal');
  readonly label = input('Date range');
  readonly locale = input('en-US');
  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);
  readonly dateFilter = input<((d: Date) => boolean) | null>(null);
  /**
   * Helper text stating the accepted date format (M3 default MM/DD/YYYY).
   */
  readonly dateFormatHint = input('MM/DD/YYYY');

  /** Captured once — this is the component root, not the pure date layer. */
  protected readonly today = startOfDay(new Date());

  private readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');

  /** Calendar month displayed by the panel. */
  protected readonly activeMonth = signal<Date>(this.today);
  /** Staged range endpoints, committed on OK. */
  protected readonly pendingStart = signal<Date | null>(null);
  protected readonly pendingEnd = signal<Date | null>(null);
  /** Parse error for typed start/end input. */
  protected readonly startError = signal(false);
  protected readonly endError = signal(false);

  private handle: GuiOverlayHandle | null = null;

  protected readonly displayStart = computed(() => {
    const value = this.control.value()?.start ?? null;
    return value ? formatDate(value, this.locale()) : '';
  });

  protected readonly displayEnd = computed(() => {
    const value = this.control.value()?.end ?? null;
    return value ? formatDate(value, this.locale()) : '';
  });

  /** Staged endpoints formatted for the in-dialog modal text inputs. */
  protected readonly pendingStartDisplay = computed(() => {
    const value = this.pendingStart();
    return value ? formatDate(value, this.locale()) : '';
  });

  protected readonly pendingEndDisplay = computed(() => {
    const value = this.pendingEnd();
    return value ? formatDate(value, this.locale()) : '';
  });

  /**
   * Month subhead above the range grid (M3 range-selector anatomy): the
   * displayed month and year, labelling the scrolling month section.
   */
  protected readonly monthSubhead = computed(() => {
    const month = this.activeMonth();
    return `${monthNames(this.locale())[month.getMonth()]} ${month.getFullYear()}`;
  });

  /** Modal Headline: the staged range, with the label as Supporting text. */
  protected readonly headlineText = computed(() => {
    const start = this.pendingStart();
    const end = this.pendingEnd();
    const fmt = (d: Date) =>
      formatDate(d, this.locale(), { month: 'short', day: 'numeric' });
    if (start && end) return `${fmt(start)} – ${fmt(end)}`;
    if (start) return `${fmt(start)} – End`;
    return 'Select range';
  });

  protected open(): void {
    if (this.control.effectiveDisabled() || this.handle) return;

    const value = this.control.value();
    const start = value?.start ?? null;
    const end = value?.end ?? null;
    this.pendingStart.set(start);
    this.pendingEnd.set(end);
    this.activeMonth.set(start ? startOfDay(start) : this.today);

    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.handle = this.overlay.openModal(portal, { ariaLabel: this.label() });

    this.handle.closed.subscribe(() => {
      this.handle = null;
    });
  }

  protected close(): void {
    this.handle?.close();
  }

  /**
   * Successive picks: first sets start (clearing end); second sets end. If the
   * second pick precedes the staged start, swap so that start <= end.
   */
  protected onDateSelected(date: Date): void {
    const day = startOfDay(date);
    const start = this.pendingStart();
    const end = this.pendingEnd();

    if (start == null || end != null) {
      // Begin a fresh range.
      this.pendingStart.set(day);
      this.pendingEnd.set(null);
      return;
    }

    // Second pick — close the range, swapping if needed.
    if (compareDate(day, start) < 0) {
      this.pendingStart.set(day);
      this.pendingEnd.set(start);
    } else {
      this.pendingEnd.set(day);
    }
  }

  protected onConfirm(): void {
    this.control.emit({
      start: this.pendingStart(),
      end: this.pendingEnd(),
    });
    this.control.markTouched();
    this.close();
  }

  /** Direct text entry on the trigger start field — commits to the control. */
  protected onStartInput(raw: string): void {
    const parsed = this.parseEndpoint(raw, 'start');
    if (parsed === undefined) return;
    this.control.emit({ start: parsed, end: this.control.value()?.end ?? null });
    this.control.markTouched();
  }

  protected onEndInput(raw: string): void {
    const parsed = this.parseEndpoint(raw, 'end');
    if (parsed === undefined) return;
    this.control.emit({
      start: this.control.value()?.start ?? null,
      end: parsed,
    });
    this.control.markTouched();
  }

  /** Direct text entry on the in-dialog modal fields — stages until OK. */
  protected onModalStartInput(raw: string): void {
    const parsed = this.parseEndpoint(raw, 'start');
    if (parsed === undefined) return;
    this.pendingStart.set(parsed);
    if (parsed) this.activeMonth.set(parsed);
  }

  protected onModalEndInput(raw: string): void {
    const parsed = this.parseEndpoint(raw, 'end');
    if (parsed === undefined) return;
    this.pendingEnd.set(parsed);
    if (parsed) this.activeMonth.set(parsed);
  }

  /**
   * Parse a typed endpoint. Returns the date (or null when cleared), or
   * `undefined` when the text is unparseable/out of range (error flagged, no
   * commit).
   */
  private parseEndpoint(
    raw: string,
    which: 'start' | 'end',
  ): Date | null | undefined {
    const errorSignal = which === 'start' ? this.startError : this.endError;
    const trimmed = raw.trim();
    if (trimmed === '') {
      errorSignal.set(false);
      return null;
    }
    const parsed = parseDate(trimmed, this.locale());
    if (!parsed || this.outOfRange(parsed)) {
      errorSignal.set(true);
      return undefined;
    }
    errorSignal.set(false);
    return startOfDay(parsed);
  }

  private outOfRange(date: Date): boolean {
    const min = this.min();
    if (min && compareDate(date, min) < 0) return true;
    const max = this.max();
    if (max && compareDate(date, max) > 0) return true;
    const filter = this.dateFilter();
    if (filter && !filter(date)) return true;
    return false;
  }
}
