# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> should logout successfully
- Location: e2e\auth.spec.ts:12:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/login/
Received string:  "http://localhost:3001/workspace-selector"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × unexpected value "http://localhost:3001/workspace-selector"

```

```yaml
- region "Notifications alt+T"
- main:
  - img "Quinfosys QuDrugForge Logo"
  - heading "Quinfosys™ QuDrugForge™" [level=1]
  - paragraph: Quantum AI Drug Discovery Platform
  - paragraph: AI-Powered Computational Molecular Intelligence
  - paragraph: Unlock the power of in silico biochemistry. QuDrugForge integrates quantum molecular screening with generative intelligence to identify high-affinity lead candidates.
  - list:
    - listitem:
      - img
      - heading "Target discovery workflows" [level=4]
      - paragraph: Identify, prioritize, and validate disease-driving genomic targets with advanced bioinformatic maps.
    - listitem:
      - img
      - heading "Molecule generation and screening" [level=4]
      - paragraph: Generative reinforcement learning pipelines designed to filter and design millions of novel candidate structures.
    - listitem:
      - img
      - heading "Docking, GNINA, and quantum reranking" [level=4]
      - paragraph: Accelerate binding affinity calculations utilizing deep convolutional neural networks and molecular mechanics scoring.
    - listitem:
      - img
      - heading "Candidate dossiers and validation reports" [level=4]
      - paragraph: Automated preparation of FDA 21 CFR Part 11 compliant evidence packages and real-time ADMET profiling data.
  - img "Quinfosys QuDrugForge Logo"
  - text: QuDrugForge SECURE PROTOCOL INITIALIZED
  - heading "Select a research workspace" [level=1]
  - paragraph: Choose an organization workspace or continue into a recent discovery program.
  - heading "Organization Workspaces" [level=2]
  - heading "Recent Discovery Programs" [level=2]
  - table:
    - rowgroup:
      - row "Program Name Disease Area Workflow Stage Telemetry Last Updated":
        - columnheader "Program Name"
        - columnheader "Disease Area"
        - columnheader "Workflow Stage"
        - columnheader "Telemetry"
        - columnheader "Last Updated"
    - rowgroup:
      - row "EGFR NSCLC Discovery Program Oncology Lead Optimization Active 2 hours ago":
        - cell "EGFR NSCLC Discovery Program"
        - cell "Oncology"
        - cell "Lead Optimization"
        - cell "Active"
        - cell "2 hours ago"
      - row "PARP1 Oncology Program Oncology Hit Validation Idle 1 day ago":
        - cell "PARP1 Oncology Program"
        - cell "Oncology"
        - cell "Hit Validation"
        - cell "Idle"
        - cell "1 day ago"
      - row "PIK3CA Molecular Screening Oncology De Novo Generation Completed 3 days ago":
        - cell "PIK3CA Molecular Screening"
        - cell "Oncology"
        - cell "De Novo Generation"
        - cell "Completed"
        - cell "3 days ago"
      - row "KRAS G12D Exploratory Campaign Oncology Target Identification Active 1 week ago":
        - cell "KRAS G12D Exploratory Campaign"
        - cell "Oncology"
        - cell "Target Identification"
        - cell "Active"
        - cell "1 week ago"
  - heading "Workspace Controls" [level=2]
  - button "Create Workspace" [disabled]:
    - img
    - text: Create Workspace
  - button "Join Workspace":
    - img
    - text: Join Workspace
  - button "Import Project":
    - img
    - text: Import Project
  - button "Continue to Dashboard" [disabled]:
    - text: Continue to Dashboard
    - img
  - heading "Research Environment" [level=2]
  - text: "ACTIVE COMPUTE CREDITS QPU Quantum Simulator14,200 hrs remaining HPC GPU Core Array84,000 hrs remaining INTEGRATIONS STATUS GNINA Neural Scorer v1.2 AutoDock Vina Engine v4.0 Schrödinger Maestro API RECENT REPORTS GENERATED 📄 EGFR-L858R_Hit_Assessment.pdf1d ago 📄 JAK3_Toxicity_Assay_Dossier.pdf3d ago ACTIVE CALCULATIONS (SIMULATOR) GNINA EGFR Docking Run #42 82% Quantum Rerank PIK3CA-01 14% © 2026 Quinfosys Inc. All rights reserved.•Security Audit v4.8•FDA 21 CFR Part 11"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupGlobalFailureRules, assertNoMockData } from './utils';
  3  | 
  4  | test.describe('Authentication', () => {
  5  |   test.beforeEach(({ page }) => {
  6  |     setupGlobalFailureRules(page);
  7  |   });
  8  | 
  9  |   // Note: Signup and Login are largely verified by the global setup.
  10 |   // We will do a basic test here to ensure logout works and kicks us to /login.
  11 |   
  12 |   test('should logout successfully', async ({ page }) => {
  13 |     await page.goto('/workspace-selector'); // Auth state is loaded from global.setup.ts
  14 |     await assertNoMockData(page);
  15 | 
  16 |     // Click on user menu/avatar (heuristically finding logout)
  17 |     // The exact selector depends on the UI, but we can look for text or button
  18 |     const userMenuTrigger = page.locator('summary[aria-label="User profile"]').first();
  19 |     if (await userMenuTrigger.isVisible()) {
  20 |       await userMenuTrigger.click();
  21 |     } else {
  22 |       // Fallback
  23 |       await page.locator('header details summary').first().click().catch(() => null);
  24 |     }
  25 |     
  26 |     const logoutBtn = page.locator('button').filter({ hasText: /Logout|Log out/i }).first();
  27 |     await logoutBtn.click({ timeout: 5000 }).catch(() => {
  28 |         // if still not found, we might have to navigate to /login and see if it clears state
  29 |     });
  30 | 
  31 |     // We should be redirected to login
> 32 |     await expect(page).toHaveURL(/.*\/login/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  33 |   });
  34 | });
  35 | 
```