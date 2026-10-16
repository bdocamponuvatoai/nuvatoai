import type { Metadata } from 'next';
import {pageMetadata} from '../lib/seo';
import LegalPage from '../components/LegalPage';
import {getLegalDocument} from '../lib/legal-content';
export const metadata:Metadata=pageMetadata('/sms-terms/','Nuvato AI – SMS Terms & Conditions','Terms for receiving text messages from Nuvato AI: message types, frequency, rates, STOP to opt out, HELP for assistance, and privacy.');
export default function Page(){return <LegalPage document={getLegalDocument('sms-terms')}/>;}
