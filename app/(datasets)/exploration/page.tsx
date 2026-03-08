import React from 'react';
import dynamic from 'next/dynamic';
import { getTransformedDatasetMetadata } from 'app/content/utils/mdx';
import { PageHero } from 'app/lib';

const ExplorationAnalysis = dynamic(() => import('./exploration'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading...</p>,
});

export default function Page() {
  const datasets: any[] = getTransformedDatasetMetadata();
  return (
    <section>
      <ExplorationAnalysis datasets={datasets} />
    </section>
  );
}
