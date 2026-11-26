import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures';
import { STRICT, recordKnownIssue } from './known-issues';
import { PAGES } from './pages';

/**
 * Accessibility violations that already exist in the app, per page (by the
 * page name in e2e/pages.ts) and axe rule id. They are tolerated so the suite
 * passes today and fails on anything new, but every occurrence is recorded as
 * a `known-issue` (see e2e/known-issues.ts), and `yarn e2e:strict` fails on
 * them. Each entry is a TODO: fix it in the app (or upstream in veda-ui), then
 * delete it here.
 */
const KNOWN_A11Y_ISSUES: Record<string, Record<string, string>> = {
  home: {
    'nested-interactive':
      'Hero/CTA buttons are rendered inside links (<a><button>) in app/components/hero-section.tsx and get-started sections.',
  },
  'data catalog': {
    'button-name': 'veda-ui catalog filter control has no accessible name.',
    'color-contrast':
      'veda-ui catalog card text/pills fail contrast in light mode.',
    list: 'veda-ui .usa-card-group renders non-<li> children inside <ul>.',
    listitem: 'veda-ui catalog renders <li> outside a list.',
  },
  stories: {
    'color-contrast':
      'veda-ui story card topic pills fail contrast in light mode.',
    'svg-img-alt':
      'veda-ui .usa-icon SVGs with role="img" have no title/label.',
  },
};

// Only serious and critical violations are checked; moderate and minor ones
// are not reported at all.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

const scanned = PAGES.filter((p) => !p.needsMap && !p.knownBug);
const notScanned = PAGES.filter((p) => p.needsMap || p.knownBug);

for (const theme of ['light', 'dark'] as const) {
  test.describe(`accessibility (${theme} mode)`, () => {
    for (const spec of scanned) {
      test(spec.name, async ({ page }, testInfo) => {
        await page.addInitScript((t) => {
          window.localStorage.setItem('theme', t);
        }, theme);
        await page.goto(spec.path);
        await expect(spec.ready(page)).toBeVisible();
        for (const locator of spec.alsoVisible?.(page) ?? []) {
          await expect(locator).toBeVisible();
        }

        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const known = STRICT ? {} : (KNOWN_A11Y_ISSUES[spec.name] ?? {});
        const blockingViolations = violations.filter((v) =>
          BLOCKING_IMPACTS.has(v.impact ?? ''),
        );

        for (const v of blockingViolations) {
          if (v.id in known) {
            recordKnownIssue(
              testInfo,
              `a11y/${v.id}`,
              `${spec.name} (${theme}): ${known[v.id]}`,
            );
          }
        }

        const blocking = blockingViolations
          .filter((v) => !(v.id in known))
          .map((v) => ({
            rule: v.id,
            impact: v.impact,
            help: v.help,
            targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
          }));

        expect(blocking, 'new serious/critical axe violations').toEqual([]);
      });
    }
  });
}

// Pages that are not scanned are listed as skipped, with the reason, instead
// of silently missing from the results.
test.describe('accessibility (not scanned)', () => {
  for (const spec of notScanned) {
    test(spec.name, () => {
      test.skip(
        true,
        spec.knownBug
          ? 'not scanned: page returns HTTP 500 on direct load (known bug)'
          : 'not scanned: page renders a map (WebGL canvas), covered by no accessibility check yet',
      );
    });
  }
});
