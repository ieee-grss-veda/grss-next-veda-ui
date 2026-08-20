'use client';
import React from 'react';
import { CatalogContent, useFiltersWithQS } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';

export default function Catalog({ datasets }: { datasets: any }) {
  const controlVars = useFiltersWithQS();

  return (
    <VedaUIWrapper>
      {/* veda-ui's search is a <form> with no onSubmit; Enter would reload. */}
      <div onSubmit={(e) => e.preventDefault()}>
        <CatalogContent
          datasets={datasets}
          search={controlVars.search}
          onAction={controlVars.onAction}
          taxonomies={controlVars.taxonomies}
        />
      </div>
    </VedaUIWrapper>
  );
}
