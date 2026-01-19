# CSS !important Removal Migration

This document explains the migration from `!important` declarations to ID-based CSS specificity for overriding veda-ui library styles.

## Overview

The veda-ui library (`@teamimpact/veda-ui`) uses styled-components and USWDS styles internally. To override these styles and match our Tailwind design system, we previously used `!important` declarations. This migration replaces that approach with ID-based specificity.

## The Problem

Our override CSS file (`app/styles/veda-ui-scope.css`) had **347 `!important` declarations**. This created several issues:

1. **Maintainability** - `!important` makes it harder to reason about CSS cascade
2. **Specificity wars** - Future overrides might need even more specificity
3. **Best practices** - `!important` is generally considered a code smell

## The Solution

Use **ID selector specificity** to naturally override library styles without `!important`.

### CSS Specificity Basics

| Selector Type | Specificity | Example |
|--------------|-------------|---------|
| Element | (0,0,1) | `div` |
| Class | (0,1,0) | `.card` |
| ID | (1,0,0) | `#root` |

An ID selector `(1,0,0)` beats any number of class selectors `(0,n,0)`.

### Before vs After

**Before (class-based with !important):**
```css
.veda-ui-scope .usa-card {
  background-color: var(--card) !important;
  border: 1px solid var(--border) !important;
}
```

**After (ID-based, no !important):**
```css
#veda-ui-root .usa-card {
  background-color: var(--card);
  border: 1px solid var(--border);
}
```

## Architecture

### Main Wrapper

The `VedaUIWrapper` component provides the ID:

```tsx
// app/components/veda-ui-wrapper.tsx
<div id='veda-ui-root' className='veda-ui-scope'>
  {children}
</div>
```

### Portal Modals

React portals render outside the main DOM tree, so they don't inherit the `#veda-ui-root` ID. For these, we use a data attribute combined with a class for higher specificity:

```tsx
// app/(datasets)/exploration/exploration.tsx
modalWrapper.setAttribute('data-veda-ui-root', 'true');
modalWrapper.classList.add('veda-ui-scope');
```

**Why both attribute and class?**

- Attribute selectors have specificity `(0,1,0)` - same as class selectors
- This is lower than the veda-ui library's internal styles
- Adding `.veda-ui-scope` class increases specificity to `(0,2,0)+` which beats library styles

### CSS Selector Patterns

| Use Case | Selector Pattern | Specificity |
|----------|-----------------|-------------|
| Basic override | `#veda-ui-root .selector` | (1,0,1)+ |
| Dark mode | `.dark #veda-ui-root .selector` | (1,1,1)+ |
| Portal modal | `[data-veda-ui-root].veda-ui-scope .selector` | (0,2,1)+ |
| Portal dark mode | `[data-veda-ui-root].dark .selector` | (0,2,1)+ |

## File Changes

### Modified Files

1. **app/components/veda-ui-wrapper.tsx**
   - Added `id='veda-ui-root'` to wrapper div

2. **app/(datasets)/exploration/exploration.tsx**
   - Added `data-veda-ui-root` attribute for portal modals

3. **app/styles/veda-ui-scope.css**
   - Replaced `.veda-ui-scope` with `#veda-ui-root`
   - Replaced `.dark .veda-ui-scope` with `.dark #veda-ui-root`
   - Replaced `.dark.veda-ui-scope` with `[data-veda-ui-root].dark`
   - Removed all `!important` declarations

## Selector Transformation Reference

| Original | Transformed |
|----------|-------------|
| `.veda-ui-scope .foo` | `#veda-ui-root .foo` |
| `.veda-ui-scope .foo:hover` | `#veda-ui-root .foo:hover` |
| `.dark .veda-ui-scope .foo` | `.dark #veda-ui-root .foo` |
| `.dark.veda-ui-scope .foo` | `[data-veda-ui-root].dark .foo` |
| Portal base styles | `[data-veda-ui-root].veda-ui-scope .foo` |

## Troubleshooting

### Styles Not Applying

If styles aren't applying after migration:

1. **Check the DOM** - Ensure the element is inside `#veda-ui-root` or has `data-veda-ui-root`
2. **Check specificity** - Use browser DevTools to see which rule wins
3. **Portal modals** - Verify the `data-veda-ui-root` attribute is being added

### Re-adding !important

If a specific rule needs `!important` (e.g., veda-ui library uses inline styles):

```css
/* Only use !important when library uses inline styles */
#veda-ui-root .specific-element {
  property: value !important; /* Library uses style="" attribute */
}
```

### Dark Mode Not Working on Modals

Ensure the portal modal handler syncs the `dark` class:

```tsx
if (theme === 'dark') {
  modalWrapper.classList.add('dark');
} else {
  modalWrapper.classList.remove('dark');
}
```

## Testing Checklist

After making CSS changes, verify:

- [ ] Data Catalog (`/data-catalog`) - cards, filters, search
- [ ] Stories Hub (`/stories`) - card grid, topic pills
- [ ] Exploration (`/exploration`) - timeline, dataset modal
- [ ] Dark mode toggle on all pages
- [ ] Modal dark mode syncs correctly

## References

- [CSS Specificity - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)
- [CSS Architecture Documentation](./CSS_ARCHITECTURE.md)
- [veda-ui Library](https://github.com/NASA-IMPACT/veda-ui)
