'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowUpRight } from 'lucide-react';

/** Elements that play their CSS animation only while on screen. */
const ANIMATED = '[data-animate], .process-grid article, .problem-rows article, .stats-band';

/** Fades in `[data-reveal]` sections that start below the fold. */
function observeReveals() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08 },
  );
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      if (element.getBoundingClientRect().top <= window.innerHeight) return;
      element.classList.add('will-reveal');
      observer.observe(element);
    });
  }
  return observer;
}

function observeAnimations() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
  document.querySelectorAll(ANIMATED).forEach((element) => observer.observe(element));
  return observer;
}

/**
 * Page-level scroll behavior for the homepage: reveal and in-view animations, the
 * mobile booking button, and the back-to-top button.
 */
export default function ScrollEffects() {
  const [showMobileCta, setShowMobileCta] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setShowBackToTop(window.scrollY > window.innerHeight);
      // The mobile CTA appears once the hero is gone, but not while the form itself is visible.
      const hero = document.getElementById('top')?.getBoundingClientRect();
      const contact = document.getElementById('contact')?.getBoundingClientRect();
      const contactOffscreen =
        !!contact && (contact.top > window.innerHeight || contact.bottom < 0);
      setShowMobileCta(!!hero && hero.bottom < 0 && contactOffscreen);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    const observers =
      'IntersectionObserver' in window ? [observeReveals(), observeAnimations()] : [];

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <>
      <a href="#contact" className={`mobile-sticky-cta ${showMobileCta ? 'visible' : ''}`}>
        Book a consultation
        <ArrowUpRight size={18} />
      </a>
      <a
        href="#top"
        className={`back-top ${showBackToTop ? 'visible' : ''} ${showMobileCta ? 'above-cta' : ''}`}
        aria-label="Back to top"
      >
        <ArrowUp size={19} />
      </a>
    </>
  );
}
