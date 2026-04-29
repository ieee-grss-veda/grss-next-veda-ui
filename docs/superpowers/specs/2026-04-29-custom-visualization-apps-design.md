# Custom Visualization Apps — Design Spec

**Date:** 2026-04-29
**Status:** Approved (design phase). Ready for implementation planning.

## Goal

Today the only way to visualize a dataset in this repo is the `/exploration` route, which uses `@teamimpact/veda-ui`'s Mapbox-based `ExplorationAndAnalysis` component. We want to support **multiple visualization apps**, with each dataset declaring (in its `.mdx` frontmatter) which app it should open in. The first new app is a **deck.gl + MapLibre** environment that renders a vector TileJSON source (e.g. Microsoft's global building footprints).

A user clicking the per-dataset "Explore" button on a catalog card should land on the right app for that dataset, with the dataset preselected. New apps must occupy the same viewport space and chrome that `/exploration` does today, and should be able to reuse parts of the exploration shell.

## Non-goals

- Comparing or layering datasets across apps (e.g. overlaying a STAC raster on top of vector tiles).
- Time-aware vector tiles.
- Letting a single dataset declare it can be opened in multiple apps and prompting the user to pick.
- Runtime per-layer style editing UI in the deck.gl app.
- Any change to story rendering, catalog filtering, or the `/data-catalog` UI.

## Architecture overview

A small **app registry** in this repo's code declares each visualization app. Each dataset's MDX frontmatter optionally declares which app it uses (`viz: <appKey>`); absence means "default to the existing exploration app". A new dynamic route `/explore/[app]/[dataset]` reads the registry and renders the right app component inside a shared shell. The existing `/exploration` route is preserved and now does a server-side dispatch: when the dataset linked from a catalog card declares a non-default `viz`, `/exploration` redirects to `/explore/<viz>/<datasetId>` server-side. Otherwise it renders exploration as before.

This means we make **no changes** to veda-ui's catalog cards — they continue to link to `/exploration?search=<id>` (which is hardcoded inside the library) — and intercept routing at the URL layer instead.

```
catalog card "Explore" click
        │
        ▼
/exploration?search=<id>  ──────────────┐
        │                                │
        │ dataset.viz absent or          │ dataset.viz set and registered
        │ === 'exploration'              ▼
        ▼                          redirect → /explore/<viz>/<id>
render existing                          │
ExplorationAnalysis                      ▼
                                  resolve app from registry
                                         │
                                         ▼
                                  render <VizAppShell>
                                  with app's Component
```

## Routing

### `/exploration` (existing route, modified)

`app/(datasets)/exploration/page.tsx` becomes a server component that:

1. Reads `searchParams.search` (the dataset id veda-ui passes).
2. If present, looks up the dataset via `getDatasets()` and reads `dataset.metadata.viz`.
3. If `viz` is set, non-empty, **registered**, `shape: 'single'`, and not `'exploration'` → `redirect('/explore/<viz>/<id>')`.
4. Otherwise renders the existing `ExplorationAnalysis` (now without its own layout — the layout has moved to `VizAppShell`).

Backward compatibility: any external or pre-existing link to `/exploration` (with or without `?search=<id>`) keeps working. Datasets that don't declare `viz` keep landing on the existing exploration component.

### `/explore/[app]/[dataset]` (new route)

This route serves `shape: 'single'` apps only. `app/(datasets)/explore/[app]/[dataset]/page.tsx`:

1. `getDatasets()` → find the dataset by slug; `notFound()` if missing.
2. Look up `params.app` in the registry; `notFound()` if unknown.
3. If the registered app is `shape: 'multi'`, `notFound()` — multi-dataset apps own their own routes (see below).
4. Render `<VizAppShell datasets={getTransformedDatasetMetadata()}>` with the registered app's component, passing the dataset metadata.
5. The inner app component is loaded via `next/dynamic` with `ssr: false` (deck.gl and the existing exploration both need the browser).

**Multi-dataset apps and routing.** For now the only `shape: 'multi'` app is exploration itself, which lives at `/exploration` and is unaffected by the new route. The `shape` field is descriptive metadata used by the dispatcher and the wrapper route — when a future multi-dataset app is added, it will need to define its own URL scheme (out of scope for this spec). The dispatcher in `/exploration` only redirects to `/explore/<viz>/<id>` for registered `shape: 'single'` apps; for any other case (absent `viz`, `viz === 'exploration'`, or a `shape: 'multi'` app) it falls through to rendering exploration.

### URL summary

