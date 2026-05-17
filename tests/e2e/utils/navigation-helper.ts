import { Page, expect } from '@playwright/test';

/**
 * Attaches page-level listeners to track console errors and uncaught exceptions.
 * Ignores benign React developer or styling warnings.
 */
export function setupConsoleTracker(page: Page) {
  const severeErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known, benign Hydration mismatches or third-party warning notifications
      if (
        text.includes('React does not recognize') || 
        text.includes('Warning:') || 
        text.includes('ResizeObserver') ||
        text.includes('Failed to load resource') ||
        text.includes('Failed to fetch RSC payload')
      ) {
        return;
      }
      severeErrors.push(`[Console Error] ${text}`);
    }
  });

  page.on('pageerror', (err) => {
    severeErrors.push(`[Page Error] ${err.message}\nStack: ${err.stack}`);
  });

  return {
    assertNoSevereErrors: () => {
      expect(severeErrors).toEqual([]);
    },
    severeErrors
  };
}

/**
 * Safe navigation utility to wrap target routing and verify execution state.
 */
export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
}
