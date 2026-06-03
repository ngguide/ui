import { GuiModalConfigBase } from '@ngguide/ui/overlay';

/**
 * Full-screen behavior for a dialog (Req 8):
 * - `never` (default) — always a centered basic dialog.
 * - `compact` — full-screen only in the compact window class (`< 600dp`).
 * - `always` — always full-screen.
 */
export type GuiDialogFullScreen = 'never' | 'compact' | 'always';

export interface GuiDialogConfig<D = unknown> extends GuiModalConfigBase<D> {
  /** When the dialog should occupy the full screen (Req 8.1). Default `never`. */
  fullScreen?: GuiDialogFullScreen;
  /**
   * Maximum width of the basic dialog. Default `min(560px, calc(100% - 48px))`
   * (M3 basic dialog max 560dp with a 24dp margin each side). Ignored in
   * full-screen mode.
   */
  maxWidth?: string;
}

export { GUI_DIALOG_DATA, type GuiDialogRef } from '@ngguide/ui/overlay';
