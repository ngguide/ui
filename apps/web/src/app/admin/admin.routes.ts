import { Routes } from '@angular/router';
import { AdminStore } from './admin.store';

/**
 * Console feature routes. `AdminStore` is provided here, so it is created once
 * for the whole `/admin` branch and shared by every screen — and disposed when
 * the user leaves Console.
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
      {
        path: 'users',
        title: 'Users · Console',
        loadComponent: () =>
          import('./users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'users/new',
        title: 'New user · Console',
        loadComponent: () =>
          import('./user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/edit',
        title: 'Edit user · Console',
        loadComponent: () =>
          import('./user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id',
        title: 'User · Console',
        loadComponent: () =>
          import('./user-detail.component').then((m) => m.UserDetailComponent),
      },
      {
        path: 'settings',
        title: 'Settings · Console',
        loadComponent: () =>
          import('./settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
