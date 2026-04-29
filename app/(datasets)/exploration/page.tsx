import React from 'react';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import {
  getDatasets,
  getTransformedDatasetMetadata,
} from 'app/content/utils/mdx';
import { resolveVizTarget } from 'app/viz-apps/dispatch';
import type { DatasetWithViz } from 'app/types/viz-app';

const ExplorationAnalysis = dynamic(() => import('./exploration'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading...</p>,
});

interface PageProps {
  searchParams?: { search?: string };
}

export default function Page({ searchParams }: PageProps) {
  const requestedId = searchParams?.search;

  if (requestedId) {
    const dataset = getDatasets().find((ds) => ds.metadata.id === requestedId);
    if (dataset) {
      const viz = (dataset.metadata as DatasetWithViz).viz;
      const target = resolveVizTarget(viz, requestedId);
      if (target) {
        redirect(target);
      }
      // Lenient fallback: if `viz` is set but unresolved (unknown key, multi
      // app, etc.), we render exploration as today. Surface a hint in the
      // server log to help authors notice typos.
      if (viz && viz !== 'exploration') {
        // eslint-disable-next-line no-console
        console.warn(
          `[viz-apps] Dataset "${requestedId}" declares viz="${viz}" which is not a registered single-dataset app; falling back to exploration.`,
        );
      }
    }
  }

  const datasets: any[] = getTransformedDatasetMetadata();
  return (
    <section>
      <ExplorationAnalysis datasets={datasets} />
    </section>
  );
}
