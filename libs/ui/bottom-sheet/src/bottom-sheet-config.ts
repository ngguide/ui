import { GuiModalConfigBase } from '@ngguide/ui/overlay';

export interface GuiBottomSheetConfig<D = unknown>
  extends GuiModalConfigBase<D> {
  /** Show the M3 drag handle (32×4dp) at the top of the sheet. Default `true`. */
  showDragHandle?: boolean;
  /** Raise the bottom offset to clear a docked FAB. Default `false`. */
  aboveFab?: boolean;
  /** Downward drag distance (px) past which the sheet dismisses. Default 96. */
  dismissThreshold?: number;
  /** Max width on larger screens (full-width on compact). Default `640px`. */
  maxWidth?: string;
}

export { GUI_DIALOG_DATA, type GuiDialogRef } from '@ngguide/ui/overlay';
