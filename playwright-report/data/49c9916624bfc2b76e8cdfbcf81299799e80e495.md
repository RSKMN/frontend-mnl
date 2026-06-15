# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux_walkthrough.spec.ts >> Phase P6 UX Validation & Data Isolation Audit >> Continuous Journey with Data Isolation Check
- Location: e2e\ux_walkthrough.spec.ts:8:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="No Active Projects Found"')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text="No Active Projects Found"')

```

```yaml
- img
- text: Connection Unreachable backend-mnl API Orchestration server is offline or unreachable. Scientific operations suspended.
- button "Rechecking..." [disabled]
- region "Notifications alt+T"
- alert
- complementary:
  - img "Quinfosys QuDrugForge"
  - paragraph: Quantum AI Drug Discovery
  - paragraph: Research Workspace
  - paragraph: member Division
  - navigation:
    - text: Main
    - link "Dashboard":
      - /url: /dashboard
    - link "Research Projects":
      - /url: /research-projects
    - link "Reports":
      - /url: /results
    - text: Research
    - link "Targets":
      - /url: /targets
    - link "Molecules":
      - /url: /molecules
    - link "Docking":
      - /url: /docking
    - link "GNINA":
      - /url: /docking?engine=gnina
    - link "Quantum":
      - /url: /quantum
    - link "Simulations":
      - /url: /simulation
    - link "ADMET":
      - /url: /validation?panel=admet
    - text: Visualization
    - link "3D Viewer":
      - /url: /visualization
    - link "Chemical Space":
      - /url: /chemical-space
    - link "Similarity":
      - /url: /similarity
    - text: AI
    - link "Models":
      - /url: /models
    - link "Pharma LLM":
      - /url: /copilot
    - text: Infrastructure
    - link "Compute":
      - /url: /settings?section=compute
    - link "Storage":
      - /url: /settings?section=storage
    - link "API":
      - /url: /settings?section=api
    - link "Integrations":
      - /url: /settings?section=integrations
    - text: Organization
    - link "Team":
      - /url: /settings?section=team
    - link "Billing":
      - /url: /settings?section=billing
    - link "Audit Logs":
      - /url: /settings?section=audit
    - link "Settings":
      - /url: /settings
  - button "Collapse sidebar": Collapse
- banner:
  - text: Research OS Oncology Division
  - heading "Dashboard" [level=1]
  - searchbox
  - text: EGFR NSCLC active
  - button "Notifications"
  - text: System Online
  - button "Switch to dark mode"
  - group: RU Research User
- img
- text: Connection Unreachable backend-mnl API Orchestration server is offline or unreachable. Scientific operations suspended.
- button "Attempt Reconnect"
- main:
  - article
  - article
  - article
  - article
  - article
  - article
  - article
  - article
