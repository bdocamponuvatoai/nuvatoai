'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { calendlyEmbedUrl, parseCalendlyHeight, readCalendlyEvent } from '@/lib/calendly';
import { siteConfig } from '@/lib/site-config';
import { useHomeState, type ContactDetails } from './HomeState';

const { consultation } = siteConfig;
/** Calendly's recommended minimum; replaced by the height Calendly reports once it renders. */
const INITIAL_HEIGHT = 700;
/** Calendly briefly reports a tiny height (~26px) before it renders; never shrink below this. */
const MIN_HEIGHT = 420;
/** If Calendly hasn't loaded by then (offline, or blocked by an extension), offer a direct link. */
const LOAD_TIMEOUT_MS = 15_000;

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

/**
 * Embedded Calendly scheduler, pre-filled with the consultation form's answers. Calendly
 * creates the appointment and sends the confirmation and calendar invitation; this
 * component only shows the result.
 */
function Booking({ details, onClose }: { details: ContactDetails; onClose: () => void }) {
  const dialog = useModalDialog();
  const [status, setStatus] = useState<Status>('loading');
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  // Rendered only after the visitor opens the dialog, so `window` is available.
  const src = useMemo(
    () => calendlyEmbedUrl(consultation.calendlyUrl, details, window.location.host),
    [details],
  );

  useEffect(() => {
    function onMessage(message: MessageEvent) {
      const calendly = readCalendlyEvent(message);
      if (!calendly) return;
      if (calendly.event === 'calendly.page_height') {
        const pixels = parseCalendlyHeight((calendly.payload as { height?: unknown })?.height);
        if (pixels) setHeight(Math.max(pixels, MIN_HEIGHT));
      } else if (calendly.event === 'calendly.event_scheduled') {
        setStatus('scheduled');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

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
      <div className="booking-shell">
        <div className="booking-header">
          <span className="booking-symbol">
            <CalendarDays size={23} />
          </span>
          <button className="icon-button" onClick={onClose} aria-label="Close booking">
            <X size={21} />
          </button>
        </div>
        <h2 id="booking-title">{scheduled ? 'You’re booked.' : 'Let’s find a time.'}</h2>
        <p className="booking-subtitle">
          {scheduled
            ? `A confirmation and calendar invitation are on their way to ${details.email}.`
            : 'A real conversation about what could work better.'}
        </p>

        {scheduled ? (
          <>
            <div className="booking-summary">
              <div className="booking-success">
                <Check size={26} />
              </div>
              <h3>{consultation.name}</h3>
              <p>
                <Clock3 size={16} />
                {consultation.minutes} minutes · Google Meet
              </p>
              <small>
                Your confirmation email has the time, the meeting link, and options to reschedule or
                cancel.
              </small>
            </div>
            <button className="button button-primary booking-next" onClick={onClose}>
              Done
              <Check size={16} />
            </button>
          </>
        ) : (
          <>
            <p className="booking-meeting">
              <Clock3 size={14} />
              {consultation.name} · {consultation.minutes} minutes
            </p>

            {status === 'unavailable' ? (
              <div className="booking-error" role="alert">
                <p>The scheduler is taking too long to load. You can book on Calendly directly.</p>
                <a href={consultation.calendlyUrl} target="_blank" rel="noopener noreferrer">
                  Open the scheduling page
                  <ArrowUpRight size={14} />
                </a>
              </div>
            ) : (
              <div className="booking-scheduler" data-loading={status === 'loading' || undefined}>
                {status === 'loading' && (
                  <div className="booking-loading" role="status">
                    <LoaderCircle className="spin" size={24} />
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

            <div className="booking-privacy">
              <p>
                Scheduling is provided by Calendly, which receives the details you entered to fill
                in the booking form. By booking, you agree to the{' '}
                <Link href="/terms/" target="_blank" rel="noopener noreferrer">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy/" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                . This does not enroll you in SMS.
              </p>
            </div>
          </>
        )}

        <div className="booking-footer">
          <ShieldCheck size={13} />
          Your details go only to Nuvato AI and our scheduling provider, Calendly.
        </div>
      </div>
    </dialog>
  );
}

/** Renders the booking dialog while the consultation form has an open booking. */
export function BookingHost() {
  const { booking, closeBooking } = useHomeState();
  return booking ? <Booking details={booking} onClose={closeBooking} /> : null;
}
