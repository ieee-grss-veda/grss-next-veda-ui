'use client';

import React, { useEffect } from 'react';
import { TourProvider, useTour, StepType, StylesObj } from '@reactour/tour';
import { Button } from '../ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const TOUR_STORAGE_KEY = 'grss-veda-tour-completed';

const tourSteps: StepType[] = [
  {
    selector: '[data-tour="logo"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Welcome to GRSS VEDA!</h3>
        <p className="text-muted-foreground">
          The Geoscience and Remote Sensing Society&apos;s Visualization,
          Exploration, and Data Analysis Platform. Let us show you around!
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="data-catalog"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Data Catalog</h3>
        <p className="text-muted-foreground">
          Browse our comprehensive collection of Earth observation datasets.
          Find satellite imagery, climate data, and more for your research.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="exploration"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Exploration</h3>
        <p className="text-muted-foreground">
          Dive deep into visual analysis with our interactive exploration tools.
          Visualize and analyze geospatial data directly in your browser.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="stories"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Stories</h3>
        <p className="text-muted-foreground">
          Discover data-driven narratives and case studies that showcase
          real-world applications of Earth observation data.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="about"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">About</h3>
        <p className="text-muted-foreground">
          Learn more about the GRSS VEDA platform, our mission, and the team
          behind this initiative.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="theme-toggle"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Theme Toggle</h3>
        <p className="text-muted-foreground">
          Switch between light and dark mode for a comfortable viewing
          experience based on your preference.
        </p>
      </div>
    ),
  },
  {
    selector: '[data-tour="contact"]',
    content: (
      <div>
        <h3 className="text-lg font-medium mb-2">Get in Touch</h3>
        <p className="text-muted-foreground">
          Have questions or need assistance? Contact our team for support and
          inquiries. You&apos;re all set to explore!
        </p>
      </div>
    ),
  },
];

function TourNavigation() {
  const { currentStep, setCurrentStep, steps, setIsOpen } = useTour();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
      <div className="text-sm text-muted-foreground">
        {currentStep + 1} of {steps.length}
      </div>
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <Button size="sm" onClick={handleNext}>
          {isLastStep ? 'Finish' : 'Next'}
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function TourController({ children }: { children: React.ReactNode }) {
  const { setIsOpen } = useTour();

  useEffect(() => {
    // Check if this is the user's first visit
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [setIsOpen]);

  return <>{children}</>;
}

export function WebsiteTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  return (
    <TourProvider
      steps={tourSteps}
      onClickClose={({ setIsOpen }) => {
        handleClose();
        setIsOpen(false);
      }}
      onClickMask={({ setIsOpen }) => {
        handleClose();
        setIsOpen(false);
      }}
      styles={{
        popover: (base: StylesObj) => ({
          ...base,
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          boxShadow:
            '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border)',
          maxWidth: '360px',
        }),
        maskArea: (base: StylesObj) => ({
          ...base,
          rx: 8,
        }),
        maskWrapper: (base: StylesObj) => ({
          ...base,
          color: 'rgba(0, 0, 0, 0.5)',
        }),
        badge: (base: StylesObj) => ({
          ...base,
          display: 'none',
        }),
        controls: (base: StylesObj) => ({
          ...base,
          display: 'none',
        }),
        close: (base: StylesObj) => ({
          ...base,
          display: 'none',
        }),
      }}
      components={{
        Close: () => {
          const { setIsOpen } = useTour();
          return (
            <button
              onClick={() => {
                handleClose();
                setIsOpen(false);
              }}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Close tour"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          );
        },
        Content: ({ content }) => (
          <div>
            {content}
            <TourNavigation />
          </div>
        ),
      }}
      padding={{ mask: 8, popover: [8, 12] }}
      showNavigation={false}
      showBadge={false}
      showCloseButton={true}
      disableDotsNavigation={true}
      disableKeyboardNavigation={false}
    >
      <TourController>{children}</TourController>
    </TourProvider>
  );
}

export function useWebsiteTour() {
  const tour = useTour();

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    tour.setCurrentStep(0);
    tour.setIsOpen(true);
  };

  const startTour = () => {
    tour.setCurrentStep(0);
    tour.setIsOpen(true);
  };

  return {
    ...tour,
    resetTour,
    startTour,
  };
}
