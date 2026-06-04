import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconButtonComponent } from '@ngguide/ui/icon-button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiSideSheet,
  GuiSideSheetActions,
  GuiSideSheetContent,
  GuiSideSheetDivider,
  GuiSideSheetHeader,
  GuiSideSheetSurface,
} from '@ngguide/ui/side-sheet';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 side sheet (`@ngguide/ui/side-sheet`).
 *
 * Two M3 variants:
 * - **Standard** — the inline `<gui-side-sheet>` surface (`GuiSideSheetSurface`).
 *   Non-modal: fixed to the inline-end edge, coexists with the page (no scrim,
 *   no focus trap). Toggled with its two-way `open` model. Supports `detached`
 *   (16dp float + all-corner rounding) and accessible-name inputs (`ariaLabel`,
 *   `ariaLabelledby`).
 * - **Modal** — opened with the injected `GuiSideSheet` service (`open()`),
 *   which renders content inside `GuiSideSheetContainer` (scrim + focus trap +
 *   focus restore + Escape). Following the codebase convention, the modal
 *   content is an inline `<ng-template let-ref="dialogRef">` resolved with
 *   `viewChild`; CDK exposes `dialogRef` (+ `$implicit` data) on the context.
 *
 * Both variants share the same anatomy primitives (`gui-side-sheet-header` with
 * `[guiSideSheetBack]`/`[guiSideSheetClose]` slots, `gui-side-sheet-divider`,
 * `gui-side-sheet-content`, `gui-side-sheet-actions`). The sheet has one visual
 * surface per variant — there are no size / shape / color enumerations to sweep.
 * The dimensions that DO vary are: variant (standard / modal), docking (docked
 * vs `detached`), the optional divider, and the modal back-icon navigation
 * pattern (start padding drops 24dp → 16dp when a leading back icon is present).
 *
 * Every standard sheet renders fixed to the viewport end edge when open, so each
 * specimen is a real trigger button (open / close) — clicking it slides the live
 * sheet in. All copy is static literals — no clock, no RNG (SSR-safe).
 */
