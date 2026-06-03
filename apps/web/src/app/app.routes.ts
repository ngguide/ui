import { Route } from '@angular/router';

/**
 * The Shell owns the persistent chrome and hosts each lazily-loaded app under
 * its base path. `/` lands on Console. The `tasks` and `shop` branches are wired
 * in their own groups (D / E).
 */
export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'admin' },
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.routes').then((m) => m.adminRoutes),
      },
    ],
  },
];
