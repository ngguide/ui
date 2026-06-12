import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiDialog,
  GuiDialogTrigger,
  GuiDialogActions,
  GuiDialogContent,
  GuiDialogDivider,
  GuiDialogFullscreenActions,
  GuiDialogFullscreenHeader,
  GuiDialogHeadline,
  GuiDialogIcon,
} from '@ngguide/ui/dialog';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 Dialog (`@ngguide/ui/dialog`).
 *
 * The dialog is a service-driven overlay: there is no inline element to place,
 * so every specimen is a real trigger button that opens a live surface. Two
 * ways to open are exercised — the declarative `[guiDialogTrigger]` directive
 * (binds an inline `<ng-template>`; CDK exposes `dialogRef` + `data` in the
 * template context) and the imperative `GuiDialog.open()` service for the
 * config-heavy cases (`fullScreen`, `disableClose`, `maxWidth`, `role`).
 *
 * Dimensions swept — exhaustive against the implemented API:
 * - Variants: the two M3 dialog forms — basic (centered, 28dp corner,
 *   `role="alertdialog"`) and full-screen (`fullScreen: 'always'`, 0dp corner,
 *   header + bottom action bar). `fullScreen: 'compact'` is the responsive
 *   in-between (full-screen only under the compact window class).
 * - Anatomy: every slot component — icon, headline, content, divider, actions
 *   for the basic dialog; fullscreen-header (with `[guiDialogClose]` /
 *   `[guiDialogConfirm]`) and fullscreen-actions for the full-screen dialog.
 * - Alignment: with-icon (center-aligned) vs. without-icon (start-aligned), the
 *   two M3 basic-dialog layouts.
 * - States: scrollable long body, persistent (`disableClose` — no Escape /
 *   scrim close), constrained `maxWidth`, and an interactive form dialog (text
 *   field + autofocus).
 *
 * All copy is static literals — no clock, no RNG (SSR-safe / deterministic).
 */
