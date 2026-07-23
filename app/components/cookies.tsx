'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

const CONSENT_STORAGE_KEY = 'cookie_consent';

const CookiesBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
    setOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'declined');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className='sm:max-w-md [&>button[data-state]]:hidden'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Cookie Consent</DialogTitle>
          <DialogDescription className='pt-2 text-sm leading-relaxed'>
            We use cookies to enhance your browsing experience and to help us
            understand how our website is used. These cookies allow us to
            collect data on site usage and improve our services based on your
            interactions. To learn more about it, see our{' '}
            <a
              href='https://privacy.ieee.org/policies'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary underline underline-offset-4 hover:no-underline'
            >
              Privacy Policy
            </a>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-2'>
          <Button variant='outline' onClick={handleDecline}>
            Decline Cookies
          </Button>
          <Button onClick={handleAccept}>Accept Cookies</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CookiesBanner;
