import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { getLegalDocument } from '@/lib/legal-content';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata(
  '/sms-terms/',
  'Nuvato AI – SMS Terms & Conditions',
  'Terms for receiving text messages from Nuvato AI: message types, frequency, rates, STOP to opt out, HELP for assistance, and privacy.',
);

export default function SmsTermsPage() {
  return <LegalPage document={getLegalDocument('sms-terms')} />;
}
