'use client';

import React, { useEffect, useState } from 'react';
import { GoogleTagManager } from '@next/third-parties/google';
import {
  denyAnalyticsByDefault,
  subscribeToAnalyticsConsent,
  updateAnalyticsConsent,
} from '@lib/analytics';

const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
const GTM_AUTH = process.env.NEXT_PUBLIC_GOOGLE_TAG_AUTH;
const GTM_PREVIEW = process.env.NEXT_PUBLIC_GOOGLE_TAG_PREVIEW;

/**
 * Loads Google Tag Manager, but only once IEEE's Osano banner reports consent
 * for the ANALYTICS category. With no container ID configured (local dev, or a
 * preview deploy) this renders nothing at all.
 */
const Analytics = () => {
  const [consentGranted, setConsentGranted] = useState(false);

  useEffect(() => {
    denyAnalyticsByDefault();
    return subscribeToAnalyticsConsent(setConsentGranted);
  }, []);

  useEffect(() => {
    updateAnalyticsConsent(consentGranted);
  }, [consentGranted]);

  if (!GTM_ID || !consentGranted) return null;

  return (
    <GoogleTagManager gtmId={GTM_ID} auth={GTM_AUTH} preview={GTM_PREVIEW} />
  );
};

export default Analytics;
