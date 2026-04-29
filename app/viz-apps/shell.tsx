'use client';

import React, { ReactNode } from 'react';
import VedaUIWrapper from 'app/components/veda-ui-wrapper';
import useElementHeight from '@utils/hooks/use-element-height';
import { DatasetMetadata } from 'app/types/content';

interface VizAppShellProps {
  children: ReactNode;
  /**
   * Forwarded to VedaUIWrapper so apps that need access to the full dataset
   * list (e.g. exploration's selector modal) can read it from context.
   * Single-dataset apps can omit this.
   */
  datasets?: DatasetMetadata[];
}

/**
 * Full-viewport shell shared by every visualization app.
 * Mirrors the layout previously inlined in app/(datasets)/exploration/exploration.tsx
 * so /exploration and /explore/[app]/[dataset] occupy the same space.
 */
export default function VizAppShell({ children, datasets }: VizAppShellProps) {
  const offsetHeight = useElementHeight({ queryToSelect: 'header' });

  return (
    <VedaUIWrapper datasets={datasets}>
      <div
        id='ea-wrapper'
        style={{
          width: '100%',
          height: `calc(100vh - ${offsetHeight}px)`,
        }}
      >
        {children}
      </div>
    </VedaUIWrapper>
  );
}
