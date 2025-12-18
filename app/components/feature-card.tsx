import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface FeatureCardProps {
  icon?: React.ElementType;
  iconContainerClassName?: string;
  iconColor?: string;
  iconSlot?: React.ReactNode;
  title: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

export default function FeatureCard({
  icon: Icon,
  iconContainerClassName,
  iconColor,
  iconSlot,
  title,
  description,
  showButton = false,
  buttonText,
  buttonHref,
}: FeatureCardProps) {
  return (
    <Card className='p-6 hover:shadow-lg transition-all border-[2px] hover:border-primary/50 flex flex-col'>
      {(Icon || iconSlot) && (
        <div
          className={
            iconContainerClassName ||
            'h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'
          }
        >
          {iconSlot ? (
            iconSlot
          ) : Icon ? (
            <Icon
              className='h-8 w-8 text-primary'
              style={iconColor ? { color: iconColor } : {}}
            />
          ) : null}
        </div>
      )}
      <h3 className='mb-3 text-xl'>{title}</h3>
      <p className={`text-muted-foreground flex-1 ${showButton ? 'mb-6' : ''}`}>
        {description}
      </p>
      {showButton && (
        <Button
          variant='outline'
          className='w-full gap-2 focus:outline-2 focus:outline-ring focus:outline-offset-2'
          // onClick={onButtonClick}
          asChild={!!buttonHref}
        >
          {buttonHref ? (
            <a href={buttonHref} target='_blank' rel='noopener noreferrer'>
              {buttonText || 'Learn More'}
              <ExternalLink className='h-4 w-4' />
            </a>
          ) : (
            <>
              {buttonText || 'Learn More'}
              <ArrowRight className='h-4 w-4' />
            </>
          )}
        </Button>
      )}
    </Card>
  );
}
