'use client';

import { ArrowRight, Database, Users } from 'lucide-react';
import React from 'react';
import { useTheme } from './common/theme-provider';
import { Button } from './ui/button';

const ctaItems = [
  {
    icon: ArrowRight,
    title: 'Access Platform',
    buttonText: 'GRSS VEDA Dashboard',
  },
  {
    icon: Database,
    title: 'Documentation',
    buttonText: 'Learn How to Use',
  },
  {
    icon: Users,
    title: 'Community',
    buttonText: 'Join Us',
  },
];

export default function GetStartedSection() {
  const { theme } = useTheme();

  return (
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
          {ctaItems.map((item, index) => (
            <div key={index} className='text-center'>
              <div className='w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6'>
                <item.icon className='h-8 w-8 text-white' />
              </div>
              <h3 className='mb-4 text-white'>{item.title}</h3>
              <Button
                size='lg'
                variant={theme === 'light' ? 'secondary' : 'default'}
                className='w-full gap-2'
              >
                {item.buttonText}
                <ArrowRight className='h-5 w-5' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
