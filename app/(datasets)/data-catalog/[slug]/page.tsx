import React from 'react';
import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { getDatasets } from 'app/content/utils/mdx';
import DatasetHero from './dataset-hero';

// CSS imports moved to dataset-hero.tsx (client component) to prevent global style conflicts

export default function DatasetOverviewPage({ params }: { params: any }) {
  const dataset = getDatasets().find((dataset) => dataset.slug === params.slug);

  if (!dataset) {
    notFound();
  }

  return (
    <section>
      <article className='prose'>
        <DatasetHero
          title={dataset.metadata.name}
          description={dataset.metadata.description}
          coverSrc={dataset.metadata.media?.src}
          coverAlt={dataset.metadata.media?.alt}
        />
        <CustomMDX source={dataset.content} />
      </article>
    </section>
  );
}
