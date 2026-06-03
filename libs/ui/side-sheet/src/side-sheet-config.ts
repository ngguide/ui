import { GuiModalConfigBase } from '@ngguide/ui/overlay';

export interface GuiSideSheetConfig<D = unknown>
  extends GuiModalConfigBase<D> {
  /** Sheet width (clamped 256–400dp by the surface). Default `400px`. */
  maxWidth?: string;
}

export { GUI_DIALOG_DATA, type GuiDialogRef } from '@ngguide/ui/overlay';
