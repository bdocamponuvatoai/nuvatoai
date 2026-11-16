'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { clearAnalyticsCookies } from '@/lib/analytics';
import {
  effectiveConsent,
  onOpenCookieSettings,
  saveConsent,
  subscribeToConsent,
  type ConsentChoice,
} from '@/lib/consent';
import ConsentBanner from './ConsentBanner';
import GoogleTag from './GoogleTag';

/** The server can't see the visitor's choice; render nothing until the browser can. */
const unknownOnServer = () => undefined;

/**
 * Consent-gated Google Tag Manager. Nothing from Google loads until the visitor accepts
 * (or has accepted before). Rendered by app/layout.tsx on production deployments only.
 */
export default function Analytics({ gtmId, nonce }: { gtmId: string; nonce?: string }) {
  const consent = useSyncExternalStore(subscribeToConsent, effectiveConsent, unknownOnServer);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => onOpenCookieSettings(() => setSettingsOpen(true)), []);

  function choose(choice: ConsentChoice) {
    const wasGranted = consent === 'granted';
    saveConsent(choice);
    setSettingsOpen(false);
    if (choice === 'denied' && wasGranted) {
      // A loaded Google tag can't be unloaded: stop it, delete its cookies, and reload
      // so the page continues without it.
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      clearAnalyticsCookies();
      window.location.reload();
    }
  }

  if (consent === undefined) return null;

  return (
    <>
      {consent === 'granted' && <GoogleTag gtmId={gtmId} nonce={nonce} />}
      {(consent === null || settingsOpen) && (
        <ConsentBanner
          current={consent}
          onChoose={choose}
          onClose={consent !== null ? () => setSettingsOpen(false) : undefined}
        />
      )}
    </>
  );
}
