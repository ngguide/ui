import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import {
  GuiBottomSheet,
  GuiBottomSheetSurface,
} from '@ngguide/ui/bottom-sheet';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 Bottom sheet (`@ngguide/ui/bottom-sheet`).
 *
 * Bottom sheets have exactly two M3 variants and the library implements both:
 *
 * - **Standard** (non-modal) — `GuiBottomSheetSurface`, selector
 *   `<gui-bottom-sheet>`. A fixed, bottom-anchored surface with **no scrim and
 *   no focus trap**; the page stays interactive. Toggled by the two-way `open`
 *   model. Its inputs are `showDragHandle` (default `true`), `dismissThreshold`
 *   (px, default 96), `heights` (preset fractions the handle cycles through,
 *   default `[0.5, 0.9]`) and `dragHandleLabel`.
 * - **Modal** — the `GuiBottomSheet` service (`providedIn: 'root'`). `open()`
 *   mounts a bottom-anchored surface **over a scrim** with focus trap/restore;
 *   the config carries the same drag-handle / threshold / heights / label
 *   options plus the shared modal options (`ariaLabel`, `disableClose`, …).
 *
 * Because the standard surface is `position: fixed; bottom: 0`, every specimen
 * is opened on demand by a trigger button (rather than rendered always-open) so
 * the sheets never stack over one another or obscure the gallery. The shared
 * anatomy — drag handle (32×4dp, focusable `role="button"`, cycles preset
 * heights on Space/Enter), `surface-container-low` container, 28dp top corners —
 * is exercised across the blocks below: Variants, Drag handle, Sizes (preset
 * heights), and States (default close vs. `disableClose`).
 */
@Component({
  selector: 'app-demo-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ...GALLERY_DEMO_UI,
    GuiBottomSheetSurface,
    ButtonComponent,
    IconComponent,
  ],
  template: `
    <app-demo-component
      name="Bottom sheet"
      entry="@ngguide/ui/bottom-sheet"
      docHref="https://m3.material.io/components/bottom-sheets"
    >
      <!-- ===== Variants — the two M3 variants ===== -->
      <!-- M3 lists exactly two: standard (no scrim, page stays interactive) and
           modal (scrim + focus trap). Standard is the <gui-bottom-sheet>
           surface; modal is the GuiBottomSheet service. -->
      <app-demo-block
        heading="Variants"
        hint="Standard (no scrim) and modal (scrim + focus trap). Click to open."
      >
        <app-demo-specimen label="standard">
          <button gui-button variant="filled" (click)="standardOpen.set(true)">
            <gui-icon guiIcon class="sym">vertical_align_bottom</gui-icon>
            Open standard
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="modal">
          <button gui-button variant="tonal" (click)="openModal()">
            <gui-icon guiIcon class="sym">layers</gui-icon>
            Open modal
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Drag handle (anatomy) ===== -->
      <!-- The optional drag handle: 32×4dp bar in a 48dp hit target, a focusable
           role="button" that cycles preset heights on Space/Enter. Shown both
           ways: with the handle (default) and with showDragHandle=false. -->
      <app-demo-block
        heading="Drag handle"
        hint="Optional 32×4dp handle (focusable, cycles heights). Toggle showDragHandle."
      >
        <app-demo-specimen label="with handle (default)">
          <button gui-button variant="outlined" (click)="handleOpen.set(true)">
            <gui-icon guiIcon class="sym">drag_handle</gui-icon>
            With handle
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="no handle">
          <button
            gui-button
            variant="outlined"
            (click)="noHandleOpen.set(true)"
          >
            <gui-icon guiIcon class="sym">remove</gui-icon>
            No handle
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="modal · no handle">
          <button gui-button variant="text" (click)="openModalNoHandle()">
            Modal, no handle
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== Sizes — preset heights ===== -->
      <!-- M3: the handle cycles the sheet through its available (preset) heights.
           Height is variable; the library models it as "heights" fractions of the
           viewport. Shown: single resting height vs. a multi-height sheet whose
           handle (Space/Enter or drag) cycles 50%→90%. -->
      <app-demo-block
        heading="Sizes"
        hint="Variable height via preset heights. Focus the handle, press Space/Enter to cycle."
      >
        <app-demo-specimen label="single height (50dvh)">
          <button
            gui-button
            variant="filled"
            (click)="singleHeightOpen.set(true)"
          >
            <gui-icon guiIcon class="sym">height</gui-icon>
            Half height
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="cycles 50% → 90%">
          <button
            gui-button
            variant="filled"
            (click)="multiHeightOpen.set(true)"
          >
            <gui-icon guiIcon class="sym">swap_vert</gui-icon>
            Two heights
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="modal · cycles 40/70/95%">
          <button gui-button variant="tonal" (click)="openModalHeights()">
            <gui-icon guiIcon class="sym">unfold_more</gui-icon>
            Three heights
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- ===== States ===== -->
      <!-- Dismissal behavior. Standard/modal default: drag past dismissThreshold,
           and (modal) Escape / scrim-click, close the sheet. With disableClose
           the modal stays put — closed only by its own action button. -->
      <app-demo-block
        heading="States"
        hint="Default close (drag / Esc / scrim) vs. disableClose (action only)."
      >
        <app-demo-specimen label="dismissible (default)">
          <button gui-button variant="filled" (click)="openModal()">
            <gui-icon guiIcon class="sym">close</gui-icon>
            Esc / scrim closes
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="disableClose">
          <button gui-button variant="filled" (click)="openModalPersistent()">
            <gui-icon guiIcon class="sym">lock</gui-icon>
            Action only
          </button>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>

    <!-- ===== Standard (non-modal) surfaces — fixed, bottom-anchored ===== -->
    <!-- Each is toggled by a trigger above; closing is via its own button or the
         drag handle (drag down past dismissThreshold). -->
    <gui-bottom-sheet [(open)]="standardOpen">
      <div class="app-demo-bs-content">
        <h3>Standard bottom sheet</h3>
        <p>
          No scrim — the gallery behind stays scrollable and interactive. Drag
          the handle down to dismiss, or use the button.
        </p>
        <button gui-button variant="tonal" (click)="standardOpen.set(false)">
          Close
        </button>
      </div>
    </gui-bottom-sheet>

    <gui-bottom-sheet [(open)]="handleOpen">
      <div class="app-demo-bs-content">
        <h3>With drag handle</h3>
        <p>The 32×4dp handle at the top is focusable and resizes the sheet.</p>
        <button gui-button variant="tonal" (click)="handleOpen.set(false)">
          Close
        </button>
      </div>
    </gui-bottom-sheet>

    <gui-bottom-sheet [(open)]="noHandleOpen" [showDragHandle]="false">
      <div class="app-demo-bs-content">
        <h3>No drag handle</h3>
        <p>
          <code>showDragHandle=false</code> hides the handle; close with the
          button.
        </p>
        <button gui-button variant="tonal" (click)="noHandleOpen.set(false)">
          Close
        </button>
      </div>
    </gui-bottom-sheet>

    <gui-bottom-sheet [(open)]="singleHeightOpen" [heights]="[0.5]">
      <div class="app-demo-bs-content">
        <h3>Single height</h3>
        <p>One preset (50dvh); the handle has no other height to cycle to.</p>
        <button
          gui-button
          variant="tonal"
          (click)="singleHeightOpen.set(false)"
        >
          Close
        </button>
      </div>
    </gui-bottom-sheet>

    <gui-bottom-sheet [(open)]="multiHeightOpen" [heights]="[0.5, 0.9]">
      <div class="app-demo-bs-content">
        <h3>Two heights</h3>
        <p>
          Focus the drag handle and press Space/Enter to cycle between 50% and
          90% of the viewport.
        </p>
        <button gui-button variant="tonal" (click)="multiHeightOpen.set(false)">
          Close
        </button>
      </div>
    </gui-bottom-sheet>

    <!-- ===== Modal templates (rendered by GuiBottomSheet.open) ===== -->
    <ng-template #modalSheet>
      <div class="app-demo-bs-content">
        <h3>Modal bottom sheet</h3>
        <p>
          Anchored to the bottom over a scrim with focus trap. Dismiss by
          dragging the handle, pressing Escape, or tapping the scrim.
        </p>
        <button gui-button variant="filled" (click)="closeModal()">Done</button>
      </div>
    </ng-template>

    <ng-template #persistentSheet>
      <div class="app-demo-bs-content">
        <h3>Persistent modal (disableClose)</h3>
        <p>
          Escape and scrim clicks are ignored — the only way out is this action
          button.
        </p>
        <button gui-button variant="filled" (click)="closeModal()">
          Acknowledge
        </button>
      </div>
    </ng-template>
  `,
  styles: `
    .app-demo-bs-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 1.5rem 1.5rem;
    }
    .app-demo-bs-content h3 {
      margin: 0;
      color: var(--md-sys-color-on-surface);
      font-family: var(--md-sys-typescale-title-large-font, 'Roboto', sans-serif);
      font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
    }
    .app-demo-bs-content p {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant);
    }
    .app-demo-bs-content button {
      align-self: flex-start;
    }
  `,
})
export class BottomSheetDemo {
  /** Modal bottom-sheet service (providedIn: 'root'). */
  private readonly bottomSheet = inject(GuiBottomSheet);

