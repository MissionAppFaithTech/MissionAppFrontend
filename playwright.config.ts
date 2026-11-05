import { defineConfig, devices } from '@playwright/test';

/** Google Chrome by default; `PW_BUNDLED_CHROMIUM=1` uses Playwright's Chromium where Chrome is not installed. */
const chromeChannel = process.env.PW_BUNDLED_CHROMIUM ? {} : { channel: 'chrome' };

const mockApiPort = process.env.E2E_MOCK_API_PORT || '3335';
const mockApiUrl = `http://localhost:${mockApiPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...chromeChannel,
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        ...chromeChannel,
      },
    },
  ],
  webServer: [
    {
      // Fake backend for the server-rendered reads (ADR-0005). Its own port, so
      // the suite never reaches a real API.
      command: 'node e2e/support/mock-api.mjs',
      url: `${mockApiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: { E2E_MOCK_API_PORT: mockApiPort },
    },
    {
      command: 'pnpm start',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        PATH: `${process.env.HOME}/.nvm/versions/node/v24.19.0/bin:${process.env.PATH}`,
        API_URL: mockApiUrl,
        // Every spec searches from the same IP; the per-IP limit has unit tests.
        CATALOG_SEARCH_IP_LIMIT: '100000',
      },
    },
  ],
});
