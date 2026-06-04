# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workspace.spec.ts >> Workspace >> should load workspace selector and allow creation
- Location: e2e\workspace.spec.ts:9:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('button').filter({ hasText: /Create|New Workspace/i }).first()
    - locator resolved to <button disabled type="button" class="w-full py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition-all">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    29 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - region "Notifications alt+T"
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - img "Quinfosys QuDrugForge Logo" [ref=e6]
        - generic [ref=e7]:
          - heading "Quinfosys™ QuDrugForge™" [level=1] [ref=e8]
          - paragraph [ref=e9]: Quantum AI Drug Discovery Platform
          - paragraph [ref=e10]: AI-Powered Computational Molecular Intelligence
      - generic [ref=e11]:
        - paragraph [ref=e12]: Unlock the power of in silico biochemistry. QuDrugForge integrates quantum molecular screening with generative intelligence to identify high-affinity lead candidates.
        - list [ref=e13]:
          - listitem [ref=e14]:
            - img [ref=e16]
            - generic [ref=e18]:
              - heading "Target discovery workflows" [level=4] [ref=e19]
              - paragraph [ref=e20]: Identify, prioritize, and validate disease-driving genomic targets with advanced bioinformatic maps.
          - listitem [ref=e21]:
            - img [ref=e23]
            - generic [ref=e25]:
              - heading "Molecule generation and screening" [level=4] [ref=e26]
              - paragraph [ref=e27]: Generative reinforcement learning pipelines designed to filter and design millions of novel candidate structures.
          - listitem [ref=e28]:
            - img [ref=e30]
            - generic [ref=e32]:
              - heading "Docking, GNINA, and quantum reranking" [level=4] [ref=e33]
              - paragraph [ref=e34]: Accelerate binding affinity calculations utilizing deep convolutional neural networks and molecular mechanics scoring.
          - listitem [ref=e35]:
            - img [ref=e37]
            - generic [ref=e39]:
              - heading "Candidate dossiers and validation reports" [level=4] [ref=e40]
              - paragraph [ref=e41]: Automated preparation of FDA 21 CFR Part 11 compliant evidence packages and real-time ADMET profiling data.
    - generic [ref=e42]:
      - generic [ref=e44]:
        - img "Quinfosys QuDrugForge Logo" [ref=e45]
        - text: QuDrugForge
      - generic [ref=e48]:
        - generic [ref=e49]:
          - text: SECURE PROTOCOL INITIALIZED
          - heading "Select a research workspace" [level=1] [ref=e50]
          - paragraph [ref=e51]: Choose an organization workspace or continue into a recent discovery program.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - heading "Organization Workspaces" [level=2] [ref=e55]
            - generic [ref=e56]:
              - heading "Recent Discovery Programs" [level=2] [ref=e57]
              - table [ref=e60]:
                - rowgroup [ref=e61]:
                  - row "Program Name Disease Area Workflow Stage Telemetry Last Updated" [ref=e62]:
                    - columnheader "Program Name" [ref=e63]
                    - columnheader "Disease Area" [ref=e64]
                    - columnheader "Workflow Stage" [ref=e65]
                    - columnheader "Telemetry" [ref=e66]
                    - columnheader "Last Updated" [ref=e67]
                - rowgroup [ref=e68]:
                  - row "EGFR NSCLC Discovery Program Oncology Lead Optimization Active 2 hours ago" [ref=e69]:
                    - cell "EGFR NSCLC Discovery Program" [ref=e70]
                    - cell "Oncology" [ref=e71]
                    - cell "Lead Optimization" [ref=e72]
                    - cell "Active" [ref=e73]
                    - cell "2 hours ago" [ref=e74]
                  - row "PARP1 Oncology Program Oncology Hit Validation Idle 1 day ago" [ref=e75]:
                    - cell "PARP1 Oncology Program" [ref=e76]
                    - cell "Oncology" [ref=e77]
                    - cell "Hit Validation" [ref=e78]
                    - cell "Idle" [ref=e79]
                    - cell "1 day ago" [ref=e80]
                  - row "PIK3CA Molecular Screening Oncology De Novo Generation Completed 3 days ago" [ref=e81]:
                    - cell "PIK3CA Molecular Screening" [ref=e82]
                    - cell "Oncology" [ref=e83]
                    - cell "De Novo Generation" [ref=e84]
                    - cell "Completed" [ref=e85]
                    - cell "3 days ago" [ref=e86]
                  - row "KRAS G12D Exploratory Campaign Oncology Target Identification Active 1 week ago" [ref=e87]:
                    - cell "KRAS G12D Exploratory Campaign" [ref=e88]
                    - cell "Oncology" [ref=e89]
                    - cell "Target Identification" [ref=e90]
                    - cell "Active" [ref=e91]
                    - cell "1 week ago" [ref=e92]
          - generic [ref=e93]:
            - generic [ref=e94]:
              - heading "Workspace Controls" [level=2] [ref=e95]
              - generic [ref=e96]:
                - button "Create Workspace" [disabled] [ref=e97]:
                  - img [ref=e98]
                  - text: Create Workspace
                - button "Join Workspace" [ref=e100]:
                  - img [ref=e101]
                  - text: Join Workspace
                - button "Import Project" [ref=e103]:
                  - img [ref=e104]
                  - text: Import Project
                - button "Continue to Dashboard" [disabled] [ref=e106]:
                  - text: Continue to Dashboard
                  - img [ref=e107]
            - generic [ref=e109]:
              - heading "Research Environment" [level=2] [ref=e110]
              - generic [ref=e111]:
                - text: ACTIVE COMPUTE CREDITS
                - generic [ref=e113]: QPU Quantum Simulator14,200 hrs remaining
                - generic [ref=e115]: HPC GPU Core Array84,000 hrs remaining
              - generic [ref=e116]:
                - text: INTEGRATIONS STATUS
                - generic [ref=e117]:
                  - generic [ref=e118]: GNINA Neural Scorer v1.2
                  - generic [ref=e119]: AutoDock Vina Engine v4.0
                  - generic [ref=e120]: Schrödinger Maestro API
              - generic [ref=e121]:
                - text: RECENT REPORTS GENERATED
                - generic [ref=e122]:
                  - generic [ref=e123]: 📄 EGFR-L858R_Hit_Assessment.pdf1d ago
                  - generic [ref=e124]: 📄 JAK3_Toxicity_Assay_Dossier.pdf3d ago
              - generic [ref=e125]:
                - text: ACTIVE CALCULATIONS (SIMULATOR)
                - generic [ref=e126]:
                  - generic [ref=e127]:
                    - generic [ref=e128]: "GNINA EGFR Docking Run #42"
                    - text: 82%
                  - generic [ref=e129]:
                    - generic [ref=e130]: Quantum Rerank PIK3CA-01
                    - text: 14%
      - generic [ref=e131]:
        - generic [ref=e132]: © 2026 Quinfosys Inc. All rights reserved.
        - text: •Security Audit v4.8•FDA 21 CFR Part 11
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupGlobalFailureRules, assertNoMockData } from './utils';
  3  | 
  4  | test.describe('Workspace', () => {
  5  |   test.beforeEach(({ page }) => {
  6  |     setupGlobalFailureRules(page);
  7  |   });
  8  | 
  9  |   test('should load workspace selector and allow creation', async ({ page }) => {
  10 |     await page.goto('/workspace-selector');
  11 |     await assertNoMockData(page);
  12 | 
  13 |     await expect(page.locator('text=Select Workspace').first()).toBeVisible({ timeout: 10000 }).catch(() => null);
  14 | 
  15 |     // Look for create workspace button
  16 |     const createBtn = page.locator('button').filter({ hasText: /Create|New Workspace/i }).first();
  17 |     if (await createBtn.isVisible()) {
  18 |       page.once('dialog', dialog => dialog.accept(`E2E Workspace ${Date.now()}`));
> 19 |       await createBtn.click();
     |                       ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  20 |       
  21 |       // Wait for network/navigation
  22 |       await page.waitForLoadState('networkidle');
  23 |     }
  24 |     
  25 |     // Select first available workspace
  26 |     const firstWorkspace = page.locator('button, a').filter({ hasText: /E2E Test Workspace|Workspace/i }).first();
  27 |     if (await firstWorkspace.isVisible()) {
  28 |       await firstWorkspace.click();
  29 |     }
  30 |     
  31 |     // Should end up on projects or dashboard
  32 |     await expect(page).toHaveURL(/.*\/research-projects|.*\/dashboard/);
  33 |   });
  34 | });
  35 | 
```