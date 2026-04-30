'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { Layer } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { InitialViewState } from './use-tile-json';

const DEFAULT_BASEMAP_STYLE: string =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const DEFAULT_VIEW: InitialViewState = { longitude: 0, latitude: 0, zoom: 1 };

export interface DeckglMaplibreCanvasProps {
  /** deck.gl layers to render on top of the basemap. */
  layers: Layer[];
  /** Optional initial view state. Defaults to a world view. */
  initialViewState?: InitialViewState;
  /** Optional MapLibre style URL or object. */
  basemapStyle?: string | StyleSpecification;
  /** Optional content rendered absolutely-positioned on top of the canvas. */
  overlayChildren?: ReactNode;
  /** Loading and error states the canvas should display. */
  status?: { loading?: boolean; error?: string };
}

export function DeckglMaplibreCanvas({
  layers,
  initialViewState = DEFAULT_VIEW,
  basemapStyle = DEFAULT_BASEMAP_STYLE,
  overlayChildren,
  status,
}: DeckglMaplibreCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  // Track whether we've already applied an explicit initial view, so a later
  // resolution (e.g. TileJSON bounds arriving after mount) can still reframe
  // the map exactly once without clobbering user pan/zoom thereafter.
  const initialViewAppliedRef = useRef(false);

  // Once the basemap style has loaded, this holds the id of the first symbol
  // (label) layer so deck.gl content can be inserted *below* labels via
  // `beforeId`. Stays undefined if the basemap has no symbol layers.
  const [labelsBeforeId, setLabelsBeforeId] = useState<string | undefined>(
    undefined,
  );

  // Mount MapLibre + deck.gl overlay once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: basemapStyle as any,
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
    });
    mapRef.current = map;
    initialViewAppliedRef.current = initialViewState !== DEFAULT_VIEW;

    const overlay = new MapboxOverlay({ interleaved: true, layers });
    overlayRef.current = overlay;
    map.addControl(overlay as any);

    // Once the style is ready, find the first symbol layer so deck.gl content
    // can be inserted under labels (place names, road labels, etc.).
    map.on('load', () => {
      const style = map.getStyle();
      const firstSymbol = style?.layers?.find(
        (l: any) => l.type === 'symbol',
      ) as { id: string } | undefined;
      if (firstSymbol) setLabelsBeforeId(firstSymbol.id);
    });

    return () => {
      overlayRef.current = null;
      mapRef.current = null;
      initialViewAppliedRef.current = false;
      map.remove();
    };
    // The basemap is intentionally only honored on first mount.
    // The initialViewState's "first real value" is applied via the next effect
    // because it commonly arrives async (e.g. after a TileJSON fetch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply the first non-default initialViewState that arrives after mount.
  useEffect(() => {
    if (initialViewAppliedRef.current) return;
    if (initialViewState === DEFAULT_VIEW) return;
    const map = mapRef.current;
    if (!map) return;
    map.jumpTo({
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
    });
    initialViewAppliedRef.current = true;
  }, [initialViewState]);

  // Push new layers into the overlay whenever they (or the resolved labels
  // anchor) change. When `labelsBeforeId` is set, clone each layer with that
  // `beforeId` so MapLibre keeps labels rendered above the deck.gl content.
  useEffect(() => {
    if (!overlayRef.current) return;
    const finalLayers = labelsBeforeId
      ? layers.map((l) =>
          typeof (l as any)?.clone === 'function'
            ? (l as any).clone({ beforeId: labelsBeforeId })
            : l,
        )
      : layers;
    overlayRef.current.setProps({ layers: finalLayers });
  }, [layers, labelsBeforeId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {overlayChildren ? (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {overlayChildren}
        </div>
      ) : null}
      {status?.error ? (
        <div
          role='alert'
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #c00',
            color: '#900',
            borderRadius: 4,
            fontSize: 13,
            maxWidth: 360,
          }}
        >
          {status.error}
        </div>
      ) : null}
      {status?.loading ? (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 8px',
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Loading…
        </div>
      ) : null}
    </div>
  );
}
