import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

test.describe('Production Pipeline Workflow', () => {
  test.setTimeout(600000); // 10 mins max

  test('Real Scientific Execution', async ({ page }) => {
    const artifactDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/artifacts';
    
    // Start video recording manually by using context if needed, but Playwright config does it automatically.
    
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
    const email = `prod_${uuid}@quinfosys.com`;
    const password = 'ProdPassword123!';

    try {
      // 1. Signup / Login
      await page.goto('/signup');
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="name"]', 'Prod User');
      await page.fill('input[name="org"]', 'Prod Corp');
      await page.fill('input[name="role"]', 'Scientist');
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
          const defaultWorkspace = page.locator('div.ui-card-surface').first();
          if (await defaultWorkspace.isVisible()) {
              await defaultWorkspace.click();
          }
      } catch (e) {
          console.log("No workspace selector, proceeding to dashboard");
      }

      await page.waitForURL('**/dashboard', { timeout: 30000 });

      // 3. Create Project
      await page.click('a[href="/research-projects"]');
      await page.waitForURL('**/research-projects', { timeout: 15000 });
      await page.click('button:has-text("New Project")');
      
      // Handle project creation dialogs
      page.on('dialog', async dialog => {
        if (dialog.message().includes('Enter a name for the new research project')) {
            await dialog.accept(`Prod_Project_${uuid}`);
        } else if (dialog.message().includes('Enter disease indication')) {
            await dialog.accept('Cancer');
        } else if (dialog.message().includes('Enter target protein/gene')) {
            await dialog.accept('EGFR');
        } else {
            await dialog.accept();
        }
      });
      
      await page.waitForTimeout(5000);
      
      // Navigate to project
      await page.goto('/research-projects');
      await page.waitForTimeout(2000);
      const projectLink = page.locator(`text=Prod_Project_${uuid}`);
      await projectLink.click();
      
      await page.waitForTimeout(2000);
      
      // 4. Upload Files
      const fastaPath = path.join(artifactDir, 'test.fasta');
      const pdbPath = path.join(artifactDir, 'test.pdb');
      
      await page.setInputFiles('input#protein_fasta_file_id', fastaPath);
      await page.waitForTimeout(2000); // Wait for upload
      
      // Deal with alerts from upload
      page.on('dialog', dialog => dialog.accept());
      
      await page.setInputFiles('input#protein_structure_file_id', pdbPath);
      await page.waitForTimeout(2000); // Wait for upload
      
      // 5. Launch Pipeline
      await page.click('button:has-text("Launch Pipeline")');
      
      await page.waitForTimeout(10000); // Give it time to run or fail
      
      // Check for errors on the page or logs
      fs.writeFileSync(path.join(artifactDir, 'production_run_errors.log'), errors.join('\n') + '\n' + networkFailures.join('\n'));
      
    } catch (e) {
      console.error(e);
      fs.writeFileSync(path.join(artifactDir, 'production_run_errors.log'), `Test Exception: ${e.message}`);
    }
  });
});
