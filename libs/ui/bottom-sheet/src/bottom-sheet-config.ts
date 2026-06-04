import { GuiModalConfigBase } from '@ngguide/ui/overlay';

export interface GuiBottomSheetConfig<D = unknown>
  extends GuiModalConfigBase<D> {
  /** Show the M3 drag handle (32×4dp) at the top of the sheet. Default `true`. */
  showDragHandle?: boolean;
  /** Downward drag distance (px) past which the sheet dismisses. Default 96. */
  dismissThreshold?: number;
  /**
   * Preset heights, as fractions of the viewport height (0–1), the drag handle
   * cycles through when activated with a non-touch input (Space/Enter). M3
   * requires resizing without relying on touch gestures. Default `[0.5, 0.9]`.
   */
  heights?: readonly number[];
  /** Accessible label for the drag-handle button. Default `Resize bottom sheet`. */
  dragHandleLabel?: string;
  /** Max width on larger screens (full-width on compact). Default `640px`. */
  maxWidth?: string;
}

export { GUI_DIALOG_DATA, type GuiDialogRef } from '@ngguide/ui/overlay';
