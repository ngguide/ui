import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDialogContainer, DialogConfig } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/** Config shape the service passes through; CDK preserves the extra flag. */
export interface GuiDialogContainerConfig extends DialogConfig {
  guiFullScreen?: boolean;
}

/**
 * M3 dialog surface. Extends CDK's {@link CdkDialogContainer} (which provides
 * the focus trap, focus restore, autofocus and `aria-modal` wiring) and wraps
 * the projected content in the M3 chrome: `surface-container-high`,
 * `corner-extra-large` (28dp), `elevation-level3`, centered (Req 7.1, 13).
 * In full-screen mode (`data-fullscreen`) it fills the window with an edge-to-
 * edge surface and no corner radius (Req 8). The enter animation
 * (emphasized-decelerate) is disabled under reduced motion (Req 15.1, 15.2).
 */
@Component({
  selector: 'gui-dialog-container',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet],
  template: `<ng-template cdkPortalOutlet />`,
  styleUrl: './dialog-container.css',
  host: {
    class: 'gui-dialog-container',
    tabindex: '-1',
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[attr.data-fullscreen]': 'fullScreen ? "" : null',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiDialogContainer extends CdkDialogContainer {
  protected readonly reducedMotion = inject(GuiReducedMotion);

  protected get fullScreen(): boolean {
    return !!(this._config as GuiDialogContainerConfig).guiFullScreen;
  }
}
