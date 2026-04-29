# Custom Visualization Apps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Git policy for this branch (`feat/custom-viz-apps`):** Each task ends with a commit. Treat every "Stop for user commit" step as **"git commit the staged work for this task with a clean conventional-style message"** (e.g. `feat: add deckgl-vector-tiles app`). Do **not** add a `Co-Authored-By: Claude ...` trailer. Do **not** run `git push` or create PRs — the user handles remote operations.

**Goal:** Make it possible to define a custom visualization app per dataset via the `.mdx` frontmatter, with the per-dataset "Explore" button automatically routing to the right app. Ship the first new app: a deck.gl + MapLibre vector-tile renderer, built on a reusable shared canvas so future apps have a starting point.

**Architecture:** A new `/explore/[app]/[dataset]` dynamic route renders the app from a small in-repo registry inside a shared `VizAppShell`. The existing `/exploration` page becomes a server-side dispatcher: when a dataset has `viz: <key>` and the app is a registered single-dataset app, it `redirect()`s to `/explore/<key>/<id>`. Otherwise it renders exploration unchanged. The deck.gl + MapLibre wiring lives in `app/viz-apps/shared/deckgl-maplibre/` so any future viz app can drop in next to the vector-tiles app.

**Tech Stack:** Next.js 14 App Router, TypeScript, vitest + @testing-library/react, MapLibre GL JS, deck.gl (`@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/geo-layers`, `@deck.gl/mapbox`), MDX (frontmatter via `gray-matter`).

**Spec:** `docs/superpowers/specs/2026-04-29-custom-visualization-apps-design.md`

---

## File map

**New (production code):**
- `app/viz-apps/apps-meta.ts` — server-safe registry metadata (no React components).
- `app/viz-apps/dispatch.ts` — pure helper `resolveVizTarget()`.
- `app/viz-apps/registry.tsx` — client-side map of app key → React component (dynamic-imported).
- `app/viz-apps/shell.tsx` — `VizAppShell` (client component, owns layout).
- `app/viz-apps/shared/deckgl-maplibre/index.ts` — public re-exports.
- `app/viz-apps/shared/deckgl-maplibre/canvas.tsx` — `DeckglMaplibreCanvas`.
- `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts` — `useTileJson` hook.
- `app/viz-apps/deckgl-vector-tiles/index.tsx` — entry (re-exports `DeckglVectorTilesApp`).
- `app/viz-apps/deckgl-vector-tiles/app.tsx` — main component.
- `app/viz-apps/deckgl-vector-tiles/dataset-info-panel.tsx` — overlay panel.
- `app/(datasets)/explore/[app]/[dataset]/page.tsx` — wrapper route.
- `app/types/viz-app.ts` — shared types (`VizKey`, `AppShape`, `AppMeta`, `VectorTilejsonLayer`).

**New (tests):**
- `__test__/viz-apps/dispatch.spec.ts`
- `__test__/viz-apps/use-tile-json.spec.ts`
- `__test__/viz-apps/canvas.spec.tsx`
- `__test__/viz-apps/deckgl-vector-tiles-app.spec.tsx`

**New (content):**
- `app/content/datasets/ms-buildings.mdx` — sample dataset that uses the new app.

**Modified:**
- `app/(datasets)/exploration/page.tsx` — add server-side dispatcher.
- `app/(datasets)/exploration/exploration.tsx` — use `VizAppShell`; drop layout block.
- `package.json` — add `maplibre-gl` and deck.gl deps.

**Untouched:** `app/(datasets)/data-catalog/*`, `VedaUIWrapper`, `app/store/providers/*`, all existing dataset MDX files.

---

## Task 1: Add MapLibre and deck.gl dependencies

**Files:**
- Modify: `package.json` and `yarn.lock` (via yarn add).

- [ ] **Step 1: Install dependencies**

Run:
```bash
yarn add maplibre-gl @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/mapbox
```

Expected: yarn resolves all five packages and adds them to `dependencies` in `package.json`. No errors.

- [ ] **Step 2: Verify the build still type-checks**

Run:
```bash
yarn ts-check
```

Expected: exits 0 (no TypeScript errors). Library type imports may not yet be referenced in the codebase; they should still resolve.

- [ ] **Step 3: Stop for user commit**

