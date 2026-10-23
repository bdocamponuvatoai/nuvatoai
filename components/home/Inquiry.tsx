'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { services } from '@/lib/content';
import { useHomeState } from './HomeState';

const STEPS = [
  {
    title: 'What needs to work better?',
    description: 'A few sentences are enough. We’ll work through the details together.',
  },
  { title: 'What can we help with?', description: 'Choose one service, or connect a few.' },
  {
    title: 'When are you looking to start?',
    description: 'Give us a sense of timing. We’ll confirm the schedule when we scope.',
  },
  {
    title: 'Where can we reach you?',
    description: 'Next, choose a consultation time from the live calendar.',
  },
];
const LAST_STEP = STEPS.length - 1;

const TIMELINES = [
  'As soon as possible',
  'Within 1–3 months',
  'Within 3–6 months',
  'Exploring options',
];

const CONTACT_FIELDS = [
  { id: 'name', label: 'Full name', type: 'text', autoComplete: 'name', maxLength: 120 },
  { id: 'email', label: 'Work email', type: 'email', autoComplete: 'email', maxLength: 254 },
  { id: 'company', label: 'Company', type: 'text', autoComplete: 'organization', maxLength: 120 },
] as const;

const MIN_NEED_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;

const field = (data: FormData, name: string) => String(data.get(name) || '').trim();

/** Four-step consultation form. The last step opens the booking calendar. */
export default function Inquiry() {
  const { selection, openBooking } = useHomeState();
  const [step, setStep] = useState(0);
  const [need, setNeed] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);

  // A service or agent chosen elsewhere on the page pre-fills the form once per selection.
  const [appliedKey, setAppliedKey] = useState(selection.key);
  if (selection.key !== appliedKey) {
    setAppliedKey(selection.key);
    if (selection.service && !choices.includes(selection.service)) {
      setChoices([...choices, selection.service]);
    }
    if (selection.agent) setNeed(`I’d like to deploy ${selection.agent}.`);
  }

  function validate(data: FormData): Errors {
    const next: Errors = {};
    if (step === 0 && need.trim().length < MIN_NEED_LENGTH) {
      next.need = `Tell us a little more — at least ${MIN_NEED_LENGTH} characters.`;
    }
    if (step === 1 && !choices.length) next.services = 'Choose at least one service.';
    if (step === 2 && !timeline) next.timeline = 'Choose a timeline.';
    if (step === LAST_STEP) {
      if (!field(data, 'name')) next.name = 'Enter your name.';
      if (!EMAIL_PATTERN.test(field(data, 'email'))) next.email = 'Enter a valid email address.';
      if (!field(data, 'company')) next.company = 'Enter your company.';
    }
    return next;
  }

  function focusFirstError(next: Errors) {
    requestAnimationFrame(() => {
      const invalid = form.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      const timelineInput = next.timeline
        ? form.current?.querySelector<HTMLElement>('input[name="timeline"]')
        : null;
      (invalid ?? timelineInput)?.focus();
    });
  }

  function advance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(data);
    setErrors(next);
    if (Object.keys(next).length) {
      focusFirstError(next);
      return;
    }
    if (step < LAST_STEP) {
      setStep(step + 1);
      requestAnimationFrame(() => heading.current?.focus());
      return;
    }
    openBooking({
      name: field(data, 'name'),
      email: field(data, 'email'),
      company: field(data, 'company'),
      service: choices.join(', '),
      message: `Timeline: ${timeline}. ${need}`,
    });
  }

  function toggleChoice(name: string) {
    setChoices((current) =>
      current.includes(name) ? current.filter((choice) => choice !== name) : [...current, name],
    );
  }

  const errorFor = (key: string) =>
    errors[key] ? (
      <span id={`${key}-error`} className="field-error" role="alert">
        {errors[key]}
      </span>
    ) : null;
  const describedBy = (key: string) => (errors[key] ? `${key}-error` : undefined);

  return (
    <form ref={form} className="inquiry" onSubmit={advance} noValidate>
      <div className="form-step-label mono">
        <span>LET’S START WITH YOU</span>
        <span>
          0{step + 1} / 0{STEPS.length}
        </span>
      </div>
      <div className="form-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((_, n) => (
          <span className={n <= step ? 'filled' : ''} key={n} />
        ))}
      </div>
      <h3 ref={heading} tabIndex={-1}>
        {STEPS[step].title}
      </h3>
      <p className="step-description">{STEPS[step].description}</p>

      <fieldset hidden={step !== 0}>
        <legend className="sr-only">Your need</legend>
        <label htmlFor="need">Describe your workflow or project</label>
        <textarea
          id="need"
          name="need"
          maxLength={3000}
          rows={5}
          value={need}
          onChange={(event) => setNeed(event.target.value)}
          placeholder="We’re spending too much time on…"
          aria-invalid={!!errors.need}
          aria-describedby={describedBy('need')}
        />
        {errorFor('need')}
        <small>Don’t include passwords or sensitive personal information.</small>
      </fieldset>

      <fieldset hidden={step !== 1} aria-describedby={describedBy('services')}>
        <legend className="sr-only">Select services</legend>
        <div className="service-choices">
          {services.map((service) => (
            <label key={service.id} className={choices.includes(service.name) ? 'checked' : ''}>
              <input
                type="checkbox"
                value={service.name}
                checked={choices.includes(service.name)}
                onChange={() => toggleChoice(service.name)}
                aria-invalid={!!errors.services}
              />
              <span>{service.name}</span>
            </label>
          ))}
        </div>
        {errorFor('services')}
      </fieldset>

      <fieldset hidden={step !== 2} aria-describedby={describedBy('timeline')}>
        <legend className="sr-only">Timeline</legend>
        <div className="service-choices">
          {TIMELINES.map((option) => (
            <label key={option} className={timeline === option ? 'checked' : ''}>
              <input
                type="radio"
                name="timeline"
                value={option}
                checked={timeline === option}
                onChange={() => setTimeline(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {errorFor('timeline')}
      </fieldset>

      <fieldset hidden={step !== LAST_STEP}>
        <legend className="sr-only">Contact details</legend>
        {CONTACT_FIELDS.map(({ id, label, type, autoComplete, maxLength }) => (
          <div className="form-field" key={id}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              name={id}
              type={type}
              autoComplete={autoComplete}
              maxLength={maxLength}
              aria-invalid={!!errors[id]}
              aria-describedby={describedBy(id)}
            />
            {errorFor(id)}
          </div>
        ))}
        <p className="form-disclosure">
          When you choose a time, these details are passed to our scheduling provider, Calendly, to
          fill in the booking form, and are used to arrange and prepare for your consultation.
          Nothing is booked until you confirm a time. This does not enroll you in SMS. See our{' '}
          <Link href="/privacy/">Privacy Policy</Link> and <Link href="/terms/">Terms</Link>.
        </p>
      </fieldset>

      <div className="form-actions">
        {step > 0 && (
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setStep(step - 1);
              setErrors({});
            }}
          >
            Back
          </button>
        )}
        <button className="button button-primary" type="submit">
          {step === LAST_STEP ? 'Choose a time' : 'Continue'}
          <ArrowRight size={18} />
        </button>
      </div>
      <span className="form-foot">
        <LockKeyhole size={13} />
        Scoped first. No commitment to a project.
      </span>
      <noscript>
        <p>
          The consultation wizard requires JavaScript.{' '}
          <a href="https://nuvato.ai/#contact">Contact Nuvato AI</a>.
        </p>
      </noscript>
    </form>
  );
}
