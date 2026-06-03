import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * M3 dialog anatomy slot components. Compose them inside the content passed to
 * {@link GuiDialog.open} to lay out the standard basic-dialog regions
 * (Req 7.1): an optional icon, the headline (`h2`), the supporting content
 * (scrollable), and the end-aligned action buttons. For full-screen dialogs use
 * {@link GuiDialogFullscreenHeader} as the top bar (Req 8.2).
 */

/** Optional leading icon, centered above the headline (24dp, secondary). */
@Component({
  selector: 'gui-dialog-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-dialog-icon' },
  styles: [
    `
      :host {
        display: flex;
        align-self: center;
        justify-content: center;
        margin: 24px 24px 16px;
        font-size: 24px;
        line-height: 24px;
        color: var(--md-sys-color-secondary);
      }
    `,
  ],
})
export class GuiDialogIcon {}

/** Dialog headline, exposed as a level-2 heading (Req 7.1, 14). */
@Component({
  selector: 'gui-dialog-headline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-dialog-headline', role: 'heading', 'aria-level': '2' },
  styles: [
    `
      :host {
        display: block;
        padding: 24px 24px 16px;
        color: var(--md-sys-color-on-surface);
        font-family: var(--md-sys-typescale-headline-small-font);
        font-size: var(--md-sys-typescale-headline-small-size);
        font-weight: var(--md-sys-typescale-headline-small-weight);
        line-height: var(--md-sys-typescale-headline-small-line-height);
        letter-spacing: var(--md-sys-typescale-headline-small-tracking);
      }
      /* When an icon precedes the headline, M3 centers the headline. */
      :host-context(gui-dialog-icon + *) {
        text-align: center;
      }
    `,
  ],
})
export class GuiDialogHeadline {}

/** Scrollable supporting content region (body-medium). */
@Component({
  selector: 'gui-dialog-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-dialog-content' },
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 0 24px;
        color: var(--md-sys-color-on-surface-variant);
        font-family: var(--md-sys-typescale-body-medium-font);
        font-size: var(--md-sys-typescale-body-medium-size);
        font-weight: var(--md-sys-typescale-body-medium-weight);
        line-height: var(--md-sys-typescale-body-medium-line-height);
        letter-spacing: var(--md-sys-typescale-body-medium-tracking);
      }
    `,
  ],
})
export class GuiDialogContent {}

/** End-aligned action buttons region (up to three text buttons, Req 7.1). */
@Component({
  selector: 'gui-dialog-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-dialog-actions' },
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        padding: 24px;
      }
    `,
  ],
})
export class GuiDialogActions {}

/**
 * Full-screen dialog top bar (Req 8.2): a leading close/back affordance, the
 * title, and an optional trailing confirm action. Project the close control
 * into `[guiDialogClose]` and the confirm control into `[guiDialogConfirm]`.
 */
@Component({
  selector: 'gui-dialog-fullscreen-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gui-dialog-fs-leading"
      ><ng-content select="[guiDialogClose]"
    /></span>
    <span class="gui-dialog-fs-title"><ng-content /></span>
    <span class="gui-dialog-fs-confirm"
      ><ng-content select="[guiDialogConfirm]"
    /></span>
  `,
  host: { class: 'gui-dialog-fullscreen-header' },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 56px;
        padding: 0 16px;
        flex: 0 0 auto;
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
      }
      .gui-dialog-fs-title {
        flex: 1 1 auto;
        font-family: var(--md-sys-typescale-title-large-font);
        font-size: var(--md-sys-typescale-title-large-size);
        font-weight: var(--md-sys-typescale-title-large-weight);
        line-height: var(--md-sys-typescale-title-large-line-height);
        letter-spacing: var(--md-sys-typescale-title-large-tracking);
      }
      .gui-dialog-fs-leading,
      .gui-dialog-fs-confirm {
        display: flex;
        align-items: center;
        flex: 0 0 auto;
      }
    `,
  ],
})
export class GuiDialogFullscreenHeader {}
