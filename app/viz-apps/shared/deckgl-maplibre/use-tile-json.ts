import { useEffect, useState } from 'react';

export interface TileJsonResponse {
  tilejson?: string;
  tiles: string[];
  bounds?: [number, number, number, number];
  minzoom?: number;
  maxzoom?: number;
  vector_layers?: Array<{ id: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface InitialViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface UseTileJsonResult {
  data?: TileJsonResponse;
  initialViewState?: InitialViewState;
  loading: boolean;
  error?: string;
}

function deriveViewFromBounds(
  bounds: [number, number, number, number],
): InitialViewState {
  const [west, south, east, north] = bounds;
  const longitude = (west + east) / 2;
  const latitude = (south + north) / 2;
  // Crude zoom heuristic: pick a zoom that roughly fits the longitude span on
  // a typical viewport. Apps that need precise framing can fitBounds in their
  // own effect after first render.
  const span = Math.max(Math.abs(east - west), Math.abs(north - south));
  const zoom =
    span >= 180 ? 1
    : span >= 90 ? 2
    : span >= 45 ? 3
    : span >= 20 ? 4
    : span >= 10 ? 5
    : span >= 5  ? 6
    : span >= 1  ? 8
    : 10;
  return { longitude, latitude, zoom };
}

export function useTileJson(url: string): UseTileJsonResult {
  const [state, setState] = useState<UseTileJsonResult>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setState({ loading: true });

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`TileJSON request failed (${res.status})`);
        }
        const data = (await res.json()) as TileJsonResponse;
        if (cancelled) return;
        const initialViewState = data.bounds
          ? deriveViewFromBounds(data.bounds)
          : undefined;
        setState({ loading: false, data, initialViewState });
      } catch (err) {
        if (cancelled) return;
        // Aborts are expected on unmount/url-change; don't surface as errors.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url]);

  return state;
}
