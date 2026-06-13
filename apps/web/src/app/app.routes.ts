import { Route } from '@angular/router';

/**
 * The Shell owns the persistent chrome and hosts each lazily-loaded app under
 * its base path. `/` lands on Console. The `tasks` and `shop` branches are wired
 * in their own groups (D / E).
 */
export const appRoutes: Route[] = [
  // The M3 documentation site is the index: `/` lands on the component reference.
  { path: '', pathMatch: 'full', redirectTo: 'ui' },
  {
    // Standalone M3-style documentation site, outside the demo-app shell.
    path: 'ui',
    loadChildren: () => import('./docs/docs.routes').then((m) => m.docsRoutes),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: 'tasks',
        loadChildren: () =>
          import('./tasks/tasks.routes').then((m) => m.tasksRoutes),
      },
      {
        path: 'shop',
        loadChildren: () =>
          import('./shop/shop.routes').then((m) => m.shopRoutes),
      },
    ],
  },
];