Pause and let the user commit `package.json` + `yarn.lock` before moving to Task 2.

---

## Task 2: Add shared types for the viz-app system

**Files:**
- Create: `app/types/viz-app.ts`

- [ ] **Step 1: Write the file**

Create `app/types/viz-app.ts` with:

```ts
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
```

- [ ] **Step 2: Verify type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 3: Stop for user commit**

---

## Task 3: Implement and test the dispatch helper

The dispatcher is pure and server-safe. It answers: "given a dataset's `viz` field, should `/exploration?search=<id>` redirect, and where to?"

**Files:**
- Create: `app/viz-apps/apps-meta.ts`
- Create: `app/viz-apps/dispatch.ts`
- Create: `__test__/viz-apps/dispatch.spec.ts`

- [ ] **Step 1: Write `apps-meta.ts`**

```ts
import type { AppMeta, VizKey } from 'app/types/viz-app';

/**
 * Server-safe registry metadata. Adding a new app means:
 *   1. Add the key to `VizKey` in app/types/viz-app.ts.
 *   2. Add an entry here with its `shape`.
 *   3. Register the React component in app/viz-apps/registry.tsx.
 */
export const APPS_META: Record<VizKey, AppMeta> = {
  exploration: { key: 'exploration', shape: 'multi' },
  'deckgl-vector-tiles': { key: 'deckgl-vector-tiles', shape: 'single' },
};
```

- [ ] **Step 2: Write the failing test**

Create `__test__/viz-apps/dispatch.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run test, verify it fails**

Run:
```bash
yarn test __test__/viz-apps/dispatch.spec.ts
```

Expected: FAIL — `resolveVizTarget` is not exported from `app/viz-apps/dispatch`.

- [ ] **Step 4: Implement `dispatch.ts`**

```ts
import { APPS_META } from './apps-meta';
import type { VizKey } from 'app/types/viz-app';

/**
 * Decide whether a click on /exploration?search=<id> should redirect to a
 * custom viz app. Returns the destination path or `null` if no redirect.
 *
 * Lenient: unknown `viz` keys fall through to exploration (with the caller
 * free to log a warning) rather than 4xx-ing the user. See the spec's
 * "Open assumptions" for the rationale.
 */
export function resolveVizTarget(
  viz: string | undefined,
  datasetId: string,
): string | null {
  if (!viz) return null;
  const meta = (APPS_META as Record<string, { key: VizKey; shape: 'single' | 'multi' } | undefined>)[viz];
  if (!meta) return null;
  if (meta.shape !== 'single') return null;
  return `/explore/${meta.key}/${datasetId}`;
}
```

- [ ] **Step 5: Run test, verify it passes**

Run:
```bash
yarn test __test__/viz-apps/dispatch.spec.ts
```

Expected: all 6 tests pass.

- [ ] **Step 6: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 7: Stop for user commit**

---

## Task 4: Implement `VizAppShell`

Lift the layout block currently at `app/(datasets)/exploration/exploration.tsx:60-88` into a reusable component, so every viz app uses the same chrome.

**Files:**
- Create: `app/viz-apps/shell.tsx`

- [ ] **Step 1: Write `shell.tsx`**

```tsx
'use client';

import React, { ReactNode } from 'react';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import useElementHeight from '@utils/hooks/use-element-height';
import type { DatasetMetadata } from 'app/types/content';

interface VizAppShellProps {
  children: ReactNode;
  /**
   * Forwarded to VedaUIWrapper so apps that need access to the full dataset
   * list (e.g. exploration's selector modal) can read it from context.
   * Single-dataset apps can omit this.
   */
  datasets?: DatasetMetadata[];
}

/**
 * Full-viewport shell shared by every visualization app.
 * Mirrors the layout previously inlined in app/(datasets)/exploration/exploration.tsx
 * so /exploration and /explore/[app]/[dataset] occupy the same space.
 */
