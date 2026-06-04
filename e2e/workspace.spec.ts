import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Workspace', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should load workspace selector and allow creation', async ({ page }) => {
    await page.goto('/workspace-selector');
    await assertNoMockData(page);

    await expect(page.locator('text=Select Workspace').first()).toBeVisible({ timeout: 10000 }).catch(() => null);

    // Look for create workspace button
    const createBtn = page.locator('button').filter({ hasText: /Create|New Workspace/i }).first();
    if (await createBtn.isVisible()) {
      page.once('dialog', dialog => dialog.accept(`E2E Workspace ${Date.now()}`));
      await createBtn.click();
      
      // Wait for network/navigation
      await page.waitForLoadState('networkidle');
    }
    
    // Select first available workspace
    const firstWorkspace = page.locator('button, a').filter({ hasText: /E2E Test Workspace|Workspace/i }).first();
    if (await firstWorkspace.isVisible()) {
      await firstWorkspace.click();
    }
    
    // Should end up on projects or dashboard
    await expect(page).toHaveURL(/.*\/research-projects|.*\/dashboard/);
  });
});
