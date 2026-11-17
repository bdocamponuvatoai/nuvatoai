'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from './mdx';

const number = (index: number) => String(index + 1).padStart(2, '0');

/**
 * "On this page": the post's sections, numbered like the body. It is server-rendered;
 * once hydrated it marks the section being read and fills a progress track.
 */
export default function BlogToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState('');
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const sections = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => !!element);
    const body = sections[0]?.closest<HTMLElement>('.blog-copy');
    const update = () => {
      frame = 0;
      const line = Math.max(140, window.innerHeight * 0.3);
      let current = '';
      for (const section of sections)
        if (section.getBoundingClientRect().top <= line) current = section.id;
      setActive(current);
      if (body) {
        const rect = body.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
        nav.current?.style.setProperty('--toc-progress', progress.toFixed(3));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <nav ref={nav} className="blog-toc" aria-labelledby="blog-toc-title">
      <p id="blog-toc-title" className="mono">
        ON THIS PAGE
      </p>
      <ol>
        {headings.map(({ id, text }, index) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
              <span className="mono" aria-hidden="true">
                {number(index)}
              </span>
              {text}
            </a>
          </li>
        ))}
      </ol>
      <span className="blog-toc-track" aria-hidden="true" />
    </nav>
  );
}
