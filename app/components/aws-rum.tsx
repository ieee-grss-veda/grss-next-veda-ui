'use client';

import { useEffect } from 'react';
import { AwsRum, type AwsRumConfig } from 'aws-rum-web';

// Guard against re-initialization on client-side navigations and
// React strict-mode double-invocation in dev.
let initialized = false;

export default function AwsRumInit() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    try {
      const config: AwsRumConfig = {
        sessionSampleRate: 1,
        identityPoolId: 'us-west-2:dedf3922-6700-481b-a2a2-4aaaac89d2ab',
        endpoint: 'https://dataplane.rum.us-west-2.amazonaws.com',
        telemetries: ['performance', 'errors', 'http'],
        allowCookies: true,
        enableXRay: false,
        signing: true, // If you have a public resource policy and wish to send unsigned requests please set this to false
      };

      const APPLICATION_ID = '65b5efc2-5635-4bc1-9430-054b88962e5c';
      const APPLICATION_VERSION = '1.0.0';
      const APPLICATION_REGION = 'us-west-2';

      new AwsRum(
        APPLICATION_ID,
        APPLICATION_VERSION,
        APPLICATION_REGION,
        config,
      );
    } catch (error) {
      // Ignore errors thrown during CloudWatch RUM web client initialization
    }
  }, []);

  return null;
}
