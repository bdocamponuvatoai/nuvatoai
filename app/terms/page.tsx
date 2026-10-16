import type { Metadata } from 'next';
import {pageMetadata} from '../lib/seo';
import LegalPage from '../components/LegalPage';
import {getLegalDocument} from '../lib/legal-content';
export const metadata:Metadata=pageMetadata('/terms/','Terms & Disclaimer | Nuvato AI','Terms of use for the Nuvato AI website, disclaimers for its information and AI demonstrations, and terms for optional text messages.');
export default function Page(){return <LegalPage document={getLegalDocument('terms')}/>;}
