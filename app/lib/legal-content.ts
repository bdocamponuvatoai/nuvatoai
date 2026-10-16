import {siteConfig} from './site-config';

const {business}=siteConfig;
const email=business.legalEmail;
const location=`${business.locality}, ${business.region}, ${business.country}`;
/** Full URLs as carriers require them in SMS terms (the published pages on the public domain). */
const privacyUrl=`${business.publicUrl}/privacy/`;
const termsUrl=`${business.publicUrl}/terms/`;
const link=(url:string)=>`[${url}](${url})`;

/** Publication details shown on each legal page. Update `updated` and `version` whenever the text changes. */
export const legalMeta = {
  effective: 'October 17, 2026',
  updated: 'October 17, 2026',
  version: '1.1',
  /** Website SMS enrollment is not offered; the SMS terms apply only to a separate opt-in. */
  smsEnrollmentEnabled: false,
} as const;

export type LegalSection = { id: string; title: string; paragraphs?: string[]; bullets?: string[]; highlight?: string };
export type LegalDocument = { slug: string; title: string; eyebrow: string; description: string; summary: {title:string;text:string}[]; sections: LegalSection[]; effective?: string; updated?: string };

/** Titles are numbered by position, so inserting a section never breaks the sequence. */
const renumber=(sections:LegalSection[],start=1,prefix='')=>sections.map((section,i)=>({...section,title:`${start+i}. ${prefix}${section.title.replace(/^\d+\. /,'')}`}));

const contactLine=`${business.name} · ${location} · ${email}`;

