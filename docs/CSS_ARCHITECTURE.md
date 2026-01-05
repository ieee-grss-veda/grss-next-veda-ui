# CSS Architecture Documentation

This document explains the CSS architecture of the GRSS VEDA UI application, including the integration with veda-ui library components and the solutions implemented to resolve CSS conflicts.

## Overview

The application uses a dual-styling approach:
- **Tailwind CSS** - Primary styling framework for custom pages (home, about, dashboard)
- **veda-ui Library** - Pre-built components (CatalogContent, StoriesHubContent, ExplorationAndAnalysis) that use styled-components internally

## Architecture History

### Previous Architecture (USWDS-based)

The original architecture used three CSS systems:
1. **USWDS (U.S. Web Design System)** - Government design system via `@uswds/uswds`
2. **Tailwind CSS** - Utility-first CSS framework
3. **styled-components** - CSS-in-JS used by veda-ui library

This caused significant CSS conflicts, with USWDS styles overriding Tailwind and vice versa.

### Current Architecture (Tailwind + veda-ui)

After simplification:
1. **Tailwind CSS** - Primary styling (via `globals.css`)
2. **veda-ui styled-components** - Scoped within `VedaUIWrapper` component
3. **CSS Variables** - Shared design tokens between systems

## Key Files

| File | Purpose |
|------|---------|
| `app/globals.css` | Tailwind CSS entry point, CSS variables, base styles |
| `app/styles/veda-ui-scope.css` | CSS overrides for veda-ui components |
| `app/components/veda-ui-wrapper.tsx` | Unified wrapper for veda-ui components |
| `app/store/providers/theme.tsx` | styled-components theme configuration |
| `app/lib/index.ts` | Re-exports veda-ui components with 'use client' directive |

## Problems Solved

### Problem 1: Font Persistence Issue

**Symptom:** After visiting pages with veda-ui components (data-catalog, stories, exploration), the "Open Sans" font persisted across the entire application, even on Tailwind-only pages.

**Root Cause:** The `LegacyGlobalStyles` component from veda-ui uses styled-components' `createGlobalStyle` to inject CSS globally into the document head:

```css
body {
  font-family: "Open Sans", sans-serif;
}
```

This CSS persists in the DOM even after navigating away from veda-ui pages because styled-components doesn't automatically remove global styles when components unmount.

**Solution:** Override the default font-family in the theme configuration (`app/store/providers/theme.tsx`):

```typescript
const VEDA_OVERRIDE_THEME = {
  type: {
    base: {
      // Override default "Open Sans" to match app's font stack
      family: "'Frutiger', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      // ... other properties
    },
  },
};
```

### Problem 2: USWDS Overriding Tailwind

**Symptom:** USWDS utility classes and component styles conflicted with Tailwind classes, causing inconsistent styling across pages.

**Root Cause:** Both USWDS and Tailwind define global utility classes (e.g., `.text-center`, `.flex`, `.border`). USWDS styles loaded via `index.scss` had higher specificity in some cases.

**Solution:**
1. Removed USWDS entirely (`@uswds/uswds`, `@trussworks/react-uswds`)
2. Deleted USWDS-related files (`index.scss`, `_uswds-theme.scss`, `homepage.scss`)
3. Removed `sassOptions` from `next.config.js`
4. Created CSS overrides in `veda-ui-scope.css` to style veda-ui components with Tailwind design tokens

### Problem 3: Inconsistent Provider Patterns

**Symptom:** Two different wrapper patterns existed (`Providers` and `VedaUIWrapper`), causing confusion and inconsistent CSS loading.

**Root Cause:**
- `Providers` had `DevseedUIThemeProvider` but no CSS imports
- `VedaUIWrapper` had CSS imports but was missing `DevseedUIThemeProvider`

**Solution:** Consolidated into a single `VedaUIWrapper` component that:
- Wraps content in `DevseedUIThemeProvider` (required for styled-components theme)
- Wraps in `VedaUIConfigProvider` (API endpoints, navigation)
- Optionally wraps in `DataProvider` (dataset state)
- Imports veda-ui CSS (`@teamimpact/veda-ui/lib/main.css`)
- Applies `veda-ui-scope` CSS class for style isolation

## Current Implementation

### VedaUIWrapper Component

```tsx
// app/components/veda-ui-wrapper.tsx
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

### CSS Scoping Strategy

The `veda-ui-scope` class creates CSS isolation:

```css
/* app/styles/veda-ui-scope.css */

/* Creates stacking context for isolation */
.veda-ui-scope {
  isolation: isolate;
  position: relative;
}

/* Font inheritance for all elements */
.veda-ui-scope,
.veda-ui-scope * {
  font-family: inherit;
}

/* Override veda-ui/USWDS styles with Tailwind design tokens */
.veda-ui-scope .usa-card__container {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background-color: var(--card);
}
```

### CSS Variables (Design Tokens)

Shared between Tailwind and veda-ui-scope via CSS custom properties:

```css
/* app/globals.css */
:root {
  --primary: #00629b;
  --primary-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --card: #ffffff;
  --radius: 0.625rem;
  /* ... more tokens */
}

