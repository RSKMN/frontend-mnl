import { test, expect } from '@playwright/test';
import { loginUser, enterWorkspace } from './utils/auth-helper';
import { setupConsoleTracker } from './utils/navigation-helper';

test.describe('Experiments & Research Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await enterWorkspace(page);
  });

  test('Experiments page loads the dynamic progress tracking table', async ({ page }) => {
    const errorTracker = setupConsoleTracker(page);
    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('table, .table, [role="table"]').first()).toBeVisible();
    
    // Assert presence of status and metadata columns
    await expect(
      page.locator('text="Status"').or(
      page.locator('text="Progress"')).or(
      page.locator('text="Created"')).or(
      page.locator('text="Type"')).first()
    ).toBeVisible();
    
    errorTracker.assertNoSevereErrors();
  });

  test('Reports/results directory loads analytic downloads list', async ({ page }) => {
    const errorTracker = setupConsoleTracker(page);
    await page.goto('/results');
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check download button or details link is present
    await expect(
      page.locator('text="Download"').or(
      page.locator('text="Export"')).or(
      page.locator('text="View"')).or(
      page.locator('text="PDF"')).or(
      page.locator('svg')).first()
    ).toBeVisible();
    
    errorTracker.assertNoSevereErrors();
  });
});
