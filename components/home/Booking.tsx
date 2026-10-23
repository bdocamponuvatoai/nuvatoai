'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';
import { images } from '@/lib/assets';
import { calendlyEmbedUrl, parseCalendlyHeight, readCalendlyEvent } from '@/lib/calendly';
import { consultationSteps } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';
import { useHomeState, type ContactDetails } from './HomeState';

const { consultation } = siteConfig;
/** Calendly's recommended minimum; replaced by the height Calendly reports once it renders. */
const INITIAL_HEIGHT = 700;
/** Calendly briefly reports a tiny height (~26px) before it renders; never shrink below this. */
const MIN_HEIGHT = 420;
/** If Calendly hasn't loaded by then (offline, or blocked by an extension), offer a direct link. */
const LOAD_TIMEOUT_MS = 15_000;

const MEETING_FACTS = [
  { Icon: Clock3, label: `${consultation.minutes} minutes` },
  { Icon: Video, label: 'Google Meet' },
  { Icon: BadgeCheck, label: 'No commitment' },
];

type Status = 'loading' | 'ready' | 'unavailable' | 'scheduled';

/** Opens a modal <dialog>, locks page scroll, and restores focus when it unmounts. */
function useModalDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return dialog;
}

/** Follows Calendly's postMessage events: its content height, and a confirmed booking. */
function useCalendlyEvents(onScheduled: () => void) {
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  useEffect(() => {
    function onMessage(message: MessageEvent) {
      const calendly = readCalendlyEvent(message);
      if (!calendly) return;
      if (calendly.event === 'calendly.page_height') {
        const pixels = parseCalendlyHeight((calendly.payload as { height?: unknown })?.height);
        if (pixels) setHeight(Math.max(pixels, MIN_HEIGHT));
      } else if (calendly.event === 'calendly.event_scheduled') {
        onScheduled();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onScheduled]);
  return height;
}

/** Left panel: the Nuvato brand, what the call is, who it's for, and what happens next. */
function BrandPanel({
  details,
  scheduled,
  onEdit,
}: {
  details: ContactDetails;
  scheduled: boolean;
  onEdit: () => void;
}) {
  return (
    <aside className="booking-brand">
      <div className="booking-lockup">
        <span className="booking-mark">
          <Image src={images.brandMark} width={32} height={32} alt="" preload />
        </span>
        <span>
          Nuvato<b> AI</b>
        </span>
      </div>

      <p className="booking-eyebrow mono">BOOK A CONSULTATION</p>
      <h2 id="booking-title">
        {scheduled ? (
          <>
            You’re <em>booked.</em>
          </>
        ) : (
          <>
            Book your <em>{consultation.name.toLowerCase()}.</em>
          </>
        )}
      </h2>
      <p className="booking-intro">A real conversation about what could work better.</p>

      <ul className="booking-facts">
        {MEETING_FACTS.map(({ Icon, label }) => (
          <li key={label}>
            <Icon size={15} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>

      <div className="booking-for">
        <span className="mono">BOOKING FOR</span>
        <p>
          <strong>{details.name}</strong>
          <span>{details.company}</span>
          <span>{details.email}</span>
        </p>
        {!scheduled && (
          <button type="button" onClick={onEdit}>
            Edit details
          </button>
        )}
      </div>

      <ol className="booking-steps">
        {consultationSteps.map((step, i) => (
          <li key={step}>
            <span className="mono">0{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <p className="booking-trust">
        <ShieldCheck size={14} aria-hidden="true" />
        Your details go only to Nuvato AI and our scheduling provider, Calendly.
      </p>
    </aside>
  );
}

function Confirmation({ email, onClose }: { email: string; onClose: () => void }) {
  return (
    <div className="booking-confirmation" role="status">
      <span className="booking-confirmation-icon">
        <Check size={30} aria-hidden="true" />
      </span>
      <h3>Your {consultation.name.toLowerCase()} is confirmed.</h3>
      <p>
        A confirmation and calendar invitation are on their way to <strong>{email}</strong>.
      </p>
      <ul>
        <li>
          <Clock3 size={15} aria-hidden="true" />
          {consultation.name} · {consultation.minutes} minutes
        </li>
        <li>
          <Video size={15} aria-hidden="true" />
          The Google Meet link is in your invitation
        </li>
      </ul>
      <small>Need to change the time? Use the reschedule link in your confirmation email.</small>
      <button type="button" className="button button-primary" onClick={onClose}>
        Done
        <Check size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Booking dialog: the Nuvato brand panel beside an embedded Calendly scheduler,
 * pre-filled with the consultation form's answers. Calendly creates the appointment and
 * sends the confirmation and calendar invitation; this component only shows the result.
 */
function Booking({ details, onClose }: { details: ContactDetails; onClose: () => void }) {
  const dialog = useModalDialog();
  const [status, setStatus] = useState<Status>('loading');
  const height = useCalendlyEvents(useCallback(() => setStatus('scheduled'), []));
  // Rendered only after the visitor opens the dialog, so `window` is available.
  const src = useMemo(
    () => calendlyEmbedUrl(consultation.calendlyUrl, details, window.location.host),
    [details],
  );

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus('unavailable'), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  const scheduled = status === 'scheduled';

  return (
    <dialog
      ref={dialog}
      className="booking-dialog"
      aria-labelledby="booking-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <button type="button" className="booking-close" onClick={onClose} aria-label="Close booking">
        <X size={20} aria-hidden="true" />
      </button>

      <div className="booking-layout">
        <BrandPanel details={details} scheduled={scheduled} onEdit={onClose} />

        <section
          className="booking-main"
          aria-label={scheduled ? 'Booking confirmed' : 'Choose a time'}
        >
          {scheduled ? (
            <Confirmation email={details.email} onClose={onClose} />
          ) : (
            <>
              <div className="booking-main-heading">
                <p className="mono">CHOOSE A TIME</p>
                <span>Times are shown in your time zone.</span>
              </div>

              {status === 'unavailable' ? (
                <div className="booking-unavailable" role="alert">
                  <p>
                    The scheduler is taking too long to load. You can book on Calendly directly.
                  </p>
                  <a href={consultation.calendlyUrl} target="_blank" rel="noopener noreferrer">
                    Open the scheduling page
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </div>
              ) : (
                <div className="booking-scheduler" data-loading={status === 'loading' || undefined}>
                  {status === 'loading' && (
                    <div className="booking-loading" role="status">
                      <LoaderCircle className="booking-spinner" size={24} aria-hidden="true" />
                      Loading live availability…
                    </div>
                  )}
                  <iframe
                    src={src}
                    title={`Schedule a ${consultation.name} with Nuvato AI`}
                    height={height}
                    onLoad={() => setStatus('ready')}
                  />
                </div>
              )}

              <p className="booking-legal">
                Scheduling is provided by Calendly, which receives the details you entered to fill
                in its booking form. By booking, you agree to the{' '}
                <Link href="/terms/" target="_blank" rel="noopener noreferrer">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy/" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                . This does not enroll you in SMS.
              </p>
            </>
          )}
        </section>
      </div>
    </dialog>
  );
}

/** Renders the booking dialog while the consultation form has an open booking. */
export function BookingHost() {
  const { booking, closeBooking } = useHomeState();
  return booking ? <Booking details={booking} onClose={closeBooking} /> : null;
}
