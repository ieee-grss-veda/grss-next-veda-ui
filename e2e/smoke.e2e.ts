import { test, expect } from './fixtures';
import { HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON } from './env';
import { expectKnownBug } from './known-issues';
import { NOT_FOUND_PATHS, PAGES } from './pages';

test.describe('every page loads and renders its main content', () => {
  for (const spec of PAGES) {
    test(spec.name, async ({ page }) => {
      test.skip(!!spec.needsMapbox && !HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON);
      if (spec.knownBug) expectKnownBug('viz-app-500', spec.knownBug);

      const response = await page.goto(spec.path);
      expect(response?.status(), `HTTP status of ${spec.path}`).toBe(200);

      await expect(page).toHaveTitle(/\S/);
      await expect(spec.ready(page)).toBeVisible();
      for (const locator of spec.alsoVisible?.(page) ?? []) {
        await expect(locator).toBeVisible();
      }
      // Let late client effects (data fetches, map init) report errors
      // before the fixture checks the console.
      await page.waitForLoadState('networkidle').catch(() => {});
    });
  }
});

test.describe('unknown routes render the 404 page', () => {
  for (const path of NOT_FOUND_PATHS) {
    test(path, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(
        page.getByRole('heading', { name: '404 - Page Not Found' }),
      ).toBeVisible();
    });
  }
});
