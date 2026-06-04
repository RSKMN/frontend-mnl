import { test as teardown } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

teardown('cleanup auth state', async ({ page }) => {
  // Ideally, we'd hit the API to delete the user or truncate the DB here.
  // We'll clean up the local auth file so next run is clean.
  try {
    const fullPath = path.resolve(process.cwd(), authFile);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error("Error deleting auth state:", err);
  }
});
