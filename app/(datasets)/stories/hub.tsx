'use client';
import React from 'react';
import { StoriesHubContent, useFiltersWithQS } from '@lib';
import Providers from '../providers';

// Import USWDS/veda-ui CSS only in this client component
// These styles are scoped by the veda-ui-scope wrapper below
import '../../styles/index.scss';
import '@teamimpact/veda-ui/lib/main.css';

export default function Hub({ stories: allStories }: { stories: any }) {
  const controlVars = useFiltersWithQS();

  return (
    <div className='veda-ui-scope'>
      <Providers>
        <StoriesHubContent
          allStories={allStories}
          onFilterchanges={() => controlVars}
          storiesString={{
            one: 'story',
            other: 'stories',
          }}
        />
      </Providers>
    </div>
  );
}
