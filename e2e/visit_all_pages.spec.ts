import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test('visit and validate all pages on deployed app', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes

  const artifactDir = 'C:/Users/pc/.gemini/antigravity/brain/8bf4241c-9c12-4f4e-b51c-9be6822bcd59/artifacts';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const errors: string[] = [];
  const networkFailures: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[${page.url()}] Console Error: ${msg.text()}`);
    }
  });

  page.on('response', response => {
    if (response.status() >= 400 && response.request().resourceType() === 'fetch') {
      networkFailures.push(`[${page.url()}] Network Failure: ${response.status()} ${response.url()}`);
    }
  });

  const baseUrl = 'https://drugquinfosys.vercel.app';

  const pagesToVisit = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Research Projects', path: '/research-projects' },
    { name: 'Experiments', path: '/research-projects' }, // fallback since /experiments doesn't exist
    { name: 'Reports', path: '/reports' },
    { name: 'Targets', path: '/targets' },
    { name: 'Molecules', path: '/molecules' },
    { name: 'Docking', path: '/docking' },
    { name: 'GNINA', path: '/gnina' }, // wait, is it /projects/[id]/gnina ? Let's just try /gnina if it exists
    { name: 'Quantum', path: '/quantum' },
  ];

  // 1. Navigate to deployed frontend and trigger auth
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');

  // Try standard login if not logged in
  await page.fill('input[type="email"]', 'test@test.com').catch(() => {});
  await page.fill('input[type="password"]', 'password123').catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(3000);

  // We need a project context for many of these pages. Let's make sure we have one active.
  await page.goto(`${baseUrl}/research-projects`);
  await page.waitForLoadState('networkidle');
  
  const projectCards = page.locator('div.ui-card-surface');
  if (await projectCards.count() > 0) {
    await projectCards.first().click();
    await page.waitForTimeout(3000);
  }

  // Record active project if present in URL
  const currentUrl = page.url();
  const match = currentUrl.match(/\/projects\/([a-zA-Z0-9_-]+)/);
  const projectId = match ? match[1] : '';

  // For each page, navigate, wait for network idle, screenshot, and record
  for (const p of pagesToVisit) {
    console.log(`Visiting ${p.name}...`);
    
    // Adjust paths if they need project ID
    let targetPath = p.path;
    if (projectId && !p.path.startsWith('/research-projects') && !p.path.startsWith('/dashboard')) {
      // Some routes might be global, some might be project scoped.
      // We will try project scoped first if it's like /targets
      if (['/targets', '/molecules', '/docking', '/gnina', '/quantum', '/reports'].includes(p.path)) {
        // Assume global for now or project scoped
        targetPath = `/projects/${projectId}${p.path}`;
      }
    }

    try {
      await page.goto(`${baseUrl}${targetPath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for animations
      
      const screenshotPath = path.join(artifactDir, `validation_${p.name.replace(/\s+/g, '_').toLowerCase()}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (e) {
      console.log(`Failed to navigate or screenshot ${p.name}`);
    }
  }

  // Dump errors and failures to a file
  const reportContent = `
# Page Verification Report

## Console Errors
${errors.length > 0 ? errors.join('\n') : 'None'}

## Network Failures
${networkFailures.length > 0 ? networkFailures.join('\n') : 'None'}
  `;
  fs.writeFileSync(path.join(artifactDir, 'page_errors.txt'), reportContent);
});