const privacy:LegalDocument={
  slug:'privacy',title:'Privacy Policy',eyebrow:'YOUR INFORMATION. YOUR CHOICES.',
  description:'How Nuvato AI collects, uses, protects, and retains information when you use this website or request a consultation, and the choices you have.',
  summary:[
    {title:'Only what is needed',text:'Contact and appointment details are used to respond to your inquiry and arrange the meeting you request.'},
    {title:'Never sold',text:'Personal information is never sold. SMS consent is not shared with third parties or affiliates.'},
    {title:'Your choices',text:`Ask to access, correct, or delete your information at any time by emailing ${email}.`},
  ],
  sections:renumber([
    {id:'scope',title:'Who we are and what this policy covers',paragraphs:[
      `${business.name} (“Nuvato AI”, “we”, “us”) is based in ${location} and operates this website. This policy explains how we handle information collected through the website, including the consultation and booking flow, and through any text-message program you choose to join under the [SMS Terms & Conditions](/sms-terms/).`,
      'Client platforms, authenticated accounts, and paid services governed by a separate written agreement may have additional terms. This policy does not cover independently operated websites that we link to.'
    ]},
    {id:'information',title:'Information we collect',bullets:[
      'Consultation details you enter: full name, work email, company, the services you are interested in, optional project notes, and your chosen appointment type, date, and time.',
      'Technical information that our hosting and security providers process to operate the website, such as IP address, browser and device type, request times, and security events.',
      'Abuse-prevention counters: short-lived, one-way hashes of an email address and connection IP with an attempt count. No raw IP address or form content is stored in these counters.',
      'Only if you separately opt in to text messages: your mobile number, the consent you gave and when, messages exchanged, delivery information, and opt-out requests.'
    ],paragraphs:[
      'The consultation form does not collect a phone number or SMS consent. Please do not include passwords, payment-card details, government identifiers, health information, or other sensitive information in project notes or messages.'
    ]},
    {id:'use',title:'How we use information',bullets:[
      'To respond to your inquiry, scope the services you ask about, arrange your consultation, and send the appointment confirmation.',
      'To send the specific service-related text messages you separately agree to receive.',
      'To keep the website secure, prevent abuse and fraud, investigate problems, and comply with legal obligations.',
      'To honor your communication preferences, including opt-outs.'
    ],paragraphs:[
      'A request for service-related messages is never treated as consent to marketing. Any marketing messages would require their own clear, separate consent.'
    ]},
    {id:'legal-bases',title:'Legal bases for processing',paragraphs:[
      'Where data-protection laws such as the GDPR or UK GDPR apply, we process information on these bases: to take steps you request before entering into a contract, such as arranging a consultation; our legitimate interests in responding to business inquiries, securing the website, and preventing abuse; your consent, for any text-message program you join, which you can withdraw at any time; and compliance with legal obligations.',
      'Where we rely on legitimate interests, we balance those interests against your rights, and you may object.'
    ]},
    {id:'sharing',title:'How we share information',highlight:'SMS consent is not shared with third parties or affiliates. All of the categories below exclude text-messaging originator opt-in data and consent; this information will not be shared with any third parties.',paragraphs:[
      'We share other personal information only with service providers that help us operate the website and deliver what you request, such as hosting, booking, calendar, and email providers. They may use it only to provide their services to us.'
    ],bullets:[
      'When you confirm a consultation, the details needed for that appointment are sent to our booking service to create your appointment and calendar invitation.',
      'We may disclose information when required by law, to respond to valid legal process, or to protect the rights, safety, and security of Nuvato AI, our clients, or others.',
      'If Nuvato AI is involved in a merger, acquisition, or sale of assets, information may be transferred as part of that transaction, subject to this policy.'
    ]},
    {id:'mobile-information',title:'Mobile information and SMS consent',highlight:'SMS consent is not shared with third parties or affiliates. Mobile information will not be sold or shared with third parties or affiliates for marketing or promotional purposes.',paragraphs:[
      'If you opt in to text messages, we collect your mobile phone number and a record of your consent, and use them only to send the messages you agreed to receive and to honor opt-outs. The [SMS Terms & Conditions](/sms-terms/) describe the message types, frequency, and how to opt out.',
      'Text-message opt-in data and consent are excluded from any sharing of contact information for another organization’s marketing. Consent applies only to the Nuvato AI program and purposes described when you gave it.',
      'Our messaging provider and mobile carriers process the information needed to deliver messages and apply opt-outs solely on our behalf. This is not sharing: they may not use your number or consent for any other purpose.'
    ]},
    {id:'cookies',title:'Cookies and tracking',paragraphs:[
      'This website does not use advertising cookies, analytics trackers, or cross-site tracking pixels, and it does not store consultation details in your browser’s storage. Form entries stay in page memory until you confirm a booking or leave the page.',
      'Our hosting platform may use strictly necessary cookies or similar technology for security and to deliver the site. Because no non-essential tracking is used, no cookie banner is shown. If that changes, we will update this policy and ask for your consent first.',
      'Browser privacy signals such as Global Privacy Control are honored as a request to opt out of the sale or sharing of personal information. Since we do neither, no further action is needed.'
    ]},
    {id:'retention',title:'How long we keep information',bullets:[
      'Inquiry and booking information: 2 years after your last contact with us, then deleted or de-identified.',
      'Client project records: for the duration of the engagement and afterwards as required by the written agreement and by tax, accounting, or other legal obligations.',
      'Text-message consent and opt-out records: for as long as you are enrolled, and up to 4 years after messaging ends, so we can demonstrate consent and continue to honor opt-outs.',
      'Abuse-prevention counters: they expire after 15 minutes and are removed during later booking activity.',
      'Hosting and security logs: kept by our providers under their own retention schedules.'
    ],paragraphs:[
      'We may keep information longer where needed to resolve a dispute, enforce our agreements, or comply with a legal hold. Deleted information may persist in backups for a limited period before it is overwritten.'
    ]},
    {id:'security',title:'How we protect information',paragraphs:[
      'The website uses HTTPS, strict security headers, server-side validation, and rate limiting. Booking details are never placed in web addresses, and no appointment is created until you explicitly confirm it.',
      'No website, email, or text-message channel can be completely secure. Text messages are not end-to-end encrypted, so never send passwords, security codes, financial credentials, or sensitive personal information by text.',
      'We do not collect biometric identifiers or biometric information, as defined by the Illinois Biometric Information Privacy Act. If a security breach affects your personal information, we will notify you as required by applicable law, including the Illinois Personal Information Protection Act.'
    ]},
    {id:'rights',title:'Your privacy rights',paragraphs:[
      'Depending on where you live, you may have the right to know what personal information we hold about you, and to access, correct, delete, or receive a portable copy of it. You may also have the right to restrict or object to certain uses, to withdraw consent, and to opt out of sale, sharing, targeted advertising, or profiling. We do not sell or share personal information, or use it for targeted advertising or profiling.',
      'Residents of California, Colorado, Connecticut, Texas, Virginia, and other U.S. states with privacy laws, and people in the EEA and UK, may exercise these rights. We extend the same choices to everyone where we reasonably can.'
    ],bullets:[
      `To make a request, email ${email}. We may need to verify your identity, and will ask only for what is needed to do so.`,
      'We respond within the time the law requires: usually within 45 days in the U.S. and one month in the EEA and UK. If we need longer, we will tell you why.',
      'An authorized agent may submit a request for you with written permission, subject to verification.',
      `If we decline your request, you may appeal by replying to our decision or emailing ${email} with “Privacy appeal” in the subject line. You may also complain to your state attorney general or your local data-protection authority.`,
      'You will not be treated differently for exercising your privacy rights.'
    ]},
    {id:'transfers',title:'International transfers',paragraphs:[
      'Nuvato AI is based in the United States. If you use this website from outside the United States, your information is transferred to, stored, and processed in the United States, where data-protection laws may differ from those where you live. Where required, we rely on appropriate safeguards such as standard contractual clauses.'
    ]},
    {id:'automated-decisions',title:'Automated decision-making',paragraphs:[
      'We do not use your information for automated decisions that produce legal or similarly significant effects. Consultation requests are reviewed by people. The AI agents described on this website are examples of services we build; they do not process visitor inquiries.'
    ]},
    {id:'children',title:'Children',paragraphs:[
      'This website and any text-message program are intended for business users aged 18 or over. We do not knowingly collect information from children under 13. If you believe a child has provided information, contact us and we will delete it.'
    ]},
    {id:'changes',title:'Changes to this policy',paragraphs:[
      'We may update this policy. The “last updated” date at the top of this page shows when it last changed. If changes are material, we will highlight them on the website before they take effect. Changes to the purposes of text messaging require new notice and, where needed, new consent.'
    ]},
    {id:'contact',title:'Contact us',highlight:contactLine,paragraphs:[
      `For privacy questions or to exercise your rights, email ${email}. Please do not send sensitive documents by email or text message.`
    ]},
  ]),
};

