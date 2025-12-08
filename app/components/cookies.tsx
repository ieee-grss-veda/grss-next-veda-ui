'use client';

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

const CookiesBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border'>
      <div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
        <Alert className='border-0 bg-transparent p-0'>
          <AlertDescription className='text-sm text-muted-foreground'>
            This website uses cookies to ensure you get the best experience on
            our website.
          </AlertDescription>
        </Alert>
        <Button size='sm' onClick={handleAccept}>
          Accept
        </Button>
      </div>
    </div>
  );
};

export default CookiesBanner;
