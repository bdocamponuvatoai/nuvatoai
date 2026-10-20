import Image from 'next/image';
import { images } from '@/lib/assets';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { siteConfig } from '@/lib/site-config';

const FOOTER_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Agents', href: '#agents' },
  { label: 'Process', href: '#process' },
  { label: 'Security', href: '#security' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export default function SiteFooter() {
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div>
              <BrandLogo />
              <p>
                New technology · Intelligent innovation ·<br />
                Business transformation.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              {FOOTER_LINKS.map(({ label, href }) => (
                <a key={href} href={href}>
                  {label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </nav>
          </div>
          <div className="footer-legal">
            <span>© {new Date().getFullYear()} Nuvato AI · Chicago, IL</span>
            <div>
              <Link href="/privacy/">Privacy</Link>
              <Link href="/terms/">Terms & disclaimer</Link>
              <Link href="/sms-terms/">SMS terms</Link>
              <a href={siteConfig.loginUrl}>
                Log in
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
          <div className="footer-wordmark" aria-hidden="true">
            NUVATO
          </div>
        </div>
      </footer>

      <div className="family-bar igv-family-bar" data-nav-tone="dark">
        <a
          href={siteConfig.parentOrganizationUrl}
          className="igv-family-link"
          rel="external"
          aria-label="Visit Isak Global Ventures — Nuvato AI is part of Isak Global Ventures"
        >
          <span className="igv-family-text">
            Part of <strong>Isak Global Ventures</strong>
          </span>
          <span className="igv-logo-window">
            <Image src={images.parentLogo} alt="IGV" width={651} height={78} />
          </span>
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
