import { Injectable, TemplateRef, inject } from '@angular/core';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import {
  GuiBreakpoint,
  GuiDialogRef,
  asArray,
  normalizeModalConfig,
  wrapDialogRef,
} from '@ngguide/ui/overlay';
import { GuiBottomSheetConfig } from './bottom-sheet-config';
import { GuiBottomSheetContainer } from './bottom-sheet-container';

/**
 * Opens M3 **modal** bottom sheets over the headless CDK `Dialog` service: a
 * bottom-anchored surface with a scrim, focus trap, focus restore and a
 * drag-to-dismiss handle (Req 9.1, 12). Returns a {@link GuiDialogRef} whose
 * `closed` emits the result (`'swipe'` when dismissed by drag). For a
 * non-modal sheet that coexists with the page, use the standard
 * `<gui-bottom-sheet variant="standard">` surface instead (Req 9.2).
 */
@Injectable({ providedIn: 'root' })
export class GuiBottomSheet {
  private readonly cdkDialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly breakpoint = inject(GuiBreakpoint);

  open<R = unknown, D = unknown, C = unknown>(
    content: ComponentType<C> | TemplateRef<C>,
    config?: GuiBottomSheetConfig<D>,
  ): GuiDialogRef<R> {
    if (content == null) {
      throw new Error(
        'GuiBottomSheet.open() requires a component type or a TemplateRef.',
      );
    }

    const maxWidth = this.breakpoint.isCompact()
      ? '100%'
      : config?.maxWidth ?? '640px';

    const cdkConfig: DialogConfig<D, DialogRef<R, C>> & {
      guiShowDragHandle?: boolean;
      guiDismissThreshold?: number;
    } = {
      ...normalizeModalConfig<D>(config),
      container: GuiBottomSheetContainer,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .bottom('0'),
      width: '100%',
      maxWidth,
      panelClass: ['gui-bottom-sheet-pane', ...asArray(config?.panelClass)],
      guiShowDragHandle: config?.showDragHandle ?? true,
      guiDismissThreshold: config?.dismissThreshold ?? 96,
    };

    const ref = this.cdkDialog.open<R, D, C>(content, cdkConfig);
    return wrapDialogRef(ref);
  }
}
