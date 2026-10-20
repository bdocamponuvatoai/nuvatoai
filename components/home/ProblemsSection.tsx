import { ArrowUpRight } from 'lucide-react';
import { services } from '@/lib/content';
import ServiceLink from './ServiceLink';

const serviceIndex = (id: (typeof services)[number]['id']) =>
  services.findIndex((service) => service.id === id);

const PROBLEMS = [
  {
    title: 'Your website is holding you back.',
    description: 'Slow pages. Unclear journeys. A site that takes more work than it should.',
    service: serviceIndex('websites'),
  },
  {
    title: 'Your tools don’t talk to each other.',
    description: 'Copying between tabs. Chasing updates. Work stuck between teams.',
    service: serviceIndex('automation'),
  },
  {
    title: 'The process lives in someone’s head.',
    description: 'Different answers. Repeated questions. Every handover starts from scratch.',
    service: serviceIndex('documentation'),
  },
];

export default function ProblemsSection() {
  return (
    <section id="problems" className="section container" data-reveal>
      <p className="eyebrow">01 / SOUND FAMILIAR?</p>
      <h2>
        Most bottlenecks aren’t
        <br />
        technical at <em>first.</em>
      </h2>
      <div className="problem-rows">
        {PROBLEMS.map((problem, i) => (
          <article key={problem.title}>
            <span className="mono">0{i + 1}</span>
            <h3>{problem.title}</h3>
            <p>{problem.description}</p>
            <ServiceLink serviceIndex={problem.service} className="text-button">
              What we do
              <ArrowUpRight size={17} />
            </ServiceLink>
          </article>
        ))}
      </div>
    </section>
  );
}
