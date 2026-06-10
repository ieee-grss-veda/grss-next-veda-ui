'use client';

import React from 'react';

export interface LayerToggleItem {
  id: string;
  label: string;
}

interface LayerTogglesPanelProps {
  layers: LayerToggleItem[];
  visibility: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
}

export function LayerTogglesPanel({
  layers,
  visibility,
  onToggle,
}: LayerTogglesPanelProps) {
  if (!layers.length) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        maxWidth: 280,
        padding: '10px 12px',
        background: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 6,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Layers</div>
      {layers.map((l) => {
        const on = visibility[l.id] !== false;
        return (
          <label
            key={l.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 0',
              cursor: 'pointer',
            }}
          >
            <input
              type='checkbox'
              checked={on}
              onChange={(e) => onToggle(l.id, e.target.checked)}
            />
            <span>{l.label}</span>
          </label>
        );
      })}
    </div>
  );
}
