import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { GUI_LIST, GuiListMode } from './list-context';

/**
 * A single M3 list row. Anatomy slots projected by the consumer:
 * `[guiListItemLeading]` (icon 24 / avatar 40 / image 56dp), the default slot
 * (headline, `body-large`), `[guiListItemSupporting]` (`body-medium`), and
 * `[guiListItemTrailing]` (`label-small` text or a control). Height follows the
 * `lines` count: 56 / 72 / 88dp (Req 4.2).
 *
 * Behavior depends on the parent {@link GuiList} mode (Req 6.5):
 * - `action` — the row hosts its own native control(s); the item carries
 *   `role="listitem"` (or no role when `interactive`, letting the inner control
 *   own semantics).
 * - `listbox` — the item is a selectable `role="option"` with `aria-selected`,
 *   reached through the list's roving focus.
 */
@Component({
  selector: 'gui-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gui-list-item-leading"><ng-content select="[guiListItemLeading]" /></span>
    <span class="gui-list-item-body">
      <span class="gui-list-item-headline"><ng-content /></span>
      <span class="gui-list-item-supporting"
        ><ng-content select="[guiListItemSupporting]"
      /></span>
    </span>
    <span class="gui-list-item-trailing"
      ><ng-content select="[guiListItemTrailing]"
    /></span>
  `,
  styleUrl: './list-item.css',
  host: {
    class: 'gui-list-item',
    '[attr.data-lines]': 'lines()',
    '[attr.role]': 'role()',
    '[attr.aria-selected]': 'isListbox() ? (selected() ? "true" : "false") : null',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.tabindex]': 'isListbox() ? (active() ? 0 : -1) : null',
    '(click)': 'onClick()',
  },
})
export class GuiListItem {
  /** Visual density: 1, 2 or 3 lines → 56 / 72 / 88dp (Req 4.2). */
  readonly lines = input<1 | 2 | 3>(1);
  /** Action mode: the row is itself interactive (suppresses `role=listitem`). */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Listbox mode: the option can be selected (Req 6.1). */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Two-way selection state (Req 6.3). */
  readonly selected = model(false);
  /** Disabled options stay focusable but are not activatable (Req 6.6). */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly list = inject(GUI_LIST, { optional: true });

  /** Whether this option currently holds the list's single tab stop. */
  private readonly activeState = signal(false);
  protected readonly active = this.activeState.asReadonly();

  protected readonly mode = computed<GuiListMode>(
    () => this.list?.mode() ?? 'action',
  );
  protected readonly isListbox = computed(() => this.mode() === 'listbox');
  protected readonly role = computed(() => {
    if (this.isListbox()) {
      return 'option';
    }
    return this.interactive() ? null : 'listitem';
  });

  /** {@link FocusableOption}: move DOM focus to this row (roving focus). */
  focus(): void {
    this.host.nativeElement.focus();
  }

  /** {@link FocusableOption}: type-ahead label is the visible text. */
  getLabel(): string {
    return this.host.nativeElement.textContent?.trim() ?? '';
  }

  /** Called by the list to grant/withdraw the roving tab stop. */
  setActive(active: boolean): void {
    this.activeState.set(active);
  }

  protected onClick(): void {
    if (this.isListbox()) {
      this.list?.select(this);
    }
  }
}
