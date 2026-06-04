import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { GuiSize } from '@ngguide/ui';

/** Default shape applied to the buttons in a connected group (M3 Expressive). */
export type GuiButtonGroupShape = 'round' | 'square';

/**
 * Selection behaviour of the group, mirroring the M3 button-group Selection
 * config. `none` is a plain action group (no selection semantics).
 */
export type GuiButtonGroupSelection = 'none' | 'single' | 'multi';

/** M3 button group: connected or standard arrangement of related buttons. The
 * container is not focusable; each projected button keeps its own Tab stop.
 *
 * Selection state lives on the child toggle buttons (each carries its own
 * `aria-pressed`/`aria-checked`); the group only advertises the selection mode
 * on the container so assistive technology can identify a single- vs
 * multi-select grouping. */
@Component({
  selector: 'gui-button-group',
  template: `<ng-content />`,
  styleUrl: './button-group.css',
  host: {
    '[attr.role]': 'selection() === "single" ? "radiogroup" : "group"',
    '[attr.aria-multiselectable]': 'selection() === "multi" ? "true" : null',
    '[attr.data-connected]': 'connected() ? "" : null',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
  },
  exportAs: 'guiButtonGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  /** Connected (shared edges) vs standard (spaced) arrangement. */
  connected = input(false, { transform: booleanAttribute });

  /** Button size of the group; drives inner padding and connected corners (M3 Expressive). */
  size = input<GuiSize>('md');

  /** Default shape applied to a connected group: fully-round or per-size square outer corners. */
  shape = input<GuiButtonGroupShape>('round');

  /** Selection semantics advertised to assistive technology. */
  selection = input<GuiButtonGroupSelection>('none');
}
