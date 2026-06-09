import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CdkMenuGroup } from '@angular/cdk/menu';

/**
 * An M3 grouped-menu section. Wraps a run of menu items into a labeled section
 * for the Expressive `layout="grouped"` vertical menu. It composes CDK's
 * `CdkMenuGroup` so the section is a `role="group"`, carries the M3 small (8dp)
 * `group.shape`, and renders an optional `label` styled per the M3
 * `section-label-text` role (on-surface-variant). Items at the section's ends
 * tuck their outer corners to the 8dp group radius (handled in menu.css).
 *
 * Usage:
 * ```html
 * <div gui-menu variant="vertical" layout="grouped" cdkMenu>
 *   <gui-menu-section label="Account">
 *     <button gui-menu-item>Profile</button>
 *     <button gui-menu-item>Settings</button>
 *   </gui-menu-section>
 * </div>
 * ```
 */
@Component({
  selector: 'gui-menu-section',
  exportAs: 'guiMenuSection',
  // The section label is decorative grouping text; CdkMenuGroup supplies the
  // role="group" semantics on the host.
  template: `@if (label()) {
      <span class="gui-menu-section-label">{{ label() }}</span>
    }
    <ng-content />`,
  host: { 'class': 'gui-menu-section' },
  hostDirectives: [CdkMenuGroup],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSectionComponent {
  /** Optional section label, rendered above the items as M3 section-label-text. */
  readonly label = input<string>();
}