const disclaimer={
  information:{id:'website-information',title:'Website information',paragraphs:[
    'This website describes Nuvato AI’s services and offers a way to request a consultation. It is general business information, not individualized legal, tax, financial, medical, or regulatory advice.',
    'Service descriptions and estimated timelines explain possible work. They are not a binding quote, a guarantee of availability, or a promise of results. A written project agreement governs any engagement.'
  ]},
  demos:{id:'website-demos',title:'Demonstrations and results',paragraphs:[
    'Interactive workflows, dashboards, and platform illustrations on this website are demonstrations labeled as illustrative. They do not run work in your accounts or show real customer metrics.',
    'Results depend on your systems, data quality, permissions, implementation, and how a solution is used. No particular revenue, savings, ranking, delivery speed, or business outcome is guaranteed.'
  ]},
  ai:{id:'website-ai',title:'AI and automation',paragraphs:[
    'AI-generated information can be incomplete or incorrect. Review outputs before relying on them, especially where an action affects people, finances, contracts, safety, or access to systems.',
    'An agent’s appearance in the catalog does not authorize it to access an account or take an action. Scope, permissions, approvals, and applicable requirements are established for each actual implementation.'
  ]},
  thirdParties:{id:'website-third-parties',title:'Third-party services and marks',paragraphs:[
    'Names and logos of third-party tools identify examples of possible integrations and remain the property of their owners. Their display does not mean those companies are Nuvato AI customers, partners, sponsors, or endorsers.',
    'Third-party pricing, availability, terms, and capabilities may change. Linked websites and external services are governed by their own terms and privacy policies.'
  ]},
  security:{id:'website-security',title:'Security and sensitive information',paragraphs:[
    'Descriptions of security controls explain how our systems are designed to work; they are not a certification or a guarantee that an incident cannot occur. Do not submit credentials or confidential personal information through website notes or text messages.'
  ]},
} satisfies Record<string,LegalSection>;

