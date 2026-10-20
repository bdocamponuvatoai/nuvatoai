'use client';

import { useRef, type KeyboardEvent } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { services } from '@/lib/content';
import { useHomeState } from './HomeState';
import { serviceIcons } from './service-icons';

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

/** WAI-ARIA tabs: arrow keys, Home, and End move between services. */
export default function ServicesSection() {
  const { activeService, showService, chooseService } = useHomeState();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = services.length;

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (NEXT_KEYS.includes(event.key)) next = (index + 1) % count;
    else if (PREVIOUS_KEYS.includes(event.key)) next = (index + count - 1) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    showService(next);
    tabs.current[next]?.focus();
  }

  return (
    <section id="services" className="section services-section container" data-reveal>
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / SERVICES</p>
          <h2>
            Five services.
            <br />
            One accountable <em>partner.</em>
          </h2>
        </div>
        <p>The whole system, or the part that needs attention. Start where it matters.</p>
      </div>

      <div className="service-explorer">
        <div role="tablist" aria-label="Explore services" className="service-tabs">
          {services.map((service, i) => {
            const Icon = serviceIcons[i];
            const selected = activeService === i;
            return (
              <button
                key={service.id}
                id={`tab-${service.id}`}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${service.id}`}
                tabIndex={selected ? 0 : -1}
                ref={(element) => {
                  tabs.current[i] = element;
                }}
                onClick={() => showService(i)}
                onKeyDown={(event) => onTabKeyDown(event, i)}
              >
                <span className="mono">0{i + 1}</span>
                <Icon size={19} />
                <span>{service.name}</span>
                <ArrowUpRight size={17} />
              </button>
            );
          })}
        </div>

        <div className="service-panels">
          {services.map((service, i) => {
            const Icon = serviceIcons[i];
            // Inactive panels stay in the HTML (hidden) so every service is server-rendered.
            return (
              <article
                role="tabpanel"
                id={`panel-${service.id}`}
                aria-labelledby={`tab-${service.id}`}
                tabIndex={0}
                hidden={activeService !== i}
                className="service-panel"
                key={service.id}
              >
                <div className="service-panel-top">
                  <span className="service-icon">
                    <Icon size={28} />
                  </span>
                  <span className="mono">SERVICE / 0{i + 1}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <p className="included-label mono">WHAT’S INCLUDED</p>
                <ul>
                  {service.items.map((item) => (
                    <li key={item}>
                      <Check size={15} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="service-tags">
                  {service.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a
                  href="#contact"
                  onClick={() => chooseService(service.name)}
                  className="button button-white"
                >
                  {service.cta}
                  <ArrowUpRight size={18} />
                </a>
                <div className="service-ring" aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </div>

      <p className="compound-note">
        Take one, or let them compound — a documented process makes a better automation, and a
        better automation makes a smarter agent.
      </p>
    </section>
  );
}
