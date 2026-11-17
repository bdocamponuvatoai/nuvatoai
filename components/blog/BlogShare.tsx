'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Link2, Mail } from 'lucide-react';

/** Share links. Plain links and the clipboard only: no third-party script loads. */
export default function BlogShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked (permissions or an insecure origin): the other links still work.
    }
  }

  return (
    <div className="blog-share">
      <span className="mono">SHARE THIS GUIDE</span>
      <div>
        <button type="button" onClick={copy} data-copied={copied || undefined}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
          {copied ? 'Link copied' : 'Copy link'}
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>
          <Mail size={15} aria-hidden="true" />
          Email
        </a>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied to the clipboard' : ''}
      </span>
    </div>
  );
}
