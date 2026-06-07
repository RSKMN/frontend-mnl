import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

test.describe('Focused Workflow Audit', () => {
  test.setTimeout(600000); // 10 mins max

  test('Research Projects and Experiments Workflow', async ({ page }) => {
    const artifactDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/artifacts';
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    const errors: string[] = [];
    const networkFailures: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[Console Error] ${msg.text()}`);
      }
    });

    page.on('response', response => {
      if (response.status() >= 400 && response.request().resourceType() === 'fetch') {
        networkFailures.push(`[Network Failure] ${response.status()} ${response.url()}`);
      }
    });

    const uuid = uuidv4().substring(0, 8);
    const email = `audit_${uuid}@quinfosys.com`;
    const password = 'AuditPassword123!';

    try {
      // 1. Signup / Login
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="name"]', 'Audit User');
      await page.fill('input[name="org"]', 'Audit Corp');
      await page.fill('input[name="role"]', 'Auditor');
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="confirm"]', password);
      
      const termsCheckbox = page.locator('input#register-terms');
      if (await termsCheckbox.isVisible()) {
          await termsCheckbox.check();
      }
      
      await page.click('button[type="submit"]');

      // 2. Workspace Selector
      try {
          await page.waitForURL('**/workspace-selector**', { timeout: 15000 });
          // If there's a default workspace card, click it, else wait for dashboard.
          const defaultWorkspace = page.locator('div.ui-card-surface').first();
          if (await defaultWorkspace.isVisible()) {
              await defaultWorkspace.click();
          }
      } catch (e) {
          console.log("No workspace-selector, assuming direct redirect to dashboard.");
      }

      // 3. Navigate to Research Projects
      await page.waitForLoadState('networkidle');
      // Click nav link if possible, or goto
      await page.goto('/research-projects');
      await page.waitForLoadState('networkidle');

      // 4. Create Project
      page.on('dialog', async dialog => {
        console.log('Dialog message:', dialog.message());
        await dialog.accept(`Audit_Project_${uuid}`);
      });

      const newProjectBtn = page.locator('button:has-text("New Project"), button:has-text("Start New Program")').first();
      await newProjectBtn.click();

      // 5. Wait for Project detail load
      await page.waitForURL('**/projects/**', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ path: path.join(artifactDir, 'project_created.png'), fullPage: true });

      // 6. Launch Experiment
      const runPipelineBtn = page.locator('button:has-text("Run Full Pipeline"), button:has-text("Launch Pipeline"), button:has-text("Start")').first();
      if (await runPipelineBtn.isVisible()) {
          await runPipelineBtn.click();
      }

      // 7. Verify Tracking
      await page.waitForTimeout(5000); // let it trigger
      await page.screenshot({ path: path.join(artifactDir, 'experiment_triggered.png'), fullPage: true });
      
      // 8. Refresh and Verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: path.join(artifactDir, 'experiment_persistence.png'), fullPage: true });

    } catch (e: any) {
        errors.push(`[Test Execution Error] ${e.message}`);
    } finally {
        fs.writeFileSync(path.join(artifactDir, 'audit_errors.txt'), JSON.stringify({ errors, networkFailures }, null, 2));
    }
  });
});