@Component({
  selector: 'app-demo-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
    GuiDialogTrigger,
    GuiDialogIcon,
    GuiDialogHeadline,
    GuiDialogContent,
    GuiDialogDivider,
    GuiDialogActions,
    GuiDialogFullscreenHeader,
    GuiDialogFullscreenActions,
  ],
  template: `
    <app-demo-component
      name="Dialog"
      entry="@ngguide/ui/dialog"
      docHref="https://m3.material.io/components/dialogs"
    >
      <!-- ===== Variants (the two M3 dialog forms) ===== -->
      <app-demo-block
        heading="Variants"
        hint="Basic (centered, 28dp corner) and full-screen (0dp corner). Click to open."
        [code]="codeVariants"
      >
        <app-demo-specimen label="basic">
          <button gui-button variant="filled" [guiDialogTrigger]="basicTpl">
            Basic dialog
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="full-screen (always)">
          <button gui-button variant="tonal" type="button" (click)="openFullScreen()">
            Full-screen
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="full-screen (compact)">
          <button gui-button variant="outlined" type="button" (click)="openFullScreenCompact()">
            Full-screen on compact
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Alignment (M3 basic-dialog layouts) ===== -->
      <app-demo-block
        heading="Alignment"
        hint="With icon ⇒ center-aligned; without icon ⇒ start-aligned."
        [code]="codeAlignment"
      >
        <app-demo-specimen label="with icon (center)">
          <button gui-button variant="filled" [guiDialogTrigger]="basicTpl">
            With icon
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="no icon (start)">
          <button gui-button variant="filled" [guiDialogTrigger]="noIconTpl">
            No icon
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Anatomy ===== -->
      <app-demo-block
        heading="Anatomy"
        hint="Icon · headline · content · divider · actions slots."
        [code]="codeAnatomy"
      >
        <app-demo-specimen label="full anatomy">
          <button gui-button variant="tonal" [guiDialogTrigger]="anatomyTpl">
            Open
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="headline + actions">
          <button gui-button variant="tonal" [guiDialogTrigger]="minimalTpl">
            Minimal
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== States ===== -->
      <app-demo-block
        heading="States"
        hint="Scrollable body, persistent (no Escape/scrim close), constrained width, interactive."
        [code]="codeStates"
        [codeLang]="'ts'"
      >
        <app-demo-specimen label="scrollable">
          <button gui-button variant="outlined" [guiDialogTrigger]="scrollTpl">
            Long content
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="persistent (disableClose)">
          <button gui-button variant="outlined" type="button" (click)="openPersistent()">
            Persistent
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="maxWidth 320px">
          <button gui-button variant="outlined" type="button" (click)="openNarrow()">
            Narrow
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="interactive (text field)">
          <button gui-button variant="outlined" [guiDialogTrigger]="formTpl">
            Rename
          </button>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>

    <!-- ===================== Templates ===================== -->

    <!-- Basic dialog: icon ⇒ center-aligned (M3). role="alertdialog" by default. -->
    <ng-template #basicTpl let-ref="dialogRef">
      <gui-dialog-icon><gui-icon class="sym">delete</gui-icon></gui-dialog-icon>
      <gui-dialog-headline>Reset settings?</gui-dialog-headline>
      <gui-dialog-content>
        This will restore all settings to their default values. You can't undo
        this action.
      </gui-dialog-content>
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('confirm')"
        >
          Reset
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- No icon ⇒ start-aligned (M3). -->
    <ng-template #noIconTpl let-ref="dialogRef">
      <gui-dialog-headline>Discard draft?</gui-dialog-headline>
      <gui-dialog-content>
        Your changes haven't been saved. Leaving now discards this draft.
      </gui-dialog-content>
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Keep editing
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('discard')"
        >
          Discard
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- Full anatomy: icon, headline, content, divider, actions. -->
    <ng-template #anatomyTpl let-ref="dialogRef">
      <gui-dialog-icon><gui-icon class="sym">favorite</gui-icon></gui-dialog-icon>
      <gui-dialog-headline>Add to favorites</gui-dialog-headline>
      <gui-dialog-content>
        This item will appear in your favorites list and sync across your
        devices.
      </gui-dialog-content>
      <gui-dialog-divider />
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('add')"
        >
          Add
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- Minimal: headline + actions only (no icon, no body). -->
    <ng-template #minimalTpl let-ref="dialogRef">
      <gui-dialog-headline>Sign out?</gui-dialog-headline>
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('sign-out')"
        >
          Sign out
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- Scrollable: long content body scrolls inside the fixed surface. -->
    <ng-template #scrollTpl let-ref="dialogRef">
      <gui-dialog-headline>Terms of service</gui-dialog-headline>
      <gui-dialog-content>
        @for (n of paragraphs; track n) {
          <p>
            {{ n }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        }
      </gui-dialog-content>
      <gui-dialog-divider />
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Decline
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('accept')"
        >
          Accept
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- Interactive: text field receives initial focus (autoFocus default). -->
    <ng-template #formTpl let-ref="dialogRef">
      <gui-dialog-headline>Rename file</gui-dialog-headline>
      <gui-dialog-content>
        <label
          style="display:flex;flex-direction:column;gap:0.25rem;padding:0.5rem 0;color:var(--md-sys-color-on-surface)"
        >
          New name
          <input
            type="text"
            value="document.txt"
            style="padding:0.5rem;border-radius:var(--md-sys-shape-corner-small,8px);border:1px solid var(--md-sys-color-outline);background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface)"
          />
        </label>
      </gui-dialog-content>
      <gui-dialog-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('save')"
        >
          Save
        </button>
      </gui-dialog-actions>
    </ng-template>

    <!-- Full-screen: header (close + confirm affordances) + scrollable body +
         bottom action bar. role="dialog" (set by the service). -->
    <ng-template #fullScreenTpl let-ref="dialogRef">
      <gui-dialog-fullscreen-header>
        <button
          guiDialogClose
          gui-icon-button
          type="button"
          aria-label="Close"
          (click)="ref.close()"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
        New event
        <button
          guiDialogConfirm
          gui-button
          variant="text"
          type="button"
          (click)="ref.close('save')"
        >
          Save
        </button>
      </gui-dialog-fullscreen-header>
      <gui-dialog-content>
        @for (n of paragraphs; track n) {
          <p>
            {{ n }}. Compose the event details here. A full-screen dialog fills
            the window and is used for longer, more complex tasks on compact
            devices.
          </p>
        }
      </gui-dialog-content>
      <gui-dialog-fullscreen-actions>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
        <button
          gui-button
          variant="filled"
          type="button"
          (click)="ref.close('save')"
        >
          Save
        </button>
      </gui-dialog-fullscreen-actions>
    </ng-template>
  `,
})
export class DialogDemo {
  private readonly dialog = inject(GuiDialog);

