/**
 * Google tag helpers. `window.gtag` exists only after the visitor has accepted analytics
 * and the Google tag has loaded (components/analytics/GoogleTag.tsx); until then these
 * do nothing.
 */
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;

/**
 * Sends an event to Google Analytics. Never pass personal data (names, emails, notes):
 * use GA4 recommended event names and non-identifying parameters only.
 */
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  window.gtag?.('event', name, params);
}

/** Google Analytics cookie names: `_ga` and `_ga_<container-id>`. */
const isAnalyticsCookie = (name: string) => name === '_ga' || name.startsWith('_ga_');

/**
 * Removes Google Analytics cookies after consent is withdrawn. They are set on the
 * top-level domain the browser allows, so try the host and each parent domain.
 */
export function clearAnalyticsCookies(hostname = window.location.hostname) {
  const parts = hostname.split('.');
  const domains = parts.map((_, i) => parts.slice(i).join('.')).filter((d) => d.includes('.'));
  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter(isAnalyticsCookie);

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
  }
  return names;
}
