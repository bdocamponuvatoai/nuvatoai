import { ArrowUpRight, Plus } from 'lucide-react';
import { faqs } from '@/lib/content';

export default function FaqSection() {
  return (
    <section id="faq" className="section container faq-section" data-reveal>
      <div className="faq-intro">
        <p className="eyebrow">07 / FAQ</p>
        <h2>
          Before
          <br />
          we <em>build.</em>
        </h2>
        <p>A few things you might be wondering.</p>
        <a className="text-button" href="#contact">
          Talk it through
          <ArrowUpRight size={18} />
        </a>
      </div>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <details key={faq.question}>
            <summary>
              <span className="mono">0{i + 1}</span>
              <h3>{faq.question}</h3>
              <Plus size={19} />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
