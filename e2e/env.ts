import { loadEnvConfig } from '@next/env';

// Same env files `next build` reads. NEXT_PUBLIC_* values are inlined at
// build time, so this mirrors what the app under test was built with
// (assuming the build ran in this checkout with the same env).
loadEnvConfig(process.cwd());

/** Mapbox-based pages (VEDA-UI exploration and story/dataset map blocks)
 * cannot render without a token. Locally their tests are skipped when it is
 * missing; in CI a missing token fails the run (see below). */
export const HAS_MAPBOX_TOKEN = Boolean(
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim(),
);

export const NO_MAPBOX_REASON =
  'NEXT_PUBLIC_MAPBOX_TOKEN is not set (in .env.local, or as the NEXT_PUBLIC_MAPBOX_TOKEN secret in CI), so Mapbox pages cannot render';

// In CI a missing token must not silently drop the map coverage: fail the run
// before the app is built. Set E2E_ALLOW_NO_MAPBOX=1 to opt out on purpose
// (for example for pull requests from forks, which cannot read secrets).
if (
  process.env.CI &&
  !HAS_MAPBOX_TOKEN &&
  process.env.E2E_ALLOW_NO_MAPBOX !== '1'
) {
  throw new Error(
    'NEXT_PUBLIC_MAPBOX_TOKEN is empty in CI, so every Mapbox page test would ' +
      'be skipped. Add the NEXT_PUBLIC_MAPBOX_TOKEN repository secret ' +
      '(Settings > Secrets and variables > Actions), or set ' +
      'E2E_ALLOW_NO_MAPBOX=1 to skip those tests on purpose.',
  );
}
