import { QueryList } from '@angular/core';
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y';

/**
 * Generic accessibility utilities for `@ngguide/ui`. These are intentionally
 * **pattern-agnostic** (Req 6.5): they provide the roving-tabindex / focus-
 * management engine, but the concrete ARIA pattern (listbox, menu, tabs,
 * combobox) is wired by the consuming component spec, not here.
 */

/** Re-export the generic CDK roving-tabindex engines (Req 6.2, 6.3). */
export {
  FocusKeyManager,
  ListKeyManager,
  type FocusableOption,
} from '@angular/cdk/a11y';

/** Orientation a roving-tabindex widget navigates with arrow keys. */
export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface RovingFocusOptions {
  /** Arrow-key axis. Defaults to `'vertical'`. */
  orientation?: RovingOrientation;
  /** Wrap focus from last→first / first→last. Defaults to `true` (WAI-ARIA APG). */
  wrap?: boolean;
  /** Enable type-ahead label matching. Defaults to `true`. */
  typeAhead?: boolean;
  /** Enable Home/End jumps. Defaults to `true`. */
  homeAndEnd?: boolean;
}

/**
 * Build a roving-tabindex {@link FocusKeyManager} over a caller-supplied set of
 * focusable items with M3 / WAI-ARIA APG defaults (wrap-around, type-ahead,
 * Home/End). The caller owns the items and chooses the orientation; this does
 * not bind to any ARIA role (Req 6.1, 6.4, 6.5).
 */
export function createRovingFocus<T extends FocusableOption>(
  items: QueryList<T> | T[] | readonly T[],
  options: RovingFocusOptions = {},
): FocusKeyManager<T> {
  const {
    orientation = 'vertical',
    wrap = true,
    typeAhead = true,
    homeAndEnd = true,
  } = options;

  const manager = new FocusKeyManager<T>(items);

  if (wrap) {
    manager.withWrap();
  }
  if (typeAhead) {
    manager.withTypeAhead();
  }
  if (homeAndEnd) {
    manager.withHomeAndEnd();
  }
  if (orientation === 'horizontal' || orientation === 'both') {
    manager.withHorizontalOrientation('ltr');
  }
  if (orientation === 'vertical' || orientation === 'both') {
    manager.withVerticalOrientation();
  }

  return manager;
}
