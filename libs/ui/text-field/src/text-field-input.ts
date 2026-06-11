import {
  afterEveryRender,
  computed,
  Directive,
  ElementRef,
  inject,
  signal,
} from '@angular/core';

/**
 * Marks the consumer-authored `<input>`/`<textarea>` projected into
 * `<gui-text-field>`. The wrapper observes this directive's signals to draw M3
 * chrome. It deliberately provides NO value accessor (deviation D1) — the
 * consumer keeps their own `ngModel`/`formControl` on the native element.
 */
@Directive({
  selector: 'input[guiTextFieldInput], textarea[guiTextFieldInput]',
  exportAs: 'guiTextFieldInput',
  standalone: true,
  host: {
    '(focus)': 'focused.set(true)',
    '(blur)': 'focused.set(false)',
    '(input)': 'empty.set(!el.value)',
  },
})
export class TextFieldInputDirective {
  /** The native input/textarea element. */
  readonly el = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(
    ElementRef,
  ).nativeElement;

  readonly focused = signal(false);
  readonly empty = signal(true);
  readonly multiline = computed(() => this.el.tagName === 'TEXTAREA');

  constructor() {
    // Keep `empty` in sync with the actual native value even when it changes
    // WITHOUT firing an `input` event: an initial/pre-filled value, or a
    // programmatic form write (ngModel / reactive-forms patch). Without this a
    // pre-filled field renders with its label un-floated, overlapping the value.
    // `afterEveryRender` runs after every change-detection pass, so a form
    // patch (which schedules CD) re-syncs the populated state; the signal's
    // equality check makes the steady-state read a no-op.
    afterEveryRender(() => this.empty.set(!this.el.value));
  }

  /** Current value length, used by the wrapper's character counter. */
  valueLength(): number {
    return this.el.value.length;
  }
}

/** Marker for content projected into the leading (start) slot. */
@Directive({
  selector: '[guiTextFieldLeading]',
  standalone: true,
})
export class TextFieldLeadingDirective {}

/** Marker for content projected into the trailing (end) slot. */
@Directive({
  selector: '[guiTextFieldTrailing]',
  standalone: true,
})
export class TextFieldTrailingDirective {}
