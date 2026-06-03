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

/**
 * M3 badge — a small status overlay anchored to the top-trailing corner of its
 * host element (typically an icon button or avatar).
 *
 * - No `guiBadge` value (or empty string) ⇒ a 6dp **dot** (small variant).
 * - A value present ⇒ a **numeric** badge (large variant), capped as `"{max}+"`.
 *
 * The injected badge graphic is `aria-hidden`; the meaning must be conveyed by
 * the host's own accessible name (e.g. `aria-label="Notifications, 3 unread"`).
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
  /** Capped display text for the large badge (e.g. "999+"). */
  protected readonly display = computed(() => {
    const v = this.value();
    if (typeof v === 'number' && v > this.max()) {
      return `${this.max()}+`;
    }
    return v == null ? '' : String(v);
  });

  constructor() {
    effect(() => {
      const el = this.ensureBadge();
      // Only the large (numeric) variant carries text; the small dot is empty.
      const text = this.variant() === 'large' ? this.display() : '';
      this.renderer.setProperty(el, 'textContent', text);
    });
  }

  private ensureBadge(): HTMLSpanElement {
    if (!this.badgeEl) {
      const el = this.renderer.createElement('span') as HTMLSpanElement;
      this.renderer.addClass(el, 'gui-badge');
      this.renderer.setAttribute(el, 'aria-hidden', 'true');
      this.renderer.appendChild(this.host.nativeElement, el);
      this.badgeEl = el;
    }
    return this.badgeEl;
  }
}
