import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { ImageWithFallback } from './common/image-with-fallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HeroSectionProps {
  imageSrc: string;
  badgeText?: string;
  heading: React.ReactNode;
  headingStyle?: React.CSSProperties;
  subheading: React.ReactNode;
  primaryButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryButton?: {
    text: string;
    onClick?: () => void;
    href?: string;
  };
  children?: React.ReactNode;
}

export default function HeroSection({
  imageSrc,
  badgeText,
  heading,
  headingStyle,
  subheading,
  primaryButton,
  secondaryButton,
  children,
}: HeroSectionProps) {
  return (
    <section
      className='relative overflow-hidden'
      aria-labelledby='hero-heading'
    >
      {/* Background Image */}
      <div className='absolute inset-0 z-0'>
        <ImageWithFallback
          src={imageSrc}
          alt=''
          className='w-full h-full object-cover opacity-20'
        />
        <div className='absolute inset-0 bg-gradient-to-b from-transparent to-background'></div>
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-20'>
        <div className='max-w-4xl mx-auto text-center'>
          {badgeText && (
            <Badge className='mb-6' variant='secondary'>
              {badgeText}
            </Badge>
          )}
          <h1
            id='hero-heading'
            className='text-5xl lg:text-6xl mb-6 leading-tight'
            style={headingStyle}
          >
            {heading}
          </h1>
          <p className='text-xl text-muted-foreground mb-8 leading-relaxed'>
            {subheading}
          </p>
          {children && (
            <div className='text-l text-muted-foreground leading-relaxed max-w-4xl mx-auto'>
              {children}
            </div>
          )}
          {(primaryButton || secondaryButton) && (
            <div className='flex flex-wrap gap-4 justify-center'>
              {primaryButton && (
                <Button
                  size='lg'
                  className='gap-2 text-lg px-8'
                  onClick={primaryButton.onClick}
                  asChild={!!primaryButton.href}
                >
                  {primaryButton.href ? (
                    <Link href={primaryButton.href}>
                      {primaryButton.text}
                      <ArrowRight className='h-5 w-5' />
                    </Link>
                  ) : (
                    <>
                      {primaryButton.text}
                      <ArrowRight className='h-5 w-5' />
                    </>
                  )}
                </Button>
              )}
              {secondaryButton && (
                <Button
                  size='lg'
                  variant='outline'
                  className='text-lg px-8'
                  onClick={secondaryButton.onClick}
                  asChild={!!secondaryButton.href}
                >
                  {secondaryButton.href ? (
                    <Link href={secondaryButton.href}>
                      {secondaryButton.text}
                    </Link>
                  ) : (
                    secondaryButton.text
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
