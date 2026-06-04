const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const artifactsDir = path.resolve(__dirname, '../artifacts/');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  const timestamp = Date.now();
  const email = `final_${timestamp}@quinfosys.com`;
  const password = `TestPass123!`;
  
  console.log("=== FINAL PIPELINE COMPLETION VALIDATION ===");
  const startTime = Date.now();
  
  console.log("1. Signup & Workspace Creation");
  await page.goto('http://localhost:3001/signup');
  await page.fill('input[name="name"]', 'Dr. Final Scientist');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="org"]', `Final Org ${timestamp}`);
  await page.fill('input[name="role"]', 'Principal Investigator');
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm"]', password);
  await page.click('input[id="register-terms"]');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/workspace-selector', { timeout: 30000 });
  
  page.once('dialog', dialog => dialog.accept(`Final Workspace ${timestamp}`));
  await page.click('button:has-text("Create Workspace")');
  await page.waitForSelector(`text=Final Workspace ${timestamp}`, { timeout: 30000 });
  
  await page.click('button:has-text("Enter Workspace")');
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  
  console.log("2. Project Creation");
  await page.goto('http://localhost:3001/research-projects');
  let dialogCount = 0;
  const dialogHandler = async dialog => {
    dialogCount++;
    if (dialogCount === 1) await dialog.accept(`Final Project ${timestamp}`);
    else if (dialogCount === 2) await dialog.accept('Oncology');
    else if (dialogCount === 3) await dialog.accept('Target');
    else { await dialog.accept(); page.off('dialog', dialogHandler); }
  };
  page.on('dialog', dialogHandler);
  await page.click('button:has-text("New Project")');
  await page.waitForSelector(`text=Final Project ${timestamp}`, { timeout: 30000 });
  
  console.log("3. Triggering Pipeline");
  await page.click(`text=Final Project ${timestamp}`);
  await page.waitForURL(/.*\/research-projects\/.*/, { timeout: 30000 });
  
  await page.click('text=Overview');
  const runPipelineBtn = await page.$('button:has-text("Run Full Pipeline")');
  if (runPipelineBtn) {
      await runPipelineBtn.click();
      console.log("Pipeline triggered...");
  }
  
  console.log("4. Waiting for Completion (Polling...)");
  // The backend might take several minutes.
  // The pipeline button turns to "Orchestrating...", then back or "Run Full Pipeline" when finished,
  // or we can wait for the status badge to say "Completed" instead of "Running".
  // Let's poll Experiments page.
  await page.click('text=Experiments');
  
  let isCompleted = false;
  // Poll every 15 seconds for up to 15 minutes (60 iterations)
  for (let i = 0; i < 60; i++) {
      await page.reload();
      await page.waitForTimeout(3000);
      await page.click('text=Experiments');
      await page.waitForTimeout(5000);
      
      const badge = await page.$('text=completed');
      if (badge) {
          isCompleted = true;
          console.log(`Pipeline completed after ${(Date.now() - startTime) / 1000}s`);
          break;
      }
      console.log(`Still waiting... ${(i + 1) * 15}s elapsed`);
      await page.waitForTimeout(7000);
  }
  
  if (!isCompleted) {
      console.log("Pipeline did not complete within the timeout!");
  }
  
  console.log("5. Taking Screenshots & Verifying");
  
  // Experiments
  await page.click('text=Experiments');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'final_experiments.png') });
  
  // Molecules
  await page.click('text=Molecules');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(artifactsDir, 'final_molecules.png') });
  
  // Check if molecules exist
  // Assuming a table row or card
  const molCount = await page.$$eval('tbody tr, .molecule-card', els => els.length).catch(() => 0);
  console.log("Molecule Count:", molCount);
  
  // Results / Reports
  await page.click('text=Reports');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(artifactsDir, 'final_reports.png') });
  
  // Verify report count
  const reportCount = await page.$$eval('.report-card, tbody tr', els => els.length).catch(() => 0);
  console.log("Report Count:", reportCount);
  
  // Open and download report
  const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
  const downloadBtn = await page.$('button:has-text("Download"), a:has-text("Download"), button[aria-label="Download Report"]');
  if (downloadBtn) {
      await downloadBtn.click();
      const download = await downloadPromise;
      if (download) {
          const downloadPath = path.join(artifactsDir, await download.suggestedFilename());
          await download.saveAs(downloadPath);
          console.log("Downloaded report to:", downloadPath);
      }
  } else {
      console.log("No download button found.");
  }
  
  // Verifying docking/gnina/quantum results in report page (if they exist in sections)
  // Usually the reports page has a "Sections" tab or list
  const pageText = await page.content();
  console.log("Docking found:", pageText.includes("docking") || pageText.includes("Docking"));
  console.log("GNINA found:", pageText.includes("gnina") || pageText.includes("GNINA"));
  console.log("Quantum found:", pageText.includes("quantum") || pageText.includes("Quantum") || pageText.includes("qm"));
  
  const endTime = Date.now();
  console.log(`Total Runtime: ${(endTime - startTime) / 1000}s`);

  // Write outputs to a file for parsing
  fs.writeFileSync(path.join(artifactsDir, 'pipeline_output.json'), JSON.stringify({
      runtime: (endTime - startTime) / 1000,
      moleculeCount: molCount,
      reportCount: reportCount,
      dockingFound: pageText.includes("docking") || pageText.includes("Docking"),
      gninaFound: pageText.includes("gnina") || pageText.includes("GNINA"),
      quantumFound: pageText.includes("quantum") || pageText.includes("Quantum") || pageText.includes("qm")
  }));

  await context.close();
  await browser.close();
})();
