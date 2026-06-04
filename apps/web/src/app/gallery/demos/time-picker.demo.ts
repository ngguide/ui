import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GuiTime } from '@ngguide/ui/datetime';
import { IconComponent } from '@ngguide/ui/icon';
import { ClockDialComponent, TimePickerComponent } from '@ngguide/ui/time-picker';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 time picker (`@ngguide/ui/time-picker`).
 *
 * Per the strict-M3 reference (m3.material.io/components/time-pickers) a time
 * picker is a MODAL that covers the main content. The implemented
 * `TimePickerComponent` ships that whole contract as a self-contained trigger:
 * an outlined text field with a clock icon-button that opens the M3 modal
 * (no external dialog service is needed). The dimensions the M3 spec enumerates
 * and the component actually supports:
 *
 * - Two VARIANTS — `dial` (clock face, headline "Select time") and `input`
 *   (two spinbutton fields, headline "Enter time"). The open dialog also lets
 *   the user toggle between them via the keyboard/clock icon.
 * - Dial ORIENTATION — `vertical` (mobile default) and `horizontal`.
 * - Hour FORMAT — 12-hour (with AM/PM period selector) and 24-hour, via the
 *   `hour12` input (or derived from `locale` when left `null`).
 * - STATES — enabled and disabled (the M3 hover/focus/pressed states live on
 *   the live trigger + dialog internals).
 *
 * The component is form-bound through the shared `GuiFormControl<GuiTime>` host
 * directive, exposed as `[(time)]` / `(timeChange)`, `[formControl]`,
 * `[(ngModel)]`, and `[disabled]`. `ClockDialComponent` (`gui-clock-dial`) is
 * also a public export — the raw clock-face engine the dial variant composes —
 * so it gets its own block.
 *
 * DETERMINISM: every seeded value is an explicit `GuiTime` literal; there is no
 * clock read and no RNG anywhere (SSR-safe).
 */
