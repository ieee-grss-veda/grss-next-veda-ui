import {
  BarChart3,
  Brain,
  CheckCircle2,
  Cpu,
  Map,
  Workflow,
} from 'lucide-react';
import FeatureCard from './feature-card';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import React from 'react';

export default function WhatVedaOffers() {
  const offerings = [
    {
      icon: Brain,
      title: 'Data-Centric AI for Machine Learning',
      description:
        'Provides users with tools to create standardized, AI-ready metadata and perform comprehensive data quality and reliability assessments. Through its cloud-native environment, users can curate datasets, evaluate bias and consistency, monitor data health, and ensure privacy and responsible AI practices. By integrating these capabilities, the DCAI Toolbox empowers the geoscience community to build trustworthy, high-quality datasets that strengthen downstream GeoAI research and applications.',
    },
    {
      icon: Cpu,
      title: 'GeoAI Toolbox',
      description:
        "An interactive environment within the GRSS VEDA platform that empowers users to explore, fine-tune, and deploy large geospatial foundation models for their own research and applications. Designed for accessibility, it provides a low-code interface that allows GRSS members to upload their datasets, customize pre-trained models such as NASA's Prithvi Geospatial Model, and run training or inference jobs directly in the cloud. By combining AI-driven tools with VEDA's Earth observation data infrastructure, the GeoAI Toolbox makes it easier for the community to build and share powerful models that support digital twin development, environmental monitoring, and other Earth science innovations.",
    },
    {
      icon: Map,
      title: 'CoMap Labeling Tool',
      description:
        'An open-source, collaborative web application integrated with the GRSS VEDA platform, designed to help users label, visualize, and manage geospatial datasets for AI and Earth observation applications. Users can interactively explore multi-band and time-series remote sensing data, customize visualizations, and layer or reorder imagery to analyze changes over time. The tool supports diverse labeling types—such as points, polygons, and polylines—along with dataset folding for team-based labeling and version-controlled storage of curated outputs. With built-in search and retrieval across geospatial, temporal, and attribute-based queries, and flexible access controls for annotators, reviewers, and administrators, CoMap streamlines collaborative dataset creation while ensuring data quality, traceability, and open-science compliance.',
    },
  ];

  const otherServices = [
    {
      icon: BarChart3,
      title: 'Data Analytics Tools & Environment',
      description:
        "Use built-in analytical and visualization tools, powered by modern machine learning and AI methods. Access GRSS VEDA's JupyterHub environment for further data analysis.",
    },
    {
      icon: CheckCircle2,
      title: 'Standards Compliance',
      description:
        'Built on community best practices, including STAC (SpatioTemporal Asset Catalog), OGC standards, and FAIR (Findable, Accessible, Interoperable, Reusable) principles.',
    },
    {
      icon: Workflow,
      title: 'Collaboration & Reproducibility',
      description:
        'Share workflows, notebooks, and data pipelines with colleagues to enhance collaborative research and reproducible science.',
    },
  ];

  return (
    <section
      id='what-veda-offers'
      className='py-16 scroll-mt-20'
      aria-labelledby='what-veda-offers-heading'
    >
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <Badge className='mb-4' variant='secondary'>
              Platform Capabilities
            </Badge>
            <h2 id='what-veda-offers-heading' className='text-4xl mb-4'>
              What VEDA Offers
            </h2>
            <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
              Comprehensive tools and capabilities designed for modern Earth
              observation research
            </p>
          </div>

          {/* Main Offerings - Larger Cards with Full Descriptions */}
          <div className='space-y-6 mb-16'>
            {offerings.map((offering, index) => {
              const Icon = offering.icon;
              return (
                <Card
                  key={index}
                  className='p-8 hover:shadow-lg transition-all hover:border-primary/50 border-2 focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2'
                >
                  <div className='flex items-start gap-6'>
                    <div className='h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0'>
                      <Icon className='h-8 w-8 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='mb-4 text-2xl'>{offering.title}</h3>
                      <p className='text-muted-foreground leading-relaxed text-lg'>
                        {offering.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Other Services Subsection */}
          <div>
            <h3 className='mb-6 text-2xl'>Additional Capabilities</h3>
            <div className='grid md:grid-cols-3 gap-6'>
              {otherServices.map((service, index) => {
                return (
                  <FeatureCard
                    key={index}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
