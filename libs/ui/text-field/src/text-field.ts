import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
} from '@angular/core';
import {
  TextFieldInputDirective,
  TextFieldLeadingDirective,
  TextFieldTrailingDirective,
} from './text-field-input';

/** Module-scoped counter for SSR-safe, stable element ids. */
let nextId = 0;

/**
 * M3 text field — a presentational wrapper (decision 1B). The consumer authors
 * their own `<input>`/`<textarea>` inside it and marks it `[guiTextFieldInput]`;
 * the wrapper only draws filled/outlined M3 chrome by observing that input
 * (deviation D1: no CVA on the wrapper).
 */
@Component({
  selector: 'gui-text-field',
  exportAs: 'guiTextField',
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-variant]': 'variant()',
    '[attr.data-focused]': 'input().focused() ? "" : null',
    '[attr.data-populated]': '!input().empty() ? "" : null',
    '[attr.data-error]': 'error() ? "" : null',
    '[attr.data-disabled]': 'input().el.disabled ? "" : null',
    '[attr.data-multiline]': 'input().multiline() ? "" : null',
    '[attr.data-has-leading]': 'leading() ? "" : null',
    '[attr.data-has-trailing]': 'trailing() ? "" : null',
  },
})
export class TextFieldComponent {
  readonly variant = input<'filled' | 'outlined'>('filled');
  readonly label = input('');
  readonly supportingText = input('');
  readonly errorText = input('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly prefix = input('');
  readonly suffix = input('');
  readonly maxLength = input<number | null>(null);

  protected readonly input = contentChild.required(TextFieldInputDirective);
  protected readonly leading = contentChild(TextFieldLeadingDirective);
  protected readonly trailing = contentChild(TextFieldTrailingDirective);

  /** Stable ids for the label/supporting/counter elements (aria refs). */
  protected readonly uid = nextId++;
  protected readonly labelId = `gui-tf-label-${this.uid}`;
  protected readonly supportingId = `gui-tf-supporting-${this.uid}`;
  protected readonly counterId = `gui-tf-counter-${this.uid}`;

  /**
   * Click-to-focus: clicking anywhere in the field body (label, prefix/suffix,
   * padding) focuses the input — the native `<label>` behaviour the projected
   * input can't provide on its own. Clicks on interactive leading/trailing
   * content (e.g. an icon button) are left alone, as is a click on the input.
   */
  protected onContainerClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      target === this.input().el ||
      target.closest('[guiTextFieldLeading], [guiTextFieldTrailing]')
    ) {
      return;
    }
    this.input().el.focus();
  }

  protected readonly counter = computed(() => {
    const max = this.maxLength();
    if (max == null) {
      return null;
    }
    // Depend on `empty` so the counter recomputes on each input event.
    this.input().empty();
    return `${this.input().valueLength()}/${max}`;
  });

  constructor() {
    afterRenderEffect(() => {
      const el = this.input().el;
      const ids: string[] = [];
      if ((this.error() && this.errorText()) || this.supportingText()) {
        ids.push(this.supportingId);
      }
      if (this.counter()) {
        ids.push(this.counterId);
      }
      // Merge our description ids with any the consumer already wired, instead
      // of clobbering theirs. Our own ids are stable, so filtering them out of
      // the current value recovers exactly the consumer-supplied tokens.
      const ours = new Set([this.supportingId, this.counterId]);
      const theirs = (el.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((token) => token && !ours.has(token));
      const describedBy = [...theirs, ...ids];
      if (describedBy.length) {
        el.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        el.removeAttribute('aria-describedby');
      }
      el.setAttribute('aria-invalid', String(this.error()));
      if (this.required()) {
        el.setAttribute('aria-required', 'true');
      } else {
        el.removeAttribute('aria-required');
      }

      // When a max length is configured, enforce it natively too (the counter
      // alone is advisory). Only set it — never remove, so a consumer's own
      // maxlength survives when our input is unset.
      const max = this.maxLength();
      if (max != null) {
        el.setAttribute('maxlength', String(max));
      }

      // The floating label names the input — unless the consumer supplied
      // their own accessible name, in which case we don't override it.
      const hasOwnName =
        el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
      if (this.label() && !hasOwnName) {
        el.setAttribute('aria-labelledby', this.labelId);
      }
    });
  }
}
