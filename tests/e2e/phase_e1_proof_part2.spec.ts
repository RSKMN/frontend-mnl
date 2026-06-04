import { test, expect } from '@playwright/test';

test.describe('Phase E1 - Full Scientific Proof Run (Part 2)', () => {
  test.use({ video: 'on' });

  test('Part 2: Verify Results and Walkthrough', async ({ page }) => {
    // Navigate to frontend and login if needed
    await page.goto('http://localhost:3001');

    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.fill('input[type="email"]', 'test_scientist@qudrugforge.com');
      await page.fill('input[type="password"]', 'ScientificProof123!');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard**', { timeout: 10000 });
    }

    // Go to the latest project
    await page.click('text=Workspaces');
    await page.click('text=Validation Run Workspace');
    await page.click('text=Phase E1 Full Proof');

    // 1. Check Pipeline State
    await page.click('text=Pipelines');
    await expect(page.locator('text=Completed').first()).toBeVisible({ timeout: 60000 });

    // 2. Verify Molecules
    await page.click('text=Molecules');
    await expect(page.locator('text=Compound ID')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_molecules.png' });

    // 3. Verify Docking
    await page.click('text=Docking');
    await expect(page.locator('text=Vina Affinity')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_docking.png' });

    // 4. Verify GNINA
    await page.click('text=GNINA CNN Scoring');
    await expect(page.locator('text=CNN Score')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_gnina.png' });

    // 5. Verify QSAR / Applicability Domain
    await page.click('text=Validation');
    await expect(page.locator('text=Applicability Domain Score')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_qsar.png' });

    // 6. Verify MD Results
    await page.click('text=Ligand Pose Relaxation');
    await expect(page.locator('text=Stability')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_md.png' });

    // 7. Verify Chemical Space
    await page.click('text=Chemical Space');
    await expect(page.locator('text=umap_rdkit_morgan')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_chemical_space.png' });

    // 8. Verify Similarity
    await page.click('text=Similarity Matrix');
    await expect(page.locator('text=rdkit_tanimoto')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_similarity.png' });

    // 9. Verify Reports & Artifacts
    await page.click('text=Reports');
    await expect(page.locator('text=Download Report')).toBeVisible();
    await page.screenshot({ path: 'test-results/proof_reports.png' });

    console.log("Part 2 Complete: UI Verification Walkthrough successful.");
  });
});
