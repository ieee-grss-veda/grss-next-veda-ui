'use client';

import AcknowledgementsSection from './components/acknowledgements-section';
import { useTheme } from './components/common/theme-provider';
import DataStoriesSection from './components/data-stories-section';
import FeaturesSection from './components/features-section';
import GetStartedSection from './components/get-started-section';
import HeroSection from './components/hero-section';
import WhoBenefitsSection from './components/who-benefits-section';

export default function HomePage() {
  const { theme } = useTheme();
  return (
    <>
      <main id='main-content'>
        <HeroSection
          imageSrc='https://images.unsplash.com/photo-1576403382893-28872d80f57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'
          badgeText='Earth Observation Platform'
          heading={
            <>
              Welcome to
              <br />
              <span style={{ color: 'var(--ieee-blue)' }}>GRSS VEDA</span>
            </>
          }
          subheading={
            <>
              The Geoscience and Remote Sensing Society's (GRSS) Visualization,
              Exploration, and Data Analysis (VEDA) Platform is a cloud-based,
              collaborative platform for GRSS members, designed to facilitate
              the exploration, analysis, and visualization of Earth observation
              data by providing{' '}
              <strong className='text-foreground'>
                cloud-native AI tools, data, and infrastructure.
              </strong>
            </>
          }
          primaryButton={{
            text: 'Explore Platform',
          }}
          secondaryButton={{
            text: 'Learn More',
          }}
        />
        <FeaturesSection />
        <DataStoriesSection />
        <WhoBenefitsSection />
        <GetStartedSection />
        <AcknowledgementsSection />
      </main>
    </>
  );
}
