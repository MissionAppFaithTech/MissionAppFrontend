import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

/**
 * Next.js ESLint flat config.
 * `settings.react.version` bypasses eslint-plugin-react auto-detect, which
 * crashes on ESLint 10 (`context.getFilename` removed).
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    settings: {
      react: {
        version: '19',
      },
    },
    rules: {
      // React Hook Form `watch()` — known React Compiler false positive
      'react-hooks/incompatible-library': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'pnpm-lock.yaml',
    'scripts/**',
    '.stryker-tmp/**',
    'reports/**',
    'playwright-report/**',
    'test-results/**',
  ]),
]);

export default eslintConfig;
