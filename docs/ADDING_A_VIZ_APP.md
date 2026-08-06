# Adding a New Visualization App

This guide is for another agent (or developer) adding a new visualization app to this repo on top of the existing custom-viz-app architecture. Read this whole document before writing any code — most of the work is wiring, and the system is designed so that the only file you should need to write from scratch is the app's main React component.

The design spec is in `docs/superpowers/specs/2026-04-29-custom-visualization-apps-design.md`. The original implementation plan is in `docs/superpowers/plans/2026-04-29-custom-visualization-apps.md`. The reference app is `app/viz-apps/deckgl-vector-tiles/`.

## What the system does

Each dataset's `.mdx` may declare `viz: <appKey>` in its frontmatter. When a user clicks "Explore" on a catalog card or detail page, they go to either:
- `/exploration?search=<id>` (legacy / default exploration UI), or
- `/explore/<appKey>/<datasetId>` (a custom viz app).

A server-side dispatcher at `/exploration` reads the dataset's `viz` and redirects to the custom route when appropriate. The custom route looks the app up in a registry and renders it inside a shared shell.

```
catalog "Explore"
        │
        ▼
/exploration?search=<id>
        │  resolveVizTarget(...) ──── redirect to /explore/<viz>/<id>
        ▼                                       │
render existing                                 ▼
ExplorationAnalysis                    /explore/[app]/[dataset]/page.tsx
                                                │ APPS_META lookup
                                                ▼
                                       VizAppShell  ←─── wraps everything
                                                │
                                                ▼
                                       VizAppRenderer (client)
                                                │  SINGLE_APP_REGISTRY[appKey]
                                                ▼
                                          Your new viz app
                                          (consumes shared module
                                           + does its own thing)
```

## Building blocks you should reuse

Before writing anything new, know what is already available.

### Shared shell — `app/viz-apps/shell.tsx`

`VizAppShell` is the full-viewport wrapper. It owns the `VedaUIWrapper` (theme, providers, modal portal scoping), the header-aware sizing (`height: calc(100vh - <headerHeight>px)`), and styled-components / global-CSS scoping. **You do not render this yourself** — the `/explore/[app]/[dataset]` route already wraps your app in it. Just render your top-level content as if it has 100% width/height.

### Shared deck.gl + MapLibre canvas — `app/viz-apps/shared/deckgl-maplibre/`

If your app is map-based, **use this** instead of rolling your own MapLibre setup.

**`<DeckglMaplibreCanvas>` (`canvas.tsx`)**
- Mounts MapLibre, attaches a deck.gl `MapboxOverlay` (interleaved mode), wires basemap, full-bleed sizing, loading and error UI.
- Automatically keeps MapLibre symbol layers (place names, road labels) on top of your deck.gl layers via `beforeId` (it finds the first symbol layer in the loaded style and clones every passed-in layer with that `beforeId`).
- Honors a `initialViewState` that may arrive **after** mount (e.g. from an async tile-source fetch) — it `jumpTo`s once, then leaves user pan/zoom alone.
- Props:
  ```ts
  {
    layers: Layer[];                                // deck.gl layers
    initialViewState?: InitialViewState;            // optional
    basemapStyle?: string | StyleSpecification;     // defaults to Carto positron
    overlayChildren?: ReactNode;                    // absolutely-positioned overlay slot
    status?: { loading?: boolean; error?: string }; // built-in alert + spinner
  }
  ```

**`useTileJson(url)` (`use-tile-json.ts`)**
- Fetches a TileJSON, parses it, derives an `InitialViewState` from `bounds`. Aborts on unmount/url-change. Returns `{ data, initialViewState, loading, error }`.
- Use this if your data source is a TileJSON (vector or raster). Don't reimplement.

### Shared types — `app/types/viz-app.ts`

