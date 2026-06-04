import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Dashboard', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should render metric cards and charts', async ({ page }) => {
    await page.goto('/research-projects');
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        
        await page.goto(`/projects/${projectId}/overview`);
        await page.waitForLoadState('networkidle');
        await assertNoMockData(page);

        // Check metric cards exist
        await expect(page.locator('text=Total Candidates').first()).toBeVisible();
        await expect(page.locator('text=Scaffold Clusters').first()).toBeVisible();

        // Check charts
        const qedChart = page.locator('text=QED vs molecular weight').first();
        await expect(qedChart).toBeVisible();

        // Check Recent Activity
        const activity = page.locator('text=Recent Activity').first();
        await expect(activity).toBeVisible();
      }
    }
  });
});
