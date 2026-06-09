import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
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
 * focus across chips (1-D horizontal) and the set is the single Tab stop:
 * exactly one chip carries `tabindex=0` (roving tabindex), all others `-1`.
 *
 * Selection (filter/input chips) is owned here and surfaced through the composed
 * {@link GuiFormControl}: `single` ⇒ value is `string | null`, `multiple` ⇒
 * value is `string[]`, `none` ⇒ no selection state. The set's `disabled` input
 * is exposed via {@link disabledState} so every chip can observe it.
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

  /** Whether the whole set (or its bound form control) is disabled. */
  readonly disabledState = this.control.effectiveDisabled;

  private readonly chips = contentChildren(forwardRef(() => ChipComponent));
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  // The manager is typed over the CDK `FocusableOption` (chips satisfy it via
  // `focus()`). `ChipComponent` cannot be the type argument directly because its
  // `disabled` signal input collides with `FocusableOption.disabled?: boolean`.
  private manager?: FocusKeyManager<FocusableOption>;
  private changeSub?: Subscription;

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
        // Only steal DOM focus when it was inside the set (a user-initiated
        // removal of the focused chip). If focus is elsewhere — e.g. the chip
        // list mutated from an async refresh — move the tab stop WITHOUT
        // focusing, so we never hijack the user's focus.
        if (this.host.nativeElement.contains(document.activeElement)) {
          this.manager?.setActiveItem(neighbour);
        } else {
          this.manager?.updateActiveItem(neighbour);
          this.syncActive(neighbour);
        }
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.manager?.onKeydown(event);
  }

  /** Mirror the manager's active index so exactly one chip holds tabindex=0. */
  private syncActive(index: number | null): void {
    this.chips().forEach((chip, i) => chip.setActive(i === index));
  }

  private rebuildManager(): void {
    this.changeSub?.unsubscribe();
    const chips = this.chips();
    // Chips stay focusable regardless of their `disabled` input (M3/WAI-ARIA
    // keeps disabled options discoverable), so the manager must not skip any.
    // Disabled chips use aria-disabled, not the native attribute, so roving
    // focus still lands on them.
    this.manager = createRovingFocus(chips as readonly FocusableOption[], {
      orientation: 'horizontal',
    }).skipPredicate(() => false);

    this.changeSub = this.manager.change
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => this.syncActive(index));

    // Seed the single tab stop without stealing focus: the selected chip holds
    // it (so Tab lands on the current selection), else the first chip.
    if (chips.length > 0) {
      const selectedIndex = chips.findIndex((chip) =>
        this.isSelected(chip.value()),
      );
      const seed = selectedIndex >= 0 ? selectedIndex : 0;
      this.manager.updateActiveItem(seed);
      this.syncActive(seed);
    }
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
