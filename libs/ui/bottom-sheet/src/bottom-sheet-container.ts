import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDialogContainer, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { OverlayRef } from '@angular/cdk/overlay';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
  CdkDragMove,
} from '@angular/cdk/drag-drop';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/** Config shape the service passes through; CDK preserves the extra fields. */
export interface GuiBottomSheetContainerConfig extends DialogConfig {
  guiShowDragHandle?: boolean;
  guiDismissThreshold?: number;
}

/**
 * M3 modal bottom-sheet surface. Extends CDK's {@link CdkDialogContainer}
 * (focus trap, restore, `aria-modal`) and adds the M3 chrome —
 * `surface-container-low`, `corner-extra-large` top corners (28dp),
 * `elevation-level1` — plus the drag handle and drag-to-dismiss gesture
 * (Req 9.1, 9.3). Dragging the handle past `dismissThreshold` closes the sheet
 * with `'swipe'`; a shorter drag springs back (Req 9.4). The scrim fades with
 * the drag distance. The slide-up enter animation is disabled under reduced
 * motion (Req 15.2).
 */
@Component({
  selector: 'gui-bottom-sheet-container',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet, CdkDrag, CdkDragHandle],
  template: `
    <div
      class="gui-bottom-sheet-surface"
      cdkDrag
      cdkDragLockAxis="y"
      (cdkDragMoved)="onDragMoved($event)"
      (cdkDragEnded)="onDragEnded($event)"
    >
      @if (showDragHandle) {
        <div class="gui-bottom-sheet-handle" cdkDragHandle aria-hidden="true"></div>
      }
      <div class="gui-bottom-sheet-body">
        <ng-template cdkPortalOutlet />
      </div>
    </div>
  `,
  styleUrl: './bottom-sheet-container.css',
  host: {
    class: 'gui-bottom-sheet-container',
    tabindex: '-1',
    '[attr.id]': '_config.id || null',
    '[attr.role]': '_config.role',
    '[attr.aria-modal]': '_config.ariaModal',
    '[attr.aria-labelledby]': '_config.ariaLabel ? null : _ariaLabelledByQueue[0]',
    '[attr.aria-label]': '_config.ariaLabel',
    '[attr.aria-describedby]': '_config.ariaDescribedBy || null',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiBottomSheetContainer extends CdkDialogContainer {
  protected readonly reducedMotion = inject(GuiReducedMotion);
  private readonly dialogRef = inject<DialogRef>(DialogRef);
  private readonly overlayRef = inject(OverlayRef);

  protected get showDragHandle(): boolean {
    return (
      (this._config as GuiBottomSheetContainerConfig).guiShowDragHandle ?? true
    );
  }

  private get dismissThreshold(): number {
    return (
      (this._config as GuiBottomSheetContainerConfig).guiDismissThreshold ?? 96
    );
  }

  /** Fade the scrim proportionally to the downward drag distance (Req 9.3). */
  protected onDragMoved(event: CdkDragMove): void {
    const surface = event.source.element.nativeElement;
    const distance = Math.max(0, event.distance.y);
    const ratio = surface.offsetHeight
      ? Math.min(1, distance / surface.offsetHeight)
      : 0;
    const backdrop = this.overlayRef.backdropElement;
    if (backdrop) {
      backdrop.style.opacity = `${1 - ratio}`;
    }
  }

  /** Dismiss past the threshold; otherwise spring back to rest (Req 9.4). */
  protected onDragEnded(event: CdkDragEnd): void {
    if (event.distance.y > this.dismissThreshold) {
      this.dialogRef.close('swipe');
      return;
    }
    event.source.setFreeDragPosition({ x: 0, y: 0 });
    const backdrop = this.overlayRef.backdropElement;
    if (backdrop) {
      backdrop.style.opacity = '';
    }
  }
}
