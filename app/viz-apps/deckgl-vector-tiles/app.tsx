'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MVTLayer } from '@deck.gl/geo-layers';
import {
  DeckglMaplibreCanvas,
  useTileJson,
  type InitialViewState,
} from 'app/viz-apps/shared/deckgl-maplibre';
import { DatasetInfoPanel } from './dataset-info-panel';
import { LayerTogglesPanel } from './layer-toggles-panel';
import type { VectorTilejsonLayer, DatasetWithViz } from 'app/types/viz-app';

interface DeckglVectorTilesAppProps {
  dataset: DatasetWithViz;
}

function isVectorTilejsonLayer(layer: any): layer is VectorTilejsonLayer {
  return (
    layer && layer.type === 'vector-tilejson' && typeof layer.tileJsonUrl === 'string'
  );
}

function parseHexColor(hex?: string): [number, number, number] | undefined {
  if (!hex) return undefined;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return undefined;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

interface LoaderProps {
  layer: VectorTilejsonLayer;
  onResolved: (id: string, mvt: any, viewState: InitialViewState | undefined) => void;
  onError: (msg: string) => void;
}

/**
 * Headless loader: fetches one TileJSON, builds one MVTLayer, and reports it
 * back via callback. Renders nothing.
 *
 * Callbacks are captured in refs so a parent re-render that produces new
 * function identities does not retrigger the build effect.
 */
function VectorTilejsonLayerLoader({ layer, onResolved, onError }: LoaderProps) {
  const { data, initialViewState, error } = useTileJson(layer.tileJsonUrl);

  const onResolvedRef = useRef(onResolved);
  const onErrorRef = useRef(onError);
  onResolvedRef.current = onResolved;
  onErrorRef.current = onError;

  useEffect(() => {
    if (error) {
      onErrorRef.current(error);
      return;
    }
    if (!data) return;
    const sourceLayer =
      layer.sourceLayer ?? data.vector_layers?.[0]?.id ?? undefined;
    const fillColor = parseHexColor(layer.paint?.fillColor) ?? [255, 126, 41];
    const fillOpacity = layer.paint?.fillOpacity ?? 1;
    const lineColor = parseHexColor(layer.paint?.lineColor) ?? [0, 0, 0];
    const lineWidth = layer.paint?.lineWidth ?? 0;

    const mvt = new MVTLayer({
      id: `vector-tilejson-${layer.id}`,
      data: data.tiles,
      minZoom: data.minzoom,
      maxZoom: data.maxzoom,
      sourceLayer,
      getFillColor: [
        fillColor[0],
        fillColor[1],
        fillColor[2],
        Math.round(fillOpacity * 255),
      ],
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      // Interpret stroke width in pixels (default is meters, which goes
      // sub-pixel at low zooms). Floor at 1 px so outlines stay visible.
      lineWidthUnits: 'pixels',
      lineWidthMinPixels: 1,
      pickable: false,
    } as any);

    onResolvedRef.current(layer.id, mvt, initialViewState);
  }, [data, error, initialViewState, layer]);

  return null;
}

export function DeckglVectorTilesApp({ dataset }: DeckglVectorTilesAppProps) {
  const vectorLayers = useMemo<VectorTilejsonLayer[]>(
    () =>
      ((dataset.layers ?? []) as any[]).filter(
        isVectorTilejsonLayer,
      ) as VectorTilejsonLayer[],
    [dataset.layers],
  );

  const [resolvedLayers, setResolvedLayers] = useState<Record<string, any>>({});
  const [firstViewState, setFirstViewState] = useState<InitialViewState | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  // Initialize visibility=true for each new layer (preserve user-toggled state).
  useEffect(() => {
    setVisibility((prev) => {
      let changed = false;
      const next = { ...prev };
      vectorLayers.forEach((l) => {
        if (next[l.id] === undefined) {
          next[l.id] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [vectorLayers]);

  const handleResolved = useCallback(
    (id: string, mvt: any, viewState: InitialViewState | undefined) => {
      setResolvedLayers((prev) => ({ ...prev, [id]: mvt }));
      setFirstViewState((prev) => prev ?? viewState);
    },
    [],
  );

  const handleError = useCallback((msg: string) => {
    setErrorMsg((prev) => prev ?? msg);
  }, []);

  const handleToggle = useCallback((id: string, next: boolean) => {
    setVisibility((prev) => ({ ...prev, [id]: next }));
  }, []);

  const layersArray = useMemo(
    () =>
      vectorLayers
        .filter((l) => visibility[l.id] !== false)
        .map((l) => resolvedLayers[l.id])
        .filter(Boolean),
    [vectorLayers, resolvedLayers, visibility],
  );

  const toggleItems = useMemo(
    () => vectorLayers.map((l) => ({ id: l.id, label: l.name ?? l.id })),
    [vectorLayers],
  );

  return (
    <>
      {vectorLayers.map((l) => (
        <VectorTilejsonLayerLoader
          key={l.id}
          layer={l}
          onResolved={handleResolved}
          onError={handleError}
        />
      ))}
      <DeckglMaplibreCanvas
        layers={layersArray}
        initialViewState={firstViewState}
        status={{ error: errorMsg }}
        overlayChildren={
          <>
            <DatasetInfoPanel
              name={dataset.name}
              description={dataset.description}
            />
            <LayerTogglesPanel
              layers={toggleItems}
              visibility={visibility}
              onToggle={handleToggle}
            />
          </>
        }
      />
    </>
  );
}
