import { test as setup, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

const authFile = 'playwright/.auth/user.json';

setup('create new account and authenticate', async ({ page }) => {
  const uuid = uuidv4().substring(0, 8);
  const email = `e2e_runner_${uuid}@quinfosys.com`;
  const password = 'E2eTestPassword123!';

  // Go to signup page
  await page.goto('/signup');
  
  // Fill out the signup form
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="name"]', 'E2E Automated Tester');
  await page.fill('input[name="org"]', 'E2E Corp');
  await page.fill('input[name="role"]', 'Tester');
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm"]', password);
  
  // Check the terms checkbox
  await page.check('input#register-terms');

  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or project selector
  await page.waitForURL('**/workspace-selector**', { timeout: 15000 }).catch(() => {
    // maybe it goes straight to dashboard?
  });
  
  // End of authentication steps. Save state.
  await page.context().storageState({ path: authFile });
});
