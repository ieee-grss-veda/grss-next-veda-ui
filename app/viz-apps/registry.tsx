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

export const SINGLE_APP_REGISTRY: Partial<Record<VizKey, SingleAppComponent>> = {
  'deckgl-vector-tiles': DeckglVectorTilesApp,
};
