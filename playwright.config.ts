import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load E2E custom environment variables if present
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // E2E tests often run cleaner sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Keep execution single-threaded for reliable UI testing
  reporter: 'html',
  timeout: 180000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: FRONTEND_BASE_URL,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on',
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
    timeout: 60000,
  },
});
