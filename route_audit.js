const { chromium } = require('playwright');
const fs = require('fs');

const routesToTest = [
  // Auth
  '/login',
  '/signup',
  '/forgot-password',
  '/workspace-selector',

  // Dashboard root
  '/dashboard',
  '/api',
  '/audit',
  '/billing',
  '/chemical-space',
  '/compute',
  '/copilot',
  '/docking',
  '/history',
  '/integrations',
  '/models',
  '/molecules',
  '/quantum',
  '/research-projects',
  '/results',
  '/settings',
  '/similarity',
  '/simulation',
  '/storage',
  '/targets',
  '/team',
  '/validation',
  '/visualization',
  
  // Projects dynamic routes (we'll just use a dummy ID 'test-project-123')
  '/research-projects/test-project-123',
  '/research-projects/test-project-123/claim-matrix',
  '/research-projects/test-project-123/gnina',
  
  // Projects alternate dynamic routes
  '/projects/test-project-123',
  '/projects/test-project-123/candidates',
  '/projects/test-project-123/docking',
  '/projects/test-project-123/gnina',
  '/projects/test-project-123/overview',
  '/projects/test-project-123/qm',
  '/projects/test-project-123/reports',
  '/projects/test-project-123/targets',
  '/projects/test-project-123/visualization',
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login first to get session token
  await page.goto('http://localhost:3001/login');
  await page.fill('input[name="email"]', 'testuser@quinfosys.com');
  await page.fill('input[name="password"]', 'TestUser123!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Set workspace ID to avoid redirects to workspace selector
  await page.evaluate(() => {
    localStorage.setItem('active_workspace_id', 'test-workspace-id');
  });

  let reportContent = '# Route Audit Report\n\n| Route | Status | Notes |\n|---|---|---|\n';

  for (const route of routesToTest) {
    const url = `http://localhost:3001${route}`;
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
      const status = response ? response.status() : 'Unknown';
      
      if (status >= 400) {
        console.log(`❌ FAIL: ${route} (Status: ${status})`);
        reportContent += `| \`${route}\` | ❌ FAIL | HTTP ${status} |\n`;
      } else {
        console.log(`✅ PASS: ${route} (Status: ${status})`);
        reportContent += `| \`${route}\` | ✅ PASS | HTTP ${status} |\n`;
      }
    } catch (e) {
      console.log(`❌ FAIL (Timeout/Crash): ${route}`);
      reportContent += `| \`${route}\` | ❌ FAIL | Error: ${e.message.split('\\n')[0]} |\n`;
    }
  }

  fs.writeFileSync('../ROUTE_AUDIT.md', reportContent);
  await browser.close();
})();
