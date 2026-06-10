import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mvtCtorMock = vi.fn();
vi.mock('@deck.gl/geo-layers', () => {
  class MockMVTLayer {
    constructor(public props: any) {
      mvtCtorMock(props);
    }
  }
  return { MVTLayer: MockMVTLayer };
});

// Minimal mock so the canvas mounts without a real maplibre / deck.gl.
vi.mock('maplibre-gl', () => {
  class MockMap {
    constructor(public opts: any) {}
    addControl = vi.fn();
    on = vi.fn();
    remove = vi.fn();
    jumpTo = vi.fn();
  }
  return { default: { Map: MockMap }, Map: MockMap };
});
vi.mock('@deck.gl/mapbox', () => {
  class MockOverlay {
    constructor(public opts: any) {}
    setProps = vi.fn();
    onAdd() {}
    onRemove() {}
  }
  return { MapboxOverlay: MockOverlay };
});

import { DeckglVectorTilesApp } from '../../app/viz-apps/deckgl-vector-tiles/app';

describe('DeckglVectorTilesApp', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    mvtCtorMock.mockClear();
    originalFetch = globalThis.fetch;
  });

  function fakeTileJson(overrides: Record<string, unknown> = {}) {
    return {
      tilejson: '3.0.0',
      tiles: ['https://t.example/{z}/{x}/{y}.pbf'],
      bounds: [-180, -85, 180, 85],
      minzoom: 0,
      maxzoom: 14,
      vector_layers: [{ id: 'footprints' }],
      ...overrides,
    };
  }

  test('builds one MVTLayer per vector-tilejson dataset layer', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(fakeTileJson()), { status: 200 })) as any;
    const dataset: any = {
      id: 'ms-buildings',
      name: 'Microsoft Buildings',
      layers: [
        {
          id: 'a',
          type: 'vector-tilejson',
          tileJsonUrl: 'https://t.example/a.json',
          paint: { fillColor: '#ff7e29', fillOpacity: 0.6 },
        },
        {
          id: 'b',
          type: 'vector-tilejson',
          tileJsonUrl: 'https://t.example/b.json',
        },
      ],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);

    await waitFor(() => expect(mvtCtorMock).toHaveBeenCalledTimes(2));
    expect(mvtCtorMock.mock.calls[0][0]).toMatchObject({
      data: ['https://t.example/{z}/{x}/{y}.pbf'],
      minZoom: 0,
      maxZoom: 14,
    });

    globalThis.fetch = originalFetch;
  });

  test('uses the configured sourceLayer; falls back to first vector_layer if absent', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(fakeTileJson({ vector_layers: [{ id: 'first' }, { id: 'second' }] })), {
        status: 200,
      }),
    ) as any;

    const dataset: any = {
      id: 'd',
      name: 'D',
      layers: [
        { id: 'a', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/a.json' },
        { id: 'b', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/b.json', sourceLayer: 'second' },
      ],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);

    await waitFor(() => expect(mvtCtorMock).toHaveBeenCalledTimes(2));
    // Both MVTLayers were constructed; the explicit sourceLayer flows through.
    const calls = mvtCtorMock.mock.calls.map((c) => c[0].sourceLayer);
    expect(calls).toContain('first');
    expect(calls).toContain('second');

    globalThis.fetch = originalFetch;
  });

  test('skips non-vector-tilejson layers', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(fakeTileJson()), { status: 200 })) as any;
    const dataset: any = {
      id: 'd',
      name: 'D',
      layers: [
        { id: 'r', type: 'raster', tileApiEndpoint: 'https://x' },
        { id: 'a', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/a.json' },
      ],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);
    await waitFor(() => expect(mvtCtorMock).toHaveBeenCalledTimes(1));

    globalThis.fetch = originalFetch;
  });

  test('renders the dataset info panel with name and description', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(fakeTileJson()), { status: 200 })) as any;
    const dataset: any = {
      id: 'd',
      name: 'Pretty Name',
      description: 'Pretty description',
      layers: [{ id: 'a', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/a.json' }],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);
    expect(screen.getByText('Pretty Name').textContent).toBe('Pretty Name');
    expect(screen.getByText('Pretty description').textContent).toBe('Pretty description');

    globalThis.fetch = originalFetch;
  });

  test('surfaces tile-fetch errors via the canvas error UI', async () => {
    globalThis.fetch = vi.fn(async () => new Response('nope', { status: 500 })) as any;
    const dataset: any = {
      id: 'd',
      name: 'D',
      layers: [{ id: 'a', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/a.json' }],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toMatch(/TileJSON request failed/);
    });

    globalThis.fetch = originalFetch;
  });

  test('renders a switch per layer and hides the layer from canvas output when toggled off', async () => {
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify(fakeTileJson()), { status: 200 })) as any;
    const dataset: any = {
      id: 'd',
      name: 'D',
      layers: [
        { id: 'a', name: 'Layer A', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/a.json' },
        { id: 'b', name: 'Layer B', type: 'vector-tilejson', tileJsonUrl: 'https://t.example/b.json' },
      ],
    };

    render(<DeckglVectorTilesApp dataset={dataset} />);

    // Both layer switches render with their names.
    const switchA = screen.getByRole('switch', { name: 'Layer A' });
    const switchB = screen.getByRole('switch', { name: 'Layer B' });
    expect(switchA.getAttribute('data-state')).toBe('checked');
    expect(switchB.getAttribute('data-state')).toBe('checked');

    // Once tile fetches resolve, both MVTLayers built.
    await waitFor(() => expect(mvtCtorMock).toHaveBeenCalledTimes(2));

    // Toggle Layer A off.
    fireEvent.click(switchA);
    await waitFor(() =>
      expect(
        screen.getByRole('switch', { name: 'Layer A' }).getAttribute('data-state'),
      ).toBe('unchecked'),
    );

    globalThis.fetch = originalFetch;
  });
});
