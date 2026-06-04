import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryPageComponent } from '../gallery-page.component';
import { CheckboxDemo } from '../demos/checkbox.demo';
import { ChipDemo } from '../demos/chip.demo';
import { MenuDemo } from '../demos/menu.demo';
import { RadioDemo } from '../demos/radio.demo';
import { SliderDemo } from '../demos/slider.demo';
import { SwitchDemo } from '../demos/switch.demo';

/** Gallery page for the M3 "Selection" component group. */
@Component({
  selector: 'app-gallery-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GalleryPageComponent,
    CheckboxDemo,
    ChipDemo,
    MenuDemo,
    RadioDemo,
    SliderDemo,
    SwitchDemo,
  ],
  template: `
    <app-gallery-page title="Selection" [componentNames]="components">
      <app-demo-checkbox />
      <app-demo-radio />
      <app-demo-switch />
      <app-demo-slider />
      <app-demo-chip />
      <app-demo-menu />
    </app-gallery-page>
  `,
})
export class SelectionPage {
  protected readonly components = [
    'Checkbox',
    'Radio button',
    'Switch',
    'Slider',
    'Chips',
    'Menu',
  ];
}
