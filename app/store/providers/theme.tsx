'use client';
/**
 * Theme provider for veda-ui styled-components.
 * This is REQUIRED for veda-ui components (CatalogContent, StoriesHubContent, PageHero, etc.)
 * as they depend on styled-components theme context for mediaRanges, breakpoints, etc.
 *
 * Note: This is separate from the app's main ThemeProvider (app/components/common/theme-provider.tsx)
 * which handles light/dark mode. Both providers are needed:
 * - Main ThemeProvider: light/dark mode for the app shell
 * - DevseedUIThemeProvider: styled-components context for veda-ui library components
 */
import React, { ReactNode } from 'react';
import { createUITheme } from '@devseed-ui/theme-provider';
import { DevseedUiThemeProvider } from '@lib';

// Theme values for veda-ui styled-components
// Be mindful that these values are used for VEDA UI components
// Use this page to look up the value: https://designsystem.digital.gov/design-tokens/color/system-tokens/
const VEDA_OVERRIDE_THEME = {
  zIndices: {
    hide: -1,
    docked: 10,
    sticky: 900,
    dropdown: 1550,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  color: {
    base: '#2c3e50',
    primary: '#d83933',
    link: '#6f3331',
    danger: '#FC3D21',
    infographicA: '#fcab10',
    infographicB: '#f4442e',
    infographicC: '#b62b6e',
    infographicD: '#2ca58d',
    infographicE: '#2276ac',
  },
  type: {
    base: {
      leadSize: '1.25rem',
      extrabold: '800',
      line: 'inherit',
      // Override default "Open Sans" to match app's Frutiger font stack
      family:
        "'Frutiger', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      // Increments to the type.base.size for each media breakpoint.
      sizeIncrement: {
        small: '0rem',
        medium: '0rem',
        large: '0.25rem',
        xlarge: '0.25rem',
      },
    },
    heading: {
      settings: '"wdth" 100, "wght" 700',
    },
  },
  layout: {
    min: '384px',
    max: '1440px',
    glspMultiplier: {
      xsmall: 1,
      small: 1,
      medium: 1.5,
      large: 2,
      xlarge: 2,
    },
  },
};

function DevseedUIThemeProvider({
  children,
}: {
  children: JSX.Element | ReactNode;
}) {
  return (
    <DevseedUiThemeProvider theme={createUITheme(VEDA_OVERRIDE_THEME)}>
      {children}
    </DevseedUiThemeProvider>
  );
}

export default DevseedUIThemeProvider;