  /** Static paragraph indices for the scrollable bodies (no RNG/clock). */
  protected readonly paragraphs = [1, 2, 3, 4, 5, 6, 7, 8];

  // The full-screen and config-heavy specimens go through the imperative
  // service so we can pass `fullScreen`, `disableClose`, and `maxWidth`. The
  // template refs are resolved from the view with `viewChild`.
  private readonly basicTpl = viewChild.required<TemplateRef<unknown>>('basicTpl');
  private readonly fullScreenTpl =
    viewChild.required<TemplateRef<unknown>>('fullScreenTpl');

  protected openFullScreen(): void {
    this.dialog.open(this.fullScreenTpl(), { fullScreen: 'always' });
  }

  protected openFullScreenCompact(): void {
    // Full-screen only under the compact window class; centered basic otherwise.
    this.dialog.open(this.fullScreenTpl(), { fullScreen: 'compact' });
  }

  protected openPersistent(): void {
    // disableClose: Escape and scrim-click do not dismiss; only the actions do.
    this.dialog.open(this.basicTpl(), { disableClose: true });
  }

  protected openNarrow(): void {
    this.dialog.open(this.basicTpl(), { maxWidth: '320px' });
  }

  protected readonly codeVariants = `
<!-- declarative: bind an inline template to a trigger button -->
<button gui-button variant="filled" [guiDialogTrigger]="basicTpl">
  Basic dialog
</button>

<ng-template #basicTpl let-ref="dialogRef">
  <gui-dialog-icon><gui-icon class="sym">delete</gui-icon></gui-dialog-icon>
  <gui-dialog-headline>Reset settings?</gui-dialog-headline>
  <gui-dialog-content>This will restore all settings.</gui-dialog-content>
  <gui-dialog-actions>
    <button gui-button variant="text" (click)="ref.close()">Cancel</button>
    <button gui-button variant="text" (click)="ref.close('confirm')">Reset</button>
  </gui-dialog-actions>
</ng-template>`;

  protected readonly codeAlignment = `
<!-- icon present ⇒ centered; omit the icon slot ⇒ start-aligned -->
<ng-template #noIconTpl let-ref="dialogRef">
  <gui-dialog-headline>Discard draft?</gui-dialog-headline>
  <gui-dialog-content>Your changes haven't been saved.</gui-dialog-content>
  <gui-dialog-actions>
    <button gui-button variant="text" (click)="ref.close()">Keep editing</button>
    <button gui-button variant="text" (click)="ref.close('discard')">Discard</button>
  </gui-dialog-actions>
</ng-template>`;

  protected readonly codeAnatomy = `
<ng-template #anatomyTpl let-ref="dialogRef">
  <gui-dialog-icon><gui-icon class="sym">favorite</gui-icon></gui-dialog-icon>
  <gui-dialog-headline>Add to favorites</gui-dialog-headline>
  <gui-dialog-content>This item will appear in your favorites list.</gui-dialog-content>
  <gui-dialog-divider />
  <gui-dialog-actions>
    <button gui-button variant="text" (click)="ref.close()">Cancel</button>
    <button gui-button variant="text" (click)="ref.close('add')">Add</button>
  </gui-dialog-actions>
</ng-template>`;

  protected readonly codeStates = `
private readonly dialog = inject(GuiDialog);
private readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');

// persistent: Escape and scrim-click do not dismiss
openPersistent() {
  this.dialog.open(this.tpl(), { disableClose: true });
}

// constrained width
openNarrow() {
  this.dialog.open(this.tpl(), { maxWidth: '320px' });
}

// full-screen form
openFullScreen() {
  this.dialog.open(this.tpl(), { fullScreen: 'always' });
}`;
}
