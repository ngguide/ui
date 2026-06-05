import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CdkMenuTrigger, MENU_SCROLL_STRATEGY } from '@angular/cdk/menu';
import { Overlay } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { ButtonComponent, GuiButtonVariant } from '@ngguide/ui/button';
import { GuiSize } from '@ngguide/ui';

/**
 * Color styles M3 lists for split buttons: Elevated, Filled, Tonal, Outlined.
 * `text` is a button-only color style and is not an M3 split-button configuration,
 * so it is excluded here.
 */
export type GuiSplitButtonVariant = Exclude<GuiButtonVariant, 'text'>;

/**
 * Keep the overlay still on scroll (don't reposition it to follow). We close the
 * menu on scroll ourselves — see the `scrolled()` subscription in the constructor
 * — *through the trigger* rather than via CDK's `close` scroll strategy, because
 * that strategy detaches the overlay directly and so never fires `cdkMenuClosed`,
 * which would leave the trailing button stuck in its open state (round shape + the
 * flipped/spun icon). Overriding the app-wide `close` strategy (provided in
 * app.config for plain menus) to a no-op here avoids that. Same fix as gui-fab-menu.
 */
const noopScroll = (overlay: Overlay) => () => overlay.scrollStrategies.noop();

/**
 * M3 split button: a leading primary action + a trailing toggle that opens a
 * menu of related choices. The consumer supplies the menu panel as an
 * `<ng-template>` (a `<div cdkMenu>` with `cdkMenuItem` buttons), kept DI-correct.
 * Focus order is leading → trailing; the trailing button announces expanded state
 * and morphs its corners when open.
 */
@Component({
  selector: 'gui-split-button',
  imports: [ButtonComponent, CdkMenuTrigger],
  template: `
    <button
      gui-button
      [variant]="variant()"
      [size]="size()"
      class="gui-split-leading"
      (click)="action.emit()"
    >
      <ng-content select="[guiLeading]" />
    </button>
    <button
      gui-button
      [variant]="variant()"
      [size]="size()"
      class="gui-split-trailing"
      [cdkMenuTriggerFor]="menu()"
      [attr.aria-label]="triggerLabel()"
      [attr.aria-expanded]="opened()"
      [attr.aria-haspopup]="'menu'"
      [attr.data-open]="opened() ? '' : null"
      [attr.data-split-selected]="selected() ? '' : null"
      (cdkMenuOpened)="opened.set(true)"
      (cdkMenuClosed)="opened.set(false)"
    >
      <span class="gui-split-trailing-icon">
        <ng-content select="[guiTrailingIcon]" />
      </span>
    </button>
  `,
  styleUrl: './split-button.css',
  host: { 'role': 'group' },
  providers: [
    // Override the app-wide `close` menu scroll strategy: we close on scroll via
    // the trigger instead (see constructor), keeping the trailing button's open
    // state synced. Same fix as gui-fab-menu.
    { provide: MENU_SCROLL_STRATEGY, useFactory: noopScroll, deps: [Overlay] },
  ],
  exportAs: 'guiSplitButton',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitButtonComponent {
  /** M3 split-button color style — Elevated, Filled, Tonal, or Outlined (no `text`). */
  variant = input<GuiSplitButtonVariant>('tonal');
  size = input<GuiSize>('sm');
  /**
   * Accessible name for the trailing menu trigger, e.g. `"More watch options"`.
   * M3 requires the icon-only trailing button to convey that more options are
   * available; combined with `aria-expanded` it announces the menu state.
   */
  triggerLabel = input<string>('More options');
  /**
   * Persistent M3 "Selected" state of the trailing button. Per M3 the split
   * button color does not change when selected — only a state layer is applied —
   * and the menu icon is optically centered (its unselected offset is removed).
   */
  selected = input(false, { transform: booleanAttribute });
  action = output<void>();
  protected readonly opened = signal(false);
  /** Consumer-provided menu panel (`<ng-template>` with cdkMenu + cdkMenuItem buttons). */
  protected readonly menu = contentChild.required(TemplateRef);

  /** The trailing button's CDK menu trigger (used to close the menu on scroll). */
  private readonly trigger = viewChild.required(CdkMenuTrigger);
  private readonly scrollDispatcher = inject(ScrollDispatcher);

  constructor() {
    // Close the menu when the page scrolls. Routing the close through the trigger
    // fires `cdkMenuClosed`, so `opened` flips back and the trailing button leaves
    // its open state (round shape morphs back, icon spins back) — unlike a `close`
    // scroll strategy, which detaches the overlay silently and desyncs that state.
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
