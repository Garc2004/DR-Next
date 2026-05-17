import { defineConfig, devices } from '@playwright/test';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'web',
      use: { ...devices['Desktop Chrome'], baseURL: WEB_URL },
      testMatch: /web\..*\.spec\.ts/,
    },
    {
      name: 'admin',
      use: { ...devices['Desktop Chrome'], baseURL: ADMIN_URL },
      testMatch: /admin\..*\.spec\.ts/,
    },
  ],
  webServer: process.env.CI
    ? undefined
    : [
        {
          command: 'pnpm --filter @dr/web dev',
          url: WEB_URL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'pnpm --filter @dr/admin dev',
          url: ADMIN_URL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});
