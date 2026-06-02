import { Injectable, RendererFactory2, inject, DOCUMENT } from '@angular/core';
import { INTERACTION_CSS } from './interaction.css';

/**
 * Injects the shared interaction stylesheet ({@link INTERACTION_CSS}) into
 * `<head>` exactly once. Mirrors the proven `M3StyleApplier` pattern
 * (`libs/ui/theme/src/style-applier.ts`): `RendererFactory2.createRenderer`
 * works on both platforms and `@angular/platform-server` serializes the
 * appended `<style>` so first paint matches and hydration adopts the existing
 * element rather than duplicating it (Req 7.4). Degrades silently when there is
 * no document head (Req 7.3).
 */
@Injectable({ providedIn: 'root' })
export class GuiInteractionStyles {
  private readonly doc = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private injected = false;

  /** Idempotent; directives call this on init so the layer CSS is present. */
  ensure(): void {
    if (this.injected) {
      return;
    }
    const head = this.doc.head;
    if (!head) {
      // No document head (extremely degraded host) — stay un-injected so a
      // later call on a real DOM can still inject.
      return;
    }
    // On the client a server-serialized `<style data-gui-interaction>` may
    // already exist (from SSR). Adopt it instead of appending a duplicate.
    const existing = head.querySelector('style[data-gui-interaction]');
    if (!existing) {
      const el = this.renderer.createElement('style') as HTMLStyleElement;
      this.renderer.setAttribute(el, 'data-gui-interaction', '');
      this.renderer.setProperty(el, 'textContent', INTERACTION_CSS);
      this.renderer.appendChild(head, el);
    }
    this.injected = true;
  }
}
