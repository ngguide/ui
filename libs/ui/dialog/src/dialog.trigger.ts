import { Directive, TemplateRef, inject, input } from '@angular/core';
import { GuiDialog } from './dialog.service';
import { GuiDialogConfig } from './dialog-config';

/**
 * Declarative dialog opener (Req 7.2). Bind an inline `<ng-template>` to the
 * `guiDialogTrigger` input; clicking the host opens it as a dialog via
 * {@link GuiDialog}. Optional config is supplied through `guiDialogConfig`.
 *
 * ```html
 * <button gui-button [guiDialogTrigger]="tpl">Open</button>
 * <ng-template #tpl> … </ng-template>
 * ```
 */
@Directive({
  selector: '[guiDialogTrigger]',
  host: { '(click)': 'open()' },
})
export class GuiDialogTrigger {
  private readonly dialog = inject(GuiDialog);

  /** The template rendered as the dialog content. */
  readonly template = input.required<TemplateRef<unknown>>({
    alias: 'guiDialogTrigger',
  });
  /** Optional dialog configuration. */
  readonly config = input<GuiDialogConfig | undefined>(undefined, {
    alias: 'guiDialogConfig',
  });

  protected open(): void {
    this.dialog.open(this.template(), this.config());
  }
}
