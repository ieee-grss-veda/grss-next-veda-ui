'use client';

import React, { useMemo } from 'react';
import { useDataStore } from 'app/store/providers/data';
import { MapBlock, ScrollytellingBlock } from '@lib';
import { transformToVedaData } from 'app/utilities/data';

function getDatasetLayers(vedaData: any, datasetId?: string) {
  if (!datasetId) return {};
  const ds = vedaData?.[datasetId];
  return ds?.data?.layers ? { [datasetId]: ds.data.layers } : {};
}

function findLayerById(layersRecord: Record<string, any[]>, layerId?: string) {
  if (!layerId) return null;
  for (const dsId of Object.keys(layersRecord)) {
    const match = (layersRecord[dsId] || []).find((l) => l.id === layerId);
    if (match) return match;
  }
  return null;
}

function toVizDatasetSuccess(layer: any) {
  if (!layer) return null;
  return {
    status: 'success',
    id: layer.id,
    name: layer.name,
    type: layer.type,
    data: layer,
    settings: {
      isVisible: true,
      opacity: 100,
    },
  };
}

export function EnhancedMapBlock({
  datasetId,
  layerId,
  compareDataLayer: compareOverride,
  ...props
}: {
  datasetId: string;
  layerId: string;
  compareDataLayer?: any;
  [key: string]: any;
}) {
  const { datasets } = useDataStore();
  const transformed = useMemo(() => transformToVedaData(datasets), [datasets]);

  const { baseDataLayer, compareDataLayer } = useMemo(() => {
    const layersRecord = getDatasetLayers(transformed, datasetId);

    const baseRaw = findLayerById(layersRecord, layerId);
    const base = toVizDatasetSuccess(baseRaw);

    let compare = compareOverride ?? null;
    if (!compare && baseRaw?.compare?.layerId) {
      const cmpRaw = findLayerById(layersRecord, baseRaw.compare.layerId);
      compare = toVizDatasetSuccess(cmpRaw);
    }

    return { baseDataLayer: base, compareDataLayer: compare };
  }, [transformed, datasetId, layerId, compareOverride]);

  return (
    <MapBlock
      {...props}
      baseDataLayer={baseDataLayer}
      compareDataLayer={compareDataLayer}
    />
  );
}

export function EnhancedScrollyTellingBlock(props) {
  const { datasets } = useDataStore();
  const transformed = transformToVedaData(datasets);
  return <ScrollytellingBlock {...props} datasets={transformed} />;
}
