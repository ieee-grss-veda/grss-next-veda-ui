import { Github } from 'lucide-react';
import React from 'react';
import SectionHeader from './section-header';

export default function AcknowledgementsSection() {
  return (
    <section className='py-16 bg-muted/30'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12 text-center'>
        <SectionHeader
          heading='Acknowledgements'
          subheading="GRSS VEDA is made possible through a collaboration between the IEEE Geoscience and Remote Sensing Society and NASA's Interagency Implementation and Advanced Concepts Team (IMPACT). GRSS VEDA is deployed and adapted from NASA's open VEDA infrastructure."
          overrideHeadingClassName='text-2xl mb-4'
          subheadingClassName='text-base mb-6'
        />
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
  );
}
