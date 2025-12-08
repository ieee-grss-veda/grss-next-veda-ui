'use client';

import React, { ReactNode } from 'react';
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
 * Wrapper component for veda-ui library components.
 * This scopes the veda-ui CSS and provides necessary context providers.
 * Use this wrapper around CatalogContent, StoriesHubContent, PageHero, etc.
 */
export default function VedaUIWrapper({
  children,
  datasets,
}: VedaUIWrapperProps) {
  return (
    <VedaUIConfigProvider>
      {datasets ? (
        <DataProvider initialDatasets={datasets}>
          <div className='veda-ui-scope'>{children}</div>
        </DataProvider>
      ) : (
        <div className='veda-ui-scope'>{children}</div>
      )}
    </VedaUIConfigProvider>
  );
}
