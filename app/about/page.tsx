import { ExternalLink, Award, BookOpen } from 'lucide-react';
import React from 'react';

import { Separator } from '../components/ui/separator';
import HeroSection from 'app/components/hero-section';
import WhatVedaOffers from 'app/components/what-veda-offers';
import WhoWeServe from 'app/components/who-we-serve';
import InfoCardSection from 'app/components/info-card-section';
import CommitmentToOpenScience from 'app/components/commitment-to-open-science';
import LearnMore from 'app/components/learn-more';

export default function Page() {
  return (
    <>
      <main id='main-content'>
        {/* Hero Header Section with Image */}
        <HeroSection
          imageSrc='https://images.unsplash.com/photo-1576403382893-28872d80f57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'
          heading='About GRSS VEDA'
          headingStyle={{ color: 'var(--ieee-blue)' }}
          subheading="The Geoscience and Remote Sensing Society's (GRSS) Visualization, Exploration, and Data Analysis (VEDA) Platform"
        >
          <p>
            <strong className='text-foreground'>GRSS VEDA</strong> is an
            advanced platform designed to streamline the discovery, access, and
            analysis of Earth observation data for the GRSS community. Deployed
            and adapted from{' '}
            <a
              href='https://docs.openveda.cloud/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded inline-flex items-center gap-1'
            >
              NASA&apos;s open VEDA infrastructure
              <ExternalLink className='h-4 w-4' />
            </a>{' '}
            , GRSS VEDA empowers researchers, engineers, and data scientists to
            leverage large-scale geospatial datasets alongside AI and
            data-analysis tools, while communicating their findings using
            data-driven storytelling.
          </p>
        </HeroSection>

        <Separator />

        <WhatVedaOffers />

        <Separator />
        <WhoWeServe />

        {/* How to Use GRSS VEDA */}
        <InfoCardSection icon={BookOpen} title='How to Use GRSS VEDA'>
          <p className='text-muted-foreground leading-relaxed text-lg mb-4'>
            To learn more about VEDA and how to use the platform, check out{' '}
            <a
              href='https://docs.openveda.cloud/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded inline-flex items-center gap-1'
            >
              VEDA Docs
              <ExternalLink className='h-4 w-4' />
            </a>
            .
          </p>
        </InfoCardSection>

        <Separator />

        <CommitmentToOpenScience />

        {/* Credits & Acknowledgements */}
        <InfoCardSection icon={Award} title='Credits & Acknowledgements'>
          <p className='text-muted-foreground leading-relaxed text-lg mb-6'>
            GRSS VEDA is a new instance built upon{' '}
            <a
              href='https://www.earthdata.nasa.gov/dashboard'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded inline-flex items-center gap-1'
            >
              NASA&apos;s VEDA
              <ExternalLink className='h-4 w-4' />
            </a>{' '}
            platform, leveraging its architecture, tools, and community
            standards.
          </p>
          <p className='text-muted-foreground leading-relaxed text-lg'>
            We extend our gratitude to NASA for providing the foundation and
            inspiration that makes GRSS VEDA possible.
          </p>
        </InfoCardSection>

        <Separator />

        <LearnMore />
      </main>
    </>
  );
}
