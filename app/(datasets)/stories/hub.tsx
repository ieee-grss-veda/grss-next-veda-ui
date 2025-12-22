'use client';
import React from 'react';
import { StoriesHubContent, useFiltersWithQS } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';

export default function Hub({ stories: allStories }: { stories: any }) {
  const controlVars = useFiltersWithQS();

  return (
    <VedaUIWrapper>
      <StoriesHubContent
        allStories={allStories}
        onFilterchanges={() => controlVars}
        storiesString={{
          one: 'story',
          other: 'stories',
        }}
      />
    </VedaUIWrapper>
  );
}
