import { loadEnvConfig } from '@next/env';

// Same env files `next build` reads. NEXT_PUBLIC_* values are inlined at
// build time, so this mirrors what the app under test was built with
// (assuming the build ran in this checkout with the same env).
loadEnvConfig(process.cwd());

/** Mapbox-based pages (VEDA-UI exploration and story/dataset map blocks)
 * cannot render without a token; their tests are skipped when it is missing. */
export const HAS_MAPBOX_TOKEN = Boolean(
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim(),
);

export const NO_MAPBOX_REASON =
  'NEXT_PUBLIC_MAPBOX_TOKEN is not set (in .env.local, or as the MAPBOX_TOKEN secret in CI), so Mapbox pages cannot render';
