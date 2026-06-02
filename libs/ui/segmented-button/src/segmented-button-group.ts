import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  contentChildren,
  effect,
  forwardRef,
  input,
  model,
} from '@angular/core';
import { SegmentedButtonComponent } from './segmented-button';

/** M3 segmented buttons (single- or multi-select). Each segment is its own Tab stop. */
@Component({
  selector: 'gui-segmented-buttons',
  template: `<ng-content />`,
  styleUrl: './segmented-button.css',
  host: {
    'role': 'radiogroup',
    '[attr.aria-multiselectable]': 'multiple() ? "true" : null',
  },
  exportAs: 'guiSegmentedButtons',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedButtonGroupComponent {
  multiple = input(false, { transform: booleanAttribute });
  /** Single-select: string|null. Multi-select: string[]. */
  value = model<string | string[] | null>(null);

  private readonly segments = contentChildren(
    forwardRef(() => SegmentedButtonComponent),
  );

  constructor() {
    effect(() => {
      const count = this.segments().length;
      if (count > 0 && (count < 2 || count > 5)) {
        // M3: segmented buttons hold 2–5 segments.
        console.warn(
          `[gui-segmented-buttons] expected 2–5 segments, got ${count}.`,
        );
      }
    });
  }

  isSelected(segmentValue: string): boolean {
    const v = this.value();
    return this.multiple()
      ? Array.isArray(v) && v.includes(segmentValue)
      : v === segmentValue;
  }

  toggleValue(segmentValue: string): void {
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? (this.value() as string[]) : [];
      this.value.set(
        current.includes(segmentValue)
          ? current.filter((x) => x !== segmentValue)
          : [...current, segmentValue],
      );
    } else {
      // single-select: clicking the selected segment unselects it (M3).
      this.value.set(this.value() === segmentValue ? null : segmentValue);
    }
  }
}
