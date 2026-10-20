import { processSteps } from '@/lib/content';

export default function ProcessSection() {
  return (
    <section id="process" className="section container process-section" data-reveal>
      <p className="eyebrow">05 / HOW IT WORKS</p>
      <h2>
        One process,
        <br />
        whatever we <em>build.</em>
      </h2>
      <div className="process-grid">
        {processSteps.map((step, i) => (
          <article key={step.title}>
            <div className="process-number mono">
              0{i + 1}
              <span />
            </div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
