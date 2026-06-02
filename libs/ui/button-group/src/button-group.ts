import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

/** M3 button group: connected or standard arrangement of related buttons. The
 * container is not focusable; each projected button keeps its own Tab stop. */
@Component({
  selector: 'gui-button-group',
  template: `<ng-content />`,
  styleUrl: './button-group.css',
  host: {
    'role': 'group',
    '[attr.data-connected]': 'connected() ? "" : null',
  },
  exportAs: 'guiButtonGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonGroupComponent {
  /** Connected (shared edges) vs standard (spaced) arrangement. */
  connected = input(false, { transform: booleanAttribute });
}
