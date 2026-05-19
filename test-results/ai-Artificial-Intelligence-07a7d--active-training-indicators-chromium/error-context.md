# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ai.spec.ts >> Artificial Intelligence & GenAI Services >> AI Models catalog loads and shows active training indicators
- Location: tests\e2e\ai.spec.ts:11:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/workspace-selector" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e2]:
        - generic [ref=e3]: 🔬
        - generic [ref=e4]:
          - generic [ref=e5]: "GNINA scoring finished: 244 ligands processed"
          - generic [ref=e6]: 11:01:52 AM
  - generic [ref=e9]: Demo Mode Active
  - main [ref=e10]:
    - generic [ref=e11]:
      - generic [ref=e13]:
        - img "Quinfosys QuDrugForge Logo" [ref=e15]
        - generic [ref=e16]:
          - heading "Quinfosys™ QuDrugForge™" [level=1] [ref=e17]
          - paragraph [ref=e18]: Quantum AI Drug Discovery Platform
          - paragraph [ref=e19]: AI-Powered Computational Molecular Intelligence
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e28]: "PLATFORM: ACTIVE"
          - generic [ref=e29]: "SYS_CORE_LATENCY: 0.12ms"
          - generic [ref=e30]: "HYBRID_QUANTUM: ON"
        - img [ref=e32]:
          - generic [ref=e65]:
            - generic [ref=e66]: d(H-O) = 0.96 Å
            - generic [ref=e67]: 120°
            - generic [ref=e68]: EGFR_BOND_9
        - generic [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e72]: "ACTIVE TARGET:"
            - generic [ref=e73]: EGFR (T790M/L858R)
          - generic [ref=e74]:
            - generic [ref=e75]: "BINDING FREE ENERGY (predicted):"
            - generic [ref=e76]: "-12.8 kcal/mol"
          - generic [ref=e77]:
            - generic [ref=e78]: "CHEM_SPACE_DENSITY:"
            - generic [ref=e79]: 0.9997 Quantum Coherence
          - generic [ref=e80]:
            - generic [ref=e81]: "SHA256: 9e248b1fc7a892b1a8d0c8d..."
            - generic [ref=e82]: "VER: 4.8.1-Q"
      - generic [ref=e83]:
        - paragraph [ref=e84]: Unlock the power of in silico biochemistry. QuDrugForge integrates quantum molecular screening with generative intelligence to identify high-affinity lead candidates.
        - list [ref=e85]:
          - listitem [ref=e86]:
            - img [ref=e88]
            - generic [ref=e90]:
              - heading "Target discovery workflows" [level=4] [ref=e91]
              - paragraph [ref=e92]: Identify, prioritize, and validate disease-driving genomic targets with advanced bioinformatic maps.
          - listitem [ref=e93]:
            - img [ref=e95]
            - generic [ref=e97]:
              - heading "Molecule generation and screening" [level=4] [ref=e98]
              - paragraph [ref=e99]: Generative reinforcement learning pipelines designed to filter and design millions of novel candidate structures.
          - listitem [ref=e100]:
            - img [ref=e102]
            - generic [ref=e104]:
              - heading "Docking, GNINA, and quantum reranking" [level=4] [ref=e105]
              - paragraph [ref=e106]: Accelerate binding affinity calculations utilizing deep convolutional neural networks and molecular mechanics scoring.
          - listitem [ref=e107]:
            - img [ref=e109]
            - generic [ref=e111]:
              - heading "Candidate dossiers and validation reports" [level=4] [ref=e112]
              - paragraph [ref=e113]: Automated preparation of FDA 21 CFR Part 11 compliant evidence packages and real-time ADMET profiling data.
    - generic [ref=e114]:
      - button "Switch to dark mode" [ref=e117] [cursor=pointer]:
        - generic [ref=e118]:
          - img [ref=e119]
          - img [ref=e122]
      - generic [ref=e128]:
        - generic [ref=e129]:
          - heading "Welcome back to QuDrugForge" [level=2] [ref=e130]
          - paragraph [ref=e131]: Access your AI-powered molecular discovery workspace.
        - generic [ref=e132]:
          - button "Continue with Google" [ref=e133] [cursor=pointer]:
            - img [ref=e135]
            - generic [ref=e140]: Continue with Google
          - generic [ref=e141]:
            - button "Continue with Microsoft" [ref=e142] [cursor=pointer]:
              - img [ref=e144]
              - generic [ref=e149]: Continue with Microsoft
            - button "Continue with Organization SSO" [ref=e150] [cursor=pointer]:
              - img [ref=e152]
              - generic [ref=e154]: Continue with Organization SSO
        - generic [ref=e158]: or sign in with credentials
        - generic [ref=e159]:
          - generic [ref=e160]:
            - generic [ref=e161]:
              - generic [ref=e162]: Institutional Email
              - textbox "Institutional Email" [ref=e164]:
                - /placeholder: researcher@quinfosys.com
                - text: e2e_researcher@example.com
            - img [ref=e166]
          - generic [ref=e168]:
            - generic [ref=e169]:
              - generic [ref=e170]: Security Key / Password
              - textbox "Security Key / Password" [ref=e172]:
                - /placeholder: Enter your security password
                - text: Password123!
            - img [ref=e174]
            - button "Show password" [ref=e176] [cursor=pointer]:
              - img [ref=e177]
          - generic [ref=e180]:
            - generic [ref=e181] [cursor=pointer]:
              - checkbox "Remember this terminal" [ref=e182]
              - generic [ref=e183]: Remember this terminal
            - link "Forgot password?" [ref=e184] [cursor=pointer]:
              - /url: /forgot-password
          - alert [ref=e185]: Your session needs attention. Please sign in again and retry.
          - button "Sign in" [ref=e186] [cursor=pointer]
        - generic [ref=e187]:
          - generic [ref=e188]:
            - generic [ref=e189]: New researcher?
            - link "Create account" [ref=e190] [cursor=pointer]:
              - /url: /signup
          - generic [ref=e191]:
            - generic [ref=e192]: Issues connecting?
            - button "Contact enterprise support" [ref=e193] [cursor=pointer]
      - generic [ref=e194]:
        - generic [ref=e195]: © 2026 Quinfosys Inc. All rights reserved.
        - generic [ref=e196]: •
        - generic [ref=e197] [cursor=pointer]: Security Audit v4.8
        - generic [ref=e198]: •
        - generic [ref=e199] [cursor=pointer]: FDA 21 CFR Part 11
  - alert [ref=e200]
