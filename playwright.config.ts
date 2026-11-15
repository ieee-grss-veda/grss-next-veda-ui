import { defineConfig, devices } from '@playwright/test';

// A dedicated port so a running `yarn dev` on :3000 is never picked up by
// mistake (dev mode compiles on demand and logs dev-only console errors).
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

// Every run writes its own HTML report to e2e_result/<run-id>/report, so
// earlier runs are never overwritten. The id is stored in the environment so
// the worker processes (which load this file again) agree with the main one.
const RESULT_ROOT = 'e2e_result';
const pad = (n: number) => String(n).padStart(2, '0');
const now = new Date();
process.env.E2E_RUN_ID ??=
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
  `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const RUN_DIR = `${RESULT_ROOT}/${process.env.E2E_RUN_ID}`;

// When a run fails, open that run's HTML report in the browser. This is only
// done for interactive local runs: Playwright then serves the report until you
// press Ctrl+C, which would hang CI and scripts. Override with
// E2E_OPEN_REPORT=always|on-failure|never.
const OPEN_REPORT = (process.env.E2E_OPEN_REPORT ??
  (isCI ? 'never' : 'on-failure')) as 'always' | 'on-failure' | 'never';

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  // Screenshots, traces and videos of this run live next to its report.
  outputDir: `${RUN_DIR}/artifacts`,
  reporter: [
    [isCI ? 'github' : 'list'],
    ['html', { outputFolder: `${RUN_DIR}/report`, open: OPEN_REPORT }],
    // Writes meta.json for this run and rebuilds e2e_result/index.html.
    ['./e2e/run-index-reporter.ts', { root: RESULT_ROOT, runDir: RUN_DIR }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Mobile only re-runs the navigation spec (the hamburger menu).
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testMatch: '**/navigation.e2e.ts',
    },
  ],
  // Tests run against a production build. `npm run` is used so the command
  // works whether or not yarn is on PATH; it does not touch the lockfile.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 300_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
