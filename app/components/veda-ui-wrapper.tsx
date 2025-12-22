'use client';

import React, { ReactNode } from 'react';
import DevseedUIThemeProvider from 'app/store/providers/theme';
import VedaUIConfigProvider from 'app/store/providers/veda-ui-config';
import DataProvider from 'app/store/providers/data';
import { DatasetMetadata } from 'app/types/content';

// Import veda-ui styles - scoped to this wrapper
import '@teamimpact/veda-ui/lib/main.css';
import 'app/styles/veda-ui-scope.css';

interface VedaUIWrapperProps {
  children: ReactNode;
  datasets?: DatasetMetadata[];
}

/**
 * Unified wrapper for veda-ui library components.
 * Provides:
 * - DevseedUIThemeProvider: styled-components theme (mediaRanges, breakpoints)
 * - VedaUIConfigProvider: API endpoints and navigation config
 * - DataProvider: dataset state management (when datasets provided)
 * - CSS scoping via veda-ui-scope class
 */
export default function VedaUIWrapper({
  children,
  datasets,
}: VedaUIWrapperProps) {
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
