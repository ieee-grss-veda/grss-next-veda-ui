import React from 'react';
import { notFound } from 'next/navigation';
import VizAppShell from 'app/viz-apps/shell';
import { APPS_META } from 'app/viz-apps/apps-meta';
import { SINGLE_APP_REGISTRY } from 'app/viz-apps/registry';
import {
  getDatasets,
  getTransformedDatasetMetadata,
} from 'app/content/utils/mdx';
import type { DatasetWithViz, VizKey } from 'app/types/viz-app';

interface PageProps {
  params: { app: string; dataset: string };
}

export default function Page({ params }: PageProps) {
  const meta = (APPS_META as Record<
    string,
    { key: VizKey; shape: 'single' | 'multi' } | undefined
  >)[params.app];
  if (!meta) notFound();
  if (meta.shape !== 'single') notFound();

  const dataset = getDatasets().find((ds) => ds.metadata.id === params.dataset);
  if (!dataset) notFound();

  const Component = SINGLE_APP_REGISTRY[meta.key];
  if (!Component) notFound();

  const datasets: any[] = getTransformedDatasetMetadata();

  return (
    <section>
      <VizAppShell datasets={datasets}>
        <Component dataset={dataset.metadata as DatasetWithViz} />
      </VizAppShell>
    </section>
  );
}
