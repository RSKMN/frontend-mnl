const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to login
  await page.goto('http://localhost:3001/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // Set localStorage to fake active workspace/project since we bypassed the selector
  await page.evaluate(() => {
    localStorage.setItem('active_workspace_id', '6a1e4a37535fc57500f907ea');
    localStorage.setItem('active_project_id', '6a1e4a72535fc57500f907ec');
  });

  // Navigate to scientific workflows
  const pages = ['docking', 'projects/6a1e4a72535fc57500f907ec/gnina', 'projects/6a1e4a72535fc57500f907ec/qm', 'simulation'];
  
  for (const p of pages) {
    const url = `http://localhost:3001/${p}`;
    await page.goto(url);
    await page.waitForTimeout(2000);
    const safeName = p.replace(/[\/\\]/g, '_');
    await page.screenshot({ path: `screenshot_${safeName}.png`, fullPage: true });
  }
  await browser.close();
})();
