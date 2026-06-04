import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent } from '@ngguide/ui/button';
import { IconComponent } from '@ngguide/ui/icon';
import { GuiSnackbar } from '@ngguide/ui/snackbar';
import { GALLERY_DEMO_UI } from '../demo-block.component';

/**
 * Vitrine demo for the M3 snackbar (`@ngguide/ui/snackbar`).
 *
 * The snackbar is a service-driven component: there is no inline element to
 * place. `GuiSnackbar` (providedIn:'root') is injected and `open()` enqueues a
 * surface (`GuiSnackbarSurface`) into a bottom-anchored overlay. So every
 * specimen here is a real trigger button wired to `open(...)` — clicking it
 * shows the live snackbar at the bottom of the viewport.
 *
 * Per the M3 spec the surface itself is a single visual variant (inverse-surface
 * container, inverse-on-surface text, inverse-primary action). It has no size /
 * shape / color enumerations to sweep. The dimensions that DO vary are the spec's
 * configurations (single/two line, with/without action, longer action) and the
 * implemented `GuiSnackbarConfig` knobs: `action`, `showClose`, `duration`
 * (auto-dismiss vs. persistent), `twoLine`, and `aboveFab`. Each block exercises
 * one of those, plus the service-level behaviours (FIFO queue, `dismissAll`).
 *
 * All copy is static literals — no clock, no RNG (SSR-safe / deterministic).
 */
@Component({
  selector: 'app-demo-snackbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...GALLERY_DEMO_UI, ButtonComponent, IconComponent],
  template: `
    <app-demo-component
      name="Snackbar"
      entry="@ngguide/ui/snackbar"
      docHref="https://m3.material.io/components/snackbar"
    >
      <!-- M3 configurations: the five layouts on the spec page. Single line is
           the brief, transient form; "with action" adds the inverse-primary text
           button; two lines is forced/long supporting text; longer action shows
           the action wrapping below the text. These are the snackbar's real
           variant axis. -->
      <app-demo-block
        heading="Configurations"
        hint="The five M3 layouts. Click to show the live snackbar at the bottom."
      >
        <app-demo-specimen label="single line">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showSingleLine()"
          >
            Single line
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="single line + action">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showSingleAction()"
          >
            Single + action
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="two lines">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showTwoLine()"
          >
            Two lines
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="two lines + action">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showTwoLineAction()"
          >
            Two lines + action
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="two lines + longer action">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showLongerAction()"
          >
            Longer action
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Anatomy: container + supporting text (always), optional action, and the
           optional trailing close icon. showClose: true renders the dismiss
           icon-button; combine with an action for the fully-loaded surface. -->
      <app-demo-block
        heading="Anatomy"
        hint="Supporting text, optional action, and the optional trailing close icon."
      >
        <app-demo-specimen label="text only">
          <button
            gui-button
            variant="outlined"
            type="button"
            (click)="showTextOnly()"
          >
            Text only
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="text + close">
          <button
            gui-button
            variant="outlined"
            type="button"
            (click)="showTextClose()"
          >
            Text + close
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="action + close">
          <button
            gui-button
            variant="outlined"
            type="button"
            (click)="showActionClose()"
          >
            Action + close
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Behaviour / state: dismissive (auto-dismisses after a duration) vs.
           non-dismissive (persists until acted on). Per M3 an actionable snackbar
           shouldn't auto-dismiss — when action is set and duration is omitted
           auto-dismiss is disabled automatically. An explicit duration (or
           null to disable) overrides. -->
      <app-demo-block
        heading="Dismiss behaviour"
        hint="Dismissive (auto-dismiss timer) vs. non-dismissive (persists until acted on)."
      >
        <app-demo-specimen label="auto-dismiss 5s">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showAutoDismiss()"
          >
            Auto-dismiss
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="short 2s">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showShortDuration()"
          >
            Short (2s)
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="persistent (action)">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showPersistent()"
          >
            Persistent
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="persistent + close">
          <button
            gui-button
            variant="tonal"
            type="button"
            (click)="showPersistentClose()"
          >
            Persistent + close
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Positioning: snackbars usually sit at the bottom; aboveFab lifts the
           surface above a bottom-anchored FAB (true ⇒ default 88px offset, or an
           explicit CSS offset string). -->
      <app-demo-block
        heading="Positioning"
        hint="aboveFab lifts the snackbar above a bottom-anchored FAB."
      >
        <app-demo-specimen label="default (bottom)">
          <button
            gui-button
            variant="elevated"
            type="button"
            (click)="showSingleLine()"
          >
            Bottom
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="aboveFab (88px)">
          <button
            gui-button
            variant="elevated"
            type="button"
            (click)="showAboveFab()"
          >
            Above FAB
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="aboveFab (custom)">
          <button
            gui-button
            variant="elevated"
            type="button"
            (click)="showAboveFabCustom()"
          >
            Above FAB (120px)
          </button>
        </app-demo-specimen>
      </app-demo-block>

      <!-- Service behaviour: one snackbar shows at a time; further opens queue
           (FIFO) and play in sequence. dismissAll() closes the current one and
           clears the queue. -->
      <app-demo-block
        heading="Queue & control"
        hint="One at a time, FIFO queue; dismissAll() clears the current + queued."
      >
        <app-demo-specimen label="enqueue three">
          <button
            gui-button
            variant="filled"
            type="button"
            (click)="enqueueThree()"
          >
            Queue 3
          </button>
        </app-demo-specimen>

        <app-demo-specimen label="dismiss all">
          <button
            gui-button
            variant="text"
            type="button"
            (click)="dismissAll()"
          >
            <gui-icon class="sym">close</gui-icon>
            Dismiss all
          </button>
        </app-demo-specimen>
      </app-demo-block>
    </app-demo-component>
  `,
})
export class SnackbarDemo {
  private readonly snackbar = inject(GuiSnackbar);

