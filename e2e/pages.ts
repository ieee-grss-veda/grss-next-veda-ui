import type { Locator, Page } from '@playwright/test';

/**
 * Every UI page the suite verifies. Add new routes here and the smoke and
 * a11y specs pick them up automatically. See docs/TESTING.md.
 */
/** A known app bug: `id` groups it in the run summary, `text` describes it. */
export type KnownBug = { id: string; text: string };

export type PageSpec = {
  name: string;
  path: string;
  /** The element that proves the page's main content rendered. */
  ready: (page: Page) => Locator;
  /** Extra elements that must also be visible. */
  alsoVisible?: (page: Page) => Locator[];
  /** Renders a map (Mapbox/MapLibre/deck.gl): skipped by the a11y scan. */
  needsMap?: boolean;
  /** Needs NEXT_PUBLIC_MAPBOX_TOKEN at build time; skipped without it. */
  needsMapbox?: boolean;
  /**
   * A known app bug that currently breaks this page. The smoke test is
   * marked `test.fail()` so CI stays green and turns red once it is fixed:
   * then delete this field.
   */
  knownBug?: KnownBug;
};

const h1 = (name: string | RegExp) => (page: Page) =>
  page.getByRole('heading', {
    level: 1,
    name,
    exact: typeof name === 'string',
  });

/** A hub card is an <article> with an h3 title and a "View more" link. */
export const card = (page: Page, title: string | RegExp) =>
  page.getByRole('article').filter({
    has: page.getByRole('heading', { level: 3, name: title }),
  });

export const VIZ_APP_500: KnownBug = {
  id: 'viz-app-500',
  text: 'GET /explore/deckgl-vector-tiles/ms-buildings returns HTTP 500 in production builds: "ReferenceError: window is not defined" during server render (a browser-only module is imported on the server).',
};

export const PAGES: PageSpec[] = [
  {
    name: 'home',
    path: '/',
    ready: h1('Welcome to GRSS VEDA'),
    alsoVisible: (page) => [
      page.locator('#stories-heading'),
      page.getByRole('link', { name: 'Explore Platform' }),
    ],
  },
  {
    name: 'about',
    path: '/about',
    ready: h1('About GRSS VEDA'),
  },
  {
    name: 'data catalog',
    path: '/data-catalog',
    ready: h1('Data Catalog'),
    // The catalog grid is client-only; this proves it hydrated.
    alsoVisible: (page) => [
      page
        .getByRole('link', { name: /Microsoft Global Building Footprints/ })
        .first(),
    ],
  },
  {
    name: 'dataset: ms-buildings',
    path: '/data-catalog/ms-buildings',
    ready: h1(/Microsoft Global Building Footprints/),
    alsoVisible: (page) => [page.getByRole('link', { name: 'Explore' })],
  },
  {
    name: 'dataset: sedac-population-density',
    path: '/data-catalog/sedac-population-density',
    ready: (page) => page.getByRole('heading', { level: 1 }).first(),
    alsoVisible: (page) => [page.getByRole('link', { name: 'Explore' })],
    needsMap: true,
    needsMapbox: true,
  },
  {
    name: 'stories',
    path: '/stories',
    ready: h1('Stories'),
    // The hub is client-only; these prove it hydrated.
    alsoVisible: (page) => [
      card(page, 'Italy: From Alps to Sea'),
      card(page, 'How Gold Mines Alter Local Environments'),
    ],
  },
  {
    name: 'story: italy-landscape',
    path: '/stories/italy-landscape',
    ready: h1('Italy: From Alps to Sea'),
    needsMap: true,
    needsMapbox: true,
  },
  {
    name: 'story: gold-mining',
    path: '/stories/gold-mining',
    ready: h1('How Gold Mines Alter Local Environments'),
    needsMap: true,
    needsMapbox: true,
  },
  {
    name: 'exploration',
    path: '/exploration',
    ready: (page) => page.locator('#ea-wrapper'),
    needsMap: true,
    needsMapbox: true,
  },
  {
    name: 'viz app: deckgl-vector-tiles / ms-buildings',
    path: '/explore/deckgl-vector-tiles/ms-buildings',
    ready: (page) =>
      page.getByRole('heading', {
        name: 'Microsoft Global Building Footprints',
      }),
    alsoVisible: (page) => [page.locator('#ea-wrapper')],
    needsMap: true,
    knownBug: VIZ_APP_500,
  },
];

/** Routes that must render the 404 page with HTTP 404. */
export const NOT_FOUND_PATHS = [
  '/this-page-does-not-exist',
  '/data-catalog/not-a-dataset',
  // The URL uses the file name (gold-mining), not the MDX id (gold-mine).
  '/stories/gold-mine',
  '/explore/not-an-app/ms-buildings',
  // `exploration` is a multi-dataset app and is not served under /explore.
  '/explore/exploration/ms-buildings',
  '/explore/deckgl-vector-tiles/not-a-dataset',
];
