import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryPageComponent } from '../gallery-page.component';
import { TextFieldDemo } from '../demos/text-field.demo';
import { DatePickerDemo } from '../demos/date-picker.demo';
import { TimePickerDemo } from '../demos/time-picker.demo';

/** Gallery page for the M3 "Text inputs" component group. */
@Component({
  selector: 'app-gallery-text-inputs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GalleryPageComponent, TextFieldDemo, DatePickerDemo, TimePickerDemo],
  template: `
    <app-gallery-page title="Text inputs" [componentNames]="components">
      <app-demo-text-field />
      <app-demo-date-picker />
      <app-demo-time-picker />
    </app-gallery-page>
  `,
})
export class TextInputsPage {
  protected readonly components = ['Text field', 'Date picker', 'Time picker'];
}
