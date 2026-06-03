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
  compareDate,
  formatDate,
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
  TextFieldTrailingDirective,
} from '@ngguide/ui/text-field';
import { CalendarComponent } from './calendar';

export type GuiDatePickerVariant = 'docked' | 'modal' | 'modal-input';

/**
 * M3 single date picker. Composes the shared GuiFormControl<Date> so it works
 * with reactive/template forms. Trigger is an outlined text field; the panel is
 * either docked (calendar) or a modal dialog (calendar / text input).
 */
@Component({
  selector: 'gui-date-picker',
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  imports: [
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldTrailingDirective,
    IconButtonComponent,
    IconComponent,
    ButtonComponent,
    CalendarComponent,
  ],
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: date', 'disabled'],
      outputs: ['valueChange: dateChange'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent {
  protected readonly control = inject(GuiFormControl<Date>);
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly hostEl =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly variant = input<GuiDatePickerVariant>('docked');
  readonly label = input('Date');
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
  /** Modal-only staged selection, committed on OK. */
  protected readonly pendingDate = signal<Date | null>(null);
  /** Parse error for typed input. */
  protected readonly inputError = signal(false);

  private handle: GuiOverlayHandle | null = null;

  protected readonly displayValue = computed(() => {
    const value = this.control.value();
    return value ? formatDate(value, this.locale()) : '';
  });

  /** Typing is supported on docked + modal-input triggers only. */
  protected readonly editable = computed(() => this.variant() !== 'modal');

  protected open(): void {
    if (this.control.effectiveDisabled() || this.handle) return;

    const value = this.control.value();
    this.activeMonth.set(value ? startOfDay(value) : this.today);
    this.pendingDate.set(value ?? null);

    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.handle =
      this.variant() === 'docked'
        ? this.overlay.openDocked(portal, { origin: this.hostEl })
        : this.overlay.openModal(portal, { ariaLabel: this.label() });

    this.handle.closed.subscribe(() => {
      this.handle = null;
    });
  }

  protected close(): void {
    this.handle?.close();
  }

  /** Docked: commit immediately. Modal: stage until OK. */
  protected onDateSelected(date: Date): void {
    if (this.variant() === 'docked') {
      this.commit(date);
    } else {
      this.pendingDate.set(date);
      this.activeMonth.set(startOfDay(date));
    }
  }

  protected onConfirm(): void {
    const pending = this.pendingDate();
    if (pending) {
      this.commit(pending);
    } else {
      this.close();
    }
  }

  protected onInput(raw: string): void {
    const trimmed = raw.trim();
    if (trimmed === '') {
      this.inputError.set(false);
      this.commit(null, false);
      return;
    }
    const parsed = parseDate(trimmed, this.locale());
    if (!parsed || this.outOfRange(parsed)) {
      this.inputError.set(true);
      return;
    }
    this.inputError.set(false);
    this.commit(startOfDay(parsed), false);
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

  private commit(date: Date | null, closeAfter = true): void {
    this.inputError.set(false);
    this.control.emit(date);
    this.control.markTouched();
    if (closeAfter) {
      this.close();
    }
  }
}
