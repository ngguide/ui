import { Directive, input } from '@angular/core';

/** M3 menu variants. `baseline` keeps the square-cornered legacy surface;
 * `vertical` opts into the M3 Expressive look (rounded corners, selection
 * states, vibrant color styles). */
export type GuiMenuVariant = 'baseline' | 'vertical';

/** M3 menu color styles. `standard` is surface-based; `vibrant` is
 * tertiary-based and makes selected items stand out (Expressive only). */
export type GuiMenuColor = 'standard' | 'vibrant';

/** M3 vertical-menu layouts. `standard` is a flat list; `grouped` adds spacing
 * between grouped sections (Expressive only). */
export type GuiMenuLayout = 'standard' | 'grouped';

/**
 * M3 menu surface. A pure styling hook applied to the consumer's
 * `<div cdkMenu>` (or `<ng-template [gui-menu] cdkMenu>`). It adds the M3
 * surface-container panel styling and nothing behavioral — `CdkMenu` supplies
 * `role="menu"` and the menu keyboard/focus behavior.
 *
 * The `variant`, `color`, and `layout` inputs drive the M3 Expressive
 * configurations onto the host via `data-*` attributes; the CSS styles from
 * those. `variant="baseline"` (the default) preserves the legacy square menu.
 */
@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    '[gui-menu]',
  exportAs: 'guiMenu',
  host: {
    'class': 'gui-menu',
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
    '[attr.data-layout]': 'layout()',
  },
})
export class MenuDirective {
  /** `baseline` (square, legacy) or `vertical` (M3 Expressive, rounded). */
  readonly variant = input<GuiMenuVariant>('baseline');
  /** `standard` (surface-based) or `vibrant` (tertiary-based). */
  readonly color = input<GuiMenuColor>('standard');
  /** `standard` (flat list) or `grouped` (spaced sections). */
  readonly layout = input<GuiMenuLayout>('standard');
}
