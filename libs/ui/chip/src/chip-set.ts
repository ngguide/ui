import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { GuiFormControl } from '@ngguide/ui/forms';
import {
  createRovingFocus,
  FocusableOption,
  FocusKeyManager,
} from '@ngguide/ui/interaction';
import { ChipComponent } from './chip';

/** Selection mode for a {@link ChipSetComponent}. */
export type GuiChipSelect = 'none' | 'single' | 'multiple';

/**
 * M3 chip set — a horizontal grid of chips. The set is `role="grid"` with a
 * single inner `role="row"`; each chip is a `role="gridcell"`. Arrow keys rove
 * focus across chips (1-D horizontal); the set itself is the single Tab stop.
 *
 * Selection (filter chips) is owned here and surfaced through the composed
 * {@link GuiFormControl}: `single` ⇒ value is `string | null`, `multiple` ⇒
 * value is `string[]`, `none` ⇒ no selection state.
 */
@Component({
  selector: 'gui-chip-set',
  exportAs: 'guiChipSet',
  template: `<div role="row" class="gui-chip-row"><ng-content /></div>`,
  styleUrl: './chip.css',
  hostDirectives: [
    {
      directive: GuiFormControl,
      inputs: ['value', 'disabled'],
      outputs: ['valueChange'],
    },
  ],
  host: {
    'role': 'grid',
    '(keydown)': 'onKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSetComponent {
  readonly control = inject(GuiFormControl<string | string[] | null>);
  readonly select = input<GuiChipSelect>('none');

  private readonly chips = contentChildren(forwardRef(() => ChipComponent));
  // The manager is typed over the CDK `FocusableOption` (chips satisfy it via
  // `focus()`). `ChipComponent` cannot be the type argument directly because its
  // `disabled` signal input collides with `FocusableOption.disabled?: boolean`.
  private manager?: FocusKeyManager<FocusableOption>;

  constructor() {
    afterNextRender(() => {
      this.rebuildManager();
    });

    // The FocusKeyManager is built over a static snapshot of the chip array, so
    // it must be recreated whenever the projected chips change. When the active
    // chip was removed, move the roving focus to a surviving neighbour.
    effect(() => {
      const chips = this.chips();
      if (!this.manager) {
        return;
      }
      const previous = this.manager.activeItem as ChipComponent | null;
      const previousIndex = this.manager.activeItemIndex ?? 0;
      this.rebuildManager();
      if (previous && !chips.includes(previous) && chips.length > 0) {
        const neighbour = Math.min(Math.max(previousIndex, 0), chips.length - 1);
        this.manager?.setActiveItem(neighbour);
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.manager?.onKeydown(event);
  }

  private rebuildManager(): void {
    // Chips stay focusable regardless of their `disabled` input (M3/WAI-ARIA
    // keeps disabled options discoverable), so the manager must not skip any.
    this.manager = createRovingFocus(
      this.chips() as readonly FocusableOption[],
      { orientation: 'horizontal' },
    ).skipPredicate(() => false);
  }

  isSelected(value: string): boolean {
    const v = this.control.value();
    switch (this.select()) {
      case 'single':
        return v === value;
      case 'multiple':
        return Array.isArray(v) && v.includes(value);
      default:
        return false;
    }
  }

  toggle(value: string): void {
    const v = this.control.value();
    switch (this.select()) {
      case 'single':
        // M3: toggling the selected chip clears the selection.
        this.control.emit(v === value ? null : value);
        break;
      case 'multiple': {
        const current = Array.isArray(v) ? v : [];
        this.control.emit(
          current.includes(value)
            ? current.filter((x) => x !== value)
            : [...current, value],
        );
        break;
      }
      default:
        // 'none': chips are not selectable.
        break;
    }
  }
}
