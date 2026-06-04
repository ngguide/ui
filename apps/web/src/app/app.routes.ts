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
      {
        path: 'gallery',
        loadChildren: () =>
          import('./gallery/gallery.routes').then((m) => m.galleryRoutes),
      },
    ],
  },
];
