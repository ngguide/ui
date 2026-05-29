import { defineConfig } from 'vitest/config';

/**
 * Advanced Vitest config for `web`'s `@nx/angular:unit-test` target (wired via
 * `runnerConfig`). The Angular Vitest builder still auto-initializes TestBed,
 * `globals`, jsdom, and zoneless support on top of this.
 *
 * `web` specs transitively import `@material/material-color-utilities` (through
 * `@ngguide/ui/theme` used by `AppComponent`). MCU is ESM-only with extensionless
 * relative imports; inlining it routes MCU through Vite's esbuild pipeline so the
 * specs resolve it. See `libs/ui/vitest.config.ts` for the same rationale.
 */
export default defineConfig({
  optimizeDeps: {
    include: ['@material/material-color-utilities'],
  },
  ssr: {
    noExternal: ['@material/material-color-utilities'],
  },
  test: {
    server: {
      deps: {
        inline: [/@material\/material-color-utilities/],
      },
    },
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: ['@material/material-color-utilities'],
        },
      },
    },
  },
});
