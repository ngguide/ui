import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CdkDialogContainer, DialogConfig } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { _IdGenerator } from '@angular/cdk/a11y';
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
 *
 * Accessible name/description: when the consumer does not pass an explicit
 * `ariaLabel`/`ariaLabelledBy`/`ariaDescribedBy`, the surface is named from its
 * M3 headline (basic `gui-dialog-headline` or the full-screen header title) and
 * described from its supporting content (`gui-dialog-content`) — the M3 a11y
 * "Labeling elements" rule that a dialog's label is typically its title/headline.
 * The anatomy slots live in an embedded view whose injector can't reach this
 * container, so the wiring locates the rendered elements after the portal
 * attaches (mirrors how `CdkDialogTitle` registers, but works for both component
 * and template content).
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
    '[attr.aria-describedby]': '_config.ariaDescribedBy || describedBy() || null',
    '[attr.data-fullscreen]': 'fullScreen ? "" : null',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiDialogContainer extends CdkDialogContainer {
  protected readonly reducedMotion = inject(GuiReducedMotion);
  private readonly idGenerator = inject(_IdGenerator);

  /**
   * Id of the projected content region wired to `aria-describedby` when the
   * consumer did not pass an explicit one (M3 a11y: expose the body as the
   * surface's accessible description). Explicit `ariaDescribedBy` still wins.
   */
  protected readonly describedBy = signal<string | null>(null);

  protected get fullScreen(): boolean {
    return !!(this._config as GuiDialogContainerConfig).guiFullScreen;
  }

  override _contentAttached(): void {
    super._contentAttached();
    this.wireAccessibleName();
  }

  /**
   * Name the surface from its M3 headline and describe it from its supporting
   * content. Runs once after the portal attaches, before the host bindings are
   * first checked, so the generated ids land in the same change-detection pass
   * (no ExpressionChanged error). Explicit config always takes precedence.
   */
  private wireAccessibleName(): void {
    const host = this._elementRef.nativeElement as HTMLElement;

    if (!this._config.ariaLabel && !this._config.ariaLabelledBy) {
      // Basic dialog headline, or the full-screen header title — whichever
      // this surface carries. M3: a dialog is labelled by its title/headline.
      const heading = host.querySelector<HTMLElement>(
        'gui-dialog-headline, .gui-dialog-fs-title',
      );
      if (heading) {
        const id = heading.id || this.idGenerator.getId('gui-dialog-title-');
        heading.id = id;
        this._addAriaLabelledBy(id);
      }
    }

    if (!this._config.ariaDescribedBy) {
      const body = host.querySelector<HTMLElement>('gui-dialog-content');
      if (body) {
        const id = body.id || this.idGenerator.getId('gui-dialog-body-');
        body.id = id;
        this.describedBy.set(id);
      }
    }
  }
}
