import React from 'react';
import dynamic from 'next/dynamic';
import { getTransformedDatasetMetadata } from 'app/content/utils/mdx';

// CSS imports moved to catalog.tsx (client component) to prevent global style conflicts

// @NOTE: Dynamically load to ensure only CSR since this depends ContextProviders for routing and etc...
const Catalog = dynamic(() => import('./catalog'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading...</p>,
});

export default function Page() {
  const transformed = getTransformedDatasetMetadata();

  return (
    <div className='flex-1'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <section>
          <div className='mt-16 mb-16'>
            <h1 className='text-3xl font-bold'>Data Catalog</h1>
            <p className='text-base mt-2 text-muted-foreground'>
              This dashboard explores key indicators to track and compare
              changes over time.
            </p>
          </div>

          <Catalog datasets={transformed} />
        </section>
      </div>
    </div>
  );
}
