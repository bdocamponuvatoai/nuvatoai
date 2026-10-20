'use client';

import type { PointerEvent } from 'react';

/** Card whose highlight follows the mouse via the --spot-x / --spot-y custom properties. */
export default function SpotlightCard({
  className,
  children,
  'aria-label': ariaLabel,
}: {
  className: string;
  children: React.ReactNode;
  'aria-label': string;
}) {
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }

  return (
    <article
      className={className}
      data-animate
      aria-label={ariaLabel}
      onPointerMove={onPointerMove}
    >
      {children}
    </article>
  );
}