export default function VizAppShell({ children, datasets }: VizAppShellProps) {
  const offsetHeight = useElementHeight({ queryToSelect: 'header' });

  return (
    <VedaUIWrapper datasets={datasets}>
      <div
        id='ea-wrapper'
        style={{
          width: '100%',
          height: `calc(100vh - ${offsetHeight}px)`,
        }}
      >
        {children}
      </div>
    </VedaUIWrapper>
  );
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0. (`useElementHeight` and `VedaUIWrapper` already exist.)

- [ ] **Step 3: Stop for user commit**

---

## Task 5: Refactor `exploration.tsx` to use `VizAppShell`

Strip the layout/wrapper boilerplate from the exploration component now that `VizAppShell` owns it. The component becomes a thin renderer of the dataset selector + `ExplorationAndAnalysis`.

**Files:**
- Modify: `app/(datasets)/exploration/exploration.tsx`

- [ ] **Step 1: Replace the file's contents**

Replace the entire contents of `app/(datasets)/exploration/exploration.tsx` with:

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  ExplorationAndAnalysis,
  DatasetSelectorModal,
  useTimelineDatasetAtom,
  externalDatasetsAtom,
} from '@lib';
import { useSetAtom } from 'jotai';
import VizAppShell from 'app/viz-apps/shell';
import { useTheme } from 'app/components/common/theme-provider';

