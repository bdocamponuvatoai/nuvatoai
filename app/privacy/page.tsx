import type { Metadata } from 'next';
import {pageMetadata} from '../lib/seo';
import LegalPage from '../components/LegalPage';
import {getLegalDocument} from '../lib/legal-content';
export const metadata:Metadata=pageMetadata('/privacy/','Privacy Policy | Nuvato AI','How Nuvato AI collects, uses, protects, and retains information from this website, and the privacy choices and rights you have.');
export default function Page(){return <LegalPage document={getLegalDocument('privacy')}/>;}
