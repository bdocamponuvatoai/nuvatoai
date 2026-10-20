import { Activity, ArrowRight, Check, LockKeyhole, Mail } from 'lucide-react';
import ToolConnections from '@/components/ToolConnections';
import SpotlightCard from './SpotlightCard';

function ApprovalGateDemo() {
  return (
    <div className="mini-ui gate-ui">
      <span className="mono">INVOICE CHASER</span>
      <div className="gate-line">
        <div>
          <Mail size={18} />
          <span>Send reminder</span>
        </div>
        <ArrowRight size={16} />
        <div className="gate-check">
          <Check size={18} />
        </div>
      </div>
      <span className="approve-display">
        Approve <Check size={13} />
      </span>
      <small>Human approval required</small>
    </div>
  );
}

const PERMISSIONS = [
  { area: 'CRM', read: true, write: true },
  { area: 'Finance', read: true, write: false },
  { area: 'Admin', read: false, write: false },
];

function PermissionsDemo() {
  return (
    <div className="mini-ui permission-ui">
      <div>
        <span>Access</span>
        <span>Read</span>
        <span>Write</span>
      </div>
      {PERMISSIONS.map(({ area, read, write }) => (
        <div key={area}>
          <b>{area}</b>
          <span>{read ? <Check size={14} /> : <span>—</span>}</span>
          <span>{write ? <Check size={14} /> : <LockKeyhole size={12} />}</span>
        </div>
      ))}
    </div>
  );
}

function RunLogDemo() {
  return (
    <div className="mini-ui logs-ui">
      <span className="mono">RUN LOG / ILLUSTRATIVE</span>
      {['Trigger received', 'Permission checked', 'Action completed'].map((step, i) => (
        <div key={step}>
          <span className="mono">09:41:0{i}</span>
          <span>{step}</span>
          <Check size={13} />
        </div>
      ))}
    </div>
  );
}

const MAINTENANCE_STAGES = ['Discover', 'Design', 'Test', 'Measure', 'Today'];

function MaintenanceDemo() {
  return (
    <div className="mini-ui maintenance-ui">
      <div className="maintenance-track">
        {MAINTENANCE_STAGES.map((stage, i) => (
          <div key={stage}>
            <span>
              {i < MAINTENANCE_STAGES.length - 1 ? <Check size={13} /> : <Activity size={13} />}
            </span>
            <b>{stage}</b>
          </div>
        ))}
      </div>
      <span className="mono">A HANDOVER IS A BEGINNING.</span>
    </div>
  );
}

const CARDS = [
  {
    title: 'People stay in control.',
    description: 'Approval gates before consequential actions.',
    Demo: ApprovalGateDemo,
  },
  {
    title: 'The right access. Nothing extra.',
    description: 'Permissions built around the job to be done.',
    Demo: PermissionsDemo,
  },
  {
    title: 'Your tools, working together.',
    description:
      'Connect the systems your team already uses. Scope the access, approvals, and handoffs around the work.',
    Demo: ToolConnections,
    // The tool map carries real, labelled content rather than a decorative mockup.
    labelled: true,
  },
  {
    title: 'See what happened.',
    description: 'Readable logs make every run easier to follow.',
    Demo: RunLogDemo,
  },
  {
    title: 'Built for the long run.',
    description: 'Documented, handed over, measured, and maintained.',
    Demo: MaintenanceDemo,
  },
];

export default function WhySection() {
  return (
    <section id="why" className="section panel why-section" data-reveal data-nav-tone="dark">
      <div className="container">
        <p className="eyebrow">03 / WHY NUVATO</p>
        <h2>
          One partner from the first map
          <br />
          to the last maintenance <em>run.</em>
        </h2>
        <div className="bento-grid">
          {CARDS.map(({ title, description, Demo, labelled }, i) => (
            <SpotlightCard
              key={title}
              className={`bento bento-${i}`}
              aria-label={labelled ? title : 'Illustrative interface example'}
            >
              <Demo />
              <span className="bento-demo mono">ILLUSTRATIVE</span>
              <div className="bento-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
