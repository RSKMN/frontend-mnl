import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.use({
  baseURL: 'https://drugquinfosys.vercel.app',
  actionTimeout: 20000,
  navigationTimeout: 40000,
});

test('Audit all pages for Phase P5 platform readiness', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes

  const screenshotPackDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/SCREENSHOT_PACK';
  if (!fs.existsSync(screenshotPackDir)) {
    fs.mkdirSync(screenshotPackDir, { recursive: true });
  }

  const errors: string[] = [];
  const networkFailures: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[${page.url()}] Console Error: ${msg.text()}`);
    }
  });

  page.on('response', async response => {
    if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
      if (response.status() >= 400) {
        let text = '';
        try {
          text = await response.text();
        } catch (_) {}
        networkFailures.push(`[${page.url()}] API Failure: ${response.status()} ${response.url()} -> ${text.slice(0, 200)}`);
      }
    }
  });

  console.log("Navigating to login page...");
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  console.log("Logging in as test_user_1780852495260@gmail.com...");
  await page.fill('input[type="email"]', 'test_user_1780852495260@gmail.com');
  await page.fill('input[type="password"]', 'SecurePassword123!');
  await page.click('button[type="submit"]');

  console.log("Waiting for workspace selector...");
  await page.waitForURL('**/workspace-selector', { timeout: 20000 });
  await page.waitForTimeout(2000);

  // Click on the Enter Workspace button for the P3 workspace
  const enterWsBtn = page.locator('button:has-text("Enter Workspace")').first();
  await enterWsBtn.click();

  console.log("Waiting for dashboard...");
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Take dashboard screenshot
  await page.screenshot({ path: path.join(screenshotPackDir, 'dashboard.png'), fullPage: true });
  console.log("Dashboard screenshot taken.");

  // Go to research projects and select the active project
  console.log("Navigating to research projects...");
  await page.goto('/research-projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotPackDir, 'research_projects.png'), fullPage: true });

  // Click on the project card to make it active and set context
  const projectCard = page.locator('div.ui-card-surface').first();
  if (await projectCard.count() > 0) {
    console.log("Clicking on project card to activate it...");
    await projectCard.click();
    await page.waitForTimeout(3000);
  }

  const pagesToVisit = [
    { name: 'dashboard', url: '/dashboard' },
    { name: 'research_projects', url: '/research-projects' },
    { name: 'experiments', url: '/history' },
    { name: 'reports', url: '/results' },
    { name: 'targets', url: '/targets' },
    { name: 'molecules', url: '/molecules' },
    { name: 'docking', url: '/docking' },
    { name: 'gnina', url: '/docking?engine=gnina' },
    { name: 'quantum', url: '/quantum' },
    { name: 'simulations', url: '/simulation' },
    { name: 'admet', url: '/validation?panel=admet' }
  ];

  for (const p of pagesToVisit) {
    console.log(`Visiting ${p.name} (${p.url})...`);
    try {
      await page.goto(p.url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(4000); // Generous wait for charts, data loading, animations
      
      const scPath = path.join(screenshotPackDir, `${p.name}.png`);
      await page.screenshot({ path: scPath, fullPage: true });
      console.log(`Successfully screenshotted ${p.name}.`);
    } catch (err) {
      console.error(`Failed to audit page ${p.name}:`, err);
    }
  }

  // Dump logs
  const auditReport = {
    consoleErrors: errors,
    networkFailures: networkFailures
  };
  fs.writeFileSync(path.join(screenshotPackDir, 'audit_logs.json'), JSON.stringify(auditReport, null, 2));
  console.log("Audit logs saved successfully.");
});