  // ---- Configurations (M3 layouts) ----

  protected showSingleLine(): void {
    this.snackbar.open('Photo archived');
  }

  protected showSingleAction(): void {
    this.snackbar.open({ message: 'Photo archived', action: 'Undo' });
  }

  protected showTwoLine(): void {
    this.snackbar.open(
      'Your message has been sent to the team and will be delivered shortly.',
    );
  }

  protected showTwoLineAction(): void {
    this.snackbar.open({
      message:
        'Your draft was saved to the cloud. It will sync across your devices.',
      action: 'View',
    });
  }

  protected showLongerAction(): void {
    this.snackbar.open({
      message:
        'A new software update is available for download on this device.',
      action: 'Update now',
      twoLine: true,
    });
  }

  // ---- Anatomy ----

  protected showTextOnly(): void {
    this.snackbar.open({ message: 'Connection restored' });
  }

  protected showTextClose(): void {
    this.snackbar.open({ message: 'Settings updated', showClose: true });
  }

  protected showActionClose(): void {
    this.snackbar.open({
      message: 'Message deleted',
      action: 'Undo',
      showClose: true,
    });
  }

  // ---- Dismiss behaviour ----

  protected showAutoDismiss(): void {
    // No action + omitted duration ⇒ M3 default 5000ms auto-dismiss.
    this.snackbar.open({ message: 'Saved — dismisses in 5s' });
  }

  protected showShortDuration(): void {
    this.snackbar.open({ message: 'Copied to clipboard', duration: 2000 });
  }

  protected showPersistent(): void {
    // action set + duration omitted ⇒ auto-dismiss disabled (M3).
    this.snackbar.open({
      message: 'No internet connection',
      action: 'Retry',
    });
  }

  protected showPersistentClose(): void {
    // duration: null forces a persistent, text-only snackbar with a close icon.
    this.snackbar.open({
      message: 'Sync paused',
      showClose: true,
      duration: null,
    });
  }

  // ---- Positioning ----

  protected showAboveFab(): void {
    this.snackbar.open({ message: 'Lifted above the FAB', aboveFab: true });
  }

  protected showAboveFabCustom(): void {
    this.snackbar.open({
      message: 'Lifted with a custom offset',
      aboveFab: '120px',
    });
  }

  // ---- Queue & control ----

  protected enqueueThree(): void {
    this.snackbar.open({ message: 'First in queue', duration: 1500 });
    this.snackbar.open({ message: 'Second in queue', duration: 1500 });
    this.snackbar.open({ message: 'Third in queue', duration: 1500 });
  }

  protected dismissAll(): void {
    this.snackbar.dismissAll();
  }
}
