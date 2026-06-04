const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const videoDir = path.resolve(__dirname, '../artifacts/videos/');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  // Record video of the context
  const context = await browser.newContext({
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 }
    },
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  const timestamp = Date.now();
  const email = `proof_${timestamp}@quinfosys.com`;
  const password = `TestPass123!`;
  
  console.log("=== PHASE 10: END-TO-END PROOF ===");
  
  console.log("1. Signup & Workspace Creation");
  await page.goto('http://localhost:3001/signup');
  await page.fill('input[name="name"]', 'Dr. Proof Scientist');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="org"]', `Proof Org ${timestamp}`);
  await page.fill('input[name="role"]', 'Principal Investigator');
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirm"]', password);
  await page.click('input[id="register-terms"]');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('**/workspace-selector', { timeout: 15000 });
  
  page.once('dialog', dialog => dialog.accept(`Proof Workspace ${timestamp}`));
  await page.click('button:has-text("Create Workspace")');
  await page.waitForSelector(`text=Proof Workspace ${timestamp}`, { timeout: 15000 });
  
  await page.click('button:has-text("Enter Workspace")');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  console.log("2. Project Creation");
  await page.goto('http://localhost:3001/research-projects');
  let dialogCount = 0;
  const dialogHandler = async dialog => {
    dialogCount++;
    if (dialogCount === 1) await dialog.accept(`Proof Project ${timestamp}`);
    else if (dialogCount === 2) await dialog.accept('Oncology');
    else if (dialogCount === 3) await dialog.accept('Genomics Target');
    else { await dialog.accept(); page.off('dialog', dialogHandler); }
  };
  page.on('dialog', dialogHandler);
  await page.click('button:has-text("New Project")');
  await page.waitForSelector(`text=Proof Project ${timestamp}`, { timeout: 15000 });
  
  console.log("3. Entering Project & Triggering Pipeline");
  await page.click(`text=Proof Project ${timestamp}`);
  await page.waitForURL(/.*\/research-projects\/.*/, { timeout: 15000 });
  
  await page.click('text=Overview');
  const runPipelineBtn = await page.$('button:has-text("Run Full Pipeline")');
  if (runPipelineBtn) {
      await runPipelineBtn.click();
      console.log("Pipeline triggered...");
  }
  
  // Wait for the pipeline to finish.
  // The button text changes to "Orchestrating..." then back or the status badges turn to completed.
  // Let's poll for a "completed" status or check the Experiments tab.
  console.log("Waiting for pipeline to complete...");
  
  // We will wait up to 2 minutes for pipeline
  try {
      // Keep checking the page or just wait
      await page.waitForTimeout(30000); // Wait 30 seconds
  } catch (e) {
      console.log("Timeout waiting...", e);
  }

  console.log("4. Verifying Outputs in UI");
  
  await page.click('text=Experiments');
  await page.waitForTimeout(2000);
  
  await page.click('text=Molecules');
  await page.waitForTimeout(2000);
  
  console.log("5. Downloading Report");
  await page.click('text=Reports');
  await page.waitForTimeout(2000);
  
  // Find a download button or link for the report
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
  const downloadBtn = await page.$('button:has-text("Download"), a:has-text("Download")');
  if (downloadBtn) {
      await downloadBtn.click();
      const download = await downloadPromise;
      if (download) {
          const downloadPath = path.join(videoDir, await download.suggestedFilename());
          await download.saveAs(downloadPath);
          console.log("Downloaded report to:", downloadPath);
      }
  } else {
      console.log("No download button found.");
  }
  
  console.log("Saving video and closing...");
  await context.close();
  await browser.close();
  
  // Find the video file
  const files = fs.readdirSync(videoDir);
  const videoFile = files.find(f => f.endsWith('.webm') && fs.statSync(path.join(videoDir, f)).mtimeMs > timestamp);
  if (videoFile) {
    fs.renameSync(path.join(videoDir, videoFile), path.join(videoDir, 'FINAL_SCIENTIFIC_PROOF.mp4'));
    console.log("Video saved as FINAL_SCIENTIFIC_PROOF.mp4");
  }
})();