  /** Inline templates rendered as modal sheet content. */
  private readonly modalSheet =
    viewChild.required<TemplateRef<unknown>>('modalSheet');
  private readonly persistentSheet =
    viewChild.required<TemplateRef<unknown>>('persistentSheet');

  /** Open state for each standard (non-modal) surface. */
  protected readonly standardOpen = signal(false);
  protected readonly handleOpen = signal(false);
  protected readonly noHandleOpen = signal(false);
  protected readonly singleHeightOpen = signal(false);
  protected readonly multiHeightOpen = signal(false);

  /** Handle to the currently-open modal sheet, so its action button can close it. */
  private modalRef: { close(result?: unknown): void } | null = null;

  /** Default modal: scrim, focus trap, dismissible by Esc / scrim / drag. */
  protected openModal(): void {
    this.modalRef = this.bottomSheet.open(this.modalSheet(), {
      ariaLabel: 'Modal bottom sheet',
    });
  }

  /** Modal without the drag handle. */
  protected openModalNoHandle(): void {
    this.modalRef = this.bottomSheet.open(this.modalSheet(), {
      ariaLabel: 'Modal bottom sheet without handle',
      showDragHandle: false,
    });
  }

  /** Modal whose handle cycles through three preset heights. */
  protected openModalHeights(): void {
    this.modalRef = this.bottomSheet.open(this.modalSheet(), {
      ariaLabel: 'Modal bottom sheet, three heights',
      heights: [0.4, 0.7, 0.95],
    });
  }

  /** Modal that ignores Escape and scrim clicks (closed only by its action). */
  protected openModalPersistent(): void {
    this.modalRef = this.bottomSheet.open(this.persistentSheet(), {
      ariaLabel: 'Persistent modal bottom sheet',
      disableClose: true,
    });
  }

  protected closeModal(): void {
    this.modalRef?.close();
    this.modalRef = null;
  }
}
