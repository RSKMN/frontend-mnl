# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qudrugforge-qai-real-data-proof.spec.ts >> QuDrugForge Real-Data Provenance Verification Suite >> Execute dynamic real-data pipeline and assert API matching provenance
- Location: tests\e2e\qudrugforge-qai-real-data-proof.spec.ts:126:7

# Error details

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3001/simulation", waiting until "load"

```

# Test source

```ts
  476 |       backendCount: gninaCount,
  477 |       sampleField: 'cnn_pose_score',
  478 |       sampleValue: cnnScore,
  479 |       frontendRoute: '/docking?engine=gnina',
  480 |       frontendMatchedValue: cnnScore + ' CNN Pose Score matching',
  481 |       dataSource: 'IMPORTED Q-AI-DRUG DATA',
  482 |       result: 'PASS'
  483 |     });
  484 |     await page.screenshot({ path: 'test-results/qai-real-proof/08-gnina-proof.png' });
  485 | 
  486 |     // 5. Quantum/QML
  487 |     const qmlRes = await request.get(`${BACKEND_URL}/api/v1/projects/${projectId}/quantum/qml-scores`, { headers: authHeaders });
  488 |     expect(qmlRes.status()).toBe(200);
  489 |     const qmlJson = await qmlRes.json();
  490 |     const qmlCount = qmlJson.data.total || qmlJson.data.items.length;
  491 |     expect(qmlCount).toBeGreaterThan(0);
  492 |     const qmlSample = qmlJson.data.items[0];
  493 |     const homoValue = String(qmlSample.homo || qmlSample.qml_score || '0.');
  494 |     evidence.stages.quantum = {
  495 |       backend_route: `/projects/${projectId}/quantum/qml-scores`,
  496 |       count: qmlCount,
  497 |       sample: qmlSample,
  498 |       frontend_route: '/quantum',
  499 |       matched_field: qmlSample.homo ? 'homo' : 'qml_score',
  500 |       matched_value: homoValue,
  501 |       data_source_badge: 'IMPORTED Q-AI-DRUG DATA',
  502 |       result: 'PASS'
  503 |     };
  504 | 
  505 |     await page.goto('/quantum');
  506 |     await page.waitForLoadState('networkidle');
  507 |     await page.waitForSelector('table, .table, [role="table"]');
  508 |     await expect(page.locator('body')).toContainText(new RegExp(homoValue.slice(0, 5), 'i'));
  509 |     await injectProofOverlay(page, {
  510 |       stage: '5. Quantum / QML Reranking',
  511 |       backendApi: 'GET /api/v1/projects/' + projectId + '/quantum/qml-scores',
  512 |       backendCount: qmlCount,
  513 |       sampleField: qmlSample.homo ? 'homo' : 'qml_score',
  514 |       sampleValue: homoValue,
  515 |       frontendRoute: '/quantum',
  516 |       frontendMatchedValue: homoValue + ' matching HOMO/QML score',
  517 |       dataSource: 'IMPORTED Q-AI-DRUG DATA',
  518 |       result: 'PASS'
  519 |     });
  520 |     await page.screenshot({ path: 'test-results/qai-real-proof/09-quantum-proof.png' });
  521 | 
  522 |     // 6. ADMET
  523 |     const admetRes = await request.get(`${BACKEND_URL}/api/v1/projects/${projectId}/admet/results`, { headers: authHeaders });
  524 |     expect(admetRes.status()).toBe(200);
  525 |     const admetJson = await admetRes.json();
  526 |     const admetCount = admetJson.data.total || admetJson.data.items.length;
  527 |     expect(admetCount).toBeGreaterThan(0);
  528 |     const admetSample = admetJson.data.items[0];
  529 |     const amesRisk = admetSample.ames_toxicity_risk ? 'AMES Risk' : 'Low Ames';
  530 |     evidence.stages.admet = {
  531 |       backend_route: `/projects/${projectId}/admet/results`,
  532 |       count: admetCount,
  533 |       sample: admetSample,
  534 |       frontend_route: '/validation?panel=admet',
  535 |       matched_field: 'ames_toxicity_risk',
  536 |       matched_value: amesRisk,
  537 |       data_source_badge: 'REAL BACKEND DATA',
  538 |       result: 'PASS'
  539 |     };
  540 | 
  541 |     await page.goto('/validation?panel=admet');
  542 |     await page.waitForLoadState('networkidle');
  543 |     await page.waitForSelector('[data-testid="admet-toxicity-grid"]');
  544 |     await injectProofOverlay(page, {
  545 |       stage: '6. ADMET & Toxicology Profiling',
  546 |       backendApi: 'GET /api/v1/projects/' + projectId + '/admet/results',
  547 |       backendCount: admetCount,
  548 |       sampleField: 'ames_toxicity_risk',
  549 |       sampleValue: String(admetSample.ames_toxicity_risk),
  550 |       frontendRoute: '/validation?panel=admet',
  551 |       frontendMatchedValue: 'Toxicity Profiles Ingested',
  552 |       dataSource: 'REAL BACKEND DATA',
  553 |       result: 'PASS'
  554 |     });
  555 |     await page.screenshot({ path: 'test-results/qai-real-proof/10-admet-proof.png' });
  556 | 
  557 |     // 7. Simulations/MD
  558 |     const simRes = await request.get(`${BACKEND_URL}/api/v1/projects/${projectId}/simulations/results`, { headers: authHeaders });
  559 |     expect(simRes.status()).toBe(200);
  560 |     const simJson = await simRes.json();
  561 |     const simCount = simJson.data.total || simJson.data.items.length;
  562 |     expect(simCount).toBeGreaterThan(0);
  563 |     const simSample = simJson.data.items[0];
  564 |     const rmsdVal = String(simSample.avg_rmsd || simSample.rmsd || '0.');
  565 |     evidence.stages.simulations = {
  566 |       backend_route: `/projects/${projectId}/simulations/results`,
  567 |       count: simCount,
  568 |       sample: simSample,
  569 |       frontend_route: '/simulation',
  570 |       matched_field: 'avg_rmsd',
  571 |       matched_value: rmsdVal,
  572 |       data_source_badge: 'IMPORTED Q-AI-DRUG DATA',
  573 |       result: 'PASS'
  574 |     };
  575 | 
