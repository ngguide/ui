import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryPageComponent } from '../gallery-page.component';
import { ButtonDemo } from '../demos/button.demo';
import { ButtonGroupDemo } from '../demos/button-group.demo';
import { FabDemo } from '../demos/fab.demo';
import { FabMenuDemo } from '../demos/fab-menu.demo';
import { IconButtonDemo } from '../demos/icon-button.demo';
import { SegmentedButtonDemo } from '../demos/segmented-button.demo';
import { SplitButtonDemo } from '../demos/split-button.demo';

/** Gallery page for the M3 "Actions" component group. */
@Component({
  selector: 'app-gallery-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GalleryPageComponent,
    ButtonDemo,
    ButtonGroupDemo,
    FabDemo,
    FabMenuDemo,
    IconButtonDemo,
    SegmentedButtonDemo,
    SplitButtonDemo,
  ],
  template: `
    <app-gallery-page title="Actions" [componentNames]="components">
      <app-demo-button />
      <app-demo-button-group />
      <app-demo-fab />
      <app-demo-fab-menu />
      <app-demo-icon-button />
      <app-demo-segmented-button />
      <app-demo-split-button />
    </app-gallery-page>
  `,
})
export class ActionsPage {
  protected readonly components = [
    'Button',
    'Button group',
    'FAB',
    'FAB menu',
    'Icon button',
    'Segmented button',
    'Split button',
  ];
}
