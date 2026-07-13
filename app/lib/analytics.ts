/**
 * Consent-aware analytics helpers.
 *
 * IEEE's Osano CMP (loaded in `app/layout.tsx`) is the source of truth for
 * consent — nothing here reads or writes consent state itself.
 * API reference: https://developers.osano.com/cmp/javascript-api
 */

type OsanoDecision = 'ACCEPT' | 'DENY';

type OsanoCategory =
  | 'ESSENTIAL'
  | 'ANALYTICS'
  | 'MARKETING'
  | 'PERSONALIZATION'
  | 'STORAGE'
  | 'OPT-OUT';

export type OsanoConsent = Partial<Record<OsanoCategory, OsanoDecision>>;

/**
 * Osano fires `osano-cm-initialized` immediately if it has already initialized,
 * and `osano-cm-consent-saved` immediately if consent was saved on a previous
 * visit. A listener registered late therefore still receives current state.
 */
type OsanoEvent = 'osano-cm-initialized' | 'osano-cm-consent-saved';

type OsanoListener = (consent?: OsanoConsent) => void;

interface OsanoConsentManager {
  getConsent?: () => OsanoConsent | undefined;
  addEventListener?: (event: OsanoEvent, listener: OsanoListener) => void;
  removeEventListener?: (event: OsanoEvent, listener: OsanoListener) => void;
}

declare global {
  interface Window {
    Osano?: { cm?: OsanoConsentManager };
    dataLayer?: unknown[];
  }
}

const hasAnalyticsConsent = (consent?: OsanoConsent): boolean =>
  consent?.ANALYTICS === 'ACCEPT';

/**
 * Invokes `onChange` with the current analytics decision, then again whenever
 * the visitor saves new preferences. Returns an unsubscribe function.
 *
 * Fails closed: if Osano is missing (blocked by an extension, script error),
 * consent is treated as denied and analytics never loads.
 */
export function subscribeToAnalyticsConsent(
  onChange: (granted: boolean) => void,
): () => void {
  const cm = window.Osano?.cm;

  if (!cm?.addEventListener) {
    onChange(false);
    return () => undefined;
  }

  const listener: OsanoListener = (consent) =>
    onChange(hasAnalyticsConsent(consent ?? cm.getConsent?.()));

  cm.addEventListener('osano-cm-initialized', listener);
  cm.addEventListener('osano-cm-consent-saved', listener);

  return () => {
    cm.removeEventListener?.('osano-cm-initialized', listener);
    cm.removeEventListener?.('osano-cm-consent-saved', listener);
  };
}

/**
 * Pushes the raw `arguments` object rather than an array: Google Consent Mode
 * reads gtag commands as a positional argument list, which is what the official
 * `function gtag(){dataLayer.push(arguments)}` shim produces.
 */
function pushGtagCommand(this: void) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

const gtag = pushGtagCommand as (...args: unknown[]) => void;

/** Consent Mode baseline. Must be pushed before GTM's script runs. */
export function denyAnalyticsByDefault() {
  gtag('consent', 'default', { analytics_storage: 'denied' });
}

/**
 * GTM cannot be unloaded once its script has executed, so a visitor who
 * withdraws consent mid-session isn't covered by unmounting alone. An `update`
 * to `denied` stops GA writing cookies or sending hits without a page reload.
 */
export function updateAnalyticsConsent(granted: boolean) {
  gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  });
}
