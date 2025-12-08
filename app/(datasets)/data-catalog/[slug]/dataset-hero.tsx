'use client';
import React from 'react';
import { PageHero, LegacyGlobalStyles } from '@lib';
import Providers from 'app/(datasets)/providers';

// Import USWDS/veda-ui CSS only in this client component
import '../../../styles/index.scss';
import '@teamimpact/veda-ui/lib/main.css';

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
    <div className='veda-ui-scope'>
      <Providers>
        <LegacyGlobalStyles />
        <PageHero
          title={title}
          description={description}
          coverSrc={coverSrc}
          coverAlt={coverAlt}
        />
      </Providers>
    </div>
  );
}
