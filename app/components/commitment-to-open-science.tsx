import { ExternalLink, Github, Globe } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function CommitmentToOpenScience() {
  return (
    <section className='py-16  bg-muted/30'>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-start gap-4 mb-8'>
            <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0'>
              <Globe className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h2 className='text-4xl   mb-4'>Commitment to Open Science</h2>
            </div>
          </div>

          <div className='space-y-6'>
            <p className='text-muted-foreground leading-relaxed text-lg'>
              GRSS VEDA is built on the principles of Open Science, ensuring
              that Earth observation data, tools, and results are findable,
              accessible, interoperable, and reusable (FAIR). By fostering
              transparency, reproducibility, and collaboration, VEDA enables the
              global community to accelerate discovery and innovation in Earth
              system science.
            </p>

            <Card className='p-6 bg-card border-[2px] border-primary/20'>
              <div className='flex items-start gap-4'>
                <Github className='h-6 w-6 text-primary flex-shrink-0 mt-1' />
                <div>
                  <h3 className='mb-2'>Open Source on GitHub</h3>
                  <p className='text-muted-foreground mb-4'>
                    Access GRSS VEDA documentation, code, and more by visiting
                    the IEEE GRSS VEDA Organization on GitHub.
                  </p>
                  <Button
                    variant='outline'
                    className='gap-2 focus:outline-2 focus:outline-ring focus:outline-offset-2'
                    asChild
                  >
                    <a
                      href='https://github.com/ieee-grss-veda'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Visit GitHub Organization
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
