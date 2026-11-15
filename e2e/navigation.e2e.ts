import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON } from './env';
import { expectKnownBug } from './known-issues';
import { VIZ_APP_500, card } from './pages';

const MAIN_NAV = [
  { name: 'Data Catalog', path: '/data-catalog', needsMapbox: false },
  { name: 'Exploration', path: '/exploration', needsMapbox: true },
  { name: 'Stories', path: '/stories', needsMapbox: false },
  { name: 'About', path: '/about', needsMapbox: false },
];

/**
 * Go to a page and wait until client-side JS has loaded. Clicking a link that
 * VEDA-UI renders before hydration finishes is sometimes swallowed, which made
 * card-click tests flaky.
 */
async function gotoHydrated(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

test.describe('header navigation', () => {
  for (const link of MAIN_NAV) {
    test(`"${link.name}" goes to ${link.path}`, async ({ page }) => {
      test.skip(link.needsMapbox && !HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON);
      await gotoHydrated(page, '/');

      if (isMobile(page)) {
        await page.getByRole('button', { name: 'Open menu' }).click();
        const menu = page.getByRole('dialog');
        await expect(menu).toBeVisible();
        await menu.getByRole('link', { name: link.name, exact: true }).click();
      } else {
        await page
          .getByRole('navigation', { name: 'Main navigation' })
          .getByRole('link', { name: link.name, exact: true })
          .click();
      }

      await expect(page).toHaveURL(new RegExp(`${link.path}(\\?|$)`));
    });
  }

  test('logo goes home', async ({ page }) => {
    await gotoHydrated(page, '/about');
    await page.getByRole('link', { name: 'Go to home page' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Welcome to GRSS VEDA' }),
    ).toBeVisible();
  });
});

test.describe('footer', () => {
  test('"Home" goes home', async ({ page }) => {
    test.skip(isMobile(page), 'covered on desktop');
    await gotoHydrated(page, '/about');
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Home', exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('page-to-page flows', () => {
  test.skip(({ isMobile: mobile }) => mobile, 'desktop flows only');

  test('home "Learn More" opens About', async ({ page }) => {
    await gotoHydrated(page, '/');
    await page.getByRole('link', { name: 'Learn More' }).click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('home "Explore Platform" opens exploration', async ({ page }) => {
    test.skip(!HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON);
    await gotoHydrated(page, '/');
    await page.getByRole('link', { name: 'Explore Platform' }).click();
    await expect(page).toHaveURL(/\/exploration/);
  });

  test('catalog card opens the dataset page', async ({ page }) => {
    await gotoHydrated(page, '/data-catalog');
    await page
      .getByRole('link', { name: /Microsoft Global Building Footprints/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/data-catalog\/ms-buildings$/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Microsoft Global Building Footprints/,
      }),
    ).toBeVisible();
  });

  test('story card opens the story', async ({ page }) => {
    test.skip(!HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON);
    await gotoHydrated(page, '/stories');
    await card(page, 'Italy: From Alps to Sea')
      .getByRole('link', { name: 'View more' })
      .click();
    await expect(page).toHaveURL(/\/stories\/italy-landscape$/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Italy: From Alps to Sea' }),
    ).toBeVisible();
  });

  test('"Explore" on a viz-app dataset opens that app', async ({ page }) => {
    await gotoHydrated(page, '/data-catalog/ms-buildings');
    await page.getByRole('link', { name: 'Explore' }).click();
    await expect(page).toHaveURL(
      /\/explore\/deckgl-vector-tiles\/ms-buildings$/,
    );
    await expect(page.locator('#ea-wrapper')).toBeVisible();
  });

  test('"Explore" on a regular dataset opens exploration', async ({ page }) => {
    test.skip(!HAS_MAPBOX_TOKEN, NO_MAPBOX_REASON);
    await gotoHydrated(page, '/data-catalog/sedac-population-density');
    await page.getByRole('link', { name: 'Explore' }).click();
    await expect(page).toHaveURL(
      /\/exploration\?search=sedac-population-density$/,
    );
    await expect(page.locator('#ea-wrapper')).toBeVisible();
  });

  test('exploration search for a viz-app dataset redirects', async ({
    page,
  }) => {
    expectKnownBug('viz-app-500', VIZ_APP_500);
    await gotoHydrated(page, '/exploration?search=ms-buildings');
    await expect(page).toHaveURL(
      /\/explore\/deckgl-vector-tiles\/ms-buildings$/,
    );
  });
});
