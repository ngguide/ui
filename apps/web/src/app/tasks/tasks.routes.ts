import { Routes } from '@angular/router';

import { TasksStore } from './tasks.store';
import { TrackerComponent } from './tracker.component';

/**
 * Tracker feature routes. `TasksStore` is provided here, so it is created once
 * for the whole `/tasks` branch and shared by the board and list views — and
 * disposed when the user leaves the Tracker. The parent `TrackerComponent`
 * renders the board↔list toggle and the child `<router-outlet />`.
 */
export const tasksRoutes: Routes = [
  {
    path: '',
    providers: [TasksStore],
    component: TrackerComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'board' },
      {
        path: 'board',
        title: 'Board · Tracker',
        loadComponent: () =>
          import('./board.component').then((m) => m.BoardComponent),
      },
      {
        path: 'list',
        title: 'List · Tracker',
        loadComponent: () =>
          import('./list.component').then((m) => m.ListComponent),
      },
    ],
  },
];
