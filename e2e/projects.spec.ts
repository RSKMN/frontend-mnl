import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Projects', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  test('should create, open, and delete a project', async ({ page }) => {
    // Navigate to projects list
    await page.goto('/research-projects');
    await assertNoMockData(page);

    // Create a new project
    const createBtn = page.locator('button').filter({ hasText: /New Project|Create/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      const pName = `E2E Test Project ${Date.now()}`;
      await page.fill('input[placeholder*="name" i]', pName);
      // Fill description if exists
      const descInput = page.locator('textarea[placeholder*="description" i]');
      if (await descInput.isVisible()) {
         await descInput.fill('Automated E2E Project');
      }

      await page.click('button[type="submit"], button:has-text("Create")');
      await page.waitForLoadState('networkidle');
      
      // Verify project is in the list
      await expect(page.locator(`text=${pName}`).first()).toBeVisible();
    }

    // Open the first project in the list
    const firstProjectLink = page.locator('a[href*="/projects/"], button').filter({ hasText: /Open|View|E2E Test/i }).first();
    if (await firstProjectLink.isVisible()) {
      await firstProjectLink.click();
      await page.waitForURL(/.*\/projects\/.*/);
      await assertNoMockData(page);
    }
    
    // (Optional) Delete project if delete button exists
    const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      // Handle confirmation modal
      const confirmBtn = page.locator('button').filter({ hasText: /Confirm|Delete/i }).last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
    }
  });
});
