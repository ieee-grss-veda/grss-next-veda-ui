# Testing

The project has two test layers:

| Layer            | Tool                             | Where       | Run with    | What it covers                                                    |
| ---------------- | -------------------------------- | ----------- | ----------- | ----------------------------------------------------------------- |
| Unit / component | Vitest + Testing Library (jsdom) | `__test__/` | `yarn test` | Content parsing, viz-app dispatch, hooks, components in isolation |
| End-to-end       | Playwright (Chromium)            | `e2e/`      | `yarn e2e`  | Every UI page in a real browser against a production build        |

Both run in CI on every pull request (`.github/workflows/checks.yml`, jobs `test` and `e2e`).

## Running the E2E suite

```bash
npx playwright install chromium   # once per machine
yarn e2e                          # builds the app, starts it on :3100, runs all tests
yarn e2e:ui                       # interactive UI mode
```

- Playwright builds and starts the app itself (`webServer` in `playwright.config.ts`, port `3100`, so a `yarn dev` on :3000 is never reused by mistake).
- To test an app that is already running, skip the build: `E2E_BASE_URL=http://localhost:3100 yarn e2e`.
- Every run writes its own HTML report; see [E2E results](#e2e-results-every-run-is-kept) below.
- If `next build` fails with `Cannot read properties of undefined (reading 'call')` while prerendering, delete `.next/` and build again (stale build cache).

### Known issues are tolerated, but never hidden

A green run means "nothing new broke", not "no bugs". Existing app problems are tolerated so CI can stay green, and every run says so:

- Each tolerated problem is recorded as a `known-issue` annotation on the test (visible in the HTML report), and the end of every run prints a `KNOWN ISSUES` list and a `SKIPPED` list with reasons. `e2e_result/index.html` shows a "Known issues" count per run, and on GitHub Actions the same lists are written to the run's job summary.
- Accessibility pages that are not scanned show up as skipped tests with the reason, instead of being absent.
- **Strict mode** shows the true state: `yarn e2e:strict` stops tolerating known issues, so the HTTP 500, the mobile menu warning and the known axe violations fail like any other bug.

### E2E results: every run is kept

Each run (local or CI) gets its own folder under `e2e_result/` (git-ignored), named by start time, so earlier reports are never overwritten:

```
e2e_result/
  index.html                  # table of all runs: result, counts, time, branch@commit
  2026-11-13_14-05-22/
    report/index.html         # the Playwright HTML report for this run
    artifacts/                # screenshots and traces of failures
    meta.json                 # summary used by index.html
```

**Automatic opening.** When you run the suite in your own terminal and a test fails, that run's report opens in your browser by itself (`Serving HTML report at http://localhost:9323`, press `Ctrl+C` to stop the server). A passing run opens nothing. It never opens in CI, in scripts (set `E2E_OPEN_REPORT=never` there), or when run from a Claude Code session (Playwright skips auto-open there). Set `E2E_OPEN_REPORT=always|on-failure|never` to change it.

Open a run's report (the exact path is printed at the end of every run) with:

```bash
npx playwright show-report e2e_result/<run-id>/report
```

and open `e2e_result/index.html` for the list of runs. Use `show-report` rather than double-clicking the file when you need traces. In CI the folder is uploaded as the `e2e-result` artifact on every run, pass or fail. Delete old runs any time with `rm -rf e2e_result/<run-id>`.

### Mapbox token

The exploration page and the map blocks in stories/dataset pages need `NEXT_PUBLIC_MAPBOX_TOKEN` **at build time**.

- **Locally**, without it those tests are **skipped** with a message saying so (they are not silently passed). Set it in `.env.local`.
- **In CI**, a missing token **fails the run** before the app is built, so map coverage cannot be dropped unnoticed. Add the token as the `MAPBOX_TOKEN` repository secret (Settings → Secrets and variables → Actions). Pull requests from forks cannot read secrets; set `E2E_ALLOW_NO_MAPBOX=1` to run without the map tests on purpose.

## Required verification per page

Each page in `e2e/pages.ts` is checked for:

| Check                | Spec                | Details                                                                                                                                                                   |
| -------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loads without errors | `smoke.e2e.ts`      | HTTP 200, a `<title>`, and **no uncaught errors or console errors** (enforced for every test by `e2e/fixtures.ts`)                                                        |
| Key content renders  | `smoke.e2e.ts`      | The page's main heading/element and, for client-only pages, content that proves hydration (catalog cards, story cards)                                                    |
| Unknown routes       | `smoke.e2e.ts`      | Bad slugs, unknown apps and datasets return HTTP 404 with the 404 page                                                                                                    |
| Navigation and links | `navigation.e2e.ts` | Header links (desktop and the mobile menu), logo, footer, catalog card → dataset, story card → story, "Explore" → viz app or exploration, `/exploration?search=` redirect |
| Dark mode            | `theme.e2e.ts`      | Toggle sets `html.dark` and `localStorage.theme`, persists across reload and navigation, toggles back                                                                     |
| Accessibility        | `a11y.e2e.ts`       | axe (WCAG 2.1 A/AA) in light and dark mode on non-map pages; fails on new `serious`/`critical` violations                                                                 |

| Page           | Route                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Home           | `/`                                                                    |
| About          | `/about`                                                               |
| Data catalog   | `/data-catalog`                                                        |
| Dataset detail | `/data-catalog/ms-buildings`, `/data-catalog/sedac-population-density` |
| Stories hub    | `/stories`                                                             |
| Story          | `/stories/italy-landscape`, `/stories/gold-mining`                     |
| Exploration    | `/exploration`                                                         |
| Viz app        | `/explore/deckgl-vector-tiles/ms-buildings`                            |
| 404            | see `NOT_FOUND_PATHS` in `e2e/pages.ts`                                |

## What the suite does not check (yet)

It checks that pages load, render their main content, link to each other, switch theme, and have no console errors or serious accessibility violations. It does **not** check how the page looks, whether the data shown is right, or whether map layers actually draw. Planned approaches:

| Gap                | Approach                                                                                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visual correctness | Playwright `toHaveScreenshot()` baselines per page, light and dark, desktop and mobile. Mask dates and map canvases, and generate baselines in CI (Linux), because fonts and anti-aliasing differ per OS.                                                                                                                               |
| Data values        | Assert rendered values against the MDX source (catalog card count and titles equal the datasets in `app/content`, dataset info panel and legend match the dataset's metadata), plus API contract checks on the STAC/raster endpoints. Mock the endpoints with recorded fixtures (`page.route`) so tests are deterministic.              |
| Map layers draw    | Wait for the map to be idle and assert the layer exists and has rendered features (Mapbox/MapLibre: `isStyleLoaded()`, `getLayer()`, `queryRenderedFeatures()`; deck.gl: layers loaded), assert tile requests return 200, and check the canvas is not blank. Needs a Mapbox token and WebGL in CI (headless Chromium with SwiftShader). |

## Adding a page

1. Add an entry to `PAGES` in `e2e/pages.ts`: `path`, a `ready` locator for the main content, and optionally `alsoVisible`, `needsMap` (skip a11y), `needsMapbox` (skip without a token).
2. Use role-based locators (`getByRole('heading', { level: 1, name })`). The app has no `data-testid`s; add one only when no accessible name exists.
3. If the page has links to other pages, add a flow to `navigation.e2e.ts`.
4. Run `yarn e2e` and make sure it passes with no new console errors.

## What the fixtures do (`e2e/fixtures.ts`)

Every test, automatically:

- Marks the website tour as completed (`localStorage['grss-veda-tour-completed']`), otherwise it covers the page after 500 ms.
- Blocks third-party scripts from `app/layout.tsx`: Osano cookie consent, the IEEE cookie banner CSS, and the Atlassian JSD widget.
- Collects `pageerror` and console errors and fails the test on anything not in `ALLOWED_CONSOLE_ERRORS`.

## Known issues (TODO)

The suite records existing app bugs so it is green today and fails on new problems. Fix these in the app, then delete the entry:

| Issue                                                                                                                                                                                                      | Where it is recorded                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/explore/deckgl-vector-tiles/ms-buildings` returns **HTTP 500** on a direct load in production builds (`ReferenceError: window is not defined` during server render). Client-side navigation to it works. | `VIZ_APP_500` in `e2e/pages.ts` (tests marked `test.fail`, so they turn red once fixed) |
| Mobile menu `Sheet` has no `SheetTitle` (Radix "`DialogContent` requires a `DialogTitle`" warning)                                                                                                         | `KNOWN_CONSOLE_ISSUES` in `e2e/fixtures.ts`                                             |
| axe violations: `nested-interactive` (home), `button-name`, `color-contrast`, `list`, `listitem` (data catalog), `color-contrast`, `svg-img-alt` (stories), mostly from veda-ui markup                     | `KNOWN_A11Y_ISSUES` in `e2e/a11y.e2e.ts`                                                |
