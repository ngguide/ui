import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export type GuiDividerInset = 'none' | 'inset' | 'middle-inset';

/**
 * M3 divider — a thin (1dp) `outline-variant` rule separating content within
 * the same hierarchy (Req 3). Non-interactive and exposed as a `separator` to
 * assistive tech (Req 14.5). Inset variants (Req 3.2): `inset` indents the
 * leading edge by 16dp (aligning the rule with text after a leading element),
 * `middle-inset` indents both edges by 16dp. Set `orientation="vertical"` to
 * divide side-by-side content (Req 3.3).
 */
@Component({
  selector: 'gui-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styleUrl: './divider.css',
  host: {
    class: 'gui-divider',
    role: 'separator',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.data-inset]': 'inset()',
    '[attr.data-orientation]': 'orientation()',
  },
})
export class GuiDivider {
  /** Inset treatment (Req 3.2). */
  readonly inset = input<GuiDividerInset>('none');
  /** Divider direction (Req 3.3). */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
}
