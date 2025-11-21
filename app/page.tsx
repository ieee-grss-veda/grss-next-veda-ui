'use client';

import { Card } from '@trussworks/react-uswds';
import {
  ArrowRight,
  Brain,
  Cpu,
  Calendar,
  Clock,
  ExternalLink,
  Users,
  BarChart3,
  Database,
  Github,
  Map,
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { ImageWithFallback } from './components/common/image-with-fallback';
import { useTheme } from './components/common/theme-provider';

export default function HomePage() {
  const { theme } = useTheme();
  return (
    <>
      <main id='main-content'>
        <section
          className='relative overflow-hidden'
          aria-labelledby='hero-heading'
        >
          {/* Background Image */}
          <div className='absolute inset-0 z-0'>
            <ImageWithFallback
              src='https://images.unsplash.com/photo-1576403382893-28872d80f57e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920'
              alt=''
              className='w-full h-full object-cover opacity-20'
            />
            <div className='absolute inset-0 bg-gradient-to-b from-transparent to-background'></div>
          </div>

          <div className='relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-20'>
            <div className='max-w-4xl mx-auto text-center'>
              <Badge className='mb-6' variant='secondary'>
                Earth Observation Platform
              </Badge>
              <h1
                id='hero-heading'
                className='text-5xl lg:text-6xl mb-6 leading-tight'
              >
                Welcome to
                <br />
                <span style={{ color: 'var(--ieee-blue)' }}>GRSS VEDA</span>
              </h1>
              <p className='text-xl text-muted-foreground mb-8 leading-relaxed'>
                The Geoscience and Remote Sensing Society's (GRSS)
                Visualization, Exploration, and Data Analysis (VEDA) Platform is
                a cloud-based, collaborative platform for GRSS members, designed
                to facilitate the exploration, analysis, and visualization of
                Earth observation data by providing{' '}
                <strong className='text-foreground'>
                  cloud-native AI tools, data, and infrastructure.
                </strong>
              </p>
              <div className='flex flex-wrap gap-4 justify-center'>
                <Button size='lg' className='gap-2 text-lg px-8'>
                  Explore Platform
                  <ArrowRight className='h-5 w-5' />
                </Button>
                <Button
                  size='lg'
                  variant='outline'
                  className='text-lg px-8'
                  // onClick={onNavigateAbout}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Key Features - Teaser Cards */}
        <section
          className='py-24 bg-gradient-to-b from-background to-muted/30'
          aria-labelledby='features-heading'
        >
          <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
            <div className='text-center mb-16'>
              <Badge className='mb-4' variant='secondary'>
                Platform Capabilities
              </Badge>
              <h2 id='features-heading' className='text-4xl lg:text-5xl mb-6'>
                Key Features
              </h2>
              <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
                Discover our comprehensive suite of tools designed for modern
                Earth observation research
              </p>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'>
              {/* Data-Centric AI */}
              <Card className='p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50 flex flex-col'>
                <Brain
                  className='h-12 w-12 mb-4'
                  style={{ color: 'var(--ieee-blue)' }}
                />
                <h3 className='mb-3'>Data-Centric AI for Machine Learning</h3>
                <p className='text-muted-foreground mb-6 flex-1'>
                  Create standardized, AI-ready datasets with comprehensive
                  quality assessments. Build trustworthy data for GeoAI
                  research.
                </p>
                <Button
                  variant='outline'
                  className='w-full gap-2'
                  // onClick={() => onNavigateToAboutSection?.('what-veda-offers')}
                >
                  Learn More
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Card>

              {/* GeoAI Toolbox */}
              <Card className='p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50 flex flex-col'>
                <Cpu
                  className='h-12 w-12 mb-4'
                  style={{ color: 'var(--ieee-blue-75)' }}
                />
                <h3 className='mb-3'>GeoAI Toolbox</h3>
                <p className='text-muted-foreground mb-6 flex-1'>
                  Explore, fine-tune, and deploy large geospatial foundation
                  models in a low-code interface with cloud-based training.
                </p>
                <Button
                  variant='outline'
                  className='w-full gap-2'
                  // onClick={() => onNavigateToAboutSection?.('what-veda-offers')}
                >
                  Learn More
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Card>

              {/* CoMap Labeling */}
              <Card className='p-8 hover:shadow-lg transition-all border-2 hover:border-primary/50 flex flex-col'>
                <Map
                  className='h-12 w-12 mb-4'
                  style={{ color: 'var(--ieee-blue)' }}
                />
                <h3 className='mb-3'>CoMap Labeling Tool</h3>
                <p className='text-muted-foreground mb-6 flex-1'>
                  Collaborative web application for labeling, visualizing, and
                  managing geospatial datasets with version control.
                </p>
                <Button
                  variant='outline'
                  className='w-full gap-2'
                  // onClick={() => onNavigateToAboutSection?.('what-veda-offers')}
                >
                  Learn More
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Card>
            </div>
          </div>
        </section>
        {/* Featured Data Stories - Conditional Rendering */}
        <section
          className='py-24'
          aria-labelledby='stories-heading'
          role='status'
          aria-label='Coming Soon: Data Stories'
        >
          <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
            <div className='max-w-5xl mx-auto'>
              {/* Main Announcement Card */}
              <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 p-12 lg:p-16'>
                {/* Coming Soon Badge */}
                <div className='absolute top-6 right-6'>
                  <Badge className='text-sm px-4 py-1.5 bg-primary/90 text-primary-foreground border-2 border-primary shadow-lg'>
                    <Clock className='h-4 w-4 mr-2 inline' />
                    Coming Soon
                  </Badge>
                </div>

                {/* Content */}
                <div className='text-center max-w-3xl mx-auto'>
                  <Badge className='mb-6' variant='secondary'>
                    Data Stories
                  </Badge>

                  <h2
                    id='stories-heading'
                    className='text-4xl lg:text-5xl mb-6'
                  >
                    Explore Data Stories
                  </h2>

                  <p className='text-xl text-muted-foreground leading-relaxed mb-8'>
                    Transform Earth observation data into interactive narratives
                    that combine compelling storytelling with embedded analytics
                    and collaborative exploration.
                  </p>

                  {/* Feature Highlights */}
                  <div className='grid md:grid-cols-3 gap-6 mb-8'>
                    <div className='flex flex-col items-center text-center'>
                      <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3'>
                        <Map className='h-6 w-6 text-primary' />
                      </div>
                      <div>
                        <h4 className='mb-1'>Interactive visualizations</h4>
                        <p className='text-sm text-muted-foreground'>
                          Explore data through dynamic maps and charts
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col items-center text-center'>
                      <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3'>
                        <Users className='h-6 w-6 text-primary' />
                      </div>
                      <div>
                        <h4 className='mb-1'>Collaborative storytelling</h4>
                        <p className='text-sm text-muted-foreground'>
                          Share and co-create narratives with the community
                        </p>
                      </div>
                    </div>

                    <div className='flex flex-col items-center text-center'>
                      <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3'>
                        <BarChart3 className='h-6 w-6 text-primary' />
                      </div>
                      <div>
                        <h4 className='mb-1'>Embedded analytics</h4>
                        <p className='text-sm text-muted-foreground'>
                          Integrate analytical tools directly within stories
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button size='lg' variant='outline' className='gap-2'>
                    Learn More About Data Stories
                    <ExternalLink className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Who Can Benefit - Split Layout */}
        <section
          className='py-24 bg-muted/30'
          aria-labelledby='who-benefits-heading'
        >
          <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
            <div className='grid lg:grid-cols-2 gap-16 items-center'>
              <div>
                <Badge className='mb-4' variant='secondary'>
                  For Everyone
                </Badge>
                <h2
                  id='who-benefits-heading'
                  className='text-4xl lg:text-5xl mb-6'
                >
                  Who Can Benefit?
                </h2>
                <p className='text-xl text-muted-foreground mb-8'>
                  GRSS VEDA is designed to serve a wide range of GRSS Members
                </p>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                <Card className='p-6 border-2 hover:border-primary transition-colors'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      backgroundColor: 'var(--ieee-blue-lightest)',
                    }}
                  >
                    <span className='text-2xl'>🎓</span>
                  </div>
                  <h4 className='mb-2'>
                    Students, Early-Career Researchers & Innovators
                  </h4>
                  <p className='text-muted-foreground text-sm'>
                    Access datasets and AI tools for learning, experimentation,
                    and collaboration.
                  </p>
                </Card>

                <Card className='p-6 border-2 hover:border-primary transition-colors'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      backgroundColor: 'var(--ieee-blue-lightest)',
                    }}
                  >
                    <span className='text-2xl'>🔬</span>
                  </div>
                  <h4 className='mb-2'>Researchers & Scientists</h4>
                  <p className='text-muted-foreground text-sm'>
                    Analyze, fine-tune, and validate models using standardized
                    datasets.
                  </p>
                </Card>

                <Card className='p-6 border-2 hover:border-primary transition-colors'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      backgroundColor: 'var(--ieee-blue-lightest)',
                    }}
                  >
                    <span className='text-2xl'>💼</span>
                  </div>
                  <h4 className='mb-2'>Professionals & Practitioners</h4>
                  <p className='text-muted-foreground text-sm'>
                    Apply ready-to-use AI tools for geospatial tasks without
                    custom infrastructure.
                  </p>
                </Card>

                <Card className='p-6 border-2 hover:border-primary transition-colors'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center mb-4'
                    style={{
                      backgroundColor: 'var(--ieee-blue-lightest)',
                    }}
                  >
                    <span className='text-2xl'>🏢</span>
                  </div>
                  <h4 className='mb-2'>Industry & Government</h4>
                  <p className='text-muted-foreground text-sm'>
                    Leverage cloud-scale analytics and collaborative tools for
                    decision-making.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>
        {/* Get Started CTA - WCAG AA Compliant */}
        {/* Light mode: uses --primary (#00629B - IEEE Blue) with white text = 4.54:1 */}
        {/* Dark mode: uses --cta-dark-bg (#1A1A1A - rich dark gray) with white text = 13.28:1 */}
        <section
          className='py-24 text-white'
          style={{
            backgroundColor:
              theme === 'dark' ? 'var(--cta-dark-bg)' : 'var(--primary)',
          }}
          aria-labelledby='get-started-heading'
        >
          <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
            <div className='text-center mb-16'>
              <h2
                id='get-started-heading'
                className='text-4xl lg:text-5xl mb-6 text-white'
              >
                Get Started with GRSS VEDA
              </h2>
              <p
                className='text-xl text-white max-w-2xl mx-auto'
                style={{ opacity: 0.95 }}
              >
                Access powerful tools for Earth observation data analysis
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
              <div className='text-center'>
                <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6'>
                  <ArrowRight className='h-8 w-8 text-white' />
                </div>
                <h3 className='mb-4 text-white'>Access Platform</h3>
                <Button
                  size='lg'
                  variant={theme === 'light' ? 'secondary' : 'default'}
                  className='w-full gap-2'
                >
                  GRSS VEDA Dashboard
                  <ArrowRight className='h-5 w-5' />
                </Button>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6'>
                  <Database className='h-8 w-8 text-white' />
                </div>
                <h3 className='mb-4 text-white'>Documentation</h3>
                <Button
                  size='lg'
                  variant={theme === 'light' ? 'secondary' : 'default'}
                  className='w-full gap-2'
                >
                  Learn How to Use
                  <ArrowRight className='h-5 w-5' />
                </Button>
              </div>

              <div className='text-center'>
                <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6'>
                  <Users className='h-8 w-8 text-white' />
                </div>
                <h3 className='mb-4 text-white'>Community</h3>
                <Button
                  size='lg'
                  variant={theme === 'light' ? 'secondary' : 'default'}
                  className='w-full gap-2'
                >
                  Join Us
                  <ArrowRight className='h-5 w-5' />
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Acknowledgements */}
        <section className='py-16 bg-muted/30'>
          <div className='max-w-[1400px] mx-auto px-6 lg:px-12 text-center'>
            <h2 className='text-2xl mb-4'>Acknowledgements</h2>
            <p className='text-muted-foreground max-w-3xl mx-auto mb-6'>
              GRSS VEDA is made possible through a collaboration between the
              IEEE Geoscience and Remote Sensing Society and NASA's Interagency
              Implementation and Advanced Concepts Team (IMPACT). GRSS VEDA is
              deployed and adapted from NASA's open VEDA infrastructure.
            </p>
            <div className='flex flex-wrap gap-4 justify-center items-center'>
              <a
                href='https://github.com/NASA-IMPACT/veda'
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-primary hover:underline focus:outline-2 focus:outline-ring focus:outline-offset-2 rounded'
              >
                <Github className='h-5 w-5' />
                View VEDA on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
