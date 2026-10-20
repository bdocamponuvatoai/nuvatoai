import { Clock3 } from 'lucide-react';
import Inquiry from './Inquiry';

const NEXT_STEPS = ['Share what you need', 'We scope the work', 'Fixed price before work starts'];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="section panel contact-section"
      data-reveal
      data-nav-tone="dark"
    >
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="eyebrow">08 / BOOK A CONSULTATION</p>
          <h2>
            Tell us what needs
            <br />
            to work <em>better.</em>
          </h2>
          <p>Start with the bottleneck, the idea, or the thing your team keeps working around.</p>
          <ol>
            {NEXT_STEPS.map((step, i) => (
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
