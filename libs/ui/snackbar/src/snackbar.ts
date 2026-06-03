import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GUI_SNACKBAR_CONTROLLER,
  GUI_SNACKBAR_DATA,
} from './snackbar-config';

/**
 * M3 snackbar surface — the visual rendered into the overlay by {@link GuiSnackbar}.
 *
 * `role="status"` (polite live region semantics); container uses the inverse
 * color roles. Reads its content from `GUI_SNACKBAR_DATA` and reports user
 * intent (action / close) through the injected `GUI_SNACKBAR_CONTROLLER`.
 */
@Component({
  selector: 'gui-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconButtonComponent, IconComponent],
  host: {
    class: 'gui-snackbar',
    role: 'status',
    '[attr.data-two-line]': 'data.twoLine ? "true" : null',
  },
  template: `
    <span class="gui-snackbar-label">{{ data.message }}</span>
    @if (data.action) {
      <button
        gui-button
        variant="text"
        type="button"
        class="gui-snackbar-action"
        (click)="onAction()"
      >
        {{ data.action }}
      </button>
    }
    @if (data.showClose) {
      <button
        gui-icon-button
        type="button"
        class="gui-snackbar-close"
        aria-label="Dismiss"
        (click)="onClose()"
      >
        <gui-icon>
          <svg
            viewBox="0 -960 960 960"
            width="24"
            height="24"
            fill="currentColor"
            focusable="false"
            aria-hidden="true"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
            />
          </svg>
        </gui-icon>
      </button>
    }
  `,
  styleUrl: './snackbar.css',
})
export class GuiSnackbarSurface {
  protected readonly data = inject(GUI_SNACKBAR_DATA);
  private readonly controller = inject(GUI_SNACKBAR_CONTROLLER);

  protected onAction(): void {
    this.controller.activateAction();
  }

  protected onClose(): void {
    this.controller.dismiss('dismiss');
  }
}
