import Image from 'next/image';
import { images } from '@/lib/assets';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  LockKeyhole,
  Workflow,
} from 'lucide-react';

const PIPELINE = [
  { label: 'Map the process', status: 'Done', className: 'done', Icon: Check },
  { label: 'Build the system', status: 'Running', className: 'running', Icon: Workflow },
  { label: 'Measure & maintain', status: 'Queued', className: '', Icon: Activity },
];

const METRICS = [
  { value: '128', label: 'Workflows live' },
  { value: '4,812', label: 'Steps documented' },
  { value: '1.2s', label: 'Avg. response' },
];

const FEED = [
  { time: '09:41:02', team: 'SALES', message: 'Synced 14 leads → CRM' },
  { time: '09:41:05', team: 'OPS', message: 'Routed onboarding task to Maya' },
  { time: '09:41:07', team: 'FIN', message: 'Sent 3 invoice reminders' },
];

const CHART_POINTS =
  '0 57 40 52 80 55 120 35 160 42 200 25 240 32 280 14 320 26 360 18 400 21 440 10 480 15 520 6 560 9 600 2';

/** Illustrative dashboard under the hero. Static demo content; no real data. */
export default function CommandCenter() {
  return (
    <div className="command-center" aria-label="Illustrative Command Center">
      <div className="command-top">
        <span>
          <Image src={images.brandMark} alt="" width={24} height={24} />
          Command Center
        </span>
        <span className="mono demo-label">ILLUSTRATIVE</span>
      </div>

      <div className="command-body">
        <div className="command-main">
          <div className="command-heading">
            <div>
              <span className="mono">YOUR OPERATION, CONNECTED</span>
              <h2>Good systems. Quietly working.</h2>
            </div>
            <span className="live-dot mono">Live view</span>
          </div>

          <div className="pipeline">
            {PIPELINE.map(({ label, status, className, Icon }, i) => (
              <div key={label}>
                <span className="pipeline-icon">
                  <Icon size={19} />
                </span>
                <b>{label}</b>
                <small className={className}>{status}</small>
                {i < PIPELINE.length - 1 && <ArrowRight className="pipeline-arrow" size={15} />}
              </div>
            ))}
          </div>

          <div className="command-metrics">
            {METRICS.map(({ value, label }) => (
              <div key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="chart-wrap">
            <span className="mono">WORKFLOW ACTIVITY</span>
            <svg viewBox="0 0 600 70" role="img" aria-label="Illustrative upward activity chart">
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#1A56F0" stopOpacity=".16" />
                  <stop offset="1" stopColor="#1A56F0" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`M${CHART_POINTS}V70H0Z`} fill="url(#chart-fill)" />
              <path
                className="chart-line"
                d={`M${CHART_POINTS}`}
                stroke="#1A56F0"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <aside className="command-feed">
          <span className="mono">
            ACTIVITY FEED <span className="live-light" />
          </span>
          {FEED.map(({ time, team, message }) => (
            <div className="feed-item" key={time}>
              <span className="mono">
                {time} <b>{team}</b>
              </span>
              <p>{message}</p>
              <CheckCheck size={15} />
            </div>
          ))}
          <div className="approval-note">
            <span className="approval-dot" />
            <div>
              <b>Agent approval needed</b>
              <p>Invoice Chaser</p>
            </div>
            <ArrowUpRight size={17} />
          </div>
        </aside>
      </div>

      <div className="command-bottom mono">
        <span>
          <LockKeyhole size={12} />
          Permissions on. People in control.
        </span>
        <span>EXAMPLE WORKSPACE</span>
      </div>
    </div>
  );
}
