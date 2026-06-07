import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'phase-p5-audit.spec.ts',
  timeout: 300000,
  expect: {
    timeout: 20000
  },
  use: {
    baseURL: 'https://drugquinfosys.vercel.app',
    trace: 'on',
    screenshot: 'off', // We manage screenshots manually in the test
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
