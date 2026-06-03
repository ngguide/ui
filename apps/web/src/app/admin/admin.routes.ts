import { Routes } from '@angular/router';
import { AdminStore } from './admin.store';

/**
 * Console feature routes. `AdminStore` is provided here, so it is created once
 * for the whole `/admin` branch and shared by every screen — and disposed when
 * the user leaves Console. `users` / `settings` land in Group C.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    providers: [AdminStore],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Console',
        loadComponent: () =>
          import('./dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
];
