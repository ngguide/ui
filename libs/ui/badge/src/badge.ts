import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/** Announced for a non-counting (dot) badge per M3 accessibility guidance. */
const NEW_NOTIFICATION_LABEL = 'New notification';

/** M3 limits badge content to four characters, including a trailing `+`. */
const MAX_BADGE_CHARS = 4;

/**
 * M3 badge — a small status overlay anchored to the top-trailing corner of its
 * host element (typically an icon button or avatar).
 *
 * - No `guiBadge` value (or empty string) ⇒ a 6dp **dot** (small variant).
 * - A value present ⇒ a **numeric** badge (large variant), capped as `"{max}+"`.
 *
 * Per M3, the badge carries its own accessible announcement: numeric badges have
 * their number read, while the non-counting dot announces "New notification".
 * This is exposed via the badge graphic's `aria-label`, read after the host's
 * own accessible name (e.g. its navigation destination).
 *
 * The badge overflows the host's bounds, so the host must not clip overflow.
 * Elements that clip for a state layer (e.g. icon buttons) should be wrapped in
 * a non-clipping badge host such as `<span guiBadge><button …>…</button></span>`.
 *
 * Requires the kit theme stylesheet (`@ngguide/ui/styles/theme.css`), which
 * carries the `.gui-badge` styling.
 */
@Directive({
  selector: '[guiBadge]',
  host: {
    class: 'gui-badge-host',
    '[style.position]': '"relative"',
    '[attr.data-gui-badge-variant]': 'variant()',
    '[attr.data-gui-badge-hidden]': 'isHidden() ? "true" : null',
  },
})
export class GuiBadge {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private badgeEl: HTMLSpanElement | null = null;

  /** Numeric/string value. Empty/absent ⇒ small dot; present ⇒ large numeric badge. */
  readonly value = input<number | string | null>(null, { alias: 'guiBadge' });
  /** Max before the `"{max}+"` cap. M3 does not publish the number; default 999. */
  readonly max = input(999, { alias: 'guiBadgeMax', transform: numberAttribute });
  /** Force-hide without removing the directive. */
  readonly hidden = input(false, {
    alias: 'guiBadgeHidden',
    transform: booleanAttribute,
  });

  protected readonly variant = computed<'small' | 'large'>(() =>
    this.value() === null || this.value() === '' ? 'small' : 'large',
  );
  protected readonly isHidden = computed(() => this.hidden());
  /**
   * Capped display text for the large badge (e.g. "999+"), limited to M3's
   * four-character maximum (including a trailing `+`).
   */
  protected readonly display = computed(() => {
    const v = this.value();
    if (v == null) {
      return '';
    }
    const text =
      typeof v === 'number' && v > this.max() ? `${this.max()}+` : String(v);
    return text.slice(0, MAX_BADGE_CHARS);
  });

  /**
   * Accessible announcement for the badge graphic. The numeric badge reads its
   * number; the non-counting dot announces "New notification".
   */
  protected readonly announcement = computed(() =>
    this.variant() === 'large' ? this.display() : NEW_NOTIFICATION_LABEL,
  );

  constructor() {
    effect(() => {
      const el = this.ensureBadge();
      // Only the large (numeric) variant carries text; the small dot is empty.
      const text = this.variant() === 'large' ? this.display() : '';
      this.renderer.setProperty(el, 'textContent', text);
      // Expose the announcement via aria-label so the badge is read after the
      // host's own accessible name (the visible number is not double-read).
      this.renderer.setAttribute(el, 'aria-label', this.announcement());
    });
  }

  private ensureBadge(): HTMLSpanElement {
    if (!this.badgeEl) {
      const el = this.renderer.createElement('span') as HTMLSpanElement;
      this.renderer.addClass(el, 'gui-badge');
      this.renderer.setAttribute(el, 'role', 'img');
      this.renderer.appendChild(this.host.nativeElement, el);
      this.badgeEl = el;
    }
    return this.badgeEl;
  }
}
