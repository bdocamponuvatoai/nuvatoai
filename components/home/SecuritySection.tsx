import { Blocks, Check, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';

const CONTROLS = [
  {
    Icon: LockKeyhole,
    title: 'Permissions',
    description: 'Give each system the access its work requires.',
  },
  {
    Icon: ShieldCheck,
    title: 'Approval gates',
    description: 'Keep consequential actions subject to human review.',
  },
  {
    Icon: FileText,
    title: 'Run & audit logs',
    description: 'Trace activity and understand what happened.',
  },
  {
    Icon: Blocks,
    title: 'Single sign-on',
    description: 'Include SSO where your platform and scope support it.',
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="section container" data-reveal>
      <div className="security-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">06 / SECURITY</p>
            <h2>
              Enterprise-grade control,
              <br />
              from day <em>one.</em>
            </h2>
          </div>
          <p>
            Define the boundaries before the system runs. Every control is scoped around your tools,
            team, and requirements.
          </p>
        </div>

        <div className="security-grid">
          {CONTROLS.map(({ Icon, title, description }) => (
            <article key={title}>
              <Icon size={25} />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div className="audit-example">
          <div>
            <span className="mono">AUDIT TRAIL</span>
            <span className="mono">ILLUSTRATIVE</span>
          </div>
          <div>
            <span className="mono">09:41:08</span>
            <b>Invoice reminder approved</b>
            <span>Human review</span>
            <span className="done">
              <Check size={14} />
              Authorized
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
