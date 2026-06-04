const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  const timestamp = Date.now();
  const email = `realuser_${timestamp}@quinfosys.com`;
  const password = `TestPass123!`;

  console.log("=== Testing Signup ===");
  await page.goto('http://localhost:3001/signup');
  await page.fill('input[name="name"]', 'Real User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="org"]', `Test Org ${timestamp}`);
  await page.fill('input[name="role"]', 'Test Role');
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm"]', password);
  await page.click('input[id="register-terms"]');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/workspace-selector', { timeout: 10000 });
  await page.screenshot({ path: '../artifacts/videos/recovery_01_signup.png' });
  console.log("✅ Signup passed");

  console.log("=== Testing Workspace Creation ===");
  page.once('dialog', dialog => dialog.accept(`Workspace ${timestamp}`));
  await page.click('button:has-text("Create Workspace")');



  // Wait for it to appear in the list
  await page.waitForSelector(`text=Workspace ${timestamp}`, { timeout: 10000 });
  await page.screenshot({ path: '../artifacts/videos/recovery_02_workspace.png' });
  console.log("✅ Workspace Creation passed");

  console.log("=== Testing Workspace Selection ===");
  await page.click('button:has-text("Enter Workspace")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.screenshot({ path: '../artifacts/videos/recovery_03_selection.png' });
  console.log("✅ Workspace Selection passed");

  console.log("=== Testing Project Creation ===");
  await page.click('text=Research Projects');
  await page.waitForURL('**/research-projects', { timeout: 10000 });
  
  let dialogCount = 0;
  const dialogHandler = async dialog => {
    dialogCount++;
    if (dialogCount === 1) {
      await dialog.accept(`Project ${timestamp}`);
    } else if (dialogCount === 2) {
      await dialog.accept('Oncology');
    } else if (dialogCount === 3) {
      await dialog.accept('Genomics Target');
    } else {
      await dialog.accept();
      page.off('dialog', dialogHandler);
    }
  };
  page.on('dialog', dialogHandler);
  
  await page.click('button:has-text("New Project")');
  
  await page.waitForSelector(`text=Project ${timestamp}`, { timeout: 10000 });
  await page.screenshot({ path: '../artifacts/videos/recovery_04_project.png' });
  console.log("✅ Project Creation passed");

  console.log("=== Testing Logout & Login ===");
  // We don't have a logout button easily visible in all views, so let's just clear storage and goto login
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  
  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/workspace-selector', { timeout: 10000 });
  console.log("✅ Login passed");

  await browser.close();
})();