```

# Test source

```ts
  1  | import { Page } from '@playwright/test';
  2  | import { E2E_EMAIL, E2E_PASSWORD, E2E_MODE } from './test-data';
  3  | import { SELECTORS } from './selectors';
  4  | 
  5  | /**
  6  |  * Configure local storage on init to synchronize demo mode state.
  7  |  */
  8  | export async function bypassDemoMode(page: Page) {
  9  |   const isMock = E2E_MODE === 'mock';
  10 |   const demoModeValue = isMock ? 'true' : 'false';
  11 |   
  12 |   await page.addInitScript((val) => {
  13 |     window.localStorage.setItem('demo_mode', val);
  14 |   }, demoModeValue);
  15 | }
  16 | 
  17 | /**
  18 |  * Perform login workflow using credentials form.
  19 |  */
  20 | export async function loginUser(page: Page, email = E2E_EMAIL, password = E2E_PASSWORD) {
  21 |   await bypassDemoMode(page);
  22 |   await page.goto('/login');
  23 |   
  24 |   // Wait for login fields to be fully interactive
  25 |   await page.waitForSelector(SELECTORS.auth.loginEmail);
  26 |   await page.fill(SELECTORS.auth.loginEmail, email);
  27 |   await page.fill(SELECTORS.auth.loginPassword, password);
  28 |   
  29 |   // Submit Form
  30 |   await page.click(SELECTORS.auth.loginSubmit);
  31 |   
  32 |   // Wait for routing transition to workspace-selector
> 33 |   await page.waitForURL('**/workspace-selector', { timeout: 15000 });
     |              ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
  34 | }
  35 | 
  36 | /**
  37 |  * Select default active workspace and proceed to the primary researcher dashboard.
  38 |  */
  39 | export async function enterWorkspace(page: Page) {
  40 |   await page.waitForURL('**/workspace-selector');
  41 |   await page.waitForSelector(SELECTORS.workspace.continueDashboard);
  42 |   await page.click(SELECTORS.workspace.continueDashboard);
  43 |   await page.waitForURL('**/dashboard', { timeout: 15000 });
  44 | }
  45 | 
```