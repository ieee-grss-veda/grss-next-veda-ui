import React from 'react';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { getDatasets } from 'app/content/utils/mdx';
import { resolveVizTarget } from 'app/viz-apps/dispatch';
import type { DatasetWithViz } from 'app/types/viz-app';
import DatasetHero from './dataset-hero';

// CSS imports moved to dataset-hero.tsx (client component) to prevent global style conflicts

export default function DatasetOverviewPage({ params }: { params: any }) {
  const dataset = getDatasets().find((dataset) => dataset.slug === params.slug);

  if (!dataset) {
    notFound();
  }

  // Pick the right Explore destination: a registered single-dataset app gets
  // a direct deep link; everything else routes through /exploration where the
  // server-side dispatcher handles it (and the existing exploration UI renders
  // when no viz is set).
  const viz = (dataset.metadata as DatasetWithViz).viz;
  const exploreHref =
    resolveVizTarget(viz, dataset.metadata.id) ??
    `/exploration?search=${encodeURIComponent(dataset.metadata.id)}`;

  return (
    <section>
      <article className='prose'>
        <DatasetHero
          title={dataset.metadata.name}
          description={dataset.metadata.description}
          coverSrc={dataset.metadata.media?.src}
          coverAlt={dataset.metadata.media?.alt}
          attributionAuthor={dataset.metadata.media?.author?.name}
          attributionUrl={dataset.metadata.media?.author?.url}
          taxonomy={dataset.metadata.taxonomy}
          exploreHref={exploreHref}
        />
        <CustomMDX source={dataset.content} />
      </article>
    </section>
  );
}
