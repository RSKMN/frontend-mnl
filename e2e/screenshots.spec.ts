import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('take screenshots of experiments and targets', async ({ page }) => {
  // Use a long timeout to allow the frontend to compile
  test.setTimeout(120000);
  
  const artifactDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/artifacts';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // Set local storage for auth token bypassing login for demo
  await page.goto('http://localhost:3001');
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'demo-token');
    localStorage.setItem('active_project_id', 'demo-project');
  });

  // Target Page Screenshot
  await page.goto('http://localhost:3001/targets');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'targets_page.png'), fullPage: true });

  // Click Launch 3D Explorer
  const launchBtn = page.getByText(/Launch 3D Explorer/i);
  if (await launchBtn.count() > 0) {
    await launchBtn.click();
    await page.waitForTimeout(2000); // let 3d viewer load
    await page.screenshot({ path: path.join(artifactDir, 'targets_3d_explorer.png') });
  }

  // Experiments List
  await page.goto('http://localhost:3001/experiments');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'experiments_list.png'), fullPage: true });

  // Let's check if there is an experiment ID to navigate to
  const expLink = page.locator('a[href*="/experiments/"]').first();
  if (await expLink.count() > 0) {
    await expLink.click();
  } else {
    // Navigate manually to a mock id
    await page.goto('http://localhost:3001/experiments/demo-exp-123');
  }
  
  await page.waitForLoadState('networkidle');
  // Scroll down a bit to see logs
  await page.mouse.wheel(0, 500);
  await page.screenshot({ path: path.join(artifactDir, 'experiment_execution_view.png'), fullPage: true });
});
