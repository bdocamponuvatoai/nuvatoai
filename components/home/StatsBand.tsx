import { agents, processSteps, services } from '@/lib/content';
import Counter from './Counter';

const STATS = [
  { value: services.length, label: 'Services under one roof' },
  { value: agents.length, label: 'Ready-made agents' },
  { value: processSteps.length, label: 'Steps from scope to maintenance' },
];

export default function StatsBand() {
  return (
    <section
      id="overview"
      className="stats-band panel"
      data-reveal
      data-nav-tone="dark"
      aria-label="Our service offering"
    >
      <div className="stats-rings" aria-hidden="true" />
      <h2>
        Built once.
        <br />
        Kept running.
      </h2>
      <div className="stats-values">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <Counter value={value} />
            <p>{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
