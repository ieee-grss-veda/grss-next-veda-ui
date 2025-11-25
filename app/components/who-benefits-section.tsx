import React from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

const beneficiaries = [
  {
    emoji: '🎓',
    title: 'Students, Early-Career Researchers & Innovators',
    description:
      'Access datasets and AI tools for learning, experimentation, and collaboration.',
  },
  {
    emoji: '🔬',
    title: 'Researchers & Scientists',
    description:
      'Analyze, fine-tune, and validate models using standardized datasets.',
  },
  {
    emoji: '💼',
    title: 'Professionals & Practitioners',
    description:
      'Apply ready-to-use AI tools for geospatial tasks without custom infrastructure.',
  },
  {
    emoji: '🏢',
    title: 'Industry & Government',
    description:
      'Leverage cloud-scale analytics and collaborative tools for decision-making.',
  },
];

export default function WhoBenefitsSection() {
  return (
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
            <h2 id='who-benefits-heading' className='text-4xl lg:text-5xl mb-6'>
              Who Can Benefit?
            </h2>
            <p className='text-xl text-muted-foreground mb-8'>
              GRSS VEDA is designed to serve a wide range of GRSS Members
            </p>
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            {beneficiaries.map((item, index) => (
              <Card
                key={index}
                className='p-6 border-2 hover:border-primary transition-colors'
              >
                <div className='w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-ieee-blue-lightest'>
                  <span className='text-2xl'>{item.emoji}</span>
                </div>
                <h4 className='mb-2'>{item.title}</h4>
                <p className='text-muted-foreground text-sm'>
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
