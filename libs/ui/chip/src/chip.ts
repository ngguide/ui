import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
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
 * `role="gridcell"` host containing a primary `button` and an optional trailing
 * remove `button`. Filter chips toggle selection on the owning set; removable
 * chips emit {@link remove} (the consumer owns the actual deletion).
 */
@Component({
  selector: 'gui-chip',
  exportAs: 'guiChip',
  template: `
    <span class="gui-chip-leading" aria-hidden="true"
      ><ng-content select="[guiChipLeading]"
    /></span>
    <button
      #primary
      class="gui-chip-primary"
      type="button"
      [attr.role]="set.select() === 'none' ? 'button' : 'checkbox'"
      [attr.aria-checked]="set.select() === 'none' ? null : selected()"
      [disabled]="disabled()"
      (click)="onPrimary()"
    >
      <span class="gui-chip-label"><ng-content /></span>
    </button>
    @if (removable()) {
      <button
        class="gui-chip-remove"
        type="button"
        [attr.aria-label]="'Remove ' + label()"
        (click)="remove.emit()"
      >
        <ng-content select="[guiChipRemove]" />
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
    '[attr.tabindex]': '-1',
    '[attr.data-type]': 'type()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-elevated]': 'elevated() ? "" : null',
    '[class.gui-disabled]': 'disabled()',
    '(keydown.delete)': 'maybeRemove($event)',
    '(keydown.backspace)': 'maybeRemove($event)',
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
  protected readonly selected = computed(() => this.set.isSelected(this.value()));

  private readonly primary =
    viewChild.required<ElementRef<HTMLButtonElement>>('primary');

  focus(): void {
    this.primary().nativeElement.focus();
  }

  protected onPrimary(): void {
    if (this.type() === 'filter') {
      this.set.toggle(this.value());
    }
  }

  protected maybeRemove(event: Event): void {
    if (this.removable()) {
      event.preventDefault();
      this.remove.emit();
    }
  }
}
