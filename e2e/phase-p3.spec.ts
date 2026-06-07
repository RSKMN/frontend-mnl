import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.use({
  baseURL: 'https://drugquinfosys.vercel.app',
  video: 'on',
  screenshot: 'on',
  actionTimeout: 15000,
  navigationTimeout: 30000,
});

test.describe('Phase P3: End-to-End Real User Verification', () => {
  // Use a unique email per run to ensure we create a brand new account
  const timestamp = Date.now();
  const testEmail = `test_user_${timestamp}@gmail.com`;
  const testPassword = 'SecurePassword123!';
  const workspaceName = `P3_Workspace_${timestamp}`;
  const projectName = `P3_Project_${timestamp}`;

  test('Complete scientific workflow', async ({ page }) => {
    console.log(`Starting run with email: ${testEmail}`);
    
    page.on('response', async response => {
      if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
        console.log(`[NETWORK] ${response.status()} ${response.url()}`);
        if (response.status() >= 400) {
            console.log(`[NETWORK ERROR BODY]`, await response.text().catch(() => 'could not read text'));
        }
      }
    });

    // 1. Registration
    console.log("Navigating to signup...");
    await page.goto('/signup');
    await page.fill('input[name="name"]', `User_${timestamp}`);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="org"]', `Org_${timestamp}`);
    await page.fill('input[name="role"]', `Role_${timestamp}`);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirm"]', testPassword);
    await page.check('#register-terms');
    await page.click('button:has-text("Create Workspace")');
    
    // Should auto-login or ask to login
    try {
        await page.waitForURL('**/workspace-selector', { timeout: 15000 });
    } catch (e) {
        console.error("Failed to navigate to workspace-selector. Checking for on-screen errors...");
        const errorText = await page.locator('div[class*="text-red"], div[class*="error"], p[class*="error"]').allTextContents();
        console.error("Found error messages on screen:", errorText);
        throw e;
    }
    console.log("Registration successful.");

    // 2. Workspace Creation
    page.once('dialog', dialog => {
        console.log(`Accepting prompt dialog with workspace name: ${workspaceName}`);
        dialog.accept(workspaceName);
    });
    await page.click('button:has-text("Create Workspace")');
    
    // Click the newly created workspace
    await page.locator('div.rounded-xl').filter({ hasText: workspaceName }).locator('button:has-text("Enter Workspace")').click();
    
    // Navigates to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log("Workspace created.");

    // 3. Project Creation
    await page.goto('/research-projects');
    
    // Setup dialog handler for 3 prompts and 1 alert
    let promptCount = 0;
    page.on('dialog', async dialog => {
        if (dialog.type() === 'prompt') {
            if (promptCount === 0) {
                console.log(`Accepting project name prompt with: ${projectName}`);
                await dialog.accept(projectName);
            } else if (promptCount === 1) {
                await dialog.accept("Lung Cancer");
            } else if (promptCount === 2) {
                await dialog.accept("EGFR L858R");
            }
            promptCount++;
        } else if (dialog.type() === 'alert') {
            console.log(`Accepting alert: ${dialog.message()}`);
            await dialog.accept();
        }
    });

    await page.click('button:has-text("New Project")');
    
    // Click on the project card link to go to overview
    await page.click(`text=${projectName}`);
    
    await page.waitForURL('**/research-projects/**', { timeout: 15000 });
    console.log("Project created.");
    
    // Validate project overview page loaded
    await expect(page.locator(`text=${projectName}`).first()).toBeVisible();

    // Navigate to Inputs & Pipeline tab
    await page.locator('button', { hasText: /Input Data/i }).first().click();
    await page.waitForTimeout(500); // Allow tab transition

    // 4. Input Upload (Scenario A & B)
    console.log("Uploading FASTA...");
    const fastaPath = path.resolve(__dirname, 'fixtures', 'protein.fasta');
    if (!fs.existsSync(fastaPath)) {
        console.warn("FASTA fixture not found, proceeding may fail.");
    }

    const fileInputs = page.locator('input[type="file"]');
    if (await fileInputs.count() > 0) {
        await fileInputs.nth(0).setInputFiles(fastaPath);
        await page.waitForTimeout(10000); // Generous wait for FASTA upload and assign
    }
    
    // Wait for the "Generation" badge
    await expect(page.locator('text=Generation Only').or(page.locator('span:has-text("Generation")'))).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: `screenshots/scenario_a_${timestamp}.png`, fullPage: true });

    // Ensure Full Pipeline is still disabled
    const runButton = page.locator('button', { hasText: 'RUN FULL PIPELINE' }).or(page.locator('button:has-text("Run Full Pipeline")')).first();
    await expect(runButton).toBeDisabled();

    // 5. Input Upload (Scenario B: PDB)
    console.log("Uploading PDB...");
    const pdbPath = path.resolve(__dirname, 'fixtures', 'protein.pdb'); // Actual fixture name
    if (await fileInputs.count() > 1) {
        await fileInputs.nth(1).setInputFiles(pdbPath);
    }

    // Wait generously for the file to upload and the server to process it
    await page.waitForTimeout(5000); // Give time for the alert and fetchReadinessData() to complete
    
    // Wait for Fully Ready
    await expect(page.locator('text=Fully Ready')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: `screenshots/scenario_b_${timestamp}.png`, fullPage: true });
    await expect(runButton).toBeEnabled();

    // 6. Pipeline Launch
    console.log("Launching Pipeline...");
    await runButton.click();

    // Wait for polling to activate (e.g. "Orchestrating..." button state)
    await expect(page.locator('button:has-text("Orchestrating...")')).toBeVisible();

    // Monitor Execution - wait up to 5 minutes for pipeline to finish
    console.log("Waiting for pipeline to complete (timeout: 5 minutes)...");
    await expect(page.locator('button:has-text("Run Full Pipeline")')).toBeVisible({ timeout: 300000 });
    console.log("Pipeline completed.");
    await page.screenshot({ path: `screenshots/pipeline_complete_${timestamp}.png`, fullPage: true });

    // 7. Results Validation
    console.log("Validating Results Pages...");
    
    await page.click('a:has-text("Molecules")');
    await expect(page.getByRole('heading', { name: 'Molecular Library' })).toBeVisible();
    await page.screenshot({ path: `screenshots/results_molecules_${timestamp}.png`, fullPage: true });
    
    await page.click('a:has-text("Experiments")');
    await expect(page.getByRole('heading', { name: 'Experiment List' })).toBeVisible();
    await page.screenshot({ path: `screenshots/results_experiments_${timestamp}.png`, fullPage: true });
    
    await page.click('a:has-text("Reports")');
    await expect(page.getByRole('heading', { name: 'Reports / Candidate Dossiers' })).toBeVisible();
    await page.screenshot({ path: `screenshots/results_reports_${timestamp}.png`, fullPage: true });

    console.log("End-to-End verification complete.");
  });
});
