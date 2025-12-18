'use client';
import React from 'react';
import { CatalogContent, useFiltersWithQS } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';

export default function Catalog({ datasets }: { datasets: any }) {
  const controlVars = useFiltersWithQS();

  return (
    <VedaUIWrapper datasets={datasets}>
      <CatalogContent
        datasets={datasets}
        search={controlVars.search}
        onAction={controlVars.onAction}
        taxonomies={controlVars.taxonomies}
      />
    </VedaUIWrapper>
  );
}
