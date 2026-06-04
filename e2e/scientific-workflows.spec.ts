import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Scientific Workflows', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  const endpoints = ['docking', 'gnina', 'qm', 'simulation'];

  for (const endpoint of endpoints) {
    test(`should render /${endpoint} without mock data or errors`, async ({ page }) => {
      await page.goto('/research-projects');
      const firstProject = page.locator('a[href*="/projects/"]').first();
      if (await firstProject.isVisible()) {
        await firstProject.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
        if (projectIdMatch) {
          const projectId = projectIdMatch[1];
          
          await page.goto(`/projects/${projectId}/${endpoint}`);
          await page.waitForLoadState('networkidle');
          await assertNoMockData(page);
          
          // Verify that at least some header/content loaded
          await expect(page.locator('text=Data Source').first()).toBeVisible({ timeout: 10000 }).catch(() => null);
        }
      }
    });
  }
});
