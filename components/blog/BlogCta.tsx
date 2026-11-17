import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { consultationInvite, consultationSteps } from '@/lib/content';

/** The homepage's consultation invitation, as a closing panel on blog pages. */
export default function BlogCta() {
  const { eyebrow, heading, emphasis, intro } = consultationInvite;
  return (
    <section className="panel blog-cta" data-nav-tone="dark" aria-labelledby="blog-cta-title">
      <div className="contact-signal blog-cta-signal" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="container blog-cta-grid">
        <div className="blog-cta-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="blog-cta-title">
            {heading.join(' ')} <em>{emphasis}</em>
          </h2>
          <p>{intro}</p>
        </div>
        <div className="blog-cta-card">
          <ol>
            {consultationSteps.map((step, index) => (
              <li key={step}>
                <span className="mono">0{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <Link href="/#contact" className="button button-white">
            Book a consultation
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
          <p className="blog-cta-reply">
            <Clock3 size={15} aria-hidden="true" />
            Reply within one business day
          </p>
        </div>
      </div>
    </section>
  );
}
