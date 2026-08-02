'use client';

import React from 'react';
import { Switch } from 'app/components/ui/switch';

export interface LayerToggleItem {
  id: string;
  label: string;
  /** Hex color (e.g. "#ff7e29") rendered as a small legend swatch. */
  color?: string;
}

interface DatasetInfoPanelProps {
  name: string;
  description?: string;
  layers?: LayerToggleItem[];
  visibility?: Record<string, boolean>;
  onToggle?: (id: string, next: boolean) => void;
}

export function DatasetInfoPanel({
  name,
  description,
  layers,
  visibility,
  onToggle,
}: DatasetInfoPanelProps) {
  const hasToggles = !!(layers && layers.length && onToggle);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
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
      {hasToggles ? (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {layers!.map((l) => {
            const on = visibility?.[l.id] !== false;
            return (
              <div
                key={l.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '4px 0',
                }}
              >
                <label
                  htmlFor={`viz-toggle-${l.id}`}
                  style={{
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {l.color ? (
                    <span
                      aria-hidden='true'
                      style={{
                        display: 'inline-block',
                        width: 12,
                        height: 12,
                        background: l.color,
                        border: '1px solid rgba(0,0,0,0.2)',
                        borderRadius: 2,
                        flex: '0 0 auto',
                      }}
                    />
                  ) : null}
                  {l.label}
                </label>
                <Switch
                  id={`viz-toggle-${l.id}`}
                  checked={on}
                  onCheckedChange={(next) => onToggle!(l.id, next)}
                  aria-label={l.label}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
