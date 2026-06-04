const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: path.join(__dirname, '../../artifacts/videos'),
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  const timestamp = Date.now();
  const email = `test_${timestamp}@example.com`;

  try {
    console.log("Navigating to signup...");
    await page.goto('http://localhost:3001/signup');

    console.log("Filling signup form...");
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="org"]', 'Test Org');
    await page.fill('input[name="role"]', 'Tester');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirm"]', 'Password123!');
    await page.check('#register-terms');

    console.log("Submitting signup...");
    await Promise.all([
      page.waitForNavigation({ url: '**/workspace-selector**', timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);

    console.log("Waiting for workspace to load...");
    await page.waitForSelector('text=Select a research workspace');
    
    // Sometimes it takes a moment to fetch workspaces
    await page.waitForTimeout(2000);

    console.log("Clicking the workspace...");
    await page.click('text="Test Org"');

    console.log("Waiting for dashboard...");
    await page.waitForNavigation({ url: '**/dashboard**', timeout: 15000 });

    console.log("Navigating to research projects...");
    await page.goto('http://localhost:3001/research-projects');

    console.log("Clicking Create Project...");
    // Handle prompts
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      if (dialog.message().includes('name')) {
        await dialog.accept(`Project_${timestamp}`);
      } else if (dialog.message().includes('disease')) {
        await dialog.accept('Oncology');
      } else if (dialog.message().includes('target')) {
        await dialog.accept('EGFR');
      } else {
        await dialog.dismiss();
      }
    });

    await page.click('button:has-text("Create Project")');
    
    console.log("Waiting to see if project was created...");
    await page.waitForTimeout(5000);
    
    console.log("Test completed.");
  } catch (err) {
    console.error("Error during test:", err);
    await page.screenshot({ path: path.join(__dirname, '../../artifacts/videos/workspace-error.png') });
    const html = await page.content();
    console.log("Page HTML snippet:", html.substring(0, 1000));
  } finally {
    await context.close();
    await browser.close();
  }
})();
