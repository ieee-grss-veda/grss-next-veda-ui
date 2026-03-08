import { BarChart3, Clock, ExternalLink, Map, Users } from 'lucide-react';
import React from 'react';
import SectionHeader from './section-header';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
const storyFeatures = [
  {
    icon: Map,
    title: 'Interactive visualizations',
    description: 'Explore data through dynamic maps and charts',
  },
  {
    icon: Users,
    title: 'Collaborative storytelling',
    description: 'Share and co-create narratives with the community',
  },
  {
    icon: BarChart3,
    title: 'Embedded analytics',
    description: 'Integrate analytical tools directly within stories',
  },
];

export default function DataStoriesSection() {
  return (
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
            <div className='max-w-3xl mx-auto text-center'>
              <SectionHeader
                badgeText='Data Stories'
                heading='Explore Data Stories'
                subheading='Transform Earth observation data into interactive narratives that combine compelling storytelling with embedded analytics and collaborative exploration.'
                id='stories-heading'
                className='mb-8'
                headingClassName='mb-6'
                subheadingClassName='leading-relaxed'
              />

              {/* Feature Highlights */}
              <div className='grid md:grid-cols-3 gap-6 mb-8'>
                {storyFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className='flex flex-col items-center text-center'
                  >
                    <div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3'>
                      <feature.icon className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <h4 className='mb-1'>{feature.title}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* <Button size='lg' variant='outline' className='gap-2'>
                Learn More About Data Stories
                <ExternalLink className='h-4 w-4' />
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