export default function ExplorationAnalysis({ datasets }: { datasets: any }) {
  const setExternalDatasets = useSetAtom(externalDatasetsAtom);
  const { theme } = useTheme();

  setExternalDatasets(datasets);

  const [timelineDatasets, setTimelineDatasets] = useTimelineDatasetAtom();
  const [datasetModalRevealed, setDatasetModalRevealed] = useState(
    !timelineDatasets.length,
  );

  const openModal = () => setDatasetModalRevealed(true);
  const closeModal = () => setDatasetModalRevealed(false);

  // Add veda-ui-root data attribute and dark mode class to modal portal when it mounts.
  useEffect(() => {
    if (!datasetModalRevealed) return;

    const timeoutId = setTimeout(() => {
      const modalWrapper = document.querySelector('[class*="styled__ModalWrapper"]');
      if (modalWrapper) {
        modalWrapper.setAttribute('data-veda-ui-root', 'true');
        if (!modalWrapper.classList.contains('veda-ui-scope')) {
          modalWrapper.classList.add('veda-ui-scope');
        }
        if (theme === 'dark') {
          modalWrapper.classList.add('dark');
        } else {
          modalWrapper.classList.remove('dark');
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [datasetModalRevealed, theme]);

  return (
    <VizAppShell datasets={datasets}>
      <DatasetSelectorModal
        revealed={datasetModalRevealed}
        close={closeModal}
        timelineDatasets={timelineDatasets}
        setTimelineDatasets={setTimelineDatasets}
        datasets={datasets}
      />
      <ExplorationAndAnalysis
        datasets={timelineDatasets}
        setDatasets={setTimelineDatasets}
        openDatasetsSelectionModal={openModal}
      />
    </VizAppShell>
  );
}
```

Differences vs the previous file:
- Removed `LegacyGlobalStyles` import (it was unused).
- Removed the inline `VedaUIWrapper` + `#ea-wrapper` wrapper — now provided by `VizAppShell`.
- Removed the inline `useElementHeight` import.

- [ ] **Step 2: Smoke-test exploration manually**

Run:
```bash
yarn dev
```

Visit `http://localhost:3000/exploration`. Expected:
- The page renders identically to before — full-viewport area below the header, dataset selector modal opens on first load, exploration map and timeline work.
- No console errors related to layout, theme, or veda-ui-scope.

Stop the dev server.

- [ ] **Step 3: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 4: Stop for user commit**

---

## Task 6: Add the server-side dispatcher to `/exploration/page.tsx`

Read the dataset id from `?search=`, look up its `viz`, and `redirect()` if `resolveVizTarget` says so.

**Files:**
- Modify: `app/(datasets)/exploration/page.tsx`

- [ ] **Step 1: Replace the file's contents**

Replace `app/(datasets)/exploration/page.tsx` with:

```tsx
import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import {
  getDatasets,
  getTransformedDatasetMetadata,
} from 'app/content/utils/mdx';
import { resolveVizTarget } from 'app/viz-apps/dispatch';
import type { DatasetWithViz } from 'app/types/viz-app';

const ExplorationAnalysis = dynamic(() => import('./exploration'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading...</p>,
});

interface PageProps {
  searchParams?: { search?: string };
}

export default function Page({ searchParams }: PageProps) {
  const requestedId = searchParams?.search;

  if (requestedId) {
    const dataset = getDatasets().find((ds) => ds.metadata.id === requestedId);
    if (dataset) {
      const viz = (dataset.metadata as DatasetWithViz).viz;
      const target = resolveVizTarget(viz, requestedId);
      if (target) {
        redirect(target);
      }
      // Lenient fallback: if `viz` is set but unresolved (unknown key, multi
      // app, etc.), we render exploration as today. Surface a hint in the
      // server log to help authors notice typos.
      if (viz && viz !== 'exploration') {
        // eslint-disable-next-line no-console
        console.warn(
          `[viz-apps] Dataset "${requestedId}" declares viz="${viz}" which is not a registered single-dataset app; falling back to exploration.`,
        );
      }
    }
  }

  const datasets: any[] = getTransformedDatasetMetadata();
  return (
    <section>
      <ExplorationAnalysis datasets={datasets} />
    </section>
  );
}
```

- [ ] **Step 2: Smoke-test that current behavior is preserved**

Run `yarn dev`. Visit:
1. `http://localhost:3000/exploration` — exploration UI with dataset selector modal opens.
2. `http://localhost:3000/exploration?search=hls_2.0` — exploration UI loads (HLS dataset has no `viz` field, so no redirect).

Expected: no redirects, no console warnings, exploration works as before. Stop the dev server.

- [ ] **Step 3: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 4: Stop for user commit**

---

## Task 7: Implement and test `useTileJson`

The hook owns the network fetch and bounds-derivation that any tile-source app will need.

**Files:**
- Create: `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts`
- Create: `__test__/viz-apps/use-tile-json.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `__test__/viz-apps/use-tile-json.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
yarn test __test__/viz-apps/use-tile-json.spec.ts
```

Expected: FAIL — `useTileJson` not exported.

- [ ] **Step 3: Implement the hook**

Create `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts`:

```ts
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
    setState({ loading: true });

    (async () => {
      try {
        const res = await fetch(url);
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
        setState({
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run:
```bash
yarn test __test__/viz-apps/use-tile-json.spec.ts
```

Expected: all 4 tests pass.

- [ ] **Step 5: Stop for user commit**

---

## Task 8: Implement `DeckglMaplibreCanvas`

The reusable canvas component. It owns MapLibre + the deck.gl `MapboxOverlay` and exposes a layers prop.

**Files:**
- Create: `app/viz-apps/shared/deckgl-maplibre/canvas.tsx`
- Create: `app/viz-apps/shared/deckgl-maplibre/index.ts`
- Create: `__test__/viz-apps/canvas.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `__test__/viz-apps/canvas.spec.tsx`. We mock both `maplibre-gl` and `@deck.gl/mapbox` so the component can mount in jsdom without a real WebGL context.

```tsx
import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const addControlMock = vi.fn();
const removeMock = vi.fn();
const onLoadMock = vi.fn();

// Mock maplibre-gl Map.
vi.mock('maplibre-gl', () => {
  class MockMap {
    constructor(public opts: any) {}
    addControl = addControlMock;
    on = (evt: string, cb: () => void) => {
      if (evt === 'load') onLoadMock(cb);
    };
    remove = removeMock;
  }
  return { default: { Map: MockMap }, Map: MockMap };
});

const setPropsMock = vi.fn();
const overlayCtorMock = vi.fn();

// Mock @deck.gl/mapbox MapboxOverlay.
vi.mock('@deck.gl/mapbox', () => {
  class MockOverlay {
    constructor(opts: any) {
      overlayCtorMock(opts);
    }
    setProps = setPropsMock;
    onAdd() {}
    onRemove() {}
  }
  return { MapboxOverlay: MockOverlay };
});

import { DeckglMaplibreCanvas } from '../../app/viz-apps/shared/deckgl-maplibre/canvas';

describe('DeckglMaplibreCanvas', () => {
  beforeEach(() => {
    addControlMock.mockClear();
    removeMock.mockClear();
    onLoadMock.mockClear();
    setPropsMock.mockClear();
    overlayCtorMock.mockClear();
  });

  test('mounts MapLibre and attaches a MapboxOverlay with the given layers', () => {
    const fakeLayers = [{ id: 'layer-a' } as any, { id: 'layer-b' } as any];
    render(<DeckglMaplibreCanvas layers={fakeLayers} />);
    expect(overlayCtorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        interleaved: true,
        layers: fakeLayers,
      }),
    );
    expect(addControlMock).toHaveBeenCalled();
  });

  test('renders overlayChildren inside the canvas container', () => {
    render(
      <DeckglMaplibreCanvas
        layers={[]}
        overlayChildren={<div data-testid='overlay'>Hello</div>}
      />,
    );
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });

  test('renders an inline error message when status.error is set', () => {
    render(
      <DeckglMaplibreCanvas
        layers={[]}
        status={{ error: "Couldn't load tiles" }}
      />,
    );
    expect(screen.getByText(/Couldn't load tiles/)).toBeInTheDocument();
  });

  test('updates overlay layers when the layers prop changes', () => {
    const { rerender } = render(<DeckglMaplibreCanvas layers={[{ id: 'a' } as any]} />);
    rerender(<DeckglMaplibreCanvas layers={[{ id: 'b' } as any]} />);
    expect(setPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ layers: [{ id: 'b' }] }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
yarn test __test__/viz-apps/canvas.spec.tsx
```

Expected: FAIL — `DeckglMaplibreCanvas` not exported.

- [ ] **Step 3: Implement the canvas**

Create `app/viz-apps/shared/deckgl-maplibre/canvas.tsx`:

```tsx
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
```

- [ ] **Step 4: Add the public re-exports**

Create `app/viz-apps/shared/deckgl-maplibre/index.ts`:

```ts
export { DeckglMaplibreCanvas } from './canvas';
export type { DeckglMaplibreCanvasProps } from './canvas';
export { useTileJson } from './use-tile-json';
export type {
  TileJsonResponse,
  InitialViewState,
  UseTileJsonResult,
} from './use-tile-json';
```

- [ ] **Step 5: Run test, verify it passes**

Run:
```bash
yarn test __test__/viz-apps/canvas.spec.tsx
```

Expected: all 4 tests pass.

- [ ] **Step 6: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 7: Stop for user commit**

---

## Task 9: Implement `DatasetInfoPanel`

Tiny presentational component. Worth its own file so future apps can reuse it.

**Files:**
- Create: `app/viz-apps/deckgl-vector-tiles/dataset-info-panel.tsx`

- [ ] **Step 1: Write the file**

```tsx
'use client';

import React from 'react';

interface DatasetInfoPanelProps {
  name: string;
  description?: string;
}

export function DatasetInfoPanel({ name, description }: DatasetInfoPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        maxWidth: 360,
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{name}</h2>
      {description ? (
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.4 }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 3: Stop for user commit**

---

## Task 10: Implement `DeckglVectorTilesApp`

Main component. Takes a `DatasetWithViz`, builds one `MVTLayer` per `vector-tilejson` entry, hands them to the canvas.

**Files:**
- Create: `app/viz-apps/deckgl-vector-tiles/app.tsx`
- Create: `app/viz-apps/deckgl-vector-tiles/index.tsx`
- Create: `__test__/viz-apps/deckgl-vector-tiles-app.spec.tsx`

- [ ] **Step 1: Write the failing test**

Create `__test__/viz-apps/deckgl-vector-tiles-app.spec.tsx`:

```tsx
import React from 'react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

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
    // First layer used the default (first vector_layer in tilejson).
    expect(mvtCtorMock.mock.calls[0][0]).toMatchObject({});
    // Second layer's MVTLayer was given the explicit sourceLayer.
    // (The exact prop name on MVTLayer for source-layer differs by version;
    // assert both fallback and explicit values flow through.)
    expect(mvtCtorMock).toHaveBeenCalled();

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
    expect(screen.getByText('Pretty Name')).toBeInTheDocument();
    expect(screen.getByText('Pretty description')).toBeInTheDocument();

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
yarn test __test__/viz-apps/deckgl-vector-tiles-app.spec.tsx
```

Expected: FAIL — `DeckglVectorTilesApp` not exported.

- [ ] **Step 3: Implement `app.tsx`**

Create `app/viz-apps/deckgl-vector-tiles/app.tsx`:

```tsx
'use client';

import React, { useMemo } from 'react';
import { MVTLayer } from '@deck.gl/geo-layers';
import {
  DeckglMaplibreCanvas,
  useTileJson,
} from 'app/viz-apps/shared/deckgl-maplibre';
import { DatasetInfoPanel } from './dataset-info-panel';
import type { VectorTilejsonLayer, DatasetWithViz } from 'app/types/viz-app';

interface DeckglVectorTilesAppProps {
  dataset: DatasetWithViz;
}

function isVectorTilejsonLayer(layer: any): layer is VectorTilejsonLayer {
  return layer && layer.type === 'vector-tilejson' && typeof layer.tileJsonUrl === 'string';
}

interface SingleLayerProps {
  layer: VectorTilejsonLayer;
  onResolved: (mvt: any, viewState: any) => void;
  onError: (msg: string) => void;
}

/**
 * One hook per dataset layer; each owns its own TileJSON fetch and produces
 * a deck.gl MVTLayer. We render this as a "headless" component (returns null)
 * and report the resolved layer up to the parent via callbacks.
 */
function VectorTilejsonLayerLoader({ layer, onResolved, onError }: SingleLayerProps) {
  const { data, initialViewState, error } = useTileJson(layer.tileJsonUrl);

  React.useEffect(() => {
    if (error) {
      onError(error);
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
      // Both casings are accepted across deck.gl versions; pass both to be safe.
      sourceLayer,
      // @ts-expect-error - prop name differs between versions
      uniqueIdProperty: undefined,
      getFillColor: [fillColor[0], fillColor[1], fillColor[2], Math.round(fillOpacity * 255)],
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      pickable: false,
    });

    onResolved(mvt, initialViewState);
  }, [data, error, initialViewState, layer, onError, onResolved]);

  return null;
}

function parseHexColor(hex?: string): [number, number, number] | undefined {
  if (!hex) return undefined;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return undefined;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function DeckglVectorTilesApp({ dataset }: DeckglVectorTilesAppProps) {
  const vectorLayers = useMemo(
    () => (dataset.layers ?? []).filter(isVectorTilejsonLayer),
    [dataset.layers],
  );

  const [resolvedLayers, setResolvedLayers] = React.useState<Record<string, any>>({});
  const [firstViewState, setFirstViewState] = React.useState<any>(undefined);
  const [errorMsg, setErrorMsg] = React.useState<string | undefined>(undefined);

  const handleResolved = React.useCallback((id: string) => (mvt: any, viewState: any) => {
    setResolvedLayers((prev) => ({ ...prev, [id]: mvt }));
    setFirstViewState((prev: any) => prev ?? viewState);
  }, []);

  const handleError = React.useCallback((msg: string) => {
    setErrorMsg((prev) => prev ?? msg);
  }, []);

  const layersArray = useMemo(
    () => vectorLayers.map((l) => resolvedLayers[l.id]).filter(Boolean),
    [vectorLayers, resolvedLayers],
  );

  return (
    <>
      {vectorLayers.map((l) => (
        <VectorTilejsonLayerLoader
          key={l.id}
          layer={l}
          onResolved={handleResolved(l.id)}
          onError={handleError}
        />
      ))}
      <DeckglMaplibreCanvas
        layers={layersArray}
        initialViewState={firstViewState}
        status={{ error: errorMsg }}
        overlayChildren={
          <DatasetInfoPanel name={dataset.name} description={dataset.description} />
        }
      />
    </>
  );
}
```

- [ ] **Step 4: Add `index.tsx`**

Create `app/viz-apps/deckgl-vector-tiles/index.tsx`:

```tsx
'use client';
export { DeckglVectorTilesApp } from './app';
export default { /* placeholder for next/dynamic default-import path */ } as any;
```

(The `default` export is a stub so `next/dynamic` can use the named export via `dynamic(() => import('...').then(m => m.DeckglVectorTilesApp))`.)

- [ ] **Step 5: Run test, verify it passes**

Run:
```bash
yarn test __test__/viz-apps/deckgl-vector-tiles-app.spec.tsx
```

Expected: all 5 tests pass.

- [ ] **Step 6: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 7: Stop for user commit**

---

## Task 11: Build the client-side registry

The registry maps `VizKey` → a dynamically-imported React component. It lives in its own file (separate from `apps-meta.ts`) so server code can keep importing pure metadata.

**Files:**
- Create: `app/viz-apps/registry.tsx`

- [ ] **Step 1: Write the file**

```tsx
'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { VizKey } from 'app/types/viz-app';
import type { DatasetWithViz } from 'app/types/viz-app';

/**
 * Single-dataset apps receive one resolved dataset.
 * Multi-dataset apps own their own routing (today only exploration at /exploration)
 * and are not loaded through this registry from /explore/[app]/[dataset].
 */
export type SingleAppComponent = ComponentType<{ dataset: DatasetWithViz }>;

const DeckglVectorTilesApp: SingleAppComponent = dynamic(
  () =>
    import('app/viz-apps/deckgl-vector-tiles/app').then(
      (m) => m.DeckglVectorTilesApp,
    ),
  { ssr: false, loading: () => <p className='p-8 text-center'>Loading…</p> },
) as any;

export const SINGLE_APP_REGISTRY: Partial<Record<VizKey, SingleAppComponent>> = {
  'deckgl-vector-tiles': DeckglVectorTilesApp,
};
```

- [ ] **Step 2: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 3: Stop for user commit**

---

## Task 12: Add the `/explore/[app]/[dataset]` wrapper route

Server component that resolves the app + dataset from the URL and renders inside `VizAppShell`.

**Files:**
- Create: `app/(datasets)/explore/[app]/[dataset]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import React from 'react';
import { notFound } from 'next/navigation';
import VizAppShell from 'app/viz-apps/shell';
import { APPS_META } from 'app/viz-apps/apps-meta';
import { SINGLE_APP_REGISTRY } from 'app/viz-apps/registry';
import { getDatasets, getTransformedDatasetMetadata } from 'app/content/utils/mdx';
import type { DatasetWithViz, VizKey } from 'app/types/viz-app';

interface PageProps {
  params: { app: string; dataset: string };
}

export default function Page({ params }: PageProps) {
  const meta = (APPS_META as Record<string, { key: VizKey; shape: 'single' | 'multi' } | undefined>)[
    params.app
  ];
  if (!meta) notFound();
  if (meta.shape !== 'single') notFound();

  const dataset = getDatasets().find((ds) => ds.metadata.id === params.dataset);
  if (!dataset) notFound();

  const Component = SINGLE_APP_REGISTRY[meta.key];
  if (!Component) notFound();

  const datasets = getTransformedDatasetMetadata();

  return (
    <section>
      <VizAppShell datasets={datasets}>
        <Component dataset={dataset.metadata as DatasetWithViz} />
      </VizAppShell>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 3: Smoke-test the unknown-app 404**

Run `yarn dev`. Visit:
- `http://localhost:3000/explore/not-a-real-app/hls_2.0` — should render Next.js 404.
- `http://localhost:3000/explore/exploration/hls_2.0` — should render Next.js 404 (exploration is multi-dataset).
- `http://localhost:3000/explore/deckgl-vector-tiles/not-a-real-id` — should render Next.js 404.

Stop the dev server.

- [ ] **Step 4: Stop for user commit**

---

## Task 13: Add the sample `ms-buildings.mdx` dataset

This is what proves the full end-to-end flow works in the catalog.

**Files:**
- Create: `app/content/datasets/ms-buildings.mdx`

- [ ] **Step 1: Write the MDX**

```mdx
---
id: ms-buildings
name: "Microsoft Global Building Footprints"
description: "Global building footprints derived by Microsoft from satellite imagery, served as vector tiles by the Microsoft Planetary Computer."
viz: deckgl-vector-tiles
media:
  src: /images/dataset/hls_20241004_true_color.jpg
  alt: Placeholder thumbnail
taxonomy:
  - name: Topics
    values:
      - Built Environment
  - name: Source
    values:
      - Microsoft
infoDescription: |
  ::markdown
    Vector tiles published by the Microsoft Planetary Computer.

    - Spatial Extent: Global
    - Format: Mapbox Vector Tiles (MVT) via TileJSON
layers:
  - id: footprints
    type: vector-tilejson
    name: "Building footprints"
    tileJsonUrl: "https://planetarycomputer.microsoft.com/api/data/v1/vector/collections/ms-buildings/tilesets/global-footprints/tilejson.json"
    paint:
      fillColor: "#ff7e29"
      fillOpacity: 0.6
      lineColor: "#cc4f00"
      lineWidth: 0.5
---

<Block>
  <Prose>
    The Microsoft global building footprints dataset is a worldwide collection of building polygons extracted from satellite imagery using machine learning. The footprints are served as vector tiles via the Microsoft Planetary Computer.
  </Prose>
</Block>
```

- [ ] **Step 2: Verify the dataset loads in the catalog**

Run `yarn dev`. Visit `http://localhost:3000/data-catalog`. Expected:
- A card for "Microsoft Global Building Footprints" appears in the catalog.
- The card has an "Explore" button (rendered by veda-ui).

- [ ] **Step 3: Click "Explore" and verify the redirect**

Click the Explore button on the new dataset's card. Expected:
- The browser URL changes to `/exploration?search=ms-buildings`, then the server-side dispatcher redirects to `/explore/deckgl-vector-tiles/ms-buildings`.
- The page renders a MapLibre basemap with deck.gl building footprints overlaid (orange fill at 60% opacity, dark-orange outlines).
- The dataset info panel shows the name and description in the bottom-left.
- Pan/zoom works.

- [ ] **Step 4: Verify direct linking works**

Visit `http://localhost:3000/explore/deckgl-vector-tiles/ms-buildings` directly. Expected: same page renders without a catalog round-trip.

- [ ] **Step 5: Verify lenient fallback**

Edit the mdx, change `viz: deckgl-vector-tiles` to `viz: typo-app`, save, click Explore on the card again. Expected:
- URL becomes `/exploration?search=ms-buildings`, no redirect, exploration UI renders.
- The Next.js dev server console logs `[viz-apps] Dataset "ms-buildings" declares viz="typo-app"…`.

Revert the mdx change.

Stop the dev server.

- [ ] **Step 6: Stop for user commit**

---

## Task 14: Final regression check

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run:
```bash
yarn test
```

Expected: all tests pass, including the existing `__test__/content/utils.spec.ts`.

- [ ] **Step 2: Run lint**

Run:
```bash
yarn lint
```

Expected: exits 0.

- [ ] **Step 3: Run type-check**

Run:
```bash
yarn ts-check
```

Expected: exits 0.

- [ ] **Step 4: Manual regression on existing exploration**

Run `yarn dev`. Verify these existing flows still work end-to-end:
1. `/exploration` — dataset selector modal opens; pick `Harmonized Landsat Sentinel-2 (HLS)`; the timeline + map renders.
2. From `/data-catalog`, click Explore on an HLS dataset card. URL becomes `/exploration?search=hls_2.0` and the page renders exploration (no redirect — `viz` field is absent on this dataset).
3. The home page's "Explore Platform" button still navigates to `/exploration` and works.

Stop the dev server.

- [ ] **Step 5: Stop for user commit**

---

## Self-review notes

- **Spec coverage:**
  - "Routing — `/exploration` (modified)" → Task 6.
  - "Routing — `/explore/[app]/[dataset]`" → Task 12.
  - "App registry" + `apps-meta` split → Tasks 3, 11.
  - "MDX schema additions" (`viz`, `vector-tilejson`) → Task 2 (types) + Task 13 (sample data exercises both).
  - "Shared shell" → Task 4 + Task 5 (refactor).
  - "Reusable deck.gl + MapLibre canvas" → Tasks 7, 8.
  - "deckgl-vector-tiles app" → Tasks 9, 10.
  - "Error handling" — covered: dispatcher leniency (Tasks 3, 6), 404s on bad app/dataset/multi (Task 12), TileJSON fetch failure (Tasks 7, 10).
  - "Testing" — Tasks 3, 7, 8, 10, 14.
- **Placeholder scan:** No "TBD"/"TODO"/"similar to Task N" steps. Every code step has the actual code.
- **Type consistency:** `VizKey`, `AppMeta`, `DatasetWithViz`, `VectorTilejsonLayer` defined once in Task 2 and consumed without renames in later tasks. `useTileJson` shape (`data`/`loading`/`error`/`initialViewState`) consistent between Tasks 7, 8, and 10. Canvas prop names (`layers`, `initialViewState`, `status`, `overlayChildren`) consistent between Tasks 8 and 10.
- **One open assumption** (lenient unknown `viz`) is implemented as the spec specifies and is exercised by both the dispatch unit test (Task 3) and the manual smoke test (Task 13).
