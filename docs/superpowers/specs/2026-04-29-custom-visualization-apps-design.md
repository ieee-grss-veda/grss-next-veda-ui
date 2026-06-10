# Custom Visualization Apps — Design Spec

**Date:** 2026-04-29 (initial); updated 2026-06-09 to match the implemented architecture.
**Status:** Implemented on branch `feat/custom-viz-apps`.
**Scope:** This document describes the **custom-viz-app system** — the wrapper, routing, registry, and shared building blocks that make new viz apps cheap to add. It does **not** describe any specific viz app. For a hands-on guide to building one, see [`docs/ADDING_A_VIZ_APP.md`](../../ADDING_A_VIZ_APP.md).

## Goal

Before this work, the only way to visualize a dataset in this repo was the `/exploration` route, which uses `@teamimpact/veda-ui`'s Mapbox-based `ExplorationAndAnalysis` component. We wanted to support **multiple visualization apps**, with each dataset declaring (in its `.mdx` frontmatter) which app it should open in.

A user clicking the per-dataset "Explore" button on a catalog card or detail page should land on the right app for that dataset, with the dataset preselected. New apps must occupy the same viewport space and chrome that `/exploration` does today, and should be able to reuse parts of the exploration shell.

## Non-goals

- Comparing or layering datasets across apps (e.g. overlaying a STAC raster on top of another app's data).
- Letting a single dataset declare it can be opened in multiple apps and prompting the user to pick.
- Any change to story rendering, catalog filtering, or the existing exploration UI behavior.

## Architecture overview

A small **app registry** in this repo's code declares each visualization app. Each dataset's MDX frontmatter optionally declares which app it uses (`viz: <appKey>`); absence means "default to the existing exploration app". A new dynamic route `/explore/[app]/[dataset]` reads the registry and renders the right app component inside a shared shell. The existing `/exploration` route is preserved and now does a server-side dispatch: when the dataset linked from a catalog card declares a non-default `viz`, `/exploration` redirects to `/explore/<viz>/<datasetId>` server-side. Otherwise it renders exploration as before.

This means we make **no changes** to veda-ui's catalog cards — they continue to link to `/exploration?search=<id>` (which is hardcoded inside the library) — and intercept routing at the URL layer instead.

```
catalog card "Explore" click                catalog detail page "Explore" button
        │                                                │
        ▼                                                ▼
/exploration?search=<id>  ──────────────┐               or directly to
        │                                │               /explore/<viz>/<id>
        │ dataset.viz absent or          │ dataset.viz set and registered
        │ === 'exploration'              ▼
        ▼                          redirect → /explore/<viz>/<id>
render existing                          │
ExplorationAnalysis                      ▼
                                  resolve app from registry
                                         │
                                         ▼
                                  render <VizAppShell>
                                  + <VizAppRenderer vizKey={...} dataset={...}/>
                                  (client lookup → app component)
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
2. Look up `params.app` in the **server-safe** `APPS_META` table; `notFound()` if unknown.
3. If the registered app is `shape: 'multi'`, `notFound()` — multi-dataset apps own their own routes (see below).
4. Render `<VizAppShell datasets={getTransformedDatasetMetadata()}>` with `<VizAppRenderer vizKey={...} dataset={...}>` inside. (See "App registry" below for why the dispatch goes through `VizAppRenderer` rather than a direct registry lookup in the server component.)

**Multi-dataset apps and routing.** For now the only `shape: 'multi'` app is exploration itself, which lives at `/exploration` and is unaffected by the new route. The `shape` field is descriptive metadata used by the dispatcher and the wrapper route — when a future multi-dataset app is added, it will need to define its own URL scheme (out of scope for this spec). The dispatcher in `/exploration` only redirects to `/explore/<viz>/<id>` for registered `shape: 'single'` apps; for any other case (absent `viz`, `viz === 'exploration'`, or a `shape: 'multi'` app) it falls through to rendering exploration.

### URL summary

| URL | Behavior |
|-----|----------|
| `/exploration` | Default exploration UI (multi-dataset). |
| `/exploration?search=<id>` | Renders exploration; redirects to `/explore/<viz>/<id>` only if the dataset's `viz` is a registered single-dataset app. |
| `/explore/<appKey>/<id>` | Renders the registered single-dataset app with that dataset. |
| `/explore/exploration/<id>` | 404 (exploration is multi-dataset; it's reached via `/exploration`). |
| `/explore/<unknown>/<id>` | 404. |
| `/explore/<app>/<unknown>` | 404. |

## App registry

The registry is split into **two files** so server and client code each get only what they need.

### Server-safe metadata — `app/viz-apps/apps-meta.ts`

```ts
import type { AppMeta, VizKey } from 'app/types/viz-app';

export const APPS_META: Record<VizKey, AppMeta> = {
  exploration:            { key: 'exploration',            shape: 'multi'  },
  'deckgl-vector-tiles':  { key: 'deckgl-vector-tiles',    shape: 'single' },
  // …add new apps here
};
```

This file is imported by the `/exploration` dispatcher and the `/explore/[app]/[dataset]` page, both of which are server components. It contains **only data** — no React component references, no client-only imports — so it's safe to read during SSR.

### Client-side component map + dispatcher — `app/viz-apps/registry.tsx`

```tsx
'use client';

const DeckglVectorTilesApp = dynamic(
  () => import('app/viz-apps/deckgl-vector-tiles/app').then((m) => m.DeckglVectorTilesApp),
  { ssr: false, loading: () => <p className='p-8 text-center'>Loading…</p> },
);

const SINGLE_APP_REGISTRY: Partial<Record<VizKey, SingleAppComponent>> = {
  'deckgl-vector-tiles': DeckglVectorTilesApp,
};

/**
 * Server components render this — they pass a vizKey + dataset and let the
 * registry lookup happen in client-land. See "Why a client-side dispatcher"
 * below.
 */
export function VizAppRenderer({ vizKey, dataset }: {
  vizKey: VizKey;
  dataset: DatasetWithViz;
}) {
  const Component = SINGLE_APP_REGISTRY[vizKey];
  if (!Component) return null;
  return <Component dataset={dataset} />;
}
```

### Why a client-side dispatcher

The `/explore/[app]/[dataset]/page.tsx` is a **server component**. If it imported `SINGLE_APP_REGISTRY` from `registry.tsx` and rendered `<RegistryEntry />` directly, the React Server Components bundler couldn't trace the client component reference flowing through a runtime object lookup, and the user would see:

> Could not find the module "…/registry.tsx#SINGLE_APP_REGISTRY#<appKey>" in the React Client Manifest.

The fix is to wrap the lookup in a single, statically-resolvable client component (`VizAppRenderer`). The server component imports just that one wrapper and passes it props — the bundler can see the boundary cleanly. **This is load-bearing**; do not collapse `apps-meta.ts` and `registry.tsx` back into one file, and do not have server components reach into `SINGLE_APP_REGISTRY` directly.

### Adding a new app

1. Add the key to `VizKey` in `app/types/viz-app.ts`.
2. Add an entry to `APPS_META` with its `shape`.
3. Register the React component in `registry.tsx` via `next/dynamic`.

No changes to the wrapper route, dispatcher, or MDX schema are needed.

## MDX schema additions

A single optional top-level field on `DatasetData`:

```yaml
viz?: string   # default: 'exploration'
```

When absent, the dataset opens in the existing exploration app. When set, the value must match a registered app key (validation behavior: see "Error handling").

Apps that need additional dataset-level or layer-level configuration extend the schema themselves. The shared `DatasetWithViz` type (in `app/types/viz-app.ts`) widens `DatasetData`'s `layers` union to admit additional layer types; new apps add their layer interface to that union. Since `parseAttributes` in `app/content/utils/mdx.ts` is structurally agnostic, arbitrary frontmatter passes through untouched.

## Shared shell — `VizAppShell`

`app/viz-apps/shell.tsx` (client component) wraps any app with the same layout `/exploration` uses today:

- Lifts the original `app/(datasets)/exploration/exploration.tsx` layout block (the `#ea-wrapper` div, `useElementHeight` against the page header, `height: calc(100vh - <headerHeight>px)`, `width: 100%`) into a reusable `VizAppShell` component.
- Wraps children in `<VedaUIWrapper datasets={datasets}>` so theme, devseed-ui theme provider, veda-ui config, data context, and the modal-portal `data-veda-ui-root` side effect all behave identically across apps.
- Single prop: `children` (plus optional `datasets` to forward to `VedaUIWrapper`).

After this refactor, `app/(datasets)/exploration/exploration.tsx` is a thin component that only renders `DatasetSelectorModal` + `ExplorationAndAnalysis`, with no layout of its own. `/exploration/page.tsx` and `/explore/[app]/[dataset]/page.tsx` both wrap their inner apps in `VizAppShell`.

## Reusable deck.gl + MapLibre canvas

A small **shared module** at `app/viz-apps/shared/deckgl-maplibre/` provides the deck.gl + MapLibre wiring for any future map-based app. It is **not coupled** to any specific viz app.

### What it owns

- MapLibre instantiation and lifecycle (mount, unmount, view-state management).
- The deck.gl `MapboxOverlay` (interleaved mode) attached to the MapLibre map.
- A configurable basemap (defaults to Carto positron; overridable via prop).
- Sizing — fills its container 100%/100% (paired with `VizAppShell` for full-viewport layouts).
- Loading and error UI scaffolding for tile-source apps that need it.
- **Labels above deck.gl content** by default — see [Labels-above behavior](#labels-above-behavior).
- **Async initial view state** — handles view state arriving *after* mount (e.g. from a TileJSON fetch).

### Public API

```ts
// app/viz-apps/shared/deckgl-maplibre/index.ts

export interface DeckglMaplibreCanvasProps {
  layers: Layer[];                                // deck.gl layers
  initialViewState?: InitialViewState;            // optional; can be supplied async
  basemapStyle?: string | StyleSpecification;     // defaults to Carto positron
  overlayChildren?: ReactNode;                    // absolutely-positioned overlay slot
  status?: { loading?: boolean; error?: string }; // built-in alert + spinner
}
export function DeckglMaplibreCanvas(props: DeckglMaplibreCanvasProps): JSX.Element;

export function useTileJson(url: string): {
  data?: TileJsonResponse;
  initialViewState?: InitialViewState;
  loading: boolean;
  error?: string;
};
```

`DeckglMaplibreCanvas` is presentational — it doesn't know about TileJSON, MVT layers, datasets, or the app registry. Apps decide what `Layer[]` to give it.

`useTileJson` is provided because multiple future apps may want to fetch a TileJSON-shaped source (raster, vector, hybrid). It fetches once per URL, derives an `InitialViewState` from `bounds`, and **aborts in-flight fetches** on unmount / url-change via `AbortController`.

### Labels-above behavior

By default the canvas keeps MapLibre symbol layers (place names, road labels) on top of the deck.gl overlay. Once the basemap style loads, it picks a `beforeId` per layer using this heuristic:

> The first symbol layer with no non-symbol layers after it.

This is more robust than "first symbol layer" because some basemaps (e.g. Carto positron) place an early `waterway_label` symbol *before* the building/road fill layers — picking that as `beforeId` would silently push deck.gl content under the basemap buildings. Walking from the end of the layer array backward to the last non-symbol layer, then taking the next symbol after it, lands on the start of the contiguous trailing label band (place names, road names, etc.). Deck.gl content ends up above all basemap polygons/lines but below all labels.

If the basemap has no symbol layers, the canvas falls back to "append at top" — deck.gl renders above everything.

### Async initial view state

The canvas mount effect runs with `[]` deps, so it constructs the MapLibre `Map` once with whatever `initialViewState` was passed at first render. Many tile-source apps don't know the right initial view until they've fetched a TileJSON's `bounds` — that may resolve *after* the canvas has already mounted with a default world view.

A second effect handles this: when `initialViewState` transitions from the default to a real value, the canvas calls `map.jumpTo(...)` exactly once, then locks. Subsequent prop changes do not re-jump (so user pan/zoom is preserved).

## Explore button on the catalog detail page

The catalog detail page (`app/(datasets)/data-catalog/[slug]/page.tsx`) renders an **Explore button** in the dataset hero. The button's destination is resolved server-side via `resolveVizTarget(viz, datasetId)`:

- If the dataset declares a registered single-dataset `viz`, the button deep-links to `/explore/<viz>/<datasetId>`.
- Otherwise it falls back to `/exploration?search=<datasetId>` (which the dispatcher handles).

This is implemented by passing an `exploreHref` prop into `DatasetHero`, which renders the button inside `<PageHero>`'s `renderDetailsBlock` slot.

## Files

This list reflects what was actually shipped.

**Shared types**
- `app/types/viz-app.ts` — `VizKey`, `AppShape`, `AppMeta`, `DatasetWithViz`.

**Wrapper system**
- `app/viz-apps/apps-meta.ts` — server-safe metadata.
- `app/viz-apps/registry.tsx` — client-side component map + `VizAppRenderer`.
- `app/viz-apps/dispatch.ts` — `resolveVizTarget()` helper.
- `app/viz-apps/shell.tsx` — `VizAppShell`.
- `app/(datasets)/explore/[app]/[dataset]/page.tsx` — wrapper route.
- `app/(datasets)/exploration/page.tsx` — modified to add the server-side dispatcher.
- `app/(datasets)/exploration/exploration.tsx` — refactored to use `VizAppShell`.
- `app/(datasets)/data-catalog/[slug]/page.tsx` — modified to compute `exploreHref`.
- `app/(datasets)/data-catalog/[slug]/dataset-hero.tsx` — modified to accept `exploreHref` and render the button inside the hero.

**Shared deck.gl + MapLibre module**
- `app/viz-apps/shared/deckgl-maplibre/index.ts`
- `app/viz-apps/shared/deckgl-maplibre/canvas.tsx`
- `app/viz-apps/shared/deckgl-maplibre/use-tile-json.ts`

**Untouched**
- `VedaUIWrapper` and providers under `app/store/providers/*`.
- Veda-ui's catalog cards (the redirect handles per-dataset routing).
- All existing dataset MDX files (absent `viz` defaults to exploration).

## Setup / dependencies

**Required deck.gl + MapLibre packages** (direct deps):
- `maplibre-gl`
- `@deck.gl/core`
- `@deck.gl/layers`
- `@deck.gl/geo-layers`
- `@deck.gl/mapbox`
- `@deck.gl/extensions` — transitive peer of `@deck.gl/geo-layers`. Not auto-installed.
- `@deck.gl/mesh-layers` — transitive peer of `@deck.gl/geo-layers`. Not auto-installed.

**Package manager:** `package.json` has `"packageManager": "yarn@1.22.22"`. Corepack on Node 20+ otherwise defaults to yarn 4, which would silently regenerate `yarn.lock` in yarn-4 format and install via Plug'n'Play instead of `node_modules`, breaking `next dev`. With the pin in place, fresh setups use yarn 1 automatically. Always use yarn 1 (`npx yarn@1.22.22 add <pkg>` works without the pin too).

## Error handling

| Situation | Behavior |
|---|---|
| Dataset has `viz` that matches a registered single-dataset app | Redirect from `/exploration` to `/explore/<viz>/<id>`. |
| Dataset has `viz` that does **not** match any registered app | **Lenient fallback.** Log a console warning, fall through to rendering the existing exploration. Rationale: a typo in mdx shouldn't break Explore. |
| Dataset has no `viz` field | Render exploration as today. |
| URL hits `/explore/<unknown-app>/<id>` directly | `notFound()` (404). |
| URL hits `/explore/<app>/<unknown-id>` | `notFound()` (404). |
| URL hits `/explore/<multi-dataset-app>/<id>` | `notFound()` (404). |
| App's data fetch fails (e.g. tile-source unreachable) | The shared canvas's `status.error` surface renders an inline alert; basemap and pan/zoom remain usable. |

## Testing

### Unit (vitest)

- **`resolveVizTarget`:** covers absent `viz` → `null`, registered single → redirect target, registered multi → `null`, unknown key → `null` (lenient), missing dataset → `null`.
- **MDX parsing:** existing tests cover `parseAttributes` round-tripping; the `viz` field is a primitive and flows through unchanged.

### Component (React Testing Library)

- **`DeckglMaplibreCanvas`** with mocked MapLibre + `MapboxOverlay`: asserts the overlay is created and given the supplied `layers`; that `overlayChildren` are mounted; that `status.error` renders an inline alert; that layer-prop updates flow through `setProps`; that `initialViewState` arriving after mount triggers a single `jumpTo`; that the labels-above heuristic clones layers with the correct `beforeId` for both simple and Carto-positron-style layer arrangements.
- **`useTileJson`** with mocked `fetch`: success returns parsed data + derived `initialViewState`; HTTP error and rejected fetch both set `error`.

App-specific tests live with each app under `__test__/viz-apps/`.

### Testing constraints

- `@testing-library/jest-dom` is **not** set up. Don't use `.toBeInTheDocument()` — use `screen.getByText(...)` and rely on the throw-on-miss, or assert against `.textContent`.
- Use `act` from `@testing-library/react` (not from `react`).
- Maplibre mocks must include `jumpTo`, `getStyle`, and an `on` handler that captures the `load` callback — the canvas relies on all three.

## Open assumptions

These were picked during brainstorming with a recommendation; they can be flipped with no architectural impact.

1. **Lenient vs strict unknown `viz`.** Recommended and shipped: **lenient** (fall through to exploration with a console warning). Strict alternative: 404. Flip is a one-line change in the dispatcher.
2. **Default basemap.** Carto positron. Apps can override via the `basemapStyle` prop on the shared canvas.
3. **Labels-above heuristic.** Picks the first symbol layer with no non-symbol layers after it. Works for typical basemaps; if a future basemap has post-label fill-extrusions (unusual), they would render above deck.gl content — at that point we'd add an opt-in canvas prop to override.
