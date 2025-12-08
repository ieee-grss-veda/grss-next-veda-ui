import React from 'react';
import dynamic from 'next/dynamic';
import { getStoriesMetadata } from 'app/content/utils/mdx';

// CSS imports moved to hub.tsx (client component) to prevent global style conflicts

// @NOTE: Dynamically load to ensure only CSR since these depends on VedaUI ContextProvider for routing...
const StoriesHub = dynamic(() => import('./hub'), {
  ssr: false,
  loading: () => <p className='p-8 text-center'>Loading...</p>,
});

export default function Page() {
  const stories = getStoriesMetadata().map((d) => ({
    ...d.metadata,
    path: `stories/${d.slug}`,
  }));

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='mt-16 mb-6'>
        <h1 className='text-3xl font-bold'>Stories</h1>
        <p className='text-base mt-2 text-muted-foreground'>
          This dashboard explores key indicators to track and compare changes
          over time.
        </p>
      </div>
      <StoriesHub stories={stories} />
    </div>
  );
}
