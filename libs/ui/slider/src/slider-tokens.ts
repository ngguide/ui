import { GuiSize } from '@ngguide/ui';

/**
 * M3 slider dimensions per size. Mirrors the `Record<GuiSize, ...>` token-map
 * pattern used by the action tokens. Values trace to the M3 slider size ladder
 * (track height, handle height, track corner shape and the optional inset icon).
 */
export interface GuiSliderSizeSet {
  /** Height of the track. */
  trackHeight: string;
  /** Height of the handle (thumb). */
  handleHeight: string;
  /** Corner radius of the track ends. */
  trackShape: string;
  /** Inset icon size, or null when the size has no inset icon. */
  insetIcon: string | null;
}

/** Per-size dimension sets for the slider (M3 slider size table). */
export const GUI_SLIDER_SIZES: Record<GuiSize, GuiSliderSizeSet> = {
  xs: { trackHeight: '16px', handleHeight: '44px', trackShape: '8px', insetIcon: null },
  sm: { trackHeight: '24px', handleHeight: '44px', trackShape: '8px', insetIcon: null },
  md: { trackHeight: '40px', handleHeight: '52px', trackShape: '12px', insetIcon: '24px' },
  lg: { trackHeight: '56px', handleHeight: '68px', trackShape: '16px', insetIcon: '24px' },
  xl: { trackHeight: '96px', handleHeight: '108px', trackShape: '28px', insetIcon: '32px' },
};
