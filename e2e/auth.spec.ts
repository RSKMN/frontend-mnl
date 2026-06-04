import { test, expect } from '@playwright/test';
import { setupGlobalFailureRules, assertNoMockData } from './utils';

test.describe('Authentication', () => {
  test.beforeEach(({ page }) => {
    setupGlobalFailureRules(page);
  });

  // Note: Signup and Login are largely verified by the global setup.
  // We will do a basic test here to ensure logout works and kicks us to /login.
  
  test('should logout successfully', async ({ page }) => {
    await page.goto('/workspace-selector'); // Auth state is loaded from global.setup.ts
    await assertNoMockData(page);

    // Click on user menu/avatar (heuristically finding logout)
    // The exact selector depends on the UI, but we can look for text or button
    const userMenuTrigger = page.locator('summary[aria-label="User profile"]').first();
    if (await userMenuTrigger.isVisible()) {
      await userMenuTrigger.click();
    } else {
      // Fallback
      await page.locator('header details summary').first().click().catch(() => null);
    }
    
    const logoutBtn = page.locator('button').filter({ hasText: /Logout|Log out/i }).first();
    await logoutBtn.click({ timeout: 5000 }).catch(() => {
        // if still not found, we might have to navigate to /login and see if it clears state
    });

    // We should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
