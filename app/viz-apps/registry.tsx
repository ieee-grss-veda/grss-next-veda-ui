'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { VizKey, DatasetWithViz } from 'app/types/viz-app';

/**
 * Single-dataset apps receive one resolved dataset.
 * Multi-dataset apps own their own routing (today only exploration at /exploration)
 * and are not loaded through this registry from /explore/[app]/[dataset].
 */
export type SingleAppComponent = ComponentType<{ dataset: DatasetWithViz }>;

const DeckglVectorTilesApp = dynamic(
  () =>
    import('app/viz-apps/deckgl-vector-tiles/app').then(
      (m) => m.DeckglVectorTilesApp,
    ),
  { ssr: false, loading: () => <p className='p-8 text-center'>Loading…</p> },
) as SingleAppComponent;

const SINGLE_APP_REGISTRY: Partial<Record<VizKey, SingleAppComponent>> = {
  'deckgl-vector-tiles': DeckglVectorTilesApp,
};

/**
 * Client-side dispatcher: takes a viz key and a resolved dataset, looks up the
 * registered component, and renders it. Server components import this single
 * client component instead of reaching into the registry directly — that
 * keeps the React Server Components bundler happy (it can't trace component
 * references that flow through a runtime object lookup from a server file).
 */
export function VizAppRenderer({
  vizKey,
  dataset,
}: {
  vizKey: VizKey;
  dataset: DatasetWithViz;
}) {
  const Component = SINGLE_APP_REGISTRY[vizKey];
  if (!Component) return null;
  return <Component dataset={dataset} />;
}
