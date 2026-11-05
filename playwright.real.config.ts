import { defineConfig, devices } from '@playwright/test';
import { BACKEND_PORT, FRONTEND_PORT, backendEnvFile } from './e2e-real/support/stack.mjs';

/**
 * E2E against the REAL backend and database (`pnpm test:e2e:real`): an isolated
 * backend (port 3334, database `app_e2e` recreated per run, Redis db 1, no
 * queue workers) and `next start` on 3100 pointing at it. Run `pnpm build`
 * first and keep the backend infra up (`just up`). The fake-API suite
 * (`playwright.config.ts`) stays the CI gate.
 */
const chromeChannel = process.env.PW_BUNDLED_CHROMIUM ? {} : { channel: 'chrome' };
const apiUrl = `http://127.0.0.1:${BACKEND_PORT}`;
const webUrl = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './e2e-real',
  fullyParallel: true,
  timeout: 60000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-real' }]],
  globalTeardown: './e2e-real/support/global-teardown.ts',
  use: {
    baseURL: webUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...chromeChannel } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'], ...chromeChannel } },
  ],
  webServer: [
    {
      command: 'node e2e-real/support/start-backend.mjs',
      url: `${apiUrl}/`,
      // NOTE: always a fresh backend, so the database is recreated every run
      reuseExistingServer: false,
      timeout: 180 * 1000,
      stdout: 'ignore',
    },
    {
      command: `pnpm start -p ${FRONTEND_PORT}`,
      url: webUrl,
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        PATH: `${process.env.HOME}/.nvm/versions/node/v24.19.0/bin:${process.env.PATH}`,
        API_URL: apiUrl,
        // Same secret on both sides (ADR-0032), read from the backend `.env`.
        BFF_SHARED_SECRET: backendEnvFile().BFF_SHARED_SECRET ?? '',
        // Every spec searches from the same IP; the per-IP limit has unit tests.
        CATALOG_SEARCH_IP_LIMIT: '100000',
      },
    },
  ],
});
