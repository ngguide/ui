import { GuiSize } from './size';

/**
 * M3 button container corner radii per size, expressed as references to the
 * existing `--md-sys-shape-corner-*` tokens (no new tokens introduced).
 * Source: m3.material.io buttons/specs corner table.
 */
export interface GuiShapeSet {
  /** Resting shape for `shape="round"` (M3: Full for every size). */
  round: string;
  /** Resting shape for `shape="square"` and the toggle-selected flip target. */
  square: string;
  /** Shape while pressed (both round and square morph to this per M3). */
  pressed: string;
}

/** Per-size shape sets for common buttons and icon buttons (M3 corner table). */
export const GUI_BUTTON_SHAPES: Record<GuiSize, GuiShapeSet> = {
  xs: { round: 'var(--md-sys-shape-corner-full)', square: 'var(--md-sys-shape-corner-medium)', pressed: 'var(--md-sys-shape-corner-small)' },
  sm: { round: 'var(--md-sys-shape-corner-full)', square: 'var(--md-sys-shape-corner-medium)', pressed: 'var(--md-sys-shape-corner-small)' },
  md: { round: 'var(--md-sys-shape-corner-full)', square: 'var(--md-sys-shape-corner-large)', pressed: 'var(--md-sys-shape-corner-medium)' },
  lg: { round: 'var(--md-sys-shape-corner-full)', square: 'var(--md-sys-shape-corner-extra-large)', pressed: 'var(--md-sys-shape-corner-large)' },
  xl: { round: 'var(--md-sys-shape-corner-full)', square: 'var(--md-sys-shape-corner-extra-large)', pressed: 'var(--md-sys-shape-corner-large)' },
};
