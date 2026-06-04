import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Phase E1 - Full Scientific Proof Run (Part 1)', () => {
  test.use({ video: 'on' });

  test('Part 1: Upload and Launch Pipeline', async ({ page }) => {
    // Navigate to frontend
    await page.goto('http://localhost:3001');

    // 1. Account Creation / Login
    // Assuming simple mock auth or standard auth flow is enabled
    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.fill('input[type="email"]', 'test_scientist@qudrugforge.com');
      await page.fill('input[type="password"]', 'ScientificProof123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
    }

    // 2. Workspace Creation
    await page.click('text=Workspaces');
    await page.click('text=Create Workspace');
    const wsName = `Validation Run Workspace ${Date.now()}`;
    await page.fill('input[name="workspaceName"]', wsName);
    await page.click('button:has-text("Create")');

    // 3. Project Creation
    await page.click(`text=${wsName}`);
    await page.click('text=New Project');
    const projName = `Phase E1 Full Proof ${Date.now()}`;
    await page.fill('input[name="projectName"]', projName);
    await page.fill('textarea[name="description"]', 'Scientific Validation E2E Proof');
    await page.click('button:has-text("Create Project")');
    await page.waitForURL('**/projects/**', { timeout: 10000 });

    // 4. Upload Inputs
    await page.click('text=Upload Data');
    
    // Resolve Absolute Paths for inputs
    const baseDir = 'E:\\rskmn\\Npersonal\\quinfosys\\drug_discovery_research\\work\\mnl\\q-ai-drug-new';
    const fastaPath = path.join(baseDir, 'validation_outputs', 'ValidationA_EGFR', 'ValidationA_EGFR.fasta');
    const pdbPath = path.join(baseDir, 'phase2_docking', 'receptors', 'try1_alphafold.pdb');
    const assayPath = path.join(baseDir, 'assay_A.csv');

    // Upload FASTA
    const fastaInput = await page.$('input[type="file"][accept*=".fasta"]');
    if (fastaInput) await fastaInput.setInputFiles(fastaPath);

    // Upload PDB
    const pdbInput = await page.$('input[type="file"][accept*=".pdb"]');
    if (pdbInput) await pdbInput.setInputFiles(pdbPath);

    // Upload Assay Dataset
    const csvInput = await page.$('input[type="file"][accept*=".csv"]');
    if (csvInput) await csvInput.setInputFiles(assayPath);

    // Set Binding Coordinates (Center of the pocket)
    await page.fill('input[name="binding_x"]', '0');
    await page.fill('input[name="binding_y"]', '0');
    await page.fill('input[name="binding_z"]', '0');
    await page.fill('input[name="binding_size_x"]', '20');
    await page.fill('input[name="binding_size_y"]', '20');
    await page.fill('input[name="binding_size_z"]', '20');

    // Set Reference Ligand (Imatinib)
    await page.fill('input[name="reference_ligand_smiles"]', 'CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5');

    await page.click('button:has-text("Submit Upload")');
    
    // 5. Launch Pipeline
    await page.click('text=Pipelines');
    await page.click('text=Run Pipeline');
    
    // Ensure all scientific modules are selected
    await page.check('input[name="enable_docking"]');
    await page.check('input[name="enable_gnina"]');
    await page.check('input[name="enable_qsar"]');
    await page.check('input[name="enable_md"]');
    await page.check('input[name="enable_chemical_space"]');
    
    await page.click('button:has-text("Start Execution")');

    // 6. Show Pipeline Successfully Started
    await expect(page.locator('text=Pipeline Running').first()).toBeVisible({ timeout: 15000 });
    
    // Allow script to complete naturally
    console.log("Part 1 Complete: Pipeline is running.");
  });
});
