import { Routes } from '@angular/router';

/**
 * Component vitrine routes. Each M3 component category (matching
 * `docs/components/<category>/`) is its own lazily-loaded page that stacks the
 * isolated per-component demos under `./demos/`. A category page exists so the
 * gallery can be browsed the same way the spec docs are organised, and so each
 * page stays a small, focused bundle.
 */
export const galleryRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'actions' },
  {
    path: 'actions',
    title: 'Actions · Gallery',
    loadComponent: () =>
      import('./pages/actions.page').then((m) => m.ActionsPage),
  },
  {
    path: 'communication',
    title: 'Communication · Gallery',
    loadComponent: () =>
      import('./pages/communication.page').then((m) => m.CommunicationPage),
  },
  {
    path: 'containment',
    title: 'Containment · Gallery',
    loadComponent: () =>
      import('./pages/containment.page').then((m) => m.ContainmentPage),
  },
  {
    path: 'selection',
    title: 'Selection · Gallery',
    loadComponent: () =>
      import('./pages/selection.page').then((m) => m.SelectionPage),
  },
  {
    path: 'text-inputs',
    title: 'Text inputs · Gallery',
    loadComponent: () =>
      import('./pages/text-inputs.page').then((m) => m.TextInputsPage),
  },
];
