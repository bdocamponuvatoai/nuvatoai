'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useHomeState, type ContactDetails } from './HomeState';

type Day = { date: string; slots: { time: string }[] };
type Availability = { ok: boolean; timezone?: string; days?: Day[]; error?: string };
type BookingResponse = { ok?: boolean; meetLink?: string; error?: string; uncertain?: boolean };
type Phase = 'choose' | 'review' | 'done';

const MEETING_TYPES = [
  { id: 'MT-1', name: 'Discovery call', minutes: 30 },
  { id: 'MT-2', name: 'Scoping workshop', minutes: 60 },
] as const;
type MeetingType = (typeof MEETING_TYPES)[number]['id'];

const BUSINESS_ZONE = 'America/Chicago';
const EXTRA_ZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Manila',
  'Europe/London',
  'UTC',
];
const FALLBACK_BOOKING_URL = 'https://nuvato.ai/#contact';

const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const zoneLabel = (zone: string) => zone.replaceAll('_', ' ');
const meetingType = (id: MeetingType) => MEETING_TYPES.find((type) => type.id === id)!;

/** The instant at which `date` + `time` occurs on the wall clock in `zone`. */
function zonedDate(date: string, time: string, zone: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  const format = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  // Converge on the zone's offset; three passes settle DST transitions.
  let timestamp = target;
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(
      format.formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]),
    );
    const wallClock = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );
    timestamp += target - wallClock;
  }
  return new Date(timestamp);
}

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

type CalendarResult = { request: string; days: Day[]; zone: string; error: string };

/**
 * Live availability for a meeting type, from /api/availability. Changing `reloadKey`
 * refetches. The calendar is loading until a result arrives for the current request.
 */
