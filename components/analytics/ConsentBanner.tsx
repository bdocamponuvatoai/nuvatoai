'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { hasGlobalPrivacyControl, type ConsentChoice } from '@/lib/consent';

/**
 * Non-blocking consent banner. Declining is exactly as easy as accepting: same size,
 * same style, side by side. Shown on first visit and whenever "Cookie settings" is used.
 */
export default function ConsentBanner({
  current,
  onChoose,
  onClose,
}: {
  current: ConsentChoice | null;
  onChoose: (choice: ConsentChoice) => void;
  onClose?: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  // Reopened from "Cookie settings": move focus here so keyboard users land on it.
  useEffect(() => {
    if (current !== null) heading.current?.focus();
  }, [current]);

  return (
    <section className="consent-banner" aria-labelledby="consent-title">
      <h2 id="consent-title" ref={heading} tabIndex={-1}>
        Analytics cookies
      </h2>
      <p>
        With your permission, we use Google Analytics cookies to understand how visitors use this
        site, so we can improve it. Nothing is collected unless you accept. You can change your
        choice at any time under Cookie settings.{' '}
        <Link href="/privacy/#cookies">Privacy Policy</Link>
      </p>
      {current !== null && (
        <p className="consent-current">
          Current choice: <strong>{current === 'granted' ? 'Accepted' : 'Declined'}</strong>
          {current === 'denied' && hasGlobalPrivacyControl()
            ? ' (your browser’s Global Privacy Control signal is on)'
            : ''}
        </p>
      )}
      <div className="consent-actions">
        <button type="button" onClick={() => onChoose('denied')}>
          Decline
        </button>
        <button type="button" onClick={() => onChoose('granted')}>
          Accept
        </button>
      </div>
      {onClose && (
        <button
          type="button"
          className="consent-close"
          onClick={onClose}
          aria-label="Close cookie settings"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
