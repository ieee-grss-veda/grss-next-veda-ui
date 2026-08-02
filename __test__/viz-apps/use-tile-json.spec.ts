import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTileJson } from '../../app/viz-apps/shared/deckgl-maplibre/use-tile-json';

describe('useTileJson', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('returns parsed data and a derived initial view from bounds', async () => {
    const tilejson = {
      tilejson: '3.0.0',
      tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
      bounds: [-10, -5, 10, 5] as [number, number, number, number],
      minzoom: 0,
      maxzoom: 14,
      vector_layers: [{ id: 'footprints' }],
    };
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(tilejson), { status: 200 })) as any;

    const { result } = renderHook(() => useTileJson('https://example.com/tilejson.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeUndefined();
    expect(result.current.data?.tiles).toEqual(tilejson.tiles);
    expect(result.current.initialViewState).toBeDefined();
    expect(result.current.initialViewState!.longitude).toBe(0); // midpoint of [-10, 10]
    expect(result.current.initialViewState!.latitude).toBe(0);  // midpoint of [-5, 5]
  });

  test('sets error when fetch returns non-OK', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Not Found', { status: 404 })) as any;

    const { result } = renderHook(() => useTileJson('https://example.com/missing.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  test('sets error when fetch rejects', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as any;

    const { result } = renderHook(() => useTileJson('https://example.com/tilejson.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('network down');
  });

  test('returns initialViewState undefined when tilejson has no bounds', async () => {
    const tilejson = {
      tilejson: '3.0.0',
      tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
      vector_layers: [{ id: 'footprints' }],
    };
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(tilejson), { status: 200 })) as any;

    const { result } = renderHook(() => useTileJson('https://example.com/tilejson.json'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.initialViewState).toBeUndefined();
  });
});
