import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';

/** Headline words, one line per entry. Each word animates in with a staggered delay. */
const HEADLINE = [
  ['We', 'build', 'the', 'systems'],
  ['your', 'business', 'runs', 'on.'],
];
const EMPHASIZED_WORD = 'runs';
const WORD_DELAY_MS = 60;

const ENGAGEMENT_INCLUDES = [
  'Scoped first',
  'Fixed price',
  'Approval gates',
  'Run logs',
  'Maintained after launch',
];

function HeadlineLine({ words, offset, last }: { words: string[]; offset: number; last: boolean }) {
  return words.map((word, i) => (
    <span
      className="hero-word"
      key={word}
      style={{ animationDelay: `${(offset + i) * WORD_DELAY_MS}ms` }}
    >
      {word === EMPHASIZED_WORD ? <em>{word}</em> : word}
      {last && i === words.length - 1 ? '' : ' '}
    </span>
  ));
}

export default function Hero() {
  return (
    <section id="top" className="hero panel" data-animate data-nav-tone="dark">
      <div className="hero-light" aria-hidden="true" />
      <div className="horizon-rings" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="hero-content">
        <p className="category-pill mono">Websites · AI · Automation · Documentation · Platforms</p>
        <h1>
          <HeadlineLine words={HEADLINE[0]} offset={0} last={false} />
          <br className="desktop-break" />
          <HeadlineLine words={HEADLINE[1]} offset={HEADLINE[0].length} last />
        </h1>
        <p className="hero-subline">
          Five services, one partner. From the website customers see to the enterprise platform your
          teams work in — designed, documented, automated, and maintained.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="button button-white">
            Book a consultation
            <ArrowUpRight size={19} />
          </a>
          <a href="#services" className="button button-glass">
            Explore our services
            <ChevronDown size={18} />
          </a>
        </div>
        <p className="trust-pill">
          <Check size={14} />
          Scoped first<span>·</span>Fixed price before work starts<span>·</span>Reply within one
          business day
        </p>
      </div>
    </section>
  );
}

export function EngagementStrip() {
  return (
    <div className="engagement container">
      <span className="mono">EVERY ENGAGEMENT INCLUDES</span>
      <div>
        {ENGAGEMENT_INCLUDES.map((item) => (
          <span key={item}>
            <Check size={15} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
