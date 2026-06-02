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
/**
 * Icon primitive. Consumed inside the icon slots of button / icon-button
 * components and sizes via the `--gui-comp-icon-size` custom property.
 */
export class IconComponent {
  size = input(undefined, {
    transform: numberAttribute,
  });

  protected sizeValue = computed(() =>
    this.size() ? `${this.size()}px` : undefined,
  );
}