| URL | Behavior |
|-----|----------|
| `/exploration` | Default exploration UI (multi-dataset). |
| `/exploration?search=<id>` | Renders exploration; redirects to `/explore/<viz>/<id>` only if the dataset's `viz` is a registered single-dataset app. |
| `/explore/deckgl-vector-tiles/<id>` | Renders the deck.gl app with that dataset. |
| `/explore/exploration/<id>` | 404 (exploration is multi-dataset; it's reached via `/exploration`). |
| `/explore/<unknown>/<id>` | 404. |
| `/explore/<app>/<unknown>` | 404. |

## App registry

`app/viz-apps/registry.ts`:

```ts
type AppShape = 'single' | 'multi';

interface AppDefinition {
  key: string;
  shape: AppShape;
  Component: ComponentType<{ dataset: DatasetData }>      // for shape: 'single'
          | ComponentType<{ datasets: DatasetData[] }>;   // for shape: 'multi'
}

export const VIZ_APPS: Record<string, AppDefinition> = {
  exploration: { key: 'exploration', shape: 'multi', Component: ExplorationApp },
  'deckgl-vector-tiles': { key: 'deckgl-vector-tiles', shape: 'single', Component: DeckglVectorTilesApp },
};
```

Adding a new app means: implement a component, register one entry. The wrapper route, redirect, and MDX schema do not need to change.

## MDX schema additions

### Dataset-level

A new optional top-level field on `DatasetData`:

```yaml
viz?: string   # default: 'exploration'
```

When absent, the dataset opens in the existing exploration app. When set, the value must match a registered app key (validation behavior: see "Error handling" below).

### New layer type: `vector-tilejson`

Alongside existing layer types (`cmr | wmts | raster`), a new value:

```yaml
- id: footprints
  type: vector-tilejson
  name: "Building footprints"
  tileJsonUrl: "https://planetarycomputer.microsoft.com/api/data/v1/vector/collections/ms-buildings/tilesets/global-footprints/tilejson.json"
  sourceLayer?: string             # optional; defaults to first source-layer in TileJSON
  paint?:                          # optional; passed into deck.gl MVTLayer styling
    fillColor: "#ff7e29"
    fillOpacity: 0.6
    # other paint keys (stroke, line color, etc.) as needed
```

`tileJsonUrl` is required for this layer type; everything else is optional.

### Example dataset MDX (full)

```yaml
---
id: ms-buildings
name: "Microsoft Global Building Footprints"
description: "..."
viz: deckgl-vector-tiles
layers:
  - id: footprints
    type: vector-tilejson
    name: "Building footprints"
    tileJsonUrl: "https://planetarycomputer.microsoft.com/api/data/v1/vector/collections/ms-buildings/tilesets/global-footprints/tilejson.json"
    paint:
      fillColor: "#ff7e29"
      fillOpacity: 0.6
---

<Block>...prose...</Block>
```

## Shared shell

`app/viz-apps/shell.tsx` (client component) wraps any app with the same layout `/exploration` uses today:

- Lifts `app/(datasets)/exploration/exploration.tsx` lines 60–88 (the `#ea-wrapper` div, `useElementHeight` against the page header, `height: calc(100vh - <headerHeight>px)`, `width: 100%`) into a reusable `VizAppShell` component.
- Wraps children in `<VedaUIWrapper datasets={datasets}>` so theme, devseed-ui theme provider, veda-ui config, data context, and the modal-portal `data-veda-ui-root` side effect all behave identically across apps.
- Single prop: `children` (plus optional `datasets` to forward to `VedaUIWrapper`).

After this refactor, `app/(datasets)/exploration/exploration.tsx` becomes a thin component that only renders `DatasetSelectorModal` + `ExplorationAndAnalysis`, with no layout of its own. `/exploration/page.tsx` and `/explore/[app]/[dataset]/page.tsx` both wrap their inner apps in `VizAppShell`.

## Reusable deck.gl + MapLibre canvas

To keep future custom visualization apps cheap to add, the deck.gl + MapLibre wiring is **not** built directly into the `deckgl-vector-tiles` app. Instead it lives as a small reusable module that any future app can import.

**Module location:** `app/viz-apps/shared/deckgl-maplibre/`

**What it owns**
- MapLibre instantiation and lifecycle (mount, unmount, view-state management).
- The deck.gl `MapboxOverlay` (interleaved mode) attached to the MapLibre map.
- A configurable basemap (defaults to a sensible free style; overridable via prop).
- Sizing — fills its container 100%/100% (paired with `VizAppShell` for full-viewport layouts).
- Loading and error UI scaffolding for tile-source apps that need it.

**Public API (illustrative)**

```ts
// app/viz-apps/shared/deckgl-maplibre/index.ts
export interface DeckglMaplibreCanvasProps {
  /** deck.gl layers to render on top of the basemap. */
  layers: Layer[];
  /** Optional initial view state. Defaults to world view. */
  initialViewState?: { longitude: number; latitude: number; zoom: number; bounds?: [number, number, number, number] };
  /** Optional MapLibre style URL or object. */
  basemapStyle?: string | StyleSpecification;
  /** Optional content rendered in a fixed overlay slot (e.g. dataset info panel). */
  overlayChildren?: ReactNode;
  /** Optional error/loading states the canvas should display. */
  status?: { loading?: boolean; error?: string };
}

export function DeckglMaplibreCanvas(props: DeckglMaplibreCanvasProps): JSX.Element;

// Helpers for tile-source apps:
export function useTileJson(url: string): {
  data?: TileJsonResponse;     // parsed tilejson
  initialViewState?: { ... };  // derived from `bounds`
  loading: boolean;
  error?: string;
};
```

`DeckglMaplibreCanvas` is presentational — it doesn't know about TileJSON, MVT layers, datasets, or the app registry. It just renders a deck.gl overlay on a MapLibre map. Apps decide what `Layer[]` to give it.

**Why a hook for `useTileJson`?** Multiple future apps may want to fetch a TileJSON-shaped source (raster tiles, vector tiles, hybrid). Centralizing the fetch + bounds-derivation lets each app share that boilerplate.

**Future apps using this module** would look like:

```tsx
function MyCustomApp({ dataset }) {
  const { data, initialViewState, loading, error } = useTileJson(dataset.layers[0].tileJsonUrl);
  const layers = useMemo(() => /* build deck.gl layers from `data` */, [data]);
  return (
    <DeckglMaplibreCanvas
      layers={layers}
      initialViewState={initialViewState}
      status={{ loading, error }}
      overlayChildren={<DatasetInfoPanel dataset={dataset} />}
    />
  );
}
```

## The `deckgl-vector-tiles` app

Lives at `app/viz-apps/deckgl-vector-tiles/`. Thin layer on top of the reusable canvas — its only responsibility is turning `vector-tilejson` layers into deck.gl `MVTLayer` instances.

### Behavior

- Receives a single `DatasetData` from the wrapper route.
- Iterates `dataset.layers` for entries with `type: 'vector-tilejson'`.
- For each, calls `useTileJson` to fetch the TileJSON (`tiles`, `bounds`, `minzoom`, `maxzoom`, `vector_layers`).
- Builds a deck.gl `MVTLayer` per entry, using the resolved tile URLs, `sourceLayer` (defaulting to the first source-layer in the TileJSON), and the layer's `paint` props.
- Initial map view: TileJSON `bounds` if present, else a sensible world default — both handled by `useTileJson` + `DeckglMaplibreCanvas`.
- Renders all matching layers (so a single dataset can have multiple vector overlays).
- Built-in controls: pan/zoom only. A minimal info panel (`<DatasetInfoPanel>`) shows the dataset name and description, passed in via `overlayChildren`.

### Out of scope for this MVP

- Timeline / time-aware controls.
- Compare mode.
- In-app dataset selector or modal.
- Style/paint editor UI.
- Layer toggles (every `vector-tilejson` layer in the dataset is rendered).

### Dependencies to add

- `maplibre-gl`
- `deck.gl` packages: `@deck.gl/core`, `@deck.gl/layers`, `@deck.gl/geo-layers` (for `MVTLayer`), `@deck.gl/mapbox` (for `MapboxOverlay`).

These are not currently in `package.json` and will need to be added with the implementation. They live as direct dependencies of the shared `deckgl-maplibre` module so all future deck.gl-based apps share them.

## Files to add / modify

**New**
- `app/viz-apps/registry.ts`
- `app/viz-apps/shell.tsx`
- `app/viz-apps/dispatch.ts` — pure helper `resolveVizTarget(dataset, registry)` returning the redirect target or `null`.
- `app/viz-apps/shared/deckgl-maplibre/index.ts` — public exports.
- `app/viz-apps/shared/deckgl-maplibre/canvas.tsx` — `DeckglMaplibreCanvas` component.
- `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts` — `useTileJson` hook.
- `app/viz-apps/deckgl-vector-tiles/index.tsx` (entry, dynamic-imported)
- `app/viz-apps/deckgl-vector-tiles/app.tsx` (the actual component, built on top of the shared canvas)
- `app/viz-apps/deckgl-vector-tiles/dataset-info-panel.tsx` (small overlay UI)
- `app/(datasets)/explore/[app]/[dataset]/page.tsx`

**Modified**
- `app/(datasets)/exploration/page.tsx` — add the dispatcher logic.
- `app/(datasets)/exploration/exploration.tsx` — drop layout/sizing (moved to `VizAppShell`); keep just modal + `ExplorationAndAnalysis`. Register the resulting component as the `'exploration'` entry in the registry.
- `app/types/content.ts` — augment `DatasetData` with `viz?: string` and the new `vector-tilejson` layer shape (the layer-shape change may need to live in a project-local extension type rather than augmenting `@lib`'s `DatasetData` directly).

**Untouched**
- `app/(datasets)/data-catalog/*`
- `VedaUIWrapper` and the providers under `app/store/providers/*`
- All existing dataset MDX files (no migration needed; absent `viz` defaults to exploration).

## Error handling

| Situation | Behavior |
|---|---|
| Dataset has `viz` that matches a registered app (other than `'exploration'`) | Redirect from `/exploration` to `/explore/<viz>/<id>`. |
| Dataset has `viz` that does **not** match any registered app | **Lenient fallback.** Log a console warning, fall through to rendering the existing exploration. Rationale: a typo in mdx shouldn't break Explore. (Open assumption — see below.) |
| Dataset has no `viz` field | Render exploration as today. |
| URL hits `/explore/<unknown-app>/<id>` directly | `notFound()` (404). |
| URL hits `/explore/<app>/<unknown-id>` | `notFound()` (404). |
| TileJSON fetch fails (network, 404, CORS) inside the deck.gl app | Inline error state ("Couldn't load tiles from `<url>`") rendered inside the shell. Basemap and pan/zoom remain usable. |
| TileJSON returns no `vector_layers` | Same inline error. |
| Dataset's first layer is `vector-tilejson` but `viz` is absent | Treated as plain exploration; the unknown layer type will surface inside the existing exploration's error handling. We do not auto-infer `viz` from layer type — `viz` is the single source of truth. |

## Testing

### Unit (vitest)

- **Registry:** lookup of known/unknown keys; `'exploration'` is always present.
- **Dispatcher (`resolveVizTarget`):** dataset with no `viz` → `null`; with registered single-dataset `viz` → redirect target; with registered multi-dataset `viz` → `null` (no redirect); with unknown `viz` → `null` (lenient); missing dataset → `null`.
- **MDX parsing:** a fixture mdx with `viz` and a `vector-tilejson` layer round-trips through `parseAttributes` / `processTaxonomies` without losing fields.

### Component (React Testing Library)

- **`VizAppShell`** mounts children inside `VedaUIWrapper`, applies the viewport sizing, and forwards `datasets`.
- **`DeckglMaplibreCanvas`** with mocked MapLibre + `MapboxOverlay`: asserts the overlay is created and given the supplied `layers`; that `initialViewState` is honored; that `status.error` renders an inline error; that `overlayChildren` are mounted.
- **`useTileJson`** with mocked `fetch`: success returns parsed data + a derived `initialViewState` from `bounds`; HTTP error sets `error`; rejected fetch sets `error`.
- **`DeckglVectorTilesApp`** with `useTileJson` mocked and `MVTLayer` mocked: assert one `MVTLayer` is constructed per `vector-tilejson` layer with the expected `data` URLs, `minzoom`/`maxzoom`, `sourceLayer`, and paint props; assert error state propagates from the hook into `DeckglMaplibreCanvas`'s `status.error`.

### Manual smoke test (to document in the implementation plan)

1. Click Explore on an existing exploration dataset → still lands on `/exploration` and works as before.
2. Add a test dataset mdx with `viz: deckgl-vector-tiles` pointing at the MS-buildings TileJSON → click Explore on its catalog card → lands on `/explore/deckgl-vector-tiles/<id>` with footprints rendered.
3. Direct-link to `/explore/deckgl-vector-tiles/<id>` works without the catalog round-trip.
4. Direct-link to `/explore/unknown-app/<id>` returns 404.
5. Set `viz: typo-app` on a dataset → click Explore → falls back to exploration (lenient mode), with a console warning.

## Open assumptions

These were picked during brainstorming with a recommendation; reviewers can flip them with no architectural impact.

1. **Lenient vs strict unknown `viz`.** Recommended: **lenient** (fall through to exploration with a console warning). Strict alternative: 404. Flip is a one-line change in the dispatcher.
2. **Basemap style for the deck.gl app.** Recommended: a fixed default style for MVP (no in-app picker).
3. **Multi-vector-layer rendering in one dataset.** Recommended: render every `vector-tilejson` layer in the dataset (no toggle). A toggle/legend can be added later.