.dark {
  --primary: #66b3db;
  --border: oklch(0.269 0 0);
  --card: oklch(0.205 0 0);
  /* ... dark mode overrides */
}
```

## Usage Guidelines

### Using veda-ui Components

Always wrap veda-ui components with `VedaUIWrapper`:

```tsx
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import { CatalogContent } from '@lib';

export default function Catalog({ datasets }) {
  return (
    <VedaUIWrapper>
      <CatalogContent datasets={datasets} />
    </VedaUIWrapper>
  );
}
```

### When to Use VedaUIWrapper

Use `VedaUIWrapper` for pages that render these veda-ui components:
- `CatalogContent` - Data catalog page
- `StoriesHubContent` - Stories listing page
- `ExplorationAndAnalysis` - Exploration/analysis page
- `PageHero` - Hero sections on dataset/story pages
- `DatasetSelectorModal` - Dataset selection modal
- MDX content with veda-ui blocks (Map, ScrollytellingBlock, etc.)

### When NOT to Use VedaUIWrapper

Do not use `VedaUIWrapper` for:
- Pure Tailwind pages (home, about, dashboard)
- Custom components built with Tailwind
- Pages that don't use veda-ui library components

## Component Dependencies

### DevseedUIThemeProvider (Required)

veda-ui components depend on styled-components theme context:
- `mediaRanges` - Responsive design breakpoints
- `breakpoints` - Theme breakpoints
- `color` - Color palette
- `type` - Typography settings
- `layout` - Layout constraints

Without `DevseedUIThemeProvider`, you'll see errors like:
- "Cannot read properties of undefined (reading 'mediaRanges')"

### LegacyGlobalStyles (Conditional)

Some veda-ui components require `LegacyGlobalStyles` for proper rendering:
- `PageHero`
- MDX content blocks
- `ExplorationAndAnalysis`

Import and render it within `VedaUIWrapper`:

```tsx
import { LegacyGlobalStyles } from '@lib';

<VedaUIWrapper>
  <LegacyGlobalStyles />
  <PageHero title="..." />
</VedaUIWrapper>
```

## Dark Mode Support

The application supports dark mode via:
1. `ThemeProvider` from `next-themes` (wraps entire app)
2. `.dark` class applied to root element
3. CSS variables that change in dark mode
4. Dark mode overrides in `veda-ui-scope.css`

Example dark mode override:

```css
.dark .veda-ui-scope .usa-card__container {
  background-color: var(--card);
  border-color: var(--border);
}
```

## Troubleshooting

### Font Issues

**Problem:** Wrong font showing on pages

**Check:**
1. Verify `type.base.family` is set in `app/store/providers/theme.tsx`
2. Ensure `font-family: inherit` is applied in `veda-ui-scope.css`
3. Check browser DevTools for computed font-family

### Style Conflicts

**Problem:** Tailwind styles not applying correctly

**Check:**
1. Ensure veda-ui components are wrapped in `VedaUIWrapper`
2. Check CSS specificity - may need `!important` in `veda-ui-scope.css`
3. Verify CSS variables are defined in `globals.css`

### Component Errors

**Problem:** "mediaRanges undefined" or similar errors

**Solution:** Ensure component is wrapped in `VedaUIWrapper` which provides `DevseedUIThemeProvider`

## Migration Notes

### Removed Dependencies

The following packages were removed as part of the USWDS cleanup:
- `@uswds/uswds`
- `@trussworks/react-uswds`

### Deleted Files

- `app/styles/index.scss`
- `app/styles/_uswds-theme.scss`
- `app/styles/homepage.scss`
- `app/(datasets)/providers.tsx`
- `app/page_.tsx` (legacy)
- `app/layout_.tsx` (legacy)
- `app/components/header_.tsx` (legacy)
- `app/components/footer_.tsx` (legacy)

### Configuration Changes

Removed from `next.config.js`:
```js
sassOptions: {
  includePaths: [
    'node_modules/@uswds/uswds',
    'node_modules/@uswds/uswds/dist',
    'node_modules/@uswds/uswds/packages',
  ],
}
```

## Testing Checklist

After making CSS changes, verify:

1. **Font Consistency**
   - Navigate: Home → Data Catalog → Home
   - Font should remain consistent (not switch to Open Sans)

2. **Tailwind Pages**
   - Home page renders correctly
   - About page renders correctly
   - Dashboard components work

3. **veda-ui Pages**
   - `/data-catalog` - Cards, search, filters display correctly
   - `/stories` - Story cards display correctly
   - `/exploration` - Map and analysis tools work
   - `/data-catalog/[slug]` - Dataset detail with PageHero
   - `/stories/[slug]` - Story detail with MDX content

4. **Dark Mode**
   - Toggle dark mode on all page types
   - Verify colors adapt correctly
   - Check veda-ui components in dark mode

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [styled-components Documentation](https://styled-components.com/docs)
- [veda-ui Library](https://github.com/NASA-IMPACT/veda-ui)
- [Next.js CSS Support](https://nextjs.org/docs/app/building-your-application/styling)
