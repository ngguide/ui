import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/**
 * M3 modal side-sheet surface. Extends CDK's {@link CdkDialogContainer} (focus
 * trap, restore, `aria-modal`) and adds the M3 chrome — docked to the inline
 * **end** edge, `256–400dp` wide, `corner-large` (16dp) on the inner edge,
 * `surface-container-low` + `elevation-level1` (Req 10.1, 10.2). The slide-in
 * animation is disabled under reduced motion (Req 15.2). Side sheets have no
 * drag gesture; they dismiss via the close affordance, scrim or Escape.
 */
@Component({
  selector: 'gui-side-sheet-container',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CdkPortalOutlet],
  template: `
    <div class="gui-side-sheet-surface">
      <ng-template cdkPortalOutlet />
    </div>
  `,
  styleUrl: './side-sheet-container.css',
  host: {
    class: 'gui-side-sheet-container',
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
export class GuiSideSheetContainer extends CdkDialogContainer {
  protected readonly reducedMotion = inject(GuiReducedMotion);
}
