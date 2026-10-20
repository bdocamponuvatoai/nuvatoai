'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the whole
 * document, so it renders its own <html> and stays dependency-free.
 */
export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F4F7FC',
          color: '#0A1230',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <main role="alert">
          <h1 style={{ fontSize: 32, margin: '0 0 12px' }}>Something went wrong.</h1>
          <p style={{ margin: '0 0 24px', color: '#56648A' }}>
            Please try again, or contact the team at{' '}
            <a href="mailto:legal@nuvato.ai" style={{ color: '#1A56F0' }}>
              legal@nuvato.ai
            </a>
            .
          </p>
          {error.digest && <p style={{ color: '#7A87A6' }}>Reference {error.digest}</p>}
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '14px 22px',
              border: 0,
              borderRadius: 12,
              background: '#1A56F0',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
