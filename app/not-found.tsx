import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowLeft, ArrowUpRight} from 'lucide-react';
import {LegalHeader} from './components/LegalPage';

export const metadata: Metadata = {title: 'Page not found | Nuvato AI', robots: {index: false, follow: false}};

export default function NotFound() {
  return <>
    <LegalHeader/>
    <main id="legal-main" className="section-shell status-page">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>This page has moved <em>on.</em></h1>
      <p>The address may be mistyped, or the page may no longer exist. Everything Nuvato builds starts from the homepage.</p>
      <div className="status-actions">
        <Link href="/" className="button button-primary"><ArrowLeft size={18} aria-hidden="true"/>Back to the homepage</Link>
        <Link href="/#contact" className="button button-secondary">Book a consultation<ArrowUpRight size={18} aria-hidden="true"/></Link>
      </div>
    </main>
  </>;
}
