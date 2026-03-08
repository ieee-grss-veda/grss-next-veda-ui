'use client';
import React from 'react';
import { PageHero, LegacyGlobalStyles } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';

interface DatasetHeroProps {
  title: string;
  description?: string;
  coverSrc?: string;
  coverAlt?: string;
}

export default function DatasetHero({
  title,
  description,
  coverSrc,
  coverAlt,
}: DatasetHeroProps) {
  return (
    <VedaUIWrapper>
      <LegacyGlobalStyles />
      <PageHero
        title={title}
        description={description}
        coverSrc={coverSrc}
        coverAlt={coverAlt}
      />
    </VedaUIWrapper>
  );
}
