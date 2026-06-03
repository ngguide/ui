import { Directive } from '@angular/core';

/**
 * M3 menu surface. A pure styling hook applied to the consumer's
 * `<div cdkMenu>` (or `<ng-template [gui-menu] cdkMenu>`). It adds the M3
 * surface-container panel styling and nothing behavioral — `CdkMenu` supplies
 * `role="menu"` and the menu keyboard/focus behavior.
 */
@Directive({
  selector:
    // eslint-disable-next-line @angular-eslint/directive-selector
    '[gui-menu]',
  exportAs: 'guiMenu',
  host: { class: 'gui-menu' },
})
export class MenuDirective {}
