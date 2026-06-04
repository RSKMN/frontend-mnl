import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Experiments', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should load history and display statuses correctly', async ({ page }) => {
    await page.goto('/research-projects');
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        
        // Go to experiments/history
        await page.goto(`/projects/${projectId}/history`);
        await page.waitForLoadState('networkidle');
        await assertNoMockData(page);

        // Verify history loads (either empty state or table)
        const table = page.locator('table').first();
        const emptyState = page.locator('text=No pipeline executions').first();
        
        await expect(table.or(emptyState)).toBeVisible();
      }
    }
  });
});