function useAvailability(type: MeetingType, reloadKey: number) {
  const request = `${type}:${reloadKey}`;
  const [result, setResult] = useState<CalendarResult | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/availability/?type=${type}`, { signal: abort.signal })
      .then(async (response) => {
        const data: Availability = await response.json();
        if (!response.ok || !data.ok || !Array.isArray(data.days)) {
          throw new Error(data.error || 'Availability is temporarily unavailable.');
        }
        setResult({
          request,
          days: data.days.filter((day) => Array.isArray(day.slots) && day.slots.length),
          zone: data.timezone || BUSINESS_ZONE,
          error: '',
        });
      })
      .catch((reason: Error) => {
        if (reason.name === 'AbortError') return;
        setResult({
          request,
          days: [],
          zone: BUSINESS_ZONE,
          error:
            'We couldn’t load the calendar. Please try again, or book on the original Nuvato AI site.',
        });
      });
    return () => abort.abort();
  }, [request, type]);

  const current = result?.request === request ? result : null;
  return {
    loading: !current,
    days: current?.days ?? [],
    zone: current?.zone ?? BUSINESS_ZONE,
    error: current?.error ?? '',
  };
}

function Booking({ details, onClose }: { details: ContactDetails; onClose: () => void }) {
  const dialog = useModalDialog();
  const [type, setType] = useState<MeetingType>('MT-1');
  const [reloadKey, setReloadKey] = useState(0);
  const { days, zone, loading, error: calendarError } = useAvailability(type, reloadKey);
  // The dialog renders only after the visitor opens it, so reading the browser zone is safe.
  const [displayZone, setDisplayZone] = useState(browserZone);
  const [chosenDate, setChosenDate] = useState('');
  const [time, setTime] = useState('');
  const [phase, setPhase] = useState<Phase>('choose');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  // Default to the first open day until the visitor picks one.
  const date = days.some((day) => day.date === chosenDate) ? chosenDate : (days[0]?.date ?? '');
  const meeting = meetingType(type);

  const formatTime = useCallback(
    (slot: string) =>
      date
        ? new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: displayZone,
          }).format(zonedDate(date, slot, zone))
        : slot,
    [date, zone, displayZone],
  );
  const dateLabel = date
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: displayZone,
      }).format(zonedDate(date, time || '12:00', zone))
    : '';

  function resetCalendar() {
    setChosenDate('');
    setTime('');
  }

  function close() {
    if (!busy) onClose();
  }

  async function confirm() {
    if (busy || !date || !time) return;
    setBusy(true);
    setError('');
    setUncertain(false);
    try {
      const response = await fetch('/api/bookings/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          date,
          time,
          name: details.name,
          email: details.email,
          company: details.company,
          phone: '',
          website: details.website || '',
          notes: `${details.service}. ${details.message}`,
        }),
      });
      const data = (await response.json()) as BookingResponse;
      if (data.ok === true) {
        try {
          const url = new URL(data.meetLink || '');
          if (url.protocol === 'https:') setMeetLink(url.href);
        } catch {
          // No usable meeting link; the confirmation email still has the details.
        }
        setPhase('done');
        return;
      }
      setError(
        data.error ||
          'The booking service could not confirm your appointment. Please check your email before trying again.',
      );
      setUncertain(!!data.uncertain);
      if (response.status === 409) {
        setPhase('choose');
        setTime('');
      }
    } catch {
      setUncertain(true);
      setError(
        'We couldn’t verify the booking confirmation. Please check your email before trying again to avoid booking twice.',
      );
    } finally {
      setBusy(false);
    }
  }

  const heading =
    phase === 'done'
      ? 'You’re booked.'
      : phase === 'review'
        ? 'Make it official.'
        : 'Let’s find a time.';
  const subtitle =
    phase === 'done'
      ? `A confirmation is on its way to ${details.email}.`
      : phase === 'review'
        ? 'Review your details before confirming.'
        : 'A real conversation about what could work better.';
  const zones = Array.from(new Set([displayZone, zone, browserZone(), ...EXTRA_ZONES]));

  return (
    <dialog
      ref={dialog}
      className="booking-dialog"
      aria-labelledby="booking-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === dialog.current) close();
      }}
    >
      <div className="booking-shell">
        <div className="booking-header">
          <span className="booking-symbol">
            <CalendarDays size={23} />
          </span>
          <button
            className="icon-button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close booking"
          >
            <X size={21} />
          </button>
        </div>
        <h2 id="booking-title">{heading}</h2>
        <p className="booking-subtitle">{subtitle}</p>

        {phase === 'choose' && (
          <>
            <div className="meeting-types" aria-label="Meeting type">
              {MEETING_TYPES.map((option) => (
                <button
                  key={option.id}
                  aria-pressed={type === option.id}
                  className={type === option.id ? 'selected' : ''}
                  onClick={() => {
                    if (option.id === type) return;
                    resetCalendar();
                    setType(option.id);
                  }}
                >
                  <b>{option.name}</b>
                  <span>
                    <Clock3 size={12} />
                    {option.minutes} minutes
                  </span>
                </button>
              ))}
            </div>

            <div className="timezone-row">
              <label>
                Display times in
                <select
                  value={displayZone}
                  onChange={(event) => setDisplayZone(event.target.value)}
                >
                  {zones.map((option) => (
                    <option key={option} value={option}>
                      {zoneLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <div className="booking-loading" role="status">
                <LoaderCircle className="spin" size={24} />
                Checking live availability…
              </div>
            ) : calendarError ? (
              <div className="booking-error" role="alert">
                <p>{calendarError}</p>
                <button
                  className="text-button blue-text"
                  onClick={() => {
                    resetCalendar();
                    setReloadKey((key) => key + 1);
                  }}
                >
                  Try again
                  <ArrowRight size={15} />
                </button>
                <a href={FALLBACK_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Open Nuvato AI booking
                  <ArrowUpRight size={14} />
                </a>
              </div>
            ) : !days.length ? (
              <div className="booking-error">
                <p>No open appointments are available in the next 14 days.</p>
                <a href={FALLBACK_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Contact Nuvato AI
                  <ArrowUpRight size={14} />
                </a>
              </div>
            ) : (
              <>
                <p className="booking-label">
                  1. CHOOSE A DATE <span>Dates below are in {zoneLabel(zone)}</span>
                </p>
                <div className="booking-days">
                  {days.map((day) => {
                    const noon = new Date(`${day.date}T12:00:00Z`);
                    return (
                      <button
                        key={day.date}
                        className={date === day.date ? 'selected' : ''}
                        aria-pressed={date === day.date}
                        onClick={() => {
                          setChosenDate(day.date);
                          setTime('');
                        }}
                      >
                        <small>
                          {noon.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                        </small>
                        <b>{noon.getUTCDate()}</b>
                        <span>
                          {noon.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="booking-label">
                  2. CHOOSE A TIME <span>{zoneLabel(displayZone)}</span>
                </p>
                <div className="booking-times">
                  {days
                    .find((day) => day.date === date)
                    ?.slots.map((slot) => (
                      <button
                        key={slot.time}
                        className={time === slot.time ? 'selected' : ''}
                        aria-pressed={time === slot.time}
                        onClick={() => setTime(slot.time)}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                </div>
                {time && (
                  <p className="selected-time" aria-live="polite">
                    <Check size={14} />
                    {dateLabel} at {formatTime(time)}
                  </p>
                )}
                <button
                  className="button button-primary booking-next"
                  disabled={!date || !time}
                  onClick={() => {
                    setPhase('review');
                    setError('');
                  }}
                >
                  Review booking
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </>
        )}

        {phase !== 'choose' && (
          <>
            <div className="booking-summary">
              {phase === 'done' && (
                <div className="booking-success">
                  <Check size={26} />
                </div>
              )}
              <h3>{meeting.name}</h3>
              <p>
                <CalendarDays size={16} />
                {dateLabel}
              </p>
              <p>
                <Clock3 size={16} />
                {formatTime(time)} · {meeting.minutes} minutes
              </p>
              <small>{zoneLabel(displayZone)}</small>
              <hr />
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{details.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{details.email}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{details.company}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>{details.service}</dd>
                </div>
              </dl>
            </div>
            {error && (
              <p className="booking-error" role="alert">
                {error}
              </p>
            )}

            {phase === 'review' ? (
              <>
                <div className="booking-review-actions">
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => {
                      setPhase('choose');
                      setError('');
                    }}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                  <button
                    className="button button-primary"
                    disabled={busy || uncertain}
                    onClick={confirm}
                  >
                    {busy ? (
                      <>
                        <LoaderCircle size={17} className="spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        Confirm booking
                        <Check size={16} />
                      </>
                    )}
                  </button>
                </div>
                <div className="booking-privacy">
                  <p>
                    By confirming, you agree to the{' '}
                    <Link href="/terms/" target="_blank" rel="noopener noreferrer">
                      Terms
                    </Link>{' '}
                    and send these details to Nuvato AI’s booking service to request your
                    appointment and calendar invitation, as described in the{' '}
                    <Link href="/privacy/" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </Link>
                    . This does not enroll you in SMS.
                  </p>
                </div>
              </>
            ) : (
              <>
                {meetLink && (
                  <a
                    className="button button-primary booking-next"
                    href={meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open meeting link
                    <ArrowUpRight size={16} />
                  </a>
                )}
                <button className="button button-secondary booking-next" onClick={onClose}>
                  Done
                  <Check size={16} />
                </button>
              </>
            )}
          </>
        )}

        <div className="booking-footer">
          <ShieldCheck size={13} />
          Your details go directly to Nuvato AI.
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
