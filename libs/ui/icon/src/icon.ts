import { Component, computed, input, numberAttribute } from '@angular/core';

@Component({
  selector: 'gui-icon',
  template: ` <ng-content /> `,
  styles: `
    :host {
      display: inline-block;
      width: var(--gui-comp-icon-size, 24px);
      height: var(--gui-comp-icon-size, 24px);
    }
  `,
  host: {
    '[style.--gui-comp-icon-size]': 'sizeValue()',
  },
})
export class IconComponent {
  size = input(undefined, {
    transform: numberAttribute,
  });

  protected sizeValue = computed(() =>
    this.size() ? `${this.size()}px` : undefined,
  );
}
