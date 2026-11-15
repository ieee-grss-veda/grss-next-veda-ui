import { test, type TestInfo } from '@playwright/test';

/**
 * Strict mode (`yarn e2e:strict`, E2E_STRICT=1) stops tolerating known app
 * issues, so they fail like any other bug. Normal mode keeps CI green but every
 * tolerated issue is recorded on the test as a `known-issue` annotation, shown
 * in the HTML report, the run index and the end-of-run summary.
 */
export const STRICT = process.env.E2E_STRICT === '1';

export const KNOWN_ISSUE = 'known-issue';

/** Record that a test tolerated a known, still-unfixed app problem. */
export function recordKnownIssue(
  testInfo: TestInfo,
  id: string,
  description: string,
) {
  const text = `${id}: ${description}`;
  if (testInfo.annotations.some((a) => a.description === text)) return;
  testInfo.annotations.push({ type: KNOWN_ISSUE, description: text });
}

/**
 * The test is expected to fail because of a known app bug. Playwright counts
 * an expected failure as passed (and turns it red once the bug is fixed), so
 * it is also recorded as a known issue to stay visible. In strict mode this
 * does nothing and the test fails for real.
 */
export function expectKnownBug(id: string, description: string) {
  if (STRICT) return;
  test.fail(true, description);
  recordKnownIssue(test.info(), id, description);
}
