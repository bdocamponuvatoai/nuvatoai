/**
 * The visitor's analytics consent, kept in this browser only (localStorage). Storing the
 * choice itself is strictly necessary: it's how the site remembers a "no".
 *
 * Browser-only helpers: call them from effects, event handlers, or useSyncExternalStore.
 */
export type ConsentChoice = 'granted' | 'denied';

/** Bump the version when the Privacy Policy's analytics terms change, to ask again. */
export const CONSENT_STORAGE_KEY = 'nuvato.analytics-consent.v1';
const CHANGE_EVENT = 'nuvato:consent-change';
const OPEN_SETTINGS_EVENT = 'nuvato:open-cookie-settings';

export function storedConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    // Storage can be unavailable (private modes, blocked site data): ask again.
    return null;
  }
}

/** Global Privacy Control: a browser-wide opt-out signal the Privacy Policy promises to honor. */
export function hasGlobalPrivacyControl() {
  return (
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

/**
 * The choice in effect: the visitor's own choice if they made one; otherwise "denied"
 * under Global Privacy Control, or null (not asked yet).
 */
export function effectiveConsent(): ConsentChoice | null {
  return storedConsent() ?? (hasGlobalPrivacyControl() ? 'denied' : null);
}

export function saveConsent(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Not persisted; the choice still applies until the page is closed.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** For useSyncExternalStore: notifies on changes here and in other tabs. */
export function subscribeToConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** Reopens the consent banner, from the "Cookie settings" links. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

export function onOpenCookieSettings(handler: () => void) {
  window.addEventListener(OPEN_SETTINGS_EVENT, handler);
  return () => window.removeEventListener(OPEN_SETTINGS_EVENT, handler);
}
