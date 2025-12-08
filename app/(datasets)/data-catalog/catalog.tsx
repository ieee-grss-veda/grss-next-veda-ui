'use client';
import React from 'react';
import { CatalogContent, useFiltersWithQS } from '@lib';
import Providers from '../providers';

// Import USWDS/veda-ui CSS only in this client component
// These styles are scoped by the veda-ui-scope wrapper below
import '../../styles/index.scss';
import '@teamimpact/veda-ui/lib/main.css';

export default function Catalog({ datasets }: { datasets: any }) {
  const controlVars = useFiltersWithQS();

  return (
    <div className='veda-ui-scope'>
      <Providers>
        <CatalogContent
          datasets={datasets}
          search={controlVars.search}
          onAction={controlVars.onAction}
          taxonomies={controlVars.taxonomies}
        />
      </Providers>
    </div>
  );
}