const websiteTerms={
  acceptance:{id:'acceptance',title:'Acceptance of these terms',paragraphs:[
    `These terms govern your use of this website, operated by ${business.name}, ${location}. By using the website you agree to these terms and acknowledge the Privacy Policy. If you do not agree, please do not use the website.`,
    'The website is intended for business users aged 18 or over. If you use it on behalf of an organization, you confirm that you are authorized to accept these terms for it.'
  ]},
  engagement:{id:'engagement',title:'Services and agreements',paragraphs:[
    'Engagements are scoped first, with a fixed price agreed before work starts. A separate written agreement defines deliverables, responsibilities, approvals, maintenance, and schedule. Using this website or booking a consultation does not create a project agreement. If a signed agreement conflicts with these terms, the signed agreement controls for that engagement.'
  ]},
  use:{id:'acceptable-use',title:'Acceptable use',paragraphs:['Use the website lawfully and only for its intended purpose: learning about Nuvato AI and requesting a consultation. You agree not to:'],bullets:[
    'submit false or misleading information, or another person’s details, or book appointments you do not intend to attend;',
    'probe, scan, or test the website’s security, circumvent rate limits or other controls, or interfere with its operation;',
    'scrape, copy, or harvest content or data by automated means, other than ordinary search-engine indexing;',
    'upload malicious code, or use the website to send spam or unlawful content.'
  ]},
  ip:{id:'intellectual-property',title:'Intellectual property',paragraphs:[
    'The website’s content, design, text, graphics, and code, and the Nuvato AI name and logo, belong to Nuvato AI or its licensors and are protected by intellectual-property laws. You may view and print pages for your own evaluation of our services. Any other copying, modification, distribution, or commercial use requires our prior written permission.'
  ]},
  warranties:{id:'warranties',title:'Disclaimer of warranties',highlight:'To the fullest extent permitted by law, the website and its content are provided “as is” and “as available”, without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.',paragraphs:[
    'We do not warrant that the website will be uninterrupted, error-free, or free of harmful components, or that its information is complete or current. Any warranties for paid services are set out only in the applicable written agreement.'
  ]},
  liability:{id:'liability',title:'Limitation of liability',highlight:'To the fullest extent permitted by law, Nuvato AI’s total liability for all claims arising from or related to this website will not exceed one hundred U.S. dollars (US $100).',paragraphs:[
    'To the fullest extent permitted by law, Nuvato AI and its affiliates, personnel, and suppliers are not liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenue, data, or goodwill, arising from or related to your use of, or inability to use, this website.',
    'This limit applies to use of the website only. Liability for paid services is governed by the applicable written agreement. Nothing in these terms limits liability that cannot be limited by law, such as liability for fraud or for death or personal injury caused by negligence.'
  ]},
  indemnity:{id:'indemnity',title:'Indemnification',paragraphs:[
    'To the extent permitted by law, you agree to indemnify Nuvato AI against claims, losses, and reasonable costs, including legal fees, arising from your misuse of the website or your breach of these terms.'
  ]},
  accessibility:{id:'accessibility',title:'Accessibility',paragraphs:[
    'Nuvato AI aims for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It supports keyboard navigation, screen readers, reduced-motion and contrast preferences, and resizable text.',
    `If you encounter a barrier, email ${email} with the page and the problem, and we will provide the information in an accessible format where possible.`
  ]},
  law:{id:'governing-law',title:'Governing law and disputes',highlight:'These terms are governed by the laws of the State of Illinois and applicable United States federal law, without regard to conflict-of-law rules.',paragraphs:[
    `Any dispute arising from these terms or your use of this website will be brought in the state or federal courts located in Cook County, Illinois, and you and Nuvato AI consent to their jurisdiction. Before filing a claim, please contact us at ${email} so we can try to resolve the issue informally. Mandatory consumer-protection rights where you live are not affected.`
  ]},
  changes:{id:'changes',title:'Changes to these terms',paragraphs:[
    'We may update these terms. The “last updated” date at the top of this page shows when they last changed. Continuing to use the website after an update takes effect means you accept the updated terms. Updates do not change signed agreements.'
  ]},
  general:{id:'general',title:'General',paragraphs:[
    'If any provision of these terms is found unenforceable, the rest remain in effect. Our failure to enforce a provision is not a waiver. These terms and the Privacy Policy are the entire agreement about your use of this website. You may not transfer your rights under them.'
  ]},
} satisfies Record<string,LegalSection>;

const smsPointer:LegalSection={id:'sms-program',title:'Text messages',paragraphs:[
  'If you opt in to receive text messages from Nuvato AI, the [SMS Terms & Conditions](/sms-terms/) apply. They explain message types, frequency, rates, and how to opt out with STOP or get help with HELP.'
]};

