import { Injectable, RendererFactory2, inject, DOCUMENT } from '@angular/core';

/**
 * Applies dynamic-color CSS by maintaining a single `<style>` element at the
 * end of `<head>` (Decision 3A). SSR-safe: `RendererFactory2.createRenderer`
 * works on both platforms, and on the server `@angular/platform-server`
 * serializes the appended element into the HTML — giving identical first paint
 * and no hydration shift (Req 10.2, 10.3). Appending after the statically
 * imported baseline lets equal-specificity `:root` rules win (Req 6.5); the
 * element is reused, so re-applying replaces its text (Req 6.3).
 */
@Injectable({ providedIn: 'root' })
export class M3StyleApplier {
  private readonly doc = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private styleEl: HTMLStyleElement | null = null;

  /** Create-or-replace the managed `<style>` with `css`. Never throws (Req 10.2). */
  apply(css: string): void {
    const head = this.doc.head;
    if (!head) {
      // No document head (extremely degraded host) — degrade gracefully.
      return;
    }
    if (!this.styleEl) {
      // On the client, a server-serialized `<style data-m3-dynamic>` may already
      // be in <head> (from SSR). Adopt it instead of appending a duplicate, so a
      // single managed element survives hydration (Req 6.3, 10.3). Any extras are
      // dropped to converge on exactly one.
      const existing = head.querySelectorAll<HTMLStyleElement>('style[data-m3-dynamic]');
      if (existing.length > 0) {
        this.styleEl = existing[existing.length - 1];
        for (let i = 0; i < existing.length - 1; i++) {
          this.renderer.removeChild(head, existing[i]);
        }
      } else {
        const el = this.renderer.createElement('style') as HTMLStyleElement;
        this.renderer.setAttribute(el, 'data-m3-dynamic', '');
        this.renderer.appendChild(head, el);
        this.styleEl = el;
      }
    }
    this.renderer.setProperty(this.styleEl, 'textContent', css);
  }
}
