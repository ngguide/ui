import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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

  /** Captured once — this is the component root, not the pure date layer. */
  protected readonly today = startOfDay(new Date());

  private readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');

  /** Calendar month displayed by the panel. */
  protected readonly activeMonth = signal<Date>(this.today);
  /** Staged range endpoints, committed on OK. */
  protected readonly pendingStart = signal<Date | null>(null);
  protected readonly pendingEnd = signal<Date | null>(null);

  private handle: GuiOverlayHandle | null = null;

  protected readonly displayStart = computed(() => {
    const value = this.control.value()?.start ?? null;
    return value ? formatDate(value, this.locale()) : '';
  });

  protected readonly displayEnd = computed(() => {
    const value = this.control.value()?.end ?? null;
    return value ? formatDate(value, this.locale()) : '';
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
}
