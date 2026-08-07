'use client';

import React from 'react';
import { PageHero, LegacyGlobalStyles } from '@lib';
import type { StoryData } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import ContentTaxonomy from 'app/components/content-taxonomy';

// Brings its own VedaUIWrapper so the page can load it behind `ssr: false`.
export default function StoryHero({ story }: { story: StoryData }) {
  return (
    <VedaUIWrapper>
      <LegacyGlobalStyles />
      <PageHero
        title={story.name}
        description={story.description}
        publishedDate={story.pubDate}
        coverSrc={story.media?.src}
        coverAlt={story.media?.alt}
        attributionAuthor={story.media?.author?.name}
        attributionUrl={story.media?.author?.url}
        renderDetailsBlock={() => (
          <ContentTaxonomy taxonomy={story.taxonomy} linkBase='/stories' />
        )}
      />
    </VedaUIWrapper>
  );
}
