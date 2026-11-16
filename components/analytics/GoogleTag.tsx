'use client';

import Script from 'next/script';

/**
 * Bootstraps the Google tag (Google's install snippet), after setting Consent Mode v2.
 * Rendered only after the visitor accepts analytics, so analytics storage is granted;
 * advertising signals stay denied because the site runs no advertising tags.
 */
const BOOTSTRAP = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied'
});
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('js', new Date());
`;

export default function GoogleTag({ gtmId, nonce }: { gtmId: string; nonce?: string }) {
  return (
    <>
      {/* Both scripts carry the request's CSP nonce; see proxy.ts and lib/security.ts. */}
      <Script id="google-tag-bootstrap" nonce={nonce} strategy="afterInteractive">
        {BOOTSTRAP}
      </Script>
      <Script
        id="google-tag"
        src={`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`}
        nonce={nonce}
        strategy="afterInteractive"
      />
    </>
  );
}
