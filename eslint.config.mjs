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

      // Prevenção de código morto e variáveis não utilizadas
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unreachable': 'error',
      'no-unused-expressions': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-duplicate-imports': 'error',

      // Prevenção de código depreciado e duplicidades de importação
      'import/no-deprecated': 'error',
      'import/no-duplicates': 'error',
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
