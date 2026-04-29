import { APPS_META } from './apps-meta';
import type { VizKey } from 'app/types/viz-app';

/**
 * Decide whether a click on /exploration?search=<id> should redirect to a
 * custom viz app. Returns the destination path or `null` if no redirect.
 *
 * Lenient: unknown `viz` keys fall through to exploration (with the caller
 * free to log a warning) rather than 4xx-ing the user. See the spec's
 * "Open assumptions" for the rationale.
 */
export function resolveVizTarget(
  viz: string | undefined,
  datasetId: string,
): string | null {
  if (!viz) return null;
  const meta = (APPS_META as Record<string, { key: VizKey; shape: 'single' | 'multi' } | undefined>)[viz];
  if (!meta) return null;
  if (meta.shape !== 'single') return null;
  return `/explore/${meta.key}/${datasetId}`;
}
