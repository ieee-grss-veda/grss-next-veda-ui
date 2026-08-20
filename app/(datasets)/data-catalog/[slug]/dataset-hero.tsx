'use client';
import React from 'react';
import Link from 'next/link';
import { PageHero, LegacyGlobalStyles } from '@lib';
import type { DatasetData } from '@lib';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import ContentTaxonomy from 'app/components/content-taxonomy';
import { Button } from 'app/components/ui/button';

interface DatasetHeroProps {
  title: string;
  description?: string;
  coverSrc?: string;
  coverAlt?: string;
  attributionAuthor?: string;
  attributionUrl?: string;
  taxonomy?: DatasetData['taxonomy'];
  exploreHref?: string;
}

export default function DatasetHero({
  title,
  description,
  coverSrc,
  coverAlt,
  attributionAuthor,
  attributionUrl,
  taxonomy,
  exploreHref,
}: DatasetHeroProps) {
  const hasTaxonomy = !!taxonomy?.length;
  const renderDetailsBlock =
    hasTaxonomy || exploreHref
      ? () => (
          <>
            {hasTaxonomy && (
              <ContentTaxonomy taxonomy={taxonomy} linkBase='/data-catalog' />
            )}
            {exploreHref && (
              <div
                style={{
                  position: 'absolute',
                  right: 64,
                  // Clear the taxonomy row when one is present so the button
                  // doesn't sit on top of the pills.
                  bottom: hasTaxonomy ? 88 : 24,
                  zIndex: 2,
                }}
              >
                <Button asChild size='lg'>
                  <Link href={exploreHref}>Explore</Link>
                </Button>
              </div>
            )}
          </>
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
          attributionAuthor={attributionAuthor}
          attributionUrl={attributionUrl}
          renderDetailsBlock={renderDetailsBlock}
        />
      </div>
    </VedaUIWrapper>
  );
}
