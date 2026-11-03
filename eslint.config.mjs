import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginQuery from '@tanstack/eslint-plugin-query';

/**
 * Next.js ESLint flat config.
 * `settings.react.version` bypasses eslint-plugin-react auto-detect, which
 * crashes on ESLint 10 (`context.getFilename` removed).
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // ADR-0002: query keys, stable query clients and other TanStack Query rules.
  ...pluginQuery.configs['flat/recommended'],
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
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Prevenção estrita de código depreciado no código fonte do projeto
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    // ADR-0003: Zustand stores are client state. A module-level store written on
    // the server would leak one user's data into another request, so server code
    // never imports them.
    files: [
      'src/app/api/**/*.{ts,tsx}',
      'src/app/actions/**/*.{ts,tsx}',
      'src/proxy.ts',
      'src/lib/api/**/*.{ts,tsx}',
      'src/lib/server/**/*.{ts,tsx}',
    ],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/stores/*', '**/stores/*'],
              message:
                'Server code must not import Zustand stores (ADR-0003): they are client state.',
            },
          ],
        },
      ],
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
