import { test as base, expect, type Page } from '@playwright/test';
import { STRICT, recordKnownIssue } from './known-issues';

/**
 * Third-party scripts loaded by app/layout.tsx. They are not part of this
 * app, are slow/flaky in CI, and may draw their own overlays, so every test
 * blocks them.
 */
const BLOCKED_HOSTS = [
  /cmp\.osano\.com/,
  /cookie-consent\.ieee\.org/,
  /jsd-widget\.atlassian\.com/,
];

/**
 * Console errors that are expected and not caused by this app's code:
 * external map/tile/image services and the third-party scripts blocked above.
 * These are environment noise, not app bugs, so they are never reported.
 * Keep this list short and explain every entry; anything else fails the test.
 */
export const ALLOWED_CONSOLE_ERRORS: RegExp[] = [
  // Requests we abort on purpose (BLOCKED_HOSTS) surface as failed loads.
  /net::ERR_FAILED/,
  /osano|cookie-consent\.ieee\.org|jsd-widget/i,
  // External images (Unsplash hero images, dataset covers) can 404 or time out.
  /Failed to load resource: the server responded with a status of 4\d\d/,
  // Map pages: Mapbox token, tiles, basemap style, WebGL in headless Chrome.
  /mapbox|maplibre|basemaps\.cartocdn|planetarycomputer|webgl/i,
  // STAC / raster API calls made by map blocks on dataset and story pages.
  /openveda\.cloud/i,
];

/**
 * Console errors caused by real, known app bugs. Unlike the list above, these
 * are reported (as `known-issue` annotations) every time they occur, and they
 * fail the test in strict mode. Each one is a TODO: fix it in the app, then
 * delete it here.
 */
export const KNOWN_CONSOLE_ISSUES: { id: string; re: RegExp; text: string }[] =
  [
    {
      id: 'mobile-menu-dialog-title',
      re: /`DialogContent` requires a `DialogTitle`/,
      text: 'the mobile menu Sheet (app/components/common/header.tsx) has no SheetTitle, so Radix warns the dialog has no accessible name',
    },
  ];

const TOUR_KEY = 'grss-veda-tour-completed';

export type ConsoleProblem = { type: string; text: string };

async function prepare(page: Page, problems: ConsoleProblem[]) {
  // The website tour auto-opens 500ms after load and covers the page.
  await page.addInitScript((key) => {
    try {
      window.localStorage.setItem(key, 'true');
    } catch {
      /* storage unavailable */
    }
  }, TOUR_KEY);

  await page.route(
    (url) => BLOCKED_HOSTS.some((re) => re.test(url.host)),
    (route) => route.abort(),
  );

  page.on('pageerror', (err) =>
    problems.push({ type: 'pageerror', text: `${err.name}: ${err.message}` }),
  );
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const location = msg.location()?.url ?? '';
    problems.push({
      type: 'console',
      text: `${msg.text()} ${location}`.trim(),
    });
  });
}

type Fixtures = {
  /** Errors collected so far; tests may inspect or clear them. */
  consoleProblems: ConsoleProblem[];
  /** Extra allowlist entries for a single test (e.g. map-heavy pages). */
  allowConsoleErrors: RegExp[];
};

export const test = base.extend<Fixtures>({
  allowConsoleErrors: [[], { option: true }],
  // `auto` so every test gets the instrumented page, even if it never asks
  // for consoleProblems explicitly.
  consoleProblems: [
    async ({ page, allowConsoleErrors }, use, testInfo) => {
      const problems: ConsoleProblem[] = [];
      await prepare(page, problems);
      await use(problems);

      const allow = [...ALLOWED_CONSOLE_ERRORS, ...allowConsoleErrors];
      const isKnown = (p: ConsoleProblem) =>
        KNOWN_CONSOLE_ISSUES.some((k) => k.re.test(p.text));

      // Known app bugs: tolerated but recorded, unless running strict.
      if (!STRICT) {
        for (const k of KNOWN_CONSOLE_ISSUES) {
          if (problems.some((p) => k.re.test(p.text))) {
            recordKnownIssue(testInfo, k.id, k.text);
          }
        }
      }

      const unexpected = problems.filter(
        (p) => !allow.some((re) => re.test(p.text)) && (STRICT || !isKnown(p)),
      );
      if (unexpected.length) {
        await testInfo.attach('console-errors', {
          body: unexpected.map((p) => `[${p.type}] ${p.text}`).join('\n'),
          contentType: 'text/plain',
        });
      }
      expect(
        unexpected,
        'page logged unexpected errors (see the console-errors attachment)',
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
