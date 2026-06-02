import {
  Directive,
  ElementRef,
  Renderer2,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { GuiReducedMotion } from './reduced-motion';
import { GuiInteractionStyles } from './interaction-styles';
import { isHostDisabled } from './disabled';

/**
 * Animates the M3 pressed ripple with the Web Animations API (Decision 2A).
 * Browser-only (driven by pointer/keyboard events that never fire on the
 * server), reduced-motion-gated (Req 5.1) and disabled-suppressed (Req 4.2).
 *
 * Motion is sourced from the live token contract via `getComputedStyle` — never
 * hard-coded: the press-grow duration is `--md-sys-motion-duration-long1`
 * (matching Material's own ripple PRESS_GROW timing) with
 * `--md-sys-motion-easing-standard`, and the start opacity is
 * `--md-sys-state-pressed-state-layer-opacity` (Req 2.4). The literal fallbacks
 * below are degradation-only (used if the directive runs before tokens load).
 */
@Directive({
  selector: '[guiRipple]',
  host: {
    class: 'gui-ripple-host',
    '(pointerdown)': 'launch($event)',
    '(keydown.enter)': 'launchCentered()',
    '(keydown.space)': 'launchCentered()',
  },
})
export class GuiRippleDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly reducedMotion = inject(GuiReducedMotion);
  private readonly styles = inject(GuiInteractionStyles);

  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || isHostDisabled(this.host.nativeElement),
  );

  constructor() {
    this.styles.ensure();
  }

  /** Pointer activation — ripple originates at the interaction point (Req 2.1). */
  launch(event: PointerEvent): void {
    this.fade(event.clientX, event.clientY);
  }

  /** Keyboard activation — ripple originates from the host center (Req 2.2). */
  launchCentered(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    this.fade(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  private fade(clientX: number, clientY: number): void {
    const el = this.host.nativeElement;
    // Suppress when disabled (Req 4.2) or reduced motion is preferred (Req 5.1).
    if (this.isDisabled() || this.reducedMotion.prefersReducedMotion()) {
      return;
    }
    // Graceful skip where WAAP is unavailable (jsdom / very old browsers).
    if (typeof el.animate !== 'function') {
      return;
    }

    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    // Radius reaches the farthest corner so the ripple fully covers the host.
    const radius = Math.hypot(
      Math.max(x, rect.width - x),
      Math.max(y, rect.height - y),
    );
    const diameter = radius * 2;

    const span = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(span, 'gui-ripple');
    this.renderer.setStyle(span, 'width', `${diameter}px`);
    this.renderer.setStyle(span, 'height', `${diameter}px`);
    this.renderer.setStyle(span, 'left', `${x - radius}px`);
    this.renderer.setStyle(span, 'top', `${y - radius}px`);
    this.renderer.appendChild(el, span);

    const opacity = Number(
      this.readToken('--md-sys-state-pressed-state-layer-opacity', '0.12'),
    );
    const duration = this.readDurationMs('--md-sys-motion-duration-long1', 450);
    const easing = this.readToken(
      '--md-sys-motion-easing-standard',
      'cubic-bezier(0.2, 0, 0, 1)',
    );

    const anim = span.animate(
      [
        { transform: 'scale(0)', opacity },
        { transform: 'scale(1)', opacity: 0 },
      ],
      { duration, easing, fill: 'forwards' },
    );
    // Remove the span once the animation settles — whether it finished or was
    // cancelled — so no residual overlay remains (Req 2.6, 2.7).
    const cleanup = () => this.renderer.removeChild(el, span);
    anim.finished.then(cleanup, cleanup);
  }

  private readToken(name: string, fallback: string): string {
    const value = getComputedStyle(this.host.nativeElement)
      .getPropertyValue(name)
      .trim();
    return value || fallback;
  }

  private readDurationMs(name: string, fallbackMs: number): number {
    const raw = this.readToken(name, '');
    if (raw.endsWith('ms')) {
      return parseFloat(raw);
    }
    if (raw.endsWith('s')) {
      return parseFloat(raw) * 1000;
    }
    return fallbackMs;
  }
}
