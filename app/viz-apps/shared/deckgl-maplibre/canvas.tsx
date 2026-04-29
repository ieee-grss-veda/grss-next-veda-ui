'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
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

    const overlay = new MapboxOverlay({ interleaved: true, layers });
    overlayRef.current = overlay;
    map.addControl(overlay as any);

    return () => {
      overlayRef.current = null;
      mapRef.current = null;
      map.remove();
    };
    // The basemap and view state are intentionally only honored on first mount.
    // Apps that need to swap them runtime-style can remount the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push new layers into the overlay whenever they change.
  useEffect(() => {
    overlayRef.current?.setProps({ layers });
  }, [layers]);

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
