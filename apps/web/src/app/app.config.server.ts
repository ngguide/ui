import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import {
  RenderMode,
  ServerRoute,
  provideServerRendering,
  withRoutes,
} from '@angular/ssr';
import { appConfig } from './app.config';

/**
 * Hybrid render policy. Every *static* route is prerendered to HTML at build
 * time, so first paint is real server-rendered content served as a static file.
 * The parameterized detail routes (`:id`) have no enumerable param set, so they
 * render on the server per request (`RenderMode.Server`). Render is
 * deterministic (fixed demo data), so no hydration mismatch.
 */
const serverRoutes: ServerRoute[] = [
  { path: 'admin/users/:id', renderMode: RenderMode.Server },
  { path: 'admin/users/:id/edit', renderMode: RenderMode.Server },
  { path: 'shop/orders/:id', renderMode: RenderMode.Server },
  { path: 'shop/products/:id', renderMode: RenderMode.Server },
  { path: 'shop/customers/:id', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender },
];

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
