/**
 * Static CSS for the M3 interaction layer, injected once by
 * {@link GuiInteractionStyles}. Every opacity, color, offset and duration is
 * read from the existing `--md-sys-*` token contract (`m3-tokens`) — there are
 * no literal interaction values here (strict M3 fidelity).
 *
 * Layers (see design "State layering"):
 *  - `.gui-state-layer::before` — the tinted overlay (hover/focus/pressed/dragged)
 *  - `.gui-ripple`              — the transient pressed-ripple span (WAAP-driven)
 *  - `.gui-focus-ring`          — the keyboard focus indicator (outline)
 *
 * Per-state opacity rules, ripple containment and focus-ring color are appended
 * by later groups (B/C/D) into the same string.
 */
export const INTERACTION_CSS = `
/* --- Host setup: positions the ::before overlay and clips overlays/ripples to
   the host's shape. The host's own box-shadow is NOT clipped by its own
   overflow, so elevated components keep their elevation. --- */
.gui-state-layer {
  position: relative;
  overflow: hidden;
}

/* --- State-layer overlay. Tints with the host content color (currentColor) so
   it adapts to light/dark automatically; opacity defaults to 0 (enabled, idle)
   and is raised per state by Group B rules. --- */
.gui-state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-duration-short2)
    var(--md-sys-motion-easing-standard);
}

/* --- Per-state opacities, each from its --md-sys-state-* token (Req 1.6).

   Precedence is expressed by "yielding" rather than specificity hacks:
     - hover / focus apply only while idle (no JS state) and enabled, so a
       pressed or dragged interaction takes over cleanly;
     - hover+focus is additive (the M3 combined state, Req 1.8);
     - pressed and dragged are mutually exclusive (the directive emits exactly
       one), and both yield to the disabled condition;
     - disabled (input flag, native :disabled, or aria-disabled) suppresses the
       overlay entirely (Req 4.1). --- */
.gui-state-layer:hover:not([data-gui-state]):not([data-gui-disabled])::before {
  opacity: var(--md-sys-state-hover-state-layer-opacity);
}
.gui-state-layer:focus-visible:not([data-gui-state]):not([data-gui-disabled])::before {
  opacity: var(--md-sys-state-focus-state-layer-opacity);
}
.gui-state-layer:hover:focus-visible:not([data-gui-state]):not([data-gui-disabled])::before {
  opacity: calc(
    var(--md-sys-state-hover-state-layer-opacity) +
      var(--md-sys-state-focus-state-layer-opacity)
  );
}
.gui-state-layer[data-gui-state~='pressed']:not([data-gui-disabled])::before {
  opacity: var(--md-sys-state-pressed-state-layer-opacity);
}
.gui-state-layer[data-gui-state~='dragged']:not([data-gui-disabled])::before {
  opacity: var(--md-sys-state-dragged-state-layer-opacity);
}
.gui-state-layer[data-gui-disabled]::before,
.gui-state-layer:disabled::before,
.gui-state-layer[aria-disabled='true']::before {
  opacity: 0;
}

/* --- Ripple host. Establishes the positioning context and clips ripples (and
   the ::before overlay) to the host's shape via overflow. The host's own
   box-shadow is NOT clipped by its own overflow, so elevated components keep
   their elevation while the ripple stays inside the shape (Req 2.5). --- */
.gui-ripple-host {
  position: relative;
  overflow: hidden;
}

/* --- Ripple span. Geometry (size/position) and the scale+opacity animation are
   supplied by GuiRippleDirective via the Web Animations API; this only
   establishes paint defaults. It tints with the host content color and scales
   from its own center (Req 2.4). --- */
.gui-ripple {
  position: absolute;
  border-radius: 50%;
  background: currentColor;
  pointer-events: none;
  transform-origin: center;
}

/* --- Reduced motion (Req 5.1, 5.2). The JS gate in GuiRippleDirective is the
   primary guard (no ripple span is even created); these rules remove the
   non-essential state-change transition and hide any ripple as a belt-and-
   suspenders fallback. --- */
@media (prefers-reduced-motion: reduce) {
  .gui-state-layer::before {
    transition: none;
  }
  .gui-ripple {
    display: none;
  }
}

/* --- Focus indicator. Hidden until the focus-ring directive marks keyboard
   focus; color/offset refined by Group D. --- */
.gui-focus-ring {
  outline: none;
}
.gui-focus-ring.gui-focus-visible {
  outline: var(--md-sys-state-focus-indicator-thickness) solid currentColor;
  outline-offset: var(--md-sys-state-focus-indicator-outer-offset);
}
`;
