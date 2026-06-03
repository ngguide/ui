import { Injectable, TemplateRef, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import {
  GuiBreakpoint,
  GuiDialogRef,
  asArray,
  normalizeModalConfig,
  wrapDialogRef,
} from '@ngguide/ui/overlay';
import { GuiDialogConfig, GuiDialogFullScreen } from './dialog-config';
import { GuiDialogContainer } from './dialog-container';

const DEFAULT_MAX_WIDTH = 'min(560px, calc(100% - 48px))';

/**
 * Opens M3 dialogs imperatively over the headless CDK `Dialog` service
 * (Req 16.2). Returns a {@link GuiDialogRef} whose `closed` observable emits the
 * close result. Accepts either a component type or an inline `TemplateRef`
 * (the CDK `Dialog.open` template overload). Full-screen selection (Req 8) is
 * resolved against {@link GuiBreakpoint}.
 */
@Injectable({ providedIn: 'root' })
export class GuiDialog {
  private readonly cdkDialog = inject(Dialog);
  private readonly breakpoint = inject(GuiBreakpoint);

  open<R = unknown, D = unknown, C = unknown>(
    content: ComponentType<C> | TemplateRef<C>,
    config?: GuiDialogConfig<D>,
  ): GuiDialogRef<R> {
    if (content == null) {
      throw new Error(
        'GuiDialog.open() requires a component type or a TemplateRef.',
      );
    }

    const fullScreen = this.resolveFullScreen(config?.fullScreen);
    const cdkConfig: DialogConfig<D, DialogRef<R, C>> & {
      guiFullScreen?: boolean;
    } = {
      ...normalizeModalConfig<D>(config),
      container: GuiDialogContainer,
      guiFullScreen: fullScreen,
      panelClass: [
        fullScreen ? 'gui-dialog-fullscreen-pane' : 'gui-dialog-pane',
        ...asArray(config?.panelClass),
      ],
      maxWidth: fullScreen ? '100vw' : config?.maxWidth ?? DEFAULT_MAX_WIDTH,
    };

    const ref = this.cdkDialog.open<R, D, C>(content, cdkConfig);
    return wrapDialogRef(ref);
  }

  private resolveFullScreen(mode: GuiDialogFullScreen = 'never'): boolean {
    return mode === 'always' || (mode === 'compact' && this.breakpoint.isCompact());
  }
}
