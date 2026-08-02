import { describe, expect, test } from 'vitest';
import { resolveVizTarget } from '../../app/viz-apps/dispatch';

describe('resolveVizTarget', () => {
  test('returns null when viz is undefined', () => {
    expect(resolveVizTarget(undefined, 'ds-1')).toBeNull();
  });

  test('returns null when viz is empty string', () => {
    expect(resolveVizTarget('', 'ds-1')).toBeNull();
  });

  test('returns null for the default exploration app', () => {
    expect(resolveVizTarget('exploration', 'ds-1')).toBeNull();
  });

  test('returns null for a registered multi-dataset app', () => {
    // exploration is the only multi app today; this asserts shape behavior, not the key.
    expect(resolveVizTarget('exploration', 'ds-1')).toBeNull();
  });

  test('returns null for an unknown viz key (lenient fallback)', () => {
    expect(resolveVizTarget('not-a-real-app', 'ds-1')).toBeNull();
  });

  test('returns redirect target for a registered single-dataset app', () => {
    expect(resolveVizTarget('deckgl-vector-tiles', 'ms-buildings')).toBe(
      '/explore/deckgl-vector-tiles/ms-buildings',
    );
  });
});