@Component({
  selector: 'app-demo-side-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    GuiSideSheetSurface,
    GuiSideSheetHeader,
    GuiSideSheetDivider,
    GuiSideSheetContent,
    GuiSideSheetActions,
    ButtonComponent,
    IconButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Side sheet"
      entry="@ngguide/ui/side-sheet"
      docHref="https://m3.material.io/components/side-sheets"
    >
      <!-- M3 variants. Standard is the inline, non-modal surface that coexists
           with the page; modal docks over a scrim with a focus trap. Both share
           the same anatomy primitives. -->
      <app-demo-block
        heading="Variants"
        hint="The two M3 side-sheet variants. Click to slide the live sheet in from the end edge."
      >
        <app-demo-specimen label="standard (inline)">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="standardOpen.set(true)"
          >
            Open standard
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="modal (service)">
          <button
            gui-button
            variant="filled"
            type="button"
            (click)="openModal()"
          >
            Open modal
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Docking: the default sheet is flush to the inline-end edge (only the
           inner corners rounded); detached floats it with a 16dp margin and
           rounds all four corners. -->
      <app-demo-block
        heading="Docking"
        hint="Docked (flush, inner corners) vs detached (16dp float, all corners rounded)."
      >
        <app-demo-specimen label="docked">
          <button
            gui-button
            variant="outlined"
            type="button"
            (click)="dockedOpen.set(true)"
          >
            Open docked
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="detached">
          <button
            gui-button
            variant="outlined"
            type="button"
            (click)="detachedOpen.set(true)"
          >
            Open detached
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Modal navigation: a side sheet may carry a back-icon button for
           in-sheet navigation. M3 drops the header start padding from 24dp to
           16dp when a leading back icon is present. -->
      <app-demo-block
        heading="Modal navigation"
        hint="Optional leading back-icon button for in-sheet navigation (16dp start padding)."
      >
        <app-demo-specimen label="with back icon">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="openModalWithBack()"
          >
            Open with back
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Anatomy: header (headline + close affordance), optional dividers, a
           scrollable content region and the start-aligned bottom actions. This
           inline specimen opens a fully-loaded standard sheet. -->
      <app-demo-block
        heading="Anatomy"
        hint="Header + close, optional dividers, scrollable content, start-aligned bottom actions."
      >
        <app-demo-specimen label="full anatomy">
          <button
            gui-button
            variant="elevated"
            type="button"
            (click)="anatomyOpen.set(true)"
          >
            Open full anatomy
          </button>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>

    <!-- Live standard (inline, non-modal) side sheets. Each is fixed to the
         viewport's inline-end edge and toggled by the buttons above. Only one
         pane is opened per specimen so the panes don't overlap. -->
    <gui-side-sheet
      variant="standard"
      [(open)]="standardOpen"
      ariaLabel="Standard side sheet"
    >
      <gui-side-sheet-header>
        Standard sheet
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="standardOpen.set(false)"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-divider />
      <gui-side-sheet-content>
        <p>
          A standard side sheet stays docked alongside the page content with no
          scrim, so the rest of the page remains interactive.
        </p>
      </gui-side-sheet-content>
      <gui-side-sheet-actions>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="standardOpen.set(false)"
        >
          Done
        </button>
      </gui-side-sheet-actions>
    </gui-side-sheet>

    <gui-side-sheet
      variant="standard"
      [(open)]="dockedOpen"
      ariaLabel="Docked side sheet"
    >
      <gui-side-sheet-header>
        Docked
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="dockedOpen.set(false)"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-content>
        <p>Flush to the inline-end edge — only the inner corners are rounded.</p>
      </gui-side-sheet-content>
    </gui-side-sheet>

    <gui-side-sheet
      variant="standard"
      detached
      [(open)]="detachedOpen"
      ariaLabel="Detached side sheet"
    >
      <gui-side-sheet-header>
        Detached
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="detachedOpen.set(false)"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-content>
        <p>
          Floated 16dp from the viewport edges with all four corners rounded.
        </p>
      </gui-side-sheet-content>
    </gui-side-sheet>

    <gui-side-sheet
      variant="standard"
      [(open)]="anatomyOpen"
      ariaLabel="Side sheet anatomy"
    >
      <gui-side-sheet-header>
        Filters
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="anatomyOpen.set(false)"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-divider />
      <gui-side-sheet-content>
        <p>
          The content region scrolls its own overflow while the header and the
          bottom actions stay pinned.
        </p>
        <p>
          Side sheets provide optional content and actions without interrupting
          the main content, so people can keep working alongside the sheet.
        </p>
        <p>
          A close icon button is always present so the sheet is easy to dismiss
          and the open / close flow is predictable.
        </p>
      </gui-side-sheet-content>
      <gui-side-sheet-divider />
      <gui-side-sheet-actions>
        <button
          gui-button
          variant="filled"
          type="button"
          (click)="anatomyOpen.set(false)"
        >
          Apply
        </button>
        <button
          gui-button
          variant="text"
          type="button"
          (click)="anatomyOpen.set(false)"
        >
          Reset
        </button>
      </gui-side-sheet-actions>
    </gui-side-sheet>

    <!-- Modal side-sheet content. The GuiSideSheet service renders this template
         inside GuiSideSheetContainer (scrim + focus trap). CDK exposes the
         dialog ref as the dialogRef context key, so let-ref drives close(). -->
    <ng-template #modalTpl let-ref="dialogRef">
      <gui-side-sheet-header>
        Details
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="ref.close()"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-divider />
      <gui-side-sheet-content>
        <p>
          A modal side sheet docks over a scrim and traps focus until it is
          dismissed with the close icon, the scrim, or Escape.
        </p>
      </gui-side-sheet-content>
      <gui-side-sheet-divider />
      <gui-side-sheet-actions>
        <button
          gui-button
          variant="filled"
          type="button"
          (click)="ref.close('save')"
        >
          Save
        </button>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
      </gui-side-sheet-actions>
    </ng-template>

    <!-- Modal side sheet with the leading back-icon navigation pattern. -->
    <ng-template #modalBackTpl let-ref="dialogRef">
      <gui-side-sheet-header>
        <button
          guiSideSheetBack
          gui-icon-button
          variant="standard"
          label="Back"
          type="button"
          (click)="ref.close()"
        >
          <gui-icon class="sym">arrow_back</gui-icon>
        </button>
        Edit profile
        <button
          guiSideSheetClose
          gui-icon-button
          variant="standard"
          label="Close"
          type="button"
          (click)="ref.close()"
        >
          <gui-icon class="sym">close</gui-icon>
        </button>
      </gui-side-sheet-header>
      <gui-side-sheet-divider />
      <gui-side-sheet-content>
        <p>
          The leading back-icon button supports navigating between regions
          inside the sheet; the header start padding drops to 16dp.
        </p>
      </gui-side-sheet-content>
      <gui-side-sheet-divider />
      <gui-side-sheet-actions>
        <button
          gui-button
          variant="filled"
          type="button"
          (click)="ref.close('save')"
        >
          Save
        </button>
        <button gui-button variant="text" type="button" (click)="ref.close()">
          Cancel
        </button>
      </gui-side-sheet-actions>
    </ng-template>
  `,
})
export class SideSheetDemo {
  private readonly sideSheet = inject(GuiSideSheet);

  /** Two-way open state for each live standard (inline) side sheet. */
  protected readonly standardOpen = signal(false);
  protected readonly dockedOpen = signal(false);
  protected readonly detachedOpen = signal(false);
  protected readonly anatomyOpen = signal(false);

  /** Inline templates rendered by the modal `GuiSideSheet` service. */
  private readonly modalTpl =
    viewChild.required<TemplateRef<unknown>>('modalTpl');
  private readonly modalBackTpl =
    viewChild.required<TemplateRef<unknown>>('modalBackTpl');

  protected openModal(): void {
    this.sideSheet.open(this.modalTpl(), { ariaLabel: 'Modal side sheet' });
  }

  protected openModalWithBack(): void {
    this.sideSheet.open(this.modalBackTpl(), {
      ariaLabel: 'Modal side sheet with navigation',
    });
  }
}
