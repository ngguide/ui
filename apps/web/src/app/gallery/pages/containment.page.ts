import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryPageComponent } from '../gallery-page.component';
import { BottomSheetDemo } from '../demos/bottom-sheet.demo';
import { CardDemo } from '../demos/card.demo';
import { CarouselDemo } from '../demos/carousel.demo';
import { DialogDemo } from '../demos/dialog.demo';
import { DividerDemo } from '../demos/divider.demo';
import { ListDemo } from '../demos/list.demo';
import { SideSheetDemo } from '../demos/side-sheet.demo';

/** Gallery page for the M3 "Containment" component group. */
@Component({
  selector: 'app-gallery-containment',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GalleryPageComponent,
    BottomSheetDemo,
    CardDemo,
    CarouselDemo,
    DialogDemo,
    DividerDemo,
    ListDemo,
    SideSheetDemo,
  ],
  template: `
    <app-gallery-page title="Containment" [componentNames]="components">
      <app-demo-card />
      <app-demo-carousel />
      <app-demo-list />
      <app-demo-divider />
      <app-demo-dialog />
      <app-demo-bottom-sheet />
      <app-demo-side-sheet />
    </app-gallery-page>
  `,
})
export class ContainmentPage {
  protected readonly components = [
    'Card',
    'Carousel',
    'List',
    'Divider',
    'Dialog',
    'Bottom sheet',
    'Side sheet',
  ];
}