const websiteSections=renumber([
  websiteTerms.acceptance,websiteTerms.engagement,
  disclaimer.information,disclaimer.demos,disclaimer.ai,disclaimer.thirdParties,
  websiteTerms.use,websiteTerms.ip,disclaimer.security,
  websiteTerms.warranties,websiteTerms.liability,websiteTerms.indemnity,
  websiteTerms.accessibility,websiteTerms.law,websiteTerms.changes,websiteTerms.general,
]);
const contactSection=renumber([smsPointer,{id:'contact',title:'Contact us',highlight:contactLine,paragraphs:[`Questions about these terms, accessibility, or text messages: email ${email}.`]}],websiteSections.length+1);

const terms:LegalDocument={
  slug:'terms',title:'Terms & Disclaimer',eyebrow:'CLEAR SCOPE. CLEAR RESPONSIBILITY.',
  description:'The terms for using the Nuvato AI website and the limits of its information and AI demonstrations. Text messages are covered by the separate SMS Terms & Conditions.',
  summary:[
    {title:'Examples are illustrative',text:'Interactive workflows and previews demonstrate concepts, not live customer operations.'},
    {title:'Projects are scoped first',text:'A written agreement defines deliverables, price, responsibilities, and the timeline.'},
    {title:'People stay responsible',text:'AI outputs and consequential actions require appropriate review and controls.'},
  ],
  sections:[...websiteSections,...contactSection],
};

/** SMS terms written to the carrier (RingCentral / TCR) registration requirements. Keep in sync with the registered campaign. */
const smsTerms:LegalDocument={
  slug:'sms-terms',title:'SMS Terms & Conditions',eyebrow:'CLEAR MESSAGES. CLEAR PERMISSION.',
  description:'The terms for receiving text messages from Nuvato AI: the messages you can expect, how often, and how to opt out or get help.',
  effective:'October 16, 2026',updated:'October 17, 2026',
  summary:[
    {title:'Text STOP',text:'To opt out at any time, text STOP.'},
    {title:'Text HELP',text:'For assistance, text HELP or visit our website at nuvato.ai.'},
    {title:'Rates may apply',text:'Messaging frequency may vary. Message and data rates may apply.'},
  ],
  sections:renumber([
    {id:'sms-terms-of-service',title:'SMS Terms of Service',highlight:`By opting into SMS from a web form or other medium, you are agreeing to receive SMS messages from Nuvato AI. This includes SMS messages for conversations (external). Message frequency varies. Message and data rates may apply. See privacy policy at ${link(privacyUrl)}. Message HELP for help. Reply STOP to any message to opt out.`},
    {id:'message-types',title:'Types of messages',paragraphs:['You can expect to receive text messages from Nuvato AI about:'],bullets:[
      'appointment confirmations and reminders for consultations you book;',
      'responses to your service inquiries;',
      'project updates and service notifications for work you requested;',
      'customer support conversations.'
    ]},
    {id:'frequency',title:'Message frequency',paragraphs:['Messaging frequency may vary, depending on your appointments, active projects, and support requests.']},
    {id:'rates',title:'Message and data rates',highlight:'Message and data rates may apply.',paragraphs:['Your mobile carrier’s plan determines any charges. Contact your carrier for details.']},
    {id:'opt-out',title:'How to opt out',highlight:'To opt out at any time, text STOP.',paragraphs:['Reply STOP to any message from Nuvato AI. You will receive one message confirming you have been unsubscribed, and no further messages unless you opt in again.']},
    {id:'help',title:'How to get help',highlight:'For assistance, text HELP or visit our website at [nuvato.ai](https://www.nuvato.ai/).',paragraphs:[`You can also email ${email}.`]},
    {id:'privacy',title:'Privacy Policy and Terms of Service',paragraphs:[`Visit ${link(privacyUrl)} for privacy policy and ${link(termsUrl)} for Terms of Service.`,'SMS consent is not shared with third parties or affiliates.']},
    {id:'consent',title:'Consent',paragraphs:['Receiving SMS messages is optional. Consent is not a condition of purchasing any products or services. You must be the account holder or an authorized user of the mobile number you provide, and be 18 or older.']},
    {id:'carrier',title:'Carrier disclaimer',paragraphs:['Mobile carriers are not liable for delayed or undelivered messages.']},
  ]),
};

export const legalDocuments:LegalDocument[]=[privacy,terms,smsTerms];
export function getLegalDocument(slug:string) {
  const document=legalDocuments.find(item=>item.slug===slug);
  if(!document)throw new Error('Unknown legal document');
  return document;
}
