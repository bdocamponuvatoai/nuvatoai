'use client';

import { useEffect } from 'react';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { LegalFooter } from '@/components/legal/LegalPage';

/** Route-level error boundary. Keeps the visitor on-brand and offers a retry. */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <main id="main" className="section-shell status-page" role="alert">
        <p className="eyebrow">SOMETHING WENT WRONG</p>
        <h1>
          We couldn’t load this <em>page.</em>
        </h1>
        <p>
          This is on our side. Try again, or reach the team through the original Nuvato AI site.
        </p>
        {error.digest && <p className="status-reference mono">Reference {error.digest}</p>}
        <div className="status-actions">
          <button type="button" className="button button-primary" onClick={reset}>
            <RotateCcw size={18} aria-hidden="true" />
            Try again
          </button>
          <a href="https://nuvato.ai/#contact" className="button button-secondary">
            Contact Nuvato AI
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </main>
      <LegalFooter />
    </>
  );
}
