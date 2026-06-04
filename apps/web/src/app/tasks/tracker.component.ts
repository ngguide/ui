import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import {
  SegmentedButtonGroupComponent,
  SegmentedButtonComponent,
} from '@ngguide/ui/segmented-button';
import { IconComponent } from '@ngguide/ui/icon';

/**
 * Tracker shell (`/tasks`). Hosts a board↔list `gui-segmented-buttons` toggle
 * whose active value is derived from the current URL and whose change navigates
 * to `/tasks/board` or `/tasks/list`, plus the `<router-outlet />` for the two
 * child views. `TasksStore` is provided on the feature route so both views share
 * one instance.
 */
@Component({
  selector: 'app-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    SegmentedButtonGroupComponent,
    SegmentedButtonComponent,
    IconComponent,
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css',
})
export class TrackerComponent {
  private readonly router = inject(Router);

  /** Latest navigated URL (seeded with the current one for the first render). */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Active toggle value, derived from the URL. */
  protected readonly view = computed(() =>
    this.url().includes('/list') ? 'list' : 'board',
  );

  protected onView(value: string | string[] | null): void {
    if (typeof value !== 'string') return;
    this.router.navigate(['/tasks', value]);
  }
}
