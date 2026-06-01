import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs}',
            '{projectRoot}/src/test-setup.ts',
            '{projectRoot}/tailwind.config.js',
            '{projectRoot}/src/**/*.spec.ts',
            '{projectRoot}/tooling/**',
            '{projectRoot}/vite.config.mts',
            '{projectRoot}/vitest.config.ts',
          ],
          // rxjs is an intentional peer: CDK's a11y APIs (e.g. FocusMonitor.monitor)
          // return rxjs Observables that consumers subscribe to. The `ui` source
          // never imports an rxjs symbol directly, so the checker can't see the use.
          ignoredDependencies: ['rxjs'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'gui',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'gui',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
