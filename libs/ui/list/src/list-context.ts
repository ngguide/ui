import { InjectionToken, Signal } from '@angular/core';

/** Semantics the list operates under (Req 4/5 action vs Req 6 selection). */
export type GuiListMode = 'action' | 'listbox';

/**
 * Minimal contract a {@link GuiListItem} needs from its parent list, exposed
 * through a DI token so the item never imports the list class directly (avoids
 * a circular module dependency).
 */
export interface GuiListContext {
  readonly mode: Signal<GuiListMode>;
  readonly multiselectable: Signal<boolean>;
  /** Toggle selection of an item, honoring single vs multi selection. */
  select(item: GuiListSelectable): void;
}

/** The slice of a list item the parent toggles selection on. */
export interface GuiListSelectable {
  readonly selected: { (): boolean; set(value: boolean): void };
  readonly disabled: Signal<boolean>;
}

export const GUI_LIST = new InjectionToken<GuiListContext>('GUI_LIST');