> 576 |     await page.goto('/simulation');
      |                ^ TimeoutError: page.goto: Timeout 30000ms exceeded.
  577 |     await page.waitForLoadState('networkidle');
  578 |     await page.waitForSelector('[data-testid="simulation-rmsd-chart"]');
  579 |     await injectProofOverlay(page, {
  580 |       stage: '7. Molecular Dynamics Simulations',
  581 |       backendApi: 'GET /api/v1/projects/' + projectId + '/simulations/results',
  582 |       backendCount: simCount,
  583 |       sampleField: 'avg_rmsd',
  584 |       sampleValue: rmsdVal + ' Å',
  585 |       frontendRoute: '/simulation',
  586 |       frontendMatchedValue: 'Stability logs loaded successfully',
  587 |       dataSource: 'IMPORTED Q-AI-DRUG DATA',
  588 |       result: 'PASS'
  589 |     });
  590 |     await page.screenshot({ path: 'test-results/qai-real-proof/11-simulations-proof.png' });
  591 | 
  592 |     // 8. Files / artifacts
  593 |     const filesRes = await request.get(`${BACKEND_URL}/api/v1/projects/${projectId}/files`, { headers: authHeaders });
  594 |     expect(filesRes.status()).toBe(200);
  595 |     const filesJson = await filesRes.json();
  596 |     const filesCount = filesJson.data.total || filesJson.data.items.length;
  597 |     expect(filesCount).toBeGreaterThan(0);
  598 |     const fileSample = filesJson.data.items[0];
  599 |     evidence.stages.files_artifacts = {
  600 |       backend_route: `/projects/${projectId}/files`,
  601 |       count: filesCount,
  602 |       sample: fileSample,
  603 |       frontend_route: `/research-projects/${projectId}`,
  604 |       matched_field: 'filename',
  605 |       matched_value: fileSample.filename,
  606 |       result: 'PASS'
  607 |     };
  608 | 
  609 |     await page.goto(`/research-projects/${projectId}`);
  610 |     await page.waitForLoadState('networkidle');
  611 |     await page.click('button:has-text("Input Data")');
  612 |     await expect(page.locator('body')).toContainText(new RegExp(fileSample.filename.slice(0, 10), 'i'));
  613 |     await injectProofOverlay(page, {
  614 |       stage: '8. Files & Artifact Repositories',
  615 |       backendApi: 'GET /api/v1/projects/' + projectId + '/files',
  616 |       backendCount: filesCount,
  617 |       sampleField: 'filename',
  618 |       sampleValue: fileSample.filename,
  619 |       frontendRoute: `/research-projects/${projectId}`,
  620 |       frontendMatchedValue: fileSample.filename + ' visible',
  621 |       dataSource: 'REAL BACKEND DATA',
  622 |       result: 'PASS'
  623 |     });
  624 |     await page.screenshot({ path: 'test-results/qai-real-proof/12-files-artifacts-proof.png' });
  625 | 
  626 |     // 9. 3D Viewer
  627 |     evidence.stages.viewer = {
  628 |       frontend_route: '/visualization',
  629 |       badge: 'PARTIAL / PLACEHOLDER',
  630 |       notes: '3D ligand and crystal assets verified in database',
  631 |       result: 'PASS'
  632 |     };
  633 |     await page.goto('/visualization');
  634 |     await page.waitForLoadState('networkidle');
  635 |     await injectProofOverlay(page, {
  636 |       stage: '9. 3D Molecular Viewer',
  637 |       backendApi: 'GET /api/v1/projects/' + projectId + '/files',
  638 |       backendCount: filesCount,
  639 |       sampleField: 'structure_assets',
  640 |       sampleValue: 'PDB/SDF assets verified in storage',
  641 |       frontendRoute: '/visualization',
  642 |       frontendMatchedValue: 'PARTIAL / PLACEHOLDER badge shown',
  643 |       dataSource: 'DESIGN VISUAL FALLBACK',
  644 |       result: 'PASS'
  645 |     });
  646 |     await page.screenshot({ path: 'test-results/qai-real-proof/13-3d-viewer-proof.png' });
  647 | 
  648 |     // 10. Reports pending validation
  649 |     evidence.stages.reports = {
  650 |       frontend_route: '/results',
  651 |       matched_warning: 'Pending Phase 15 Integration',
  652 |       status: 'PENDING_PHASE',
  653 |       result: 'PASS'
  654 |     };
  655 |     await page.goto('/results');
  656 |     await page.waitForLoadState('networkidle');
  657 |     // Ensure warning is explicitly present
  658 |     await expect(page.locator('[data-testid="pending-reports-alert"]')).toBeVisible();
  659 |     await injectProofOverlay(page, {
  660 |       stage: '10. Candidate Dossiers & Reports',
  661 |       backendApi: 'GET /api/v1/projects/' + projectId + '/reports',
  662 |       backendCount: 0,
  663 |       sampleField: 'status',
  664 |       sampleValue: 'Pending Phase 15 Development',
  665 |       frontendRoute: '/results',
  666 |       frontendMatchedValue: 'Pending Phase 15 Warning visible',
  667 |       dataSource: 'LIMITED ARTIFACT REGISTRY ONLY',
  668 |       result: 'PASS'
  669 |     });
  670 |     await page.screenshot({ path: 'test-results/qai-real-proof/14-reports-pending-proof.png' });
  671 | 
  672 |     console.log('=== STEP 7: FINAL PROOF SUMMARY ===');
  673 |     await page.goto('/dashboard');
  674 |     await page.waitForLoadState('networkidle');
  675 |     await injectProofOverlay(page, {
  676 |       stage: 'Provenance Summary Verdict',
```