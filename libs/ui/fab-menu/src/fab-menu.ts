import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CdkMenuTrigger, MENU_SCROLL_STRATEGY } from '@angular/cdk/menu';
import { ConnectedPosition, Overlay } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { FabComponent, GuiFabColor } from '@ngguide/ui/fab';
import { GuiFabMenuColor } from './fab-menu-list';

/**
 * Keep the overlay still on scroll (don't reposition it to follow). We close the
 * menu on scroll ourselves — see the `scrolled()` subscription below — *through
 * the trigger* rather than via CDK's `close` scroll strategy, because that
 * strategy detaches the overlay directly and so never fires `cdkMenuClosed`,
 * which would leave the FAB stuck showing the ✕. Overriding the app-wide `close`
 * strategy (provided in app.config for plain menus) to a no-op here avoids that.
 */
const noopScroll = (overlay: Overlay) => () => overlay.scrollStrategies.noop();

/**
 * M3 FAB-menu placement. The menu expands from the FAB's top trailing edge with
 * the FAB acting as the close button that stays in place. The panel is anchored
 * so its bottom-trailing corner sits above the FAB's top-trailing corner, with
 * the M3-recommended 4dp gap (offsetY). A flipped fallback keeps the menu
 * on-screen when there is no room above the FAB.
 */
const FAB_MENU_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
];

/**
 * M3 FAB menu. The FAB toggles a menu of related actions. The consumer supplies
 * the menu panel as an `<ng-template>` containing a `<gui-fab-menu-list>` with
 * `gui-fab-menu-item` items. `gui-fab-menu-list` hosts `CdkMenu` as a host
 * directive, so the items resolve their menu through it (no manual `cdkMenu`).
 * When open, the FAB exposes `aria-expanded` and the "Toggle menu" label (M3
 * close-button semantics).
 *
 * The FAB trigger is the 56dp FAB (`size="sm"`) — M3 requires the close button
 * to always be 56dp, regardless of how large the resting FAB would otherwise be.
 * The `color` input is the FAB-menu color set; the close button (the FAB) takes
 * the tonal `*-container` half of the set and `gui-fab-menu-list` takes the same
 * set for the items' vibrant half, so the two elements read as one coupled,
 * contrasting color pair. When the menu opens, the FAB morphs into the M3 close
 * button — its projected icon swaps for a ✕ and the icon spins half a turn; on
 * close it spins back. The panel carries its own (`:host`-scoped) styling, so no
 * `ViewEncapsulation.None` / global stylesheet is needed for the overlay.
 */
@Component({
  selector: 'gui-fab-menu',
  imports: [CdkMenuTrigger, FabComponent],
  template: `
    <button
      gui-fab
      size="sm"
      [color]="closeColor()"
      [cdkMenuTriggerFor]="menu()"
      [cdkMenuPosition]="positions"
      [attr.aria-label]="opened() ? 'Toggle menu' : ariaLabel()"
      [attr.aria-expanded]="opened()"
      (cdkMenuOpened)="opened.set(true)"
      (cdkMenuClosed)="opened.set(false)"
    >
      <span class="gui-fab-menu-icon" [class.gui-fab-menu-icon--open]="opened()">
        @if (opened()) {
          <svg
            class="gui-fab-menu-close"
            viewBox="0 -960 960 960"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
              fill="currentColor"
            />
          </svg>
        } @else {
          <ng-content select="[guiFabIcon]" />
        }
      </span>
    </button>
  `,
  styles: `
    .gui-fab-menu-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .gui-fab-menu-close {
      width: var(--gui-comp-icon-size, 24px);
      height: var(--gui-comp-icon-size, 24px);
    }

    /* The close-button morph: the glyph spins half a turn (decelerating to a
       stop) when the FAB becomes the ✕, and spins back the same way on close.
       Driven by a transition so it plays in BOTH directions. The ✕ is
       point-symmetric, so resting at 180° reads identically to 0°. */
    @media (prefers-reduced-motion: no-preference) {
      .gui-fab-menu-icon {
        transition: transform var(--md-sys-motion-duration-medium2)
          var(--md-sys-motion-easing-emphasized);
      }

      .gui-fab-menu-icon--open {
        transform: rotate(180deg);
      }
    }
  `,
  providers: [
    // Override the app-wide `close` menu scroll strategy: we close on scroll via
    // the trigger instead (see constructor), keeping the FAB's open state synced.
    { provide: MENU_SCROLL_STRATEGY, useFactory: noopScroll, deps: [Overlay] },
  ],
  exportAs: 'guiFabMenu',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabMenuComponent {
  /** The FAB-menu color set, shared by the close button (FAB) and the items. */
  color = input<GuiFabMenuColor>('primary');
  ariaLabel = input<string>('');
  protected readonly opened = signal(false);
  /** The close button (FAB) takes the tonal `*-container` half of the set. */
  protected readonly closeColor = computed<GuiFabColor>(
    () => `${this.color()}-container` as GuiFabColor,
  );
  /** M3 top-trailing anchor with the recommended 4dp gap. */
  protected readonly positions = FAB_MENU_POSITIONS;
  /** Consumer-provided menu panel (`<ng-template>` with `gui-fab-menu-list`). */
  protected readonly menu = contentChild.required(TemplateRef);

  private readonly trigger = viewChild.required(CdkMenuTrigger);
  private readonly scrollDispatcher = inject(ScrollDispatcher);

  constructor() {
    // Close the menu when the page scrolls (M3: it is pinned to the FAB and
    // should not drift). Routing the close through the trigger fires
    // `cdkMenuClosed`, so `opened` flips back and the ✕ morphs back to the icon
    // — unlike a `close` scroll strategy, which detaches the overlay silently.
    // Subscribe only while open; the cleanup unsubscribes on close/destroy.
    effect((onCleanup) => {
      if (!this.opened()) {
        return;
      }
      const sub = this.scrollDispatcher
        .scrolled()
        .subscribe(() => this.trigger().close());
      onCleanup(() => sub.unsubscribe());
    });
  }
}
