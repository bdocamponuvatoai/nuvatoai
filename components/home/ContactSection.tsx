import { Clock3 } from 'lucide-react';
import { consultationInvite, consultationSteps } from '@/lib/content';
import Inquiry from './Inquiry';

export default function ContactSection() {
  const { eyebrow, heading, emphasis, intro } = consultationInvite;
  return (
    <section
      id="contact"
      className="section panel contact-section"
      data-reveal
      data-nav-tone="dark"
    >
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">08 / {eyebrow}</p>
          <h2>
            {heading[0]}
            <br />
            {heading[1]} <em>{emphasis}</em>
          </h2>
          <p>{intro}</p>
          <ol>
            {consultationSteps.map((step, i) => (
              <li key={step}>
                <span className="mono">0{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="contact-reply">
            <Clock3 size={17} />
            Reply within one business day
          </div>
          <div className="contact-signal" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <Inquiry />
      </div>
    </section>
  );
}
