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
  GuiTime,
  formatTime,
  parseTime,
  prefersHour12,
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
import { ClockDialComponent } from './clock-dial';

type Period = 'AM' | 'PM';

/**
 * M3 time picker. A modal dialog with two variants: `dial` (clock face) and
 * `input` (two spinbutton fields). Composes the shared GuiFormControl<GuiTime>
 * so it works with reactive/template forms. Trigger is an outlined text field.
 */
@Component({
  selector: 'gui-time-picker',
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.css',
  imports: [
    TextFieldComponent,
    TextFieldInputDirective,
    TextFieldTrailingDirective,
    IconButtonComponent,
    IconComponent,
    ButtonComponent,
    ClockDialComponent,
  ],
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value: time', 'disabled'],
      outputs: ['valueChange: timeChange'],
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimePickerComponent {
  protected readonly control = inject(GuiFormControl<GuiTime>);
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly variant = input<'dial' | 'input'>('dial');
  readonly hour12 = input<boolean | null>(null);
  readonly locale = input('en-US');
  readonly label = input('Time');

  protected readonly effectiveHour12 = computed(
    () => this.hour12() ?? prefersHour12(this.locale()),
  );

  private readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');

  /** Variant shown inside the open dialog (toggled by the keyboard icon). */
  protected readonly activeVariant = signal<'dial' | 'input'>('dial');
  /** Which unit the dial is editing. */
  protected readonly dialMode = signal<'hours' | 'minutes'>('hours');
  /** Staged selection, committed on OK. */
  protected readonly pendingTime = signal<GuiTime>({ hours: 0, minutes: 0 });
  /** Parse error for typed fields. */
  protected readonly hourError = signal(false);
  protected readonly minuteError = signal(false);

  private handle: GuiOverlayHandle | null = null;

  protected readonly displayValue = computed(() => {
    const value = this.control.value();
    return value
      ? formatTime(value, this.locale(), this.effectiveHour12())
      : '';
  });

  // --- Derived display values for the dialog ---------------------------------

  protected readonly period = computed<Period>(() =>
    this.pendingTime().hours >= 12 ? 'PM' : 'AM',
  );

  /** Hour as shown in the spinbutton (1..12 in 12h, 0..23 in 24h). */
  protected readonly displayHour = computed(() => {
    const h = this.pendingTime().hours;
    if (!this.effectiveHour12()) return h;
    const mod = h % 12;
    return mod === 0 ? 12 : mod;
  });

  protected readonly displayMinute = computed(() => this.pendingTime().minutes);

  protected readonly hourMin = computed(() => (this.effectiveHour12() ? 1 : 0));
  protected readonly hourMax = computed(() => (this.effectiveHour12() ? 12 : 23));

  protected readonly hourText = computed(() =>
    String(this.displayHour()).padStart(2, '0'),
  );
  protected readonly minuteText = computed(() =>
    String(this.displayMinute()).padStart(2, '0'),
  );

  // --- Open / close ----------------------------------------------------------

  protected open(): void {
    if (this.control.effectiveDisabled() || this.handle) return;

    this.pendingTime.set(this.control.value() ?? { hours: 0, minutes: 0 });
    this.activeVariant.set(this.variant());
    this.dialMode.set('hours');
    this.hourError.set(false);
    this.minuteError.set(false);

    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.handle = this.overlay.openModal(portal, { ariaLabel: this.label() });
    this.handle.closed.subscribe(() => {
      this.handle = null;
    });
  }

  protected close(): void {
    this.handle?.close();
  }

  protected toggleVariant(): void {
    this.activeVariant.update((v) => (v === 'dial' ? 'input' : 'dial'));
  }

  protected onConfirm(): void {
    this.control.emit(this.pendingTime());
    this.control.markTouched();
    this.close();
  }

  // --- Dial ------------------------------------------------------------------

  protected onDialChange(time: GuiTime | undefined): void {
    if (!time) return;
    this.pendingTime.set(time);
  }

  // --- Spinbutton: hours -----------------------------------------------------

  protected stepHour(delta: number): void {
    const cur = this.pendingTime();
    if (this.effectiveHour12()) {
      const shown = this.displayHour(); // 1..12
      const next = ((shown - 1 + delta + 12) % 12) + 1;
      this.pendingTime.set({
        ...cur,
        hours: this.to24(next, this.period()),
      });
    } else {
      const next = (cur.hours + delta + 24) % 24;
      this.pendingTime.set({ ...cur, hours: next });
    }
    this.hourError.set(false);
  }

  protected onHourInput(raw: string): void {
    const n = Number(raw.trim());
    if (raw.trim() === '' || Number.isNaN(n)) {
      this.hourError.set(true);
      return;
    }
    if (this.effectiveHour12()) {
      if (n < 1 || n > 12) {
        this.hourError.set(true);
        return;
      }
      this.pendingTime.update((t) => ({
        ...t,
        hours: this.to24(n, this.period()),
      }));
    } else {
      if (n < 0 || n > 23) {
        this.hourError.set(true);
        return;
      }
      this.pendingTime.update((t) => ({ ...t, hours: n }));
    }
    this.hourError.set(false);
  }

  // --- Spinbutton: minutes ---------------------------------------------------

  protected stepMinute(delta: number): void {
    this.pendingTime.update((t) => ({
      ...t,
      minutes: (t.minutes + delta + 60) % 60,
    }));
    this.minuteError.set(false);
  }

  protected onMinuteInput(raw: string): void {
    const n = Number(raw.trim());
    if (raw.trim() === '' || Number.isNaN(n) || n < 0 || n > 59) {
      this.minuteError.set(true);
      return;
    }
    this.pendingTime.update((t) => ({ ...t, minutes: n }));
    this.minuteError.set(false);
  }

  // --- Period ----------------------------------------------------------------

  protected setPeriod(period: Period): void {
    if (this.period() === period) return;
    const shown = this.displayHour();
    this.pendingTime.update((t) => ({ ...t, hours: this.to24(shown, period) }));
  }

  protected onHourKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.stepHour(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.stepHour(-1);
    }
  }

  protected onMinuteKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.stepMinute(1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.stepMinute(-1);
    }
  }

  /** Combine a 1..12 display hour + period into an internal 0..23 hour. */
  private to24(shown: number, period: Period): number {
    const base = shown % 12; // 12 -> 0
    return period === 'PM' ? base + 12 : base;
  }

  /** Parse helper used by the typed-input validation contract (see spec). */
  protected validate(raw: string): boolean {
    return parseTime(raw, this.effectiveHour12()) !== null;
  }
}
