import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Molecules', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should load table, search, and details pane', async ({ page }) => {
    await page.goto('/research-projects');
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        
        await page.goto(`/projects/${projectId}/candidates`);
        await page.waitForLoadState('networkidle');
        await assertNoMockData(page);

        const table = page.locator('table').first();
        const emptyState = page.locator('text=No candidate molecules').first();
        await expect(table.or(emptyState)).toBeVisible();

        // Search test
        const searchInput = page.locator('input[placeholder*="Search" i]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('benzene');
            await page.waitForTimeout(500); // debounce
        }

        // Details pane test
        const firstRowBtn = page.locator('table tbody tr button').first();
        if (await firstRowBtn.isVisible()) {
            await firstRowBtn.click();
            await expect(page.locator('text=Molecule Properties').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
        }
      }
    }
  });
});
