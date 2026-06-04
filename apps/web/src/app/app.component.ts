import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Thin router host. The demo's UI lives entirely in the lazily-loaded Shell and
 * its feature apps (Console / Tracker / Commerce). The previous single-screen
 * kitchen-sink playground was removed (Superseded Behaviors).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
