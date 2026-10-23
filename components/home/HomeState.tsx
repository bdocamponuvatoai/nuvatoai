'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { SchedulingDetails } from '@/lib/calendly';

/** What the consultation form collects; passed to Calendly to pre-fill the booking form. */
export type ContactDetails = SchedulingDetails;

/** A service or agent picked elsewhere on the page. `key` changes on every pick. */
export type ServiceSelection = { service: string; agent: string; key: number };

type HomeState = {
  /** Index of the open tab in the services explorer. */
  activeService: number;
  showService: (index: number) => void;
  selection: ServiceSelection;
  /** Pre-fills the consultation form with a service and, optionally, an agent. */
  chooseService: (service: string, agent?: string) => void;
  booking: ContactDetails | null;
  openBooking: (details: ContactDetails) => void;
  closeBooking: () => void;
};

const HomeStateContext = createContext<HomeState | null>(null);

/** State shared by the header, service explorer, agent catalog, and consultation form. */
export function HomeStateProvider({ children }: { children: React.ReactNode }) {
  const [activeService, setActiveService] = useState(0);
  const [selection, setSelection] = useState<ServiceSelection>({ service: '', agent: '', key: 0 });
  const [booking, setBooking] = useState<ContactDetails | null>(null);

  const chooseService = useCallback((service: string, agent = '') => {
    setSelection((previous) => ({ service, agent, key: previous.key + 1 }));
  }, []);
  const closeBooking = useCallback(() => setBooking(null), []);

  const value = useMemo(
    () => ({
      activeService,
      showService: setActiveService,
      selection,
      chooseService,
      booking,
      openBooking: setBooking,
      closeBooking,
    }),
    [activeService, selection, chooseService, booking, closeBooking],
  );

  return <HomeStateContext value={value}>{children}</HomeStateContext>;
}

export function useHomeState() {
  const state = useContext(HomeStateContext);
  if (!state) throw new Error('useHomeState must be used inside <HomeStateProvider>.');
  return state;
}
