import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { getLegalDocument } from '@/lib/legal-content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata(
  '/terms/',
  'Terms & Disclaimer | Nuvato AI',
  'Terms of use for the Nuvato AI website, disclaimers for its information and AI demonstrations, and terms for optional text messages.',
);

export default function TermsPage() {
  return <LegalPage document={getLegalDocument('terms')} />;
}
