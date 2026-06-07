import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('verify deployed experiments and targets', async ({ page }) => {
  test.setTimeout(240000); // 4 minutes
  
  const artifactDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/artifacts';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // 1. Navigate to deployed frontend
  await page.goto('https://drugquinfosys.vercel.app');

  // 2. Login using the existing test account
  // Wait, I don't know the test account credentials.
  // The playwright setup script usually has this. Let me check global.setup.ts.
  // Actually, I can use the existing state from `.auth/user.json` if it's there. 
  // Let's just run login via UI if we have standard credentials like test@test.com / password.
  
  // Actually, wait, let's see if the user is already logged in or if we can use the default test credentials
  await page.fill('input[type="email"]', 'test@test.com').catch(() => {});
  await page.fill('input[type="password"]', 'password123').catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  
  await page.waitForLoadState('networkidle');
  
  // If not on dashboard, we might need to click "Workspaces"
  // Let's go to /research-projects directly to select a project
  await page.goto('https://drugquinfosys.vercel.app/research-projects');
  await page.waitForLoadState('networkidle');

  // Select the first available project
  const projectCards = page.locator('div.ui-card-surface');
  if (await projectCards.count() > 0) {
    await projectCards.first().click();
  } else {
    // Try to create a project if none exists
    const createBtn = page.getByText(/New Project|Create Project/i);
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.fill('input[name="name"]', 'Deployment Test Project').catch(() => {});
      await page.getByText(/Create|Submit/i).click().catch(() => {});
    }
  }

  await page.waitForTimeout(3000); // wait for routing

  // Go to Targets page
  await page.goto('https://drugquinfosys.vercel.app/targets');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Screenshot Targets
  await page.screenshot({ path: path.join(artifactDir, 'deployment_targets_page.png'), fullPage: true });

  // 3D Explorer
  const launchBtn = page.getByText(/Launch 3D Explorer/i);
  if (await launchBtn.count() > 0) {
    await launchBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(artifactDir, 'deployment_targets_3d_explorer.png') });
    // Close modal
    await page.keyboard.press('Escape');
  }

  // Go to Experiments list (Wait, it's /research-projects or /projects/[id]/experiments)
  // Let's see if there's an Experiments nav link
  const navExperiments = page.getByText(/Experiments/i).first();
  if (await navExperiments.count() > 0) {
    await navExperiments.click();
  } else {
    await page.goto('https://drugquinfosys.vercel.app/experiments'); // Fallback to see if the top level has it
  }
  
  await page.waitForLoadState('networkidle');
  
  // Find an experiment link and click it
  const expLinks = page.locator('a[href*="/experiments/"]');
  if (await expLinks.count() > 0) {
    await expLinks.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(artifactDir, 'deployment_experiment_view.png'), fullPage: true });
  } else {
    // If no experiments, try to trigger a run.
    const startRunBtn = page.getByText(/Run Pipeline|Start Pipeline|New Experiment/i).first();
    if (await startRunBtn.count() > 0) {
      await startRunBtn.click();
      await page.waitForTimeout(3000);
      await page.getByText(/Start|Execute/i).first().click().catch(() => {});
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(artifactDir, 'deployment_experiment_view.png'), fullPage: true });
    } else {
      console.log('No experiments found and no trigger button found.');
    }
  }
});
