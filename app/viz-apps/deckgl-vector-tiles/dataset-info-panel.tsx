'use client';

import React from 'react';

interface DatasetInfoPanelProps {
  name: string;
  description?: string;
}

export function DatasetInfoPanel({ name, description }: DatasetInfoPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        maxWidth: 360,
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{name}</h2>
      {description ? (
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.4 }}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
