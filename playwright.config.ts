import { defineConfig, devices } from '@playwright/test';

// Intentionally local-only: never accept a production/preview base URL.
const baseURL = 'http://127.0.0.1:3107';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 30_000,
  outputDir: '.context/browser-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: '.context/browser-report', open: 'never' }],
  ],
  use: {
    baseURL,
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start -- --hostname 127.0.0.1 --port 3107',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      // Explicit values also take precedence over local .env files in Next.
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'browser-test-mocked-widget',
      NEXT_PUBLIC_GA_MEASUREMENT_ID: '',
      DATABASE_URL: '',
      PG_INTEGRATION_URL: '',
      TURNSTILE_SECRET_KEY: '',
      MAIL_ENABLED: 'false',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      MAIL_TO: '',
      APP_ORIGIN: baseURL,
    },
  },
});
