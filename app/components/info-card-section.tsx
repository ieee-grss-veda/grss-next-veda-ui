import React from 'react';
import { Card } from './ui/card';

interface InfoCardSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  sectionClassName?: string;
}

export default function InfoCardSection({
  icon: Icon,
  title,
  children,
  sectionClassName = 'py-16',
}: InfoCardSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className='max-w-[1400px] mx-auto px-6 lg:px-12'>
        <div className='max-w-4xl mx-auto'>
          <Card className='p-8 lg:p-12 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20'>
            <div className='flex items-start gap-4 mb-6'>
              <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0'>
                <Icon className='h-6 w-6 text-primary' />
              </div>
              <h2 className='text-4xl mb-0'>{title}</h2>
            </div>
            {children}
          </Card>
        </div>
      </div>
    </section>
  );
}
