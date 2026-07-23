'use client';

import React from 'react';
import { PageHero } from '@lib';
import type { StoryData } from '@lib';
import ContentTaxonomy from 'app/components/content-taxonomy';

export default function StoryHero({ story }: { story: StoryData }) {
  return (
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
  );
}
