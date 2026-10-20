import Image from 'next/image';
import { assetUrl, images, toolLogo } from '@/lib/assets';
import { toolNames } from '@/lib/content';

export function ToolBadge({ name }: { name: string }) {
  return (
    <span className={`tool-badge tool-${name.toLowerCase()}`}>
      <span className="tool-logo">
        <Image src={assetUrl(toolLogo(name))} width={32} height={32} alt="" unoptimized />
      </span>
      <span>{name}</span>
    </span>
  );
}

function ToolRow({ names, position }: { names: string[]; position: 'top' | 'bottom' }) {
  return (
    <ul
      className={`integration-row integration-row-${position}`}
      aria-label={position === 'top' ? 'Sales and team tools' : 'Finance and customer tools'}
    >
      {names.map((name) => (
        <li key={name}>
          <ToolBadge name={name} />
        </li>
      ))}
    </ul>
  );
}

export default function ToolConnections() {
  return (
    <div className="integration-visual" aria-label="Nuvato AI integration examples">
      <div className="integration-visual-label mono">
        <span>YOUR EXISTING STACK</span>
        <span>14 TOOL EXAMPLES</span>
      </div>
      <div className="integration-map">
        <ToolRow names={toolNames.slice(0, 7)} position="top" />
        <div className="integration-spine">
          <div className="integration-brand">
            <Image src={images.brandMark} alt="" width={64} height={64} />
            <div>
              <span className="integration-wordmark">
                Nuvato <b>AI</b>
              </span>
              <span className="integration-brand-caption">One connected workflow</span>
            </div>
          </div>
        </div>
        <ToolRow names={toolNames.slice(7)} position="bottom" />
      </div>
      <div className="integration-footnote">
        <span className="integration-key">
          <i aria-hidden="true" />
          Connections defined during scoping
        </span>
        <p>
          Integration examples. Availability depends on your systems and permissions. Logos belong
          to their owners; no partnership is implied.
        </p>
      </div>
    </div>
  );
}
