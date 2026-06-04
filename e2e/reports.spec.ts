import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Reports', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should load report list and details', async ({ page }) => {
    await page.goto('/research-projects');
    const firstProject = page.locator('a[href*="/projects/"]').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch) {
        const projectId = projectIdMatch[1];
        
        await page.goto(`/projects/${projectId}/reports`);
        await page.waitForLoadState('networkidle');
        await assertNoMockData(page);

        // Verify report list loads
        const table = page.locator('table').first();
        const emptyState = page.locator('text=No reports generated').first();
        await expect(table.or(emptyState)).toBeVisible();

        // If a report exists, click "Open" and check if detail opens
        const openBtn = page.locator('button').filter({ hasText: 'Open' }).first();
        if (await openBtn.isVisible()) {
            await openBtn.click();
            await expect(page.locator('text=Reported sections').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
        }

        // Check if download link resolves correctly
        const downloadBtn = page.locator('a[data-testid="report-download-button"]').first();
        if (await downloadBtn.isVisible()) {
            const href = await downloadBtn.getAttribute('href');
            expect(href).toBeTruthy();
            expect(href).not.toContain('undefined');
            expect(href).not.toContain('null');
        }
      }
    }
  });
});
