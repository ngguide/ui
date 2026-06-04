import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GalleryPageComponent } from '../gallery-page.component';
import { BadgeDemo } from '../demos/badge.demo';
import { LoadingIndicatorDemo } from '../demos/loading-indicator.demo';
import { ProgressDemo } from '../demos/progress.demo';
import { SnackbarDemo } from '../demos/snackbar.demo';
import { TooltipDemo } from '../demos/tooltip.demo';

/** Gallery page for the M3 "Communication" component group. */
@Component({
  selector: 'app-gallery-communication',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GalleryPageComponent,
    BadgeDemo,
    LoadingIndicatorDemo,
    ProgressDemo,
    SnackbarDemo,
    TooltipDemo,
  ],
  template: `
    <app-gallery-page title="Communication" [componentNames]="components">
      <app-demo-badge />
      <app-demo-loading-indicator />
      <app-demo-progress />
      <app-demo-snackbar />
      <app-demo-tooltip />
    </app-gallery-page>
  `,
})
export class CommunicationPage {
  protected readonly components = [
    'Badge',
    'Loading indicator',
    'Progress indicators',
    'Snackbar',
    'Tooltip',
  ];
}
