'use client';
import React from 'react';
import Link from 'next/link';
import { PageHero, LegacyGlobalStyles } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import { Button } from 'app/components/ui/button';

interface DatasetHeroProps {
  title: string;
  description?: string;
  coverSrc?: string;
  coverAlt?: string;
  exploreHref?: string;
}

export default function DatasetHero({
  title,
  description,
  coverSrc,
  coverAlt,
  exploreHref,
}: DatasetHeroProps) {
  const renderDetailsBlock = exploreHref
    ? () => (
        <div
          style={{
            position: 'absolute',
            right: 64,
            bottom: 24,
            zIndex: 2,
          }}
        >
          <Button asChild size='lg'>
            <Link href={exploreHref}>Explore</Link>
          </Button>
        </div>
      )
    : undefined;

  return (
    <VedaUIWrapper>
      <LegacyGlobalStyles />
      <div style={{ position: 'relative' }}>
        <PageHero
          title={title}
          description={description}
          coverSrc={coverSrc}
          coverAlt={coverAlt}
          renderDetailsBlock={renderDetailsBlock}
        />
      </div>
    </VedaUIWrapper>
  );
}
