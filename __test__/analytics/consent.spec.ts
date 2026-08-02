import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  denyAnalyticsByDefault,
  subscribeToAnalyticsConsent,
  updateAnalyticsConsent,
  type OsanoConsent,
} from '@lib/analytics';

/**
 * Stands in for the Osano CMP, which is loaded from cmp.osano.com at runtime
 * and so is never present in tests. `emit` replays a consent decision the way
 * the real CMP does when a visitor saves preferences.
 */
function mockOsano(initial?: OsanoConsent) {
  const listeners = new Map<string, Set<(c?: OsanoConsent) => void>>();
  let current = initial;

  window.Osano = {
    cm: {
      getConsent: () => current,
      addEventListener: (event, listener) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(listener);
      },
      removeEventListener: (event, listener) => {
        listeners.get(event)?.delete(listener);
      },
    },
  };

  return {
    emit(consent: OsanoConsent) {
      current = consent;
      listeners
        .get('osano-cm-consent-saved')
        ?.forEach((listener) => listener(consent));
    },
    listenerCount: () =>
      Array.from(listeners.values()).reduce((n, set) => n + set.size, 0),
  };
}

beforeEach(() => {
  delete window.Osano;
  window.dataLayer = [];
});

describe('subscribeToAnalyticsConsent', () => {
  it('denies when Osano is absent (blocked by an extension, or failed to load)', () => {
    const onChange = vi.fn();

    subscribeToAnalyticsConsent(onChange);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('denies when the visitor rejected the analytics category', () => {
    const osano = mockOsano({ ESSENTIAL: 'ACCEPT', ANALYTICS: 'DENY' });
    const onChange = vi.fn();

    subscribeToAnalyticsConsent(onChange);
    osano.emit({ ESSENTIAL: 'ACCEPT', ANALYTICS: 'DENY' });

    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).not.toHaveBeenCalledWith(true);
  });

  it('grants once the visitor accepts the analytics category', () => {
    const osano = mockOsano({ ESSENTIAL: 'ACCEPT', ANALYTICS: 'DENY' });
    const onChange = vi.fn();

    subscribeToAnalyticsConsent(onChange);
    osano.emit({ ESSENTIAL: 'ACCEPT', ANALYTICS: 'ACCEPT' });

    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('revokes when a previously-consenting visitor withdraws consent', () => {
    const osano = mockOsano({ ANALYTICS: 'ACCEPT' });
    const onChange = vi.fn();

    subscribeToAnalyticsConsent(onChange);
    osano.emit({ ANALYTICS: 'ACCEPT' });
    expect(onChange).toHaveBeenLastCalledWith(true);

    osano.emit({ ANALYTICS: 'DENY' });
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('detaches its listeners on unsubscribe', () => {
    const osano = mockOsano({ ANALYTICS: 'ACCEPT' });

    const unsubscribe = subscribeToAnalyticsConsent(vi.fn());
    expect(osano.listenerCount()).toBeGreaterThan(0);

    unsubscribe();
    expect(osano.listenerCount()).toBe(0);
  });
});

describe('consent mode signals', () => {
  // Consent Mode reads gtag commands positionally, so the pushed value must be
  // argument-list shaped rather than a plain object.
  const lastCommand = () =>
    Array.from(window.dataLayer!.at(-1) as IArguments) as unknown[];

  it('pushes a denied default that GTM can read before it loads', () => {
    denyAnalyticsByDefault();

    expect(lastCommand()).toEqual([
      'consent',
      'default',
      { analytics_storage: 'denied' },
    ]);
  });

  it('grants and revokes analytics_storage on update', () => {
    updateAnalyticsConsent(true);
    expect(lastCommand()).toEqual([
      'consent',
      'update',
      { analytics_storage: 'granted' },
    ]);

    updateAnalyticsConsent(false);
    expect(lastCommand()).toEqual([
      'consent',
      'update',
      { analytics_storage: 'denied' },
    ]);
  });
});
