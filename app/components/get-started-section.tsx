'use client';

import Link from 'next/link';
import { ArrowRight, Database, Users } from 'lucide-react';
import React from 'react';
import { useTheme } from './common/theme-provider';
import SectionHeader from './section-header';
import { Button } from './ui/button';

const ctaItems = [
  {
    icon: ArrowRight,
    title: 'Access Platform',
    buttonText: 'GRSS VEDA Dashboard',
    href: '/exploration',
  },
  {
    icon: Database,
    title: 'Documentation',
    buttonText: 'Learn How to Use',
    href: '#',
  },
  {
    icon: Users,
    title: 'Community',
    buttonText: 'Join Us',
    href: '#',
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
        <SectionHeader
          className='mb-16'
          heading='Get Started with GRSS VEDA'
          subheading='Access powerful tools for Earth observation data analysis'
          id='get-started-heading'
          headingClassName='text-white'
          subheadingClassName='text-white'
          subheadingStyle={{ opacity: 0.95 }}
        />

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
                <Link href={item.href} target='_blank' rel='noopener noreferrer'>
                  {item.buttonText}
                </Link>
                <ArrowRight className='h-5 w-5' />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
