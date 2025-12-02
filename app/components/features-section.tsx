import { Brain, Cpu, Map } from 'lucide-react';
import React from 'react';
import SectionHeader from './section-header';
import FeatureCard from './feature-card';

const features = [
  {
    icon: Brain,
    iconColor: 'var(--ieee-blue)',
    title: 'Data-Centric AI for Machine Learning',
    description:
      'Create standardized, AI-ready datasets with comprehensive quality assessments. Build trustworthy data for GeoAI research.',
  },
  {
    icon: Cpu,
    iconColor: 'var(--ieee-blue-75)',
    title: 'GeoAI Toolbox',
    description:
      'Explore, fine-tune, and deploy large geospatial foundation models in a low-code interface with cloud-based training.',
  },
  {
    icon: Map,
    iconColor: 'var(--ieee-blue)',
    title: 'CoMap Labeling Tool',
    description:
      'Collaborative web application for labeling, visualizing, and managing geospatial datasets with version control.',
  },
];

export default function FeaturesSection() {
  return (
    <section
      className='py-24 bg-gradient-to-b from-background to-muted/30'
      aria-labelledby='features-heading'
    >
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <SectionHeader
          className='mb-16'
          badgeText='Platform Capabilities'
          heading='Key Features'
          subheading='Discover our comprehensive suite of tools designed for modern Earth observation research'
          id='features-heading'
        />

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              iconColor={feature.iconColor}
              title={feature.title}
              description={feature.description}
              showButton={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
