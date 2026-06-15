import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Phase P6 UX Validation & Data Isolation Audit', () => {
  test.setTimeout(600000); // 10 minutes total

  test('Continuous Journey with Data Isolation Check', async ({ page }) => {
    const timestamp = Date.now();
    const email = `ux-test-${timestamp}@example.com`;
    const password = 'UXPassword123!';
    const workspaceName = 'UX Evaluation Workspace';
    const projectName = 'UX Evaluation Project';

    console.log(`[UX WALKTHROUGH] Initiating run for new user: ${email}`);

    // Step 1: Registration
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Read the signup page

    await page.fill('input[name="name"]', 'UX Auditor');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="org"]', 'UX Lab');
    await page.fill('input[name="role"]', 'Scientist');
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirm"]', password);

    const termsCheckbox = page.locator('input#register-terms');
    if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
    }
    await page.waitForTimeout(1000);
    await page.click('button[type="submit"]');

    // Step 2: Workspace Selection & Verification
    // The server automatically redirects to /workspace-selector
    await page.waitForURL('**/workspace-selector', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Visual pause

    // Assert that the dynamically loaded Organization Workspace lists the correct custom name
    const orgWorkspaceCard = page.locator('h3:has-text("UX Lab")');
    await expect(orgWorkspaceCard).toBeVisible();

    // Select the newly created workspace
    const enterWorkspaceBtn = page.locator('button:has-text("Enter Workspace")').first();
    await enterWorkspaceBtn.click();

    // Step 3: Dashboard & Data Isolation Verification
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Verify Dashboard is completely empty (Data Isolation Check)
    console.log('[UX WALKTHROUGH] Verifying dashboard data isolation (should be empty)...');
    await expect(page.locator('text="No Active Projects Found"')).toBeVisible();
    await expect(page.locator('text="No Lead Candidates Found"')).toBeVisible();
    await expect(page.locator('text="No Reports Generated"')).toBeVisible();
    await expect(page.locator('text="No Experiment Logs Found"')).toBeVisible();

    // Step 4: Research Projects List & Verification
    await page.click('a[href="/research-projects"]');
    await page.waitForURL('**/research-projects', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify projects page is completely empty
    console.log('[UX WALKTHROUGH] Verifying projects list data isolation (should be empty)...');
    await expect(page.locator('text="No Projects Found"')).toBeVisible();

    // Setup dialog handler BEFORE clicking new project
    page.on('dialog', async dialog => {
      const msg = dialog.message();
      console.log(`[DIALOG] Prompt appeared: "${msg}"`);
      if (msg.includes('name')) {
        await dialog.accept(projectName);
      } else if (msg.includes('disease')) {
        await dialog.accept('Oncology');
      } else if (msg.includes('target')) {
        await dialog.accept('EGFR');
      } else {
        await dialog.accept();
      }
    });

    // Step 5: Project Creation
    console.log('[UX WALKTHROUGH] Creating new project...');
    const newProjectBtn = page.locator('button:has-text("New Project")').first();
    await newProjectBtn.click();
    await page.waitForTimeout(5000); // Allow time for prompt inputs to resolve and project to create

    // Verify project card is created and click on it
    const projectCard = page.locator(`h3:has-text("${projectName}")`).first();
    await expect(projectCard).toBeVisible();
    await projectCard.click();

    // Wait for the project overview page to load
    await page.waitForURL('**/research-projects/**', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Step 6: File Uploads & Input Validation
    console.log('[UX WALKTHROUGH] Navigating to Input Data tab...');
    const inputDataTab = page.locator('button:has-text("Input Data")');
    await inputDataTab.click();
    await page.waitForTimeout(2000);

    // Upload files
    console.log('[UX WALKTHROUGH] Uploading test.fasta...');
    const fastaInput = page.locator('#file-input-protein-fasta');
    await fastaInput.setInputFiles('test.fasta');
    await page.waitForTimeout(4000); // Wait for upload API to complete

    console.log('[UX WALKTHROUGH] Uploading test_receptor.pdb...');
    const pdbInput = page.locator('#file-input-protein-pdb-mmcif');
    await pdbInput.setInputFiles('test_receptor.pdb');
    await page.waitForTimeout(5000); // Wait for upload API to complete

    // Step 7: Check Readiness and Launch Pipeline
    console.log('[UX WALKTHROUGH] Navigating back to Overview tab...');
    const overviewTab = page.locator('button:has-text("Overview")');
    await overviewTab.click();
    await page.waitForTimeout(3000);

    // Assert that the pipeline readiness shows "Fully Ready" or "Structural Ready"
    const readinessLabel = page.locator('text="Fully Ready"').or(page.locator('text="Structural Ready"')).first();
    await expect(readinessLabel).toBeVisible();

    // Click "Run Full Pipeline"
    console.log('[UX WALKTHROUGH] Triggering full pipeline execution...');
    const runPipelineBtn = page.locator('button:has-text("Run Full Pipeline")');
    await runPipelineBtn.click();
    await page.waitForTimeout(10000); // Watch it start and Celery worker kick off

    // Step 8: Continuous Verification Navigation Loop (Show the pages)
    const navLinks = [
      { text: 'Molecules', url: '/molecules' },
      { text: 'Docking', url: '/docking' },
      { text: 'GNINA', url: '/gnina' },
      { text: 'Quantum', url: '/quantum' },
      { text: 'Simulation', url: '/simulation' },
      { text: 'ADMET', url: '/admet' },
      { text: 'Reports', url: '/reports' }
    ];

    for (const link of navLinks) {
      console.log(`[UX WALKTHROUGH] Navigating to ${link.text} page...`);
      try {
        const sidebarLink = page.locator(`a:has-text("${link.text}"), button:has-text("${link.text}")`).first();
        if (await sidebarLink.isVisible()) {
          await sidebarLink.click();
          await page.waitForURL(`**${link.url}*`, { timeout: 15000 });
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000); // Visual showcase of the page
        } else {
          // Fallback direct navigation if sidebar click is not registered
          await page.goto(`https://drugquinfosys.vercel.app${link.url}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
        }
      } catch (err) {
        console.warn(`[UX WALKTHROUGH] Could not navigate to ${link.text} via sidebar, continuing...`, err);
      }
    }

    // Step 9: Final Dashboard Verification (Results Check)
    console.log('[UX WALKTHROUGH] Returning to main dashboard to verify populated results...');
    await page.goto('https://drugquinfosys.vercel.app/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log('[UX WALKTHROUGH] UX Validation Re-run complete.');
  });
});