@Component({
  selector: 'app-demo-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    TimePickerComponent,
    ClockDialComponent,
    IconComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <app-demo-component
      name="Time picker"
      entry="@ngguide/ui/time-picker"
      docHref="https://m3.material.io/components/time-pickers"
    >
      <!-- The two M3 variants. Open either trigger to see the modal. -->
      <app-demo-block
        heading="Variants"
        hint="The two M3 variants — dial (clock face) and input (spinbutton fields). Open a trigger to see the modal."
        [column]="true"
      >
        <app-demo-specimen label="dial" class="fill">
          <gui-time-picker variant="dial" label="Start time" [(time)]="dial" />
        </app-demo-specimen>
        <app-demo-specimen label="input" class="fill">
          <gui-time-picker variant="input" label="End time" [(time)]="input" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Dial layout: vertical (mobile default) vs horizontal. -->
      <app-demo-block
        heading="Orientation"
        hint="Dial layout — vertical (mobile default) and horizontal"
        [column]="true"
      >
        <app-demo-specimen label="vertical" class="fill">
          <gui-time-picker
            variant="dial"
            orientation="vertical"
            label="Vertical dial"
            [(time)]="vertical"
          />
        </app-demo-specimen>
        <app-demo-specimen label="horizontal" class="fill">
          <gui-time-picker
            variant="dial"
            orientation="horizontal"
            label="Horizontal dial"
            [(time)]="horizontal"
          />
        </app-demo-specimen>
        <app-demo-specimen label="horizontal · 24h" class="fill">
          <gui-time-picker
            variant="dial"
            orientation="horizontal"
            [hour12]="false"
            label="Horizontal 24-hour dial"
            [(time)]="horizontal24"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- 12-hour (AM/PM) vs 24-hour, for both variants. -->
      <app-demo-block
        heading="Hour format"
        hint="12-hour shows an AM/PM period selector; 24-hour uses a two-ring dial / 0–23 fields"
        [column]="true"
      >
        <app-demo-specimen label="dial · 12h" class="fill">
          <gui-time-picker
            variant="dial"
            [hour12]="true"
            label="Dial 12-hour"
            [(time)]="dial12"
          />
        </app-demo-specimen>
        <app-demo-specimen label="dial · 24h" class="fill">
          <gui-time-picker
            variant="dial"
            [hour12]="false"
            label="Dial 24-hour"
            [(time)]="dial24"
          />
        </app-demo-specimen>
        <app-demo-specimen label="input · 12h" class="fill">
          <gui-time-picker
            variant="input"
            [hour12]="true"
            label="Input 12-hour"
            [(time)]="input12"
          />
        </app-demo-specimen>
        <app-demo-specimen label="input · 24h" class="fill">
          <gui-time-picker
            variant="input"
            [hour12]="false"
            label="Input 24-hour"
            [(time)]="input24"
          />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Locale drives the default hour format when hour12 is left null. -->
      <app-demo-block
        heading="Locale"
        hint="When hour12 is null the format derives from locale — en-US → 12h, en-GB → 24h"
        [column]="true"
      >
        <app-demo-specimen label="en-US (12h default)" class="fill">
          <gui-time-picker locale="en-US" label="US time" [(time)]="localeUs" />
        </app-demo-specimen>
        <app-demo-specimen label="en-GB (24h default)" class="fill">
          <gui-time-picker locale="en-GB" label="UK time" [(time)]="localeGb" />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Enabled vs disabled (the M3 disabled treatment). -->
      <app-demo-block
        heading="States"
        hint="Enabled and disabled — the M3 hover/focus/pressed states live on the live trigger and dialog"
        [column]="true"
      >
        <app-demo-specimen label="enabled (seeded 09:41)" class="fill">
          <gui-time-picker label="Enabled" [(time)]="enabled" />
        </app-demo-specimen>
        <app-demo-specimen label="empty" class="fill">
          <gui-time-picker label="Empty" [(time)]="empty" />
        </app-demo-specimen>
        <app-demo-specimen label="disabled" class="fill">
          <gui-time-picker label="Disabled" [time]="disabledValue" disabled />
        </app-demo-specimen>
      </app-demo-block>

      <!-- Reactive forms binding — fully operable, live value readout. -->
      <app-demo-block
        heading="Reactive form"
        hint="Bound to a FormControl via ControlValueAccessor — pick a time and watch the value"
        [column]="true"
      >
        <app-demo-specimen label="FormControl (open + pick)" class="fill">
          <gui-time-picker variant="dial" label="Reminder" [formControl]="form" />
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ formText() }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ngModel binding — template-driven two-way. -->
      <app-demo-block
        heading="Template form (ngModel)"
        hint="Two-way [(ngModel)] binding"
        [column]="true"
      >
        <app-demo-specimen label="ngModel (open + pick)" class="fill">
          <gui-time-picker
            variant="input"
            label="Alarm"
            [(ngModel)]="model"
          />
        </app-demo-specimen>
        <app-demo-specimen label="value" class="fill">
          <code>{{ modelText() }}</code>
        </app-demo-specimen>
      </app-demo-block>

      <!-- The raw clock-face engine the dial variant composes (public export). -->
      <app-demo-block
        heading="Clock dial"
        hint="gui-clock-dial — the standalone M3 clock-face engine; drag a handle or use arrow keys"
        [column]="true"
      >
        <app-demo-specimen label="hours · 12h" class="fill">
          <gui-clock-dial mode="hours" [hour12]="true" [(value)]="dialHours12" />
        </app-demo-specimen>
        <app-demo-specimen label="hours · 24h (two rings)" class="fill">
          <gui-clock-dial mode="hours" [hour12]="false" [(value)]="dialHours24" />
        </app-demo-specimen>
        <app-demo-specimen label="minutes" class="fill">
          <gui-clock-dial mode="minutes" [(value)]="dialMinutes" />
        </app-demo-specimen>
      </app-demo-block>

      <app-demo-block
        heading="Icon"
        hint="The trailing trigger icon (Material Symbols schedule)"
      >
        <app-demo-specimen label="schedule">
          <gui-icon class="sym">schedule</gui-icon>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class TimePickerDemo {
  // Variant block.
  protected readonly dial = signal<GuiTime>({ hours: 9, minutes: 41 });
  protected readonly input = signal<GuiTime>({ hours: 17, minutes: 30 });

  // Orientation block.
  protected readonly vertical = signal<GuiTime>({ hours: 10, minutes: 15 });
  protected readonly horizontal = signal<GuiTime>({ hours: 14, minutes: 45 });
  protected readonly horizontal24 = signal<GuiTime>({ hours: 19, minutes: 10 });

  // Hour-format block.
  protected readonly dial12 = signal<GuiTime>({ hours: 8, minutes: 5 });
  protected readonly dial24 = signal<GuiTime>({ hours: 20, minutes: 5 });
  protected readonly input12 = signal<GuiTime>({ hours: 7, minutes: 0 });
  protected readonly input24 = signal<GuiTime>({ hours: 23, minutes: 59 });

  // Locale block.
  protected readonly localeUs = signal<GuiTime>({ hours: 13, minutes: 20 });
  protected readonly localeGb = signal<GuiTime>({ hours: 13, minutes: 20 });

  // States block.
  protected readonly enabled = signal<GuiTime>({ hours: 9, minutes: 41 });
  protected readonly empty = signal<GuiTime | null>(null);
  protected readonly disabledValue: GuiTime = { hours: 12, minutes: 0 };

  // Reactive form.
  protected readonly form = new FormControl<GuiTime | null>({
    hours: 6,
    minutes: 30,
  });

  // Template form.
  protected model: GuiTime | null = { hours: 22, minutes: 0 };

  // Clock-dial block.
  protected readonly dialHours12 = signal<GuiTime>({ hours: 3, minutes: 0 });
  protected readonly dialHours24 = signal<GuiTime>({ hours: 18, minutes: 0 });
  protected readonly dialMinutes = signal<GuiTime>({ hours: 0, minutes: 25 });

  protected formText(): string {
    return this.format(this.form.value);
  }

  protected modelText(): string {
    return this.format(this.model);
  }

  private format(value: GuiTime | null | undefined): string {
    if (!value) return 'null';
    const hh = String(value.hours).padStart(2, '0');
    const mm = String(value.minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
