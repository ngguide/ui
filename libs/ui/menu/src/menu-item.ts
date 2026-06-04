import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { CdkMenuItem } from '@angular/cdk/menu';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';

/**
 * An M3 menu list item. Composes `CdkMenuItem` (which resolves the consumer's
 * `cdkMenu`) plus the interaction foundation, with leading / label / trailing
 * slots, plus the M3 Expressive optional slots (badge, trailing text, two-line
 * supporting text). Disabled state is owned by `CdkMenuItem` — consumers set it
 * on the host via `disabled` / `cdkMenuItemDisabled`. The item also works when
 * it carries a `cdkMenuTriggerFor` for cascading submenus.
 *
 * Selection: set `[selected]` to render the M3 selected state — the item
 * changes shape and color (tertiary-container by default, tertiary in a vibrant
 * menu) and shows a leading checkmark cue. Selectable items expose
 * `role="menuitemradio"` and `aria-checked`, per the M3 accessibility guidance
 * that selection be conveyed with multiple cues (color, shape, icon) at ≥3:1
 * contrast.
 *
 * Also matches the legacy `gui-fab-menu-item` selector / `guiFabMenuItem`
 * exportAs so FAB menus route through this single shared M3 implementation
 * (re-exported as `FabMenuItemComponent` from `@ngguide/ui/fab-menu`).
 */
@Component({
  selector:
    // eslint-disable-next-line @angular-eslint/component-selector
    'button[gui-menu-item], a[gui-menu-item], button[gui-fab-menu-item], a[gui-fab-menu-item]',
  template: `<span class="gui-menu-item-leading" aria-hidden="true">
      @if (selected()) {
        <svg
          class="gui-menu-item-check"
          viewBox="0 -960 960 960"
          focusable="false"
        >
          <path
            d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
            fill="currentColor"
          />
        </svg>
      } @else {
        <ng-content select="[guiMenuItemLeading]" />
      }
    </span>
    <span class="gui-menu-item-body">
      <span class="gui-menu-item-label"><ng-content /></span>
      <span class="gui-menu-item-supporting"
        ><ng-content select="[guiMenuItemSupporting]"
      /></span>
    </span>
    <span class="gui-menu-item-trailing-text"
      ><ng-content select="[guiMenuItemTrailingText]"
    /></span>
    <span class="gui-menu-item-badge"
      ><ng-content select="[guiMenuItemBadge]"
    /></span>
    <span class="gui-menu-item-trailing" aria-hidden="true"
      ><ng-content select="[guiMenuItemTrailing]"
    /></span>`,
  styleUrl: './menu.css',
  // The `.gui-menu` surface and `.gui-menu-divider` are applied to
  // CONSUMER-authored elements (a `<div gui-menu cdkMenu>` and
  // `<gui-menu-divider>`), which the CDK renders into the overlay carrying the
  // consumer's encapsulation id — emulated-scoped rules here would never match
  // them. ViewEncapsulation.None emits the (all `gui-menu*`-namespaced) rules
  // globally so the surface/divider style wherever the overlay places them.
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'gui-menu-item',
    '[attr.data-selected]': 'selected() ? "" : null',
    // CdkMenuItem sets a static role="menuitem"; override it to the radio role
    // for selectable items, otherwise re-assert "menuitem" (never null, which
    // would strip CDK's role).
    '[attr.role]':
      '(guiMenuItemSelectable() || selected()) ? "menuitemradio" : "menuitem"',
    '[attr.aria-checked]':
      '(guiMenuItemSelectable() || selected()) ? selected() : null',
  },
  hostDirectives: [
    // Expose CdkMenuItem's disabled input (aliased `cdkMenuItemDisabled`) so
    // consumers can set `[disabled]`/`[cdkMenuItemDisabled]` on the host.
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled', 'cdkMenuitemTypeaheadLabel'],
    },
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  exportAs: 'guiMenuItem, guiFabMenuItem',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  /**
   * Whether the item is currently selected. When `true`, the item renders the
   * M3 selected state (tertiary-container color + shape change + checkmark cue)
   * and reports `aria-checked="true"`. Setting `selected` also opts the item
   * into the selectable role.
   */
  readonly selected = input(false, { transform: booleanAttribute });

  /**
   * Opt the item into selection semantics without it being selected yet. A
   * selectable item is a `role="menuitemradio"` and reports `aria-checked`
   * (even when `false`), per the M3 accessibility guidance for selectable menu
   * items. Plain action items leave this off and keep CdkMenuItem's `menuitem`
   * role.
   */
  readonly guiMenuItemSelectable = input(false, {
    transform: booleanAttribute,
  });
}
