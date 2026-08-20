import type { AppMeta, VizKey } from 'app/types/viz-app';

/**
 * Server-safe registry metadata. Adding a new app means:
 *   1. Add the key to `VizKey` in app/types/viz-app.ts.
 *   2. Add an entry here with its `shape`.
 *   3. Register the React component in app/viz-apps/registry.tsx.
 */
export const APPS_META: Record<VizKey, AppMeta> = {
  exploration: { key: 'exploration', shape: 'multi' },
  'deckgl-vector-tiles': { key: 'deckgl-vector-tiles', shape: 'single' },
};
