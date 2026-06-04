import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import {
  FocusKeyManager,
  FocusableOption,
  createRovingFocus,
} from '@ngguide/ui/interaction';
import { GUI_LIST, GuiListContext, GuiListMode } from './list-context';
import { GuiListItem } from './list-item';

/**
 * M3 list container. One component serves two ARIA patterns via the `mode`
 * input (Req 6.5):
 * - `action` (default) — a plain `role="list"` whose rows host their own native
 *   controls; keyboard order is the natural Tab order, no roving focus.
 * - `listbox` — a `role="listbox"` with roving focus (single Tab stop,
 *   arrow / Home / End / type-ahead) and selection toggled with Enter / Space
 *   or click (Req 6.1–6.3). `multiselectable` allows more than one selected
 *   option and sets `aria-multiselectable`.
 */
@Component({
  selector: 'gui-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './list.css',
  host: {
    class: 'gui-list',
    '[attr.role]': 'mode() === "listbox" ? "listbox" : "list"',
    '[attr.aria-multiselectable]':
      'mode() === "listbox" ? (multiselectable() ? "true" : "false") : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: GUI_LIST, useExisting: forwardRef(() => GuiList) }],
})
export class GuiList implements GuiListContext {
  readonly mode = input<GuiListMode>('action');
  readonly multiselectable = input(false, { transform: booleanAttribute });
  /**
   * Accessibility label for the container. In `listbox` mode M3 asks the
   * container label to describe the type of selection that can be made (e.g.
   * "Choose one fruit" / "Select toppings"). Bound to `aria-label` when set;
   * consumers may instead supply their own `aria-label`/`aria-labelledby`.
   */
  readonly ariaLabel = input<string>('', { alias: 'aria-label' });

  private readonly items = contentChildren(forwardRef(() => GuiListItem));
  private readonly destroyRef = inject(DestroyRef);
  // Typed over the CDK `FocusableOption`: `GuiListItem` cannot be the type
  // argument directly because its `disabled` signal input collides with
  // `FocusableOption.disabled?: boolean` (same constraint as the chip set).
  private manager?: FocusKeyManager<FocusableOption>;
  private changeSub?: Subscription;

  constructor() {
    afterNextRender(() => {
      if (this.mode() === 'listbox') {
        this.rebuildManager();
      }
    });

    // The FocusKeyManager is built over a static snapshot, so rebuild when the
    // projected items change (listbox mode only).
    effect(() => {
      this.items();
      if (this.manager && this.mode() === 'listbox') {
        this.rebuildManager();
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.mode() !== 'listbox') {
      return;
    }
    const key = event.key;
    if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
      const active = this.manager?.activeItem as GuiListItem | null;
      if (active) {
        event.preventDefault();
        this.select(active);
      }
      return;
    }
    this.manager?.onKeydown(event);
  }

  /** Toggle selection of an option, honoring single vs multi (Req 6.3). */
  select(item: GuiListItem): void {
    if (item.disabled()) {
      return;
    }
    const next = !item.selected();
    if (next && !this.multiselectable()) {
      for (const other of this.items()) {
        if (other !== item) {
          other.selected.set(false);
        }
      }
    }
    item.selected.set(next);
  }

  private rebuildManager(): void {
    this.changeSub?.unsubscribe();
    const items = this.items();
    this.manager = createRovingFocus(
      items as readonly FocusableOption[],
      { orientation: 'vertical' },
      // Disabled options stay reachable (M3 keeps them discoverable, Req 6.6).
    ).skipPredicate(() => false);

    // Mirror the manager's active index onto each item so exactly one option
    // carries the roving tab stop (tabindex=0).
    const syncActive = (index: number | null) => {
      items.forEach((item, i) => item.setActive(i === index));
    };
    this.changeSub = this.manager.change
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(syncActive);

    // Seed the first option as the initial tab stop without stealing focus.
    if (items.length > 0) {
      this.manager.updateActiveItem(0);
      syncActive(0);
    }
  }
}
