import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'phase-p3.spec.ts',
  timeout: 300000,
  expect: {
    timeout: 15000
  },
  use: {
    baseURL: 'https://drugquinfosys.vercel.app',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
