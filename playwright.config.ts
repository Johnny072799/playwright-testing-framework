import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'playwright/env/.env') });

export default defineConfig({
  testDir: './playwright/tests',
  timeout: 120_000,
  retries: parseInt(process.env.TEST_RETRIES || '0'),
  workers: parseInt(process.env.TEST_WORKERS || '1'),
  fullyParallel: true,
  use: {
    baseURL: process.env.BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
  },
  reporter: [
    ['html', { open: 'never', outputFolder: process.env.REPORTS_PATH || 'playwright-reports' }],
    ['json', { outputFile: `${process.env.REPORTS_PATH || 'playwright-reports'}/test-results.json` }],
    ['junit', { outputFile: `${process.env.REPORTS_PATH || 'playwright-reports'}/junit-results.xml` }],
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
