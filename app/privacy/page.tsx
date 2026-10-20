import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { getLegalDocument } from '@/lib/legal-content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata(
  '/privacy/',
  'Privacy Policy | Nuvato AI',
  'How Nuvato AI collects, uses, protects, and retains information from this website, and the privacy choices and rights you have.',
);

export default function PrivacyPage() {
  return <LegalPage document={getLegalDocument('privacy')} />;
}
