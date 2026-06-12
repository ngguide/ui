import { Routes } from '@angular/router';

/**
 * The M3-style documentation site (`/ui`). The shell owns the persistent bar +
 * sidebar; the home page fronts the catalogue and each component gets its own
 * page (mirroring m3.material.io's one-page-per-component structure).
 */
export const docsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./docs-shell.component').then((m) => m.DocsShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'ngguide UI · Material Design 3 for Angular',
        loadComponent: () =>
          import('./docs-home.component').then((m) => m.DocsHomeComponent),
      },
      {
        path: 'components/:slug',
        title: 'Component · ngguide UI',
        loadComponent: () =>
          import('./component-page.component').then(
            (m) => m.ComponentPageComponent,
          ),
      },
      { path: 'components', pathMatch: 'full', redirectTo: '' },
    ],
  },
];
