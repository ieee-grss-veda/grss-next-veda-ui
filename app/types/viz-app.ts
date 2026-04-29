/**
 * Project-local types for the custom visualization app system.
 * Kept separate from app/types/content.ts because (a) DatasetData comes from
 * @teamimpact/veda-ui and we extend it locally, and (b) these types are
 * imported by both server and client code.
 */

import type { DatasetData } from '@lib';

/** Stable string keys for registered apps. Add to this union when registering a new app. */
export type VizKey = 'exploration' | 'deckgl-vector-tiles';

/** Whether an app shows one dataset at a time or many. */
export type AppShape = 'single' | 'multi';

/** Server-safe metadata about a registered app — no React component refs. */
export interface AppMeta {
  key: VizKey;
  shape: AppShape;
}

/** A new layer type for vector tile sources described by a TileJSON document. */
export interface VectorTilejsonLayer {
  id: string;
  name?: string;
  type: 'vector-tilejson';
  tileJsonUrl: string;
  sourceLayer?: string;
  paint?: {
    fillColor?: string;
    fillOpacity?: number;
    lineColor?: string;
    lineWidth?: number;
  };
}

/**
 * Project-local view of a dataset that may declare a `viz` field and may
 * include `vector-tilejson` layers alongside the existing layer types.
 *
 * We don't try to augment veda-ui's `DatasetData` type via declaration merging
 * because the library's exported type is a closed interface. Code that reads
 * the `viz` field or new layer types should cast/narrow through this type.
 */
export type DatasetWithViz = DatasetData & {
  viz?: VizKey | string; // tolerate strings from MDX; dispatch validates
  layers: Array<DatasetData['layers'][number] | VectorTilejsonLayer>;
};
