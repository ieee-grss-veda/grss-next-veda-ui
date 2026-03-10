import React from 'react';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

interface SectionHeaderProps {
  badgeText?: string;
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  id?: string;
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  overrideHeadingClassName?: string;
}

export default function SectionHeader({
  badgeText,
  heading,
  subheading,
  id,
  className,
  headingClassName,
  subheadingClassName,
  overrideHeadingClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('text-center', className)}>
      {badgeText && (
        <Badge className='mb-4' variant='secondary'>
          {badgeText}
        </Badge>
      )}
      <h2
        id={id}
        className={
          overrideHeadingClassName ||
          cn('text-4xl lg:text-5xl mb-6', headingClassName)
        }
      >
        {heading}
      </h2>
      {subheading && (
        <p
          className={cn(
            'text-xl text-muted-foreground max-w-3xl mx-auto',
            subheadingClassName,
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}
