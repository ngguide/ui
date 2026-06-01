import { defineConfig } from 'vitest/config';

/**
 * Advanced Vitest config for the `ui` library's `@nx/angular:unit-test` target
 * (wired via `runnerConfig` in project.json). The Angular Vitest builder still
 * auto-initializes TestBed, `globals`, jsdom, and zoneless support on top of
 * this — these options only ADD to that.
 *
 * `@material/material-color-utilities` is ESM-only and ships extensionless
 * relative imports (e.g. `./dynamic_color`). The test build externalizes
 * packages, so without this the runner would import MCU through raw Node ESM
 * and fail to resolve those paths. Inlining it routes MCU through Vite's
 * esbuild pipeline (which resolves extensionless imports) so the theme specs
 * can import the real algorithm.
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