- button:
  - img
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | test.describe('Phase P6 UX Validation & Data Isolation Audit', () => {
  6   |   test.setTimeout(600000); // 10 minutes total
  7   | 
  8   |   test('Continuous Journey with Data Isolation Check', async ({ page }) => {
  9   |     const timestamp = Date.now();
  10  |     const email = `ux-test-${timestamp}@example.com`;
  11  |     const password = 'UXPassword123!';
  12  |     const workspaceName = 'UX Evaluation Workspace';
  13  |     const projectName = 'UX Evaluation Project';
  14  | 
  15  |     console.log(`[UX WALKTHROUGH] Initiating run for new user: ${email}`);
  16  | 
  17  |     // Step 1: Registration
  18  |     await page.goto('/signup');
  19  |     await page.waitForLoadState('networkidle');
  20  |     await page.waitForTimeout(2000); // Read the signup page
  21  | 
  22  |     await page.fill('input[name="name"]', 'UX Auditor');
  23  |     await page.fill('input[name="email"]', email);
  24  |     await page.fill('input[name="org"]', 'UX Lab');
  25  |     await page.fill('input[name="role"]', 'Scientist');
  26  |     await page.fill('input[name="password"]', password);
  27  |     await page.fill('input[name="confirm"]', password);
  28  | 
  29  |     const termsCheckbox = page.locator('input#register-terms');
  30  |     if (await termsCheckbox.isVisible()) {
  31  |         await termsCheckbox.check();
  32  |     }
  33  |     await page.waitForTimeout(1000);
  34  |     await page.click('button[type="submit"]');
  35  | 
  36  |     // Step 2: Workspace Selection & Verification
  37  |     // The server automatically redirects to /workspace-selector
  38  |     await page.waitForURL('**/workspace-selector', { timeout: 30000 });
  39  |     await page.waitForLoadState('networkidle');
  40  |     await page.waitForTimeout(3000); // Visual pause
  41  | 
  42  |     // Assert that the dynamically loaded Organization Workspace lists the correct custom name
  43  |     const orgWorkspaceCard = page.locator('h3:has-text("UX Lab")');
  44  |     await expect(orgWorkspaceCard).toBeVisible();
  45  | 
  46  |     // Select the newly created workspace
  47  |     const enterWorkspaceBtn = page.locator('button:has-text("Enter Workspace")').first();
  48  |     await enterWorkspaceBtn.click();
  49  | 
  50  |     // Step 3: Dashboard & Data Isolation Verification
  51  |     await page.waitForURL('**/dashboard', { timeout: 30000 });
  52  |     await page.waitForLoadState('networkidle');
  53  |     await page.waitForTimeout(3000);
  54  | 
  55  |     // Verify Dashboard is completely empty (Data Isolation Check)
  56  |     console.log('[UX WALKTHROUGH] Verifying dashboard data isolation (should be empty)...');
> 57  |     await expect(page.locator('text="No Active Projects Found"')).toBeVisible();
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  58  |     await expect(page.locator('text="No Lead Candidates Found"')).toBeVisible();
  59  |     await expect(page.locator('text="No Reports Generated"')).toBeVisible();
  60  |     await expect(page.locator('text="No Experiment Logs Found"')).toBeVisible();
  61  | 
  62  |     // Step 4: Research Projects List & Verification
  63  |     await page.click('a[href="/research-projects"]');
  64  |     await page.waitForURL('**/research-projects', { timeout: 15000 });
  65  |     await page.waitForLoadState('networkidle');
  66  |     await page.waitForTimeout(2000);
  67  | 
  68  |     // Verify projects page is completely empty
  69  |     console.log('[UX WALKTHROUGH] Verifying projects list data isolation (should be empty)...');
  70  |     await expect(page.locator('text="No Projects Found"')).toBeVisible();
  71  | 
  72  |     // Setup dialog handler BEFORE clicking new project
  73  |     page.on('dialog', async dialog => {
  74  |       const msg = dialog.message();
  75  |       console.log(`[DIALOG] Prompt appeared: "${msg}"`);
  76  |       if (msg.includes('name')) {
  77  |         await dialog.accept(projectName);
  78  |       } else if (msg.includes('disease')) {
  79  |         await dialog.accept('Oncology');
  80  |       } else if (msg.includes('target')) {
  81  |         await dialog.accept('EGFR');
  82  |       } else {
  83  |         await dialog.accept();
  84  |       }
  85  |     });
  86  | 
  87  |     // Step 5: Project Creation
  88  |     console.log('[UX WALKTHROUGH] Creating new project...');
  89  |     const newProjectBtn = page.locator('button:has-text("New Project")').first();
  90  |     await newProjectBtn.click();
  91  |     await page.waitForTimeout(5000); // Allow time for prompt inputs to resolve and project to create
  92  | 
  93  |     // Verify project card is created and click on it
  94  |     const projectCard = page.locator(`h3:has-text("${projectName}")`).first();
  95  |     await expect(projectCard).toBeVisible();
  96  |     await projectCard.click();
  97  | 
  98  |     // Wait for the project overview page to load
  99  |     await page.waitForURL('**/research-projects/**', { timeout: 30000 });
  100 |     await page.waitForLoadState('networkidle');
  101 |     await page.waitForTimeout(3000);
  102 | 
  103 |     // Step 6: File Uploads & Input Validation
  104 |     console.log('[UX WALKTHROUGH] Navigating to Input Data tab...');
  105 |     const inputDataTab = page.locator('button:has-text("Input Data")');
  106 |     await inputDataTab.click();
  107 |     await page.waitForTimeout(2000);
  108 | 
  109 |     // Upload files
  110 |     console.log('[UX WALKTHROUGH] Uploading test.fasta...');
  111 |     const fastaInput = page.locator('#file-input-protein-fasta');
  112 |     await fastaInput.setInputFiles('test.fasta');
  113 |     await page.waitForTimeout(4000); // Wait for upload API to complete
  114 | 
  115 |     console.log('[UX WALKTHROUGH] Uploading test_receptor.pdb...');
  116 |     const pdbInput = page.locator('#file-input-protein-pdb-mmcif');
  117 |     await pdbInput.setInputFiles('test_receptor.pdb');
  118 |     await page.waitForTimeout(5000); // Wait for upload API to complete
  119 | 
  120 |     // Step 7: Check Readiness and Launch Pipeline
  121 |     console.log('[UX WALKTHROUGH] Navigating back to Overview tab...');
  122 |     const overviewTab = page.locator('button:has-text("Overview")');
  123 |     await overviewTab.click();
  124 |     await page.waitForTimeout(3000);
  125 | 
  126 |     // Assert that the pipeline readiness shows "Fully Ready" or "Structural Ready"
  127 |     const readinessLabel = page.locator('text="Fully Ready"').or(page.locator('text="Structural Ready"')).first();
  128 |     await expect(readinessLabel).toBeVisible();
  129 | 
  130 |     // Click "Run Full Pipeline"
  131 |     console.log('[UX WALKTHROUGH] Triggering full pipeline execution...');
  132 |     const runPipelineBtn = page.locator('button:has-text("Run Full Pipeline")');
  133 |     await runPipelineBtn.click();
  134 |     await page.waitForTimeout(10000); // Watch it start and Celery worker kick off
  135 | 
  136 |     // Step 8: Continuous Verification Navigation Loop (Show the pages)
  137 |     const navLinks = [
  138 |       { text: 'Molecules', url: '/molecules' },
  139 |       { text: 'Docking', url: '/docking' },
  140 |       { text: 'GNINA', url: '/gnina' },
  141 |       { text: 'Quantum', url: '/quantum' },
  142 |       { text: 'Simulation', url: '/simulation' },
  143 |       { text: 'ADMET', url: '/admet' },
  144 |       { text: 'Reports', url: '/reports' }
  145 |     ];
  146 | 
  147 |     for (const link of navLinks) {
  148 |       console.log(`[UX WALKTHROUGH] Navigating to ${link.text} page...`);
  149 |       try {
  150 |         const sidebarLink = page.locator(`a:has-text("${link.text}"), button:has-text("${link.text}")`).first();
  151 |         if (await sidebarLink.isVisible()) {
  152 |           await sidebarLink.click();
  153 |           await page.waitForURL(`**${link.url}*`, { timeout: 15000 });
  154 |           await page.waitForLoadState('networkidle');
  155 |           await page.waitForTimeout(3000); // Visual showcase of the page
  156 |         } else {
  157 |           // Fallback direct navigation if sidebar click is not registered
```