- `VizKey` — string-literal union of all registered app keys. Add yours here.
- `AppShape` — `'single' | 'multi'`. Single-dataset apps go through `/explore/[app]/[dataset]`. Multi-dataset apps own their own routing today.
- `DatasetWithViz` — the dataset shape your app receives (extends veda-ui's `DatasetData` with `viz` and the `vector-tilejson` layer type). If you add a new layer type, extend this here.

### Registry — split across two files

- `app/viz-apps/apps-meta.ts` — **server-safe**. Just `{ key, shape }` per app. Imported by the server dispatcher and the wrapper route.
- `app/viz-apps/registry.tsx` — **client only** (`'use client'`). Maps app keys to dynamic-imported components, and exports a `VizAppRenderer` client component that the server route uses to render the right app.

The split exists because React Server Components can't trace client component references that flow through a runtime registry object lookup from a server file. **Don't merge these — render through `VizAppRenderer` from server components.**

### Dispatch helper — `app/viz-apps/dispatch.ts`

`resolveVizTarget(viz, datasetId)` returns the destination URL or `null`. Pure and server-safe. The catalog detail page and the `/exploration` dispatcher already use it. **You probably don't need to touch this.**

### MDX content & frontmatter

Dataset `.mdx` files live in `app/content/datasets/`. The frontmatter is parsed by `app/content/utils/mdx.ts` via `gray-matter`. Anything you add to frontmatter passes through untouched (no schema enforcement at the parsing layer), so you can declare arbitrary fields on a dataset or a layer. **The types are the contract** — extend `app/types/viz-app.ts` for new fields.

## Step-by-step: adding a new app

Assume you want to add an app keyed `my-app` that visualizes some dataset.

### 1. Decide what the app needs

- **Map-based + uses TileJSON?** You'll reuse `DeckglMaplibreCanvas` + `useTileJson`. ~80% of the work is done.
- **Map-based + uses something other than TileJSON** (e.g. raw GeoJSON, COG raster, JSON points)? Reuse `DeckglMaplibreCanvas`; build deck.gl layers from your data source. You may want a new `useXxx` hook in `shared/deckgl-maplibre/` if other apps will need the same.
- **Not map-based** (a chart, a 3D viewer, an animation)? `VizAppShell` is still your friend, but you'll mount your own component. Don't put it in `shared/deckgl-maplibre/`.

### 2. Add a new layer type to MDX (if needed)

Open `app/types/viz-app.ts`. Define your layer interface alongside `VectorTilejsonLayer`:

```ts
export interface MyAppLayer {
  id: string;
  name?: string;
  type: 'my-app-layer';
  // ...whatever your dataset needs (URLs, params, styling, etc.)
}
```

Add it to `DatasetWithViz['layers']`'s union:

```ts
export type DatasetWithViz = DatasetData & {
  viz?: VizKey | string;
  layers: Array<
    DatasetData['layers'][number] | VectorTilejsonLayer | MyAppLayer
  >;
};
```

### 3. Register the app key

In `app/types/viz-app.ts`, add to the `VizKey` union:

```ts
export type VizKey = 'exploration' | 'deckgl-vector-tiles' | 'my-app';
```

In `app/viz-apps/apps-meta.ts`, add an entry:

```ts
export const APPS_META: Record<VizKey, AppMeta> = {
  exploration: { key: 'exploration', shape: 'multi' },
  'deckgl-vector-tiles': { key: 'deckgl-vector-tiles', shape: 'single' },
  'my-app': { key: 'my-app', shape: 'single' },
};
```

### 4. Write the app component

Create `app/viz-apps/my-app/app.tsx`:

```tsx
'use client';

import React from 'react';
import {
  DeckglMaplibreCanvas,
  useTileJson, // if applicable
} from 'app/viz-apps/shared/deckgl-maplibre';
import type { DatasetWithViz, MyAppLayer } from 'app/types/viz-app';

interface MyAppProps {
  dataset: DatasetWithViz;
}

export function MyApp({ dataset }: MyAppProps) {
  // 1. Find your app's layers in the dataset.
  // 2. Build deck.gl Layer instances from them (use useMemo for the array).
  // 3. Render <DeckglMaplibreCanvas layers={...} initialViewState={...} />
  //    inside any overlayChildren you want (e.g. <DatasetInfoPanel>).
  return (
    <DeckglMaplibreCanvas
      layers={[/* your layers */]}
      // optional: initialViewState, status, overlayChildren
    />
  );
}
```

If your app needs an entry barrel for `next/dynamic`:

```tsx
// app/viz-apps/my-app/index.tsx
'use client';
export { MyApp } from './app';
```

**Look at `app/viz-apps/deckgl-vector-tiles/app.tsx` for a complete working example.** Note specifically:
- It uses a headless "loader" component pattern (`VectorTilejsonLayerLoader`) to call `useTileJson` once per dataset layer. Hooks can't run in a loop directly, so each loader is its own component instance.
- Callbacks from loader → parent are stabilized via `useRef` so the loader's build effect doesn't refire on every parent render.

### 5. Register the React component

In `app/viz-apps/registry.tsx`, dynamically import and register your app:

```tsx
const MyApp = dynamic(
  () => import('app/viz-apps/my-app/app').then((m) => m.MyApp),
  { ssr: false, loading: () => <p className='p-8 text-center'>Loading…</p> },
) as SingleAppComponent;

const SINGLE_APP_REGISTRY: Partial<Record<VizKey, SingleAppComponent>> = {
  'deckgl-vector-tiles': DeckglVectorTilesApp,
  'my-app': MyApp,
};
```

`VizAppRenderer` already handles the registry lookup; you don't change anything else there.

### 6. Add a sample dataset to test

Create `app/content/datasets/my-test-dataset.mdx`:

```mdx
---
id: my-test-dataset
name: "My Test Dataset"
description: "..."
viz: my-app
media:
  src: /images/dataset/placeholder.jpg
  alt: Thumbnail
taxonomy:
  - name: Topics
    values:
      - Your Topic
layers:
  - id: layer-1
    type: my-app-layer
    # ...your layer fields
---

<Block>
  <Prose>
    Long-form prose for the catalog detail page.
  </Prose>
</Block>
```

### 7. Tests

Drop a spec in `__test__/viz-apps/my-app.spec.tsx`. Mirror the structure of `__test__/viz-apps/deckgl-vector-tiles-app.spec.tsx`:

- Mock `maplibre-gl` and `@deck.gl/mapbox` (jsdom has no WebGL).
- Render the app with a fake `dataset`.
- Assert that the right deck.gl layers are constructed with the expected props.
- Test error states (e.g. data-fetch failures surface via the canvas's `status.error`).

**Important testing notes (from real experience with this codebase):**
- `@testing-library/jest-dom` is **not** set up. Don't use `.toBeInTheDocument()`. Use `screen.getByText(...)` and let the throw-on-miss be the assertion, or assert against `.textContent`.
- If you call `setProps` or fire async events on the mocked map, wrap state updates in `act()` imported from `@testing-library/react` (NOT from `react`).
- If you copy the `maplibre-gl` mock from `canvas.spec.tsx`, include the `jumpTo` method — the canvas uses it for the post-mount view-state apply, and missing it causes uncaught errors.

### 8. Verify

Run from the repo root:

```bash
npx vitest run               # all tests pass
npx tsc --noEmit             # no NEW TypeScript errors in your files
npx next lint                # clean
npx next dev                 # open browser, click Explore on your test dataset
```

### 9. Commit

Follow the conventional-commit style used in the existing branch history. **Do not add `Co-Authored-By: Claude` trailers.** Don't `git push` or open PRs — the user manages remote operations.

## Gotchas

### Package manager: yarn 1 only

This repo is on **yarn 1** (classic). The default `yarn` on the typical developer machine may be **yarn 4** via corepack (it's auto-installed by Node 20+). Yarn 4 will silently:
- Regenerate `yarn.lock` in yarn-4 format (`__metadata: version: 8`) — incompatible with everything in CI and other dev environments.
- Install via Plug'n'Play (`.pnp.cjs`, `.yarn/`) instead of populating `node_modules` — `next dev` won't resolve packages.

`package.json` has `"packageManager": "yarn@1.22.22"` to tell corepack to use yarn 1. If you ever need to install a new dep, use:

```bash
npx -y yarn@1.22.22 add <pkg>
```

For script aliases (`yarn test`, `yarn ts-check`, `yarn dev`), corepack still hijacks. Bypass with:

```bash
npx vitest run     # instead of yarn test
npx tsc --noEmit   # instead of yarn ts-check
npx next dev       # instead of yarn dev
npx next lint      # instead of yarn lint
```

Red flags that you accidentally used yarn 4: `.pnp.cjs` / `.yarn/` appearing untracked, `__metadata: version: 8` at the top of `yarn.lock`, missing `node_modules/<new-pkg>/package.json`.

### deck.gl transitive deps

`@deck.gl/geo-layers` has peer dependencies on `@deck.gl/extensions` and `@deck.gl/mesh-layers` that npm/yarn doesn't auto-install. If you import from `@deck.gl/geo-layers` and `next dev` fails with `Module not found: Can't resolve '@deck.gl/mesh-layers'`, that's why. Both are already pinned in `package.json`.

### React Server Components boundary

`/explore/[app]/[dataset]/page.tsx` is a **server** component. It calls `getDatasets()` (server-only) and reads `dataset.metadata.viz`. It does **not** import client modules to call them directly. Instead it imports the `VizAppRenderer` (client) and passes it props. **Don't** make the server page reach into `SINGLE_APP_REGISTRY` directly — that won't work (it produces a "Could not find the module in the React Client Manifest" runtime error, and the cause is non-obvious).

### CSS scoping

`VedaUIWrapper` scopes veda-ui styles to `#veda-ui-root.veda-ui-scope`. If your app injects global CSS (like maplibre's `maplibre-gl.css`), it will be global. The reference deck.gl app imports `'maplibre-gl/dist/maplibre-gl.css'` inside `canvas.tsx` — this is intentional and works because the import is colocated with the only consumer of those styles.

### MapLibre labels on top

The shared canvas already implements "labels above your overlay layers." If you reuse `DeckglMaplibreCanvas`, you get this for free. If you bypass the canvas and wire MapLibre yourself, replicate the pattern: after `map.on('load', ...)` find the first `type: 'symbol'` layer and pass its id as `beforeId` on each deck.gl layer.

### Initial view state arrives async

If you derive view state from an async fetch (e.g. a TileJSON's `bounds`), the canvas handles it: it `jumpTo`s once when a non-default `initialViewState` first arrives, then locks. Don't fight this — just pass `firstViewState` once it's known and let the canvas do the rest.

### `dataset.layers` typing

`DatasetWithViz['layers']` is a union (`DatasetLayer | VectorTilejsonLayer | …`). TypeScript's narrowing through a type guard inside `Array.prototype.filter` doesn't always survive across the union with veda-ui's `DatasetLayer` shape. The reference app uses a cast at the boundary:

```ts
const myLayers = useMemo<MyAppLayer[]>(
  () =>
    ((dataset.layers ?? []) as any[]).filter(isMyAppLayer) as MyAppLayer[],
  [dataset.layers],
);
```

It's ugly but pragmatic. Don't fight it; the cast is narrow.

## When NOT to add a new app

- If your only difference from an existing app is **styling** (different colors, line widths, etc.), don't add a new app. Use the existing app's `paint` MDX schema (or add new keys to it).
- If you want to add a **basemap option**, the canvas already takes a `basemapStyle` prop — surface it as a per-app or per-dataset config rather than a new app.
- If you need **time-aware data**, that's `exploration`'s domain. Adding time controls to a new map-based app is non-trivial; consider whether the dataset belongs in exploration instead.

## Where to ask for help

The reference implementation is the best reference. Read in this order:
1. `app/viz-apps/deckgl-vector-tiles/app.tsx` — the complete working app.
2. `app/viz-apps/shared/deckgl-maplibre/canvas.tsx` — the canvas internals.
3. `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts` — pattern for async data fetches in a hook.
4. `app/(datasets)/explore/[app]/[dataset]/page.tsx` — how the wrapper route resolves apps + datasets.

If you find something missing from this guide, update it. The architecture is meant to be extended, not just copied.
