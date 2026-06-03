import { Injectable, TemplateRef, inject } from '@angular/core';
import { ComponentType, Overlay } from '@angular/cdk/overlay';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import {
  GuiDialogRef,
  asArray,
  normalizeModalConfig,
  wrapDialogRef,
} from '@ngguide/ui/overlay';
import { GuiSideSheetConfig } from './side-sheet-config';
import { GuiSideSheetContainer } from './side-sheet-container';

/**
 * Opens M3 **modal** side sheets over the headless CDK `Dialog` service: an
 * end-docked, full-height surface with a scrim, focus trap, focus restore and
 * Escape (Req 10.1, 12). Returns a {@link GuiDialogRef} whose `closed` emits the
 * result. For a non-modal side sheet that coexists with the page, use the
 * standard `<gui-side-sheet variant="standard">` surface instead (Req 10.3).
 */
@Injectable({ providedIn: 'root' })
export class GuiSideSheet {
  private readonly cdkDialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  open<R = unknown, D = unknown, C = unknown>(
    content: ComponentType<C> | TemplateRef<C>,
    config?: GuiSideSheetConfig<D>,
  ): GuiDialogRef<R> {
    if (content == null) {
      throw new Error(
        'GuiSideSheet.open() requires a component type or a TemplateRef.',
      );
    }

    const cdkConfig: DialogConfig<D, DialogRef<R, C>> = {
      ...normalizeModalConfig<D>(config),
      container: GuiSideSheetContainer,
      positionStrategy: this.overlay
        .position()
        .global()
        .top('0')
        .right('0'),
      height: '100%',
      maxWidth: config?.maxWidth ?? '400px',
      panelClass: ['gui-side-sheet-pane', ...asArray(config?.panelClass)],
    };

    const ref = this.cdkDialog.open<R, D, C>(content, cdkConfig);
    return wrapDialogRef(ref);
  }
}
