'use client';

import React, { ReactNode } from 'react';
import VedaUIConfigProvider from 'app/store/providers/veda-ui-config';
import DataProvider from 'app/store/providers/data';
import DevseedUIThemeProvider from 'app/store/providers/theme';
import { DatasetMetadata } from 'app/types/content';

// SINGLE IMPORT POINT for all veda-ui/USWDS styles
// These are wrapped in @layer(uswds) for lowest cascade priority
import 'app/styles/veda-ui-layered.css';

interface VedaUIWrapperProps {
  children: ReactNode;
  datasets?: DatasetMetadata[];
}

/**
 * Wrapper component for veda-ui library components.
 * This is the ONLY place that imports veda-ui CSS.
 * All veda-ui components (CatalogContent, StoriesHubContent, PageHero, etc.)
 * must be wrapped with this component.
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
