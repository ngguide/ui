import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  GuiFocusRingDirective,
  GuiRippleDirective,
  GuiStateLayerDirective,
} from '@ngguide/ui/interaction';
import { ChipSetComponent } from './chip-set';

/** M3 chip families. */
export type GuiChipType = 'assist' | 'filter' | 'input' | 'suggestion';

/**
 * A single M3 chip. Lives inside a {@link ChipSetComponent} as a
 * `role="gridcell"` host that is ALSO the interactive target: the host carries
 * the roving tab stop, the state layer / ripple / focus ring (its keyboard
 * focus lands on the host directly, so the host directives' default
 * `monitorDescendants:false` is correct), and the click / Enter / Space
 * activation. Selection (single/multiple sets) is conveyed by `aria-selected`
 * on the gridcell per the M3 web a11y table — not a nested `role="checkbox"`.
 *
 * Disabled chips use `aria-disabled` (not the native `disabled` attribute) so
 * they stay focusable and the roving model keeps them discoverable (M3), while
 * the interaction directives self-suppress via `isHostDisabled`.
 *
 * Only an input chip exposes a trailing remove `button`; a filter chip may carry
 * a non-remove trailing icon via `[guiChipTrailing]`. Removal emits
 * {@link remove} (the consumer owns the actual deletion).
 */
@Component({
  selector: 'gui-chip',
  exportAs: 'guiChip',
  template: `
    <span class="gui-chip-avatar" aria-hidden="true">
      <ng-content select="[guiChipAvatar]" />
    </span>
    <span class="gui-chip-leading" aria-hidden="true">
      @if (type() === 'filter' && selected()) {
        <svg class="gui-chip-check" viewBox="0 -960 960 960" focusable="false">
          <path
            d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"
            fill="currentColor"
          />
        </svg>
      } @else {
        <ng-content select="[guiChipLeading]" />
      }
    </span>
    <span class="gui-chip-label"><ng-content /></span>
    @if (type() === 'filter') {
      <span class="gui-chip-trailing" aria-hidden="true">
        <ng-content select="[guiChipTrailing]" />
      </span>
    }
    @if (isRemovable()) {
      <button
        class="gui-chip-remove"
        type="button"
        tabindex="-1"
        [attr.aria-label]="'Remove ' + label()"
        [disabled]="isDisabled()"
        (click)="onRemove($event)"
      >
        <span class="gui-chip-remove-icon">
          <ng-content select="[guiChipRemove]" />
        </span>
      </button>
    }
  `,
  styleUrl: './chip.css',
  hostDirectives: [
    GuiStateLayerDirective,
    GuiRippleDirective,
    GuiFocusRingDirective,
  ],
  host: {
    'role': 'gridcell',
    // The host IS the roving focus target: exactly one chip holds tabindex=0.
    '[attr.tabindex]': 'active() ? 0 : -1',
    '[attr.data-type]': 'type()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-elevated]': 'elevated() ? "" : null',
    // M3 web a11y: a selectable chip conveys selection via aria-selected on the
    // gridcell (not a nested checkbox/radio).
    '[attr.aria-selected]': 'selectable() ? (selected() ? "true" : "false") : null',
    // aria-disabled (not native disabled) keeps the chip focusable/discoverable.
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[class.gui-disabled]': 'isDisabled()',
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onActivateKey($event)',
    '(keydown.space)': 'onActivateKey($event)',
    '(keydown.delete)': 'maybeRemove($event)',
    '(keydown.backspace)': 'maybeRemove($event)',
    '(blur)': 'control.markTouched()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  readonly type = input<GuiChipType>('assist');
  readonly value = input('');
  readonly label = input('');
  readonly removable = input(false, { transform: booleanAttribute });
  readonly elevated = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly remove = output<void>();

  protected readonly set = inject(ChipSetComponent);
  protected readonly control = this.set.control;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The owning set makes chips selectable (single/multiple). */
  protected readonly selectable = computed(() => this.set.select() !== 'none');
  protected readonly selected = computed(() => this.set.isSelected(this.value()));
  /** Own `disabled` OR the whole set being disabled. */
  protected readonly isDisabled = computed(
    () => this.disabled() || this.set.disabledState(),
  );
  /** Remove affordance is an M3 input-chip feature only. */
  protected readonly isRemovable = computed(
    () => this.removable() && this.type() === 'input',
  );

  /** Roving tab stop: granted/withdrawn by the owning set. */
  private readonly activeState = signal(false);
  protected readonly active = this.activeState.asReadonly();

  /** {@link FocusableOption}: roving focus moves DOM focus to the host. */
  focus(): void {
    this.host.nativeElement.focus();
  }

  /**
   * {@link FocusableOption} type-ahead label. `createRovingFocus` enables
   * type-ahead, whose {@link FocusKeyManager} requires every option to provide a
   * `getLabel()`; without it the manager throws on build. Returns the explicit
   * `label` input or, failing that, the chip's visible text.
   */
  getLabel(): string {
    return (
      this.label() ||
      this.host.nativeElement
        .querySelector('.gui-chip-label')
        ?.textContent?.trim() ||
      ''
    );
  }

  /** Called by the set to grant/withdraw the single roving tab stop. */
  setActive(active: boolean): void {
    this.activeState.set(active);
  }

  protected onActivate(): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.selectable()) {
      this.set.toggle(this.value());
    }
  }

  protected onActivateKey(event: Event): void {
    // Enter / Space activate the focused chip (M3 keyboard). Stop the event so
    // the set's roving key manager (Space type-ahead) does not also consume it.
    event.preventDefault();
    event.stopPropagation();
    this.onActivate();
  }

  protected onRemove(event: Event): void {
    // Don't let the remove click bubble up and also toggle the chip.
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    this.remove.emit();
  }

  protected maybeRemove(event: Event): void {
    // M3: Backspace/Delete removes the currently focused INPUT chip.
    if (this.isRemovable() && !this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      this.remove.emit();
    }
  }
}
