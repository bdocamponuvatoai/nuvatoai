'use client';

import { useHomeState } from './HomeState';

/** In-page link to the services explorer that also opens a specific service tab. */
export default function ServiceLink({
  serviceIndex,
  className,
  children,
}: {
  serviceIndex: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { showService } = useHomeState();
  return (
    <a href="#services" className={className} onClick={() => showService(serviceIndex)}>
      {children}
    </a>
  );
}
