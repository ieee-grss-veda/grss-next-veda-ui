# USWDS Style Isolation Fix - Documentation

## Problem Statement

1. **USWDS styles were overriding Tailwind** - The `@forward 'uswds'` in `index.scss` loaded USWDS globally, causing it to override Tailwind utilities throughout the app
2. **Hacky workaround wasn't working** - `veda-ui-scope.css` had 73 `!important` declarations trying to fight USWDS specificity
3. **CSS imports scattered everywhere** - Multiple files importing CSS independently
4. **veda-ui library needs USWDS** - Components like `CatalogContent` and `StoriesHubContent` internally depend on USWDS grid classes
5. **veda-ui doesn't include USWDS grid definitions** - The library uses USWDS grid classes but doesn't bundle the grid CSS itself

## Solution: CSS Layers + Scoped Grid Utilities

We use two strategies:

### 1. CSS Layers for Cascade Priority

```css
@layer uswds, tailwind, app;
```

**Priority order (lowest → highest):**

1. `uswds` - USWDS/veda-ui styles (easily overridden)
2. `tailwind` - Tailwind utilities
3. `app` - Custom application styles (highest priority)

### 2. Scoped USWDS Grid Utilities

USWDS grid classes are **scoped to `.veda-ui-scope`** wrapper, ensuring they only apply within veda-ui components and don't leak to the rest of the application.

```css
/* Grid classes only work inside .veda-ui-scope */
.veda-ui-scope .grid-col-6 { width: 50%; flex: 0 0 auto; }
.veda-ui-scope .tablet\:grid-col-6 { ... }
```

---

## Files

| File | Purpose |
|------|---------|
| `app/styles/veda-ui-layered.css` | Imports veda-ui CSS + scoped grid into `uswds` layer |
| `app/styles/veda-ui-grid-scoped.css` | **Scoped USWDS grid utilities** - all grid classes prefixed with `.veda-ui-scope` |
| `app/globals.css` | Layer declarations, Tailwind in layer, app styles |
| `app/components/veda-ui-wrapper.tsx` | Centralized CSS imports, providers, wraps children in `.veda-ui-scope` |

---

## Key Implementation Details

### 1. globals.css - Layer Architecture

```css
@layer uswds, tailwind, app;

@layer tailwind {
  @import 'tailwindcss';
}

@layer app {
  /* Base styles, typography, non-scoped utilities */
}
```

### 2. veda-ui-layered.css - Layer Wrapping + Scoped Grid

```css
/* Import veda-ui's pre-compiled CSS into the uswds layer */
@import '@teamimpact/veda-ui/lib/main.css' layer(uswds);

/*
 * Import scoped USWDS grid utilities into the uswds layer.
 * These grid classes ONLY apply within .veda-ui-scope wrapper,
 * preventing any leakage to the rest of the application.
 */
@import './veda-ui-grid-scoped.css' layer(uswds);
```

### 3. veda-ui-grid-scoped.css - Scoped Grid System

All USWDS grid utilities scoped to `.veda-ui-scope`:

```css
/* Grid Container - scoped */
.veda-ui-scope .grid-container { ... }

/* Grid Row - scoped */
.veda-ui-scope .grid-row { display: flex; flex-wrap: wrap; }

/* Grid Columns - Full 12-column grid */
.veda-ui-scope .grid-col-1 { width: 8.33333%; flex: 0 0 auto; }
.veda-ui-scope .grid-col-6 { width: 50%; flex: 0 0 auto; }
.veda-ui-scope .grid-col-12 { width: 100%; flex: 0 0 auto; }

/* Responsive breakpoints */
@media (min-width: 480px) {
  .veda-ui-scope .mobile-lg\:grid-col-6 { width: 50%; }
}
@media (min-width: 640px) {
  .veda-ui-scope .tablet\:grid-col-6 { width: 50%; }
}
@media (min-width: 1024px) {
  .veda-ui-scope .desktop\:grid-col-6 { width: 50%; }
}
```

### 4. veda-ui-wrapper.tsx - Scope Container

```tsx
import 'app/styles/veda-ui-layered.css';

export default function VedaUIWrapper({ children, datasets }) {
  return (
    <DevseedUIThemeProvider>
      <VedaUIConfigProvider>
        {datasets ? (
          <DataProvider initialDatasets={datasets}>
            <div className='veda-ui-scope'>{children}</div>
          </DataProvider>
        ) : (
          <div className='veda-ui-scope'>{children}</div>
        )}
      </VedaUIConfigProvider>
    </DevseedUIThemeProvider>
  );
}
```

---

## Why This Works

1. **Scoped grid classes** - `.veda-ui-scope .grid-col-*` only matches elements inside the wrapper
2. **No leakage** - Grid styles can't affect elements outside `VedaUIWrapper`
3. **Layer cascade** - Even within scope, Tailwind classes win due to layer priority
4. **No `!important` hacks** - Scoping + layers handle specificity naturally
5. **Single import point** - `VedaUIWrapper` is the only component that imports CSS

---

## Usage Pattern

Any component using veda-ui library components must be wrapped with `VedaUIWrapper`:

```tsx
import VedaUIWrapper from 'app/components/veda-ui-wrapper';

export default function MyPage() {
  return (
    <VedaUIWrapper datasets={datasets}>
      <CatalogContent {...props} />
    </VedaUIWrapper>
  );
}
```

---

## USWDS Breakpoints Reference

| Breakpoint | Min-width | USWDS Token |
|------------|-----------|-------------|
| mobile-lg | 480px | `mobile-lg:` |
| tablet | 640px | `tablet:` |
| desktop | 1024px | `desktop:` |
| desktop-lg | 1200px | `desktop-lg:` |

---

## Testing Checklist

- [ ] `/data-catalog` - CatalogContent renders correctly with proper grid layout
- [ ] `/stories` - StoriesHubContent renders correctly
- [ ] `/exploration` - ExplorationAndAnalysis renders correctly
- [ ] Tailwind classes work on non-veda-ui components without USWDS interference
- [ ] Grid classes outside `.veda-ui-scope` have no effect
- [ ] DevTools shows `@layer uswds`, `@layer tailwind`, `@layer app` in cascade
