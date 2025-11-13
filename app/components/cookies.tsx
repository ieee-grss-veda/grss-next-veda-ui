'use client';

import React, { useState, useEffect } from 'react';
import { Banner, Button } from '@uswds/uswds';

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
    <Banner>
      <div className='grid-container padding-1'>
        <p className='font-sans-xs'>
          This website uses cookies to ensure you get the best experience on our
          website.
        </p>
        <Button type='button' size='small' onClick={handleAccept}>
          Accept
        </Button>
      </div>
    </Banner>
  );
};

export default CookiesBanner;
