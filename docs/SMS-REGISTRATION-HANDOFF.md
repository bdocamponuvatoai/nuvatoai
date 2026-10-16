# RingCentral SMS disclosure handoff

Prepared October 16, 2026. The reference attachment asks for a website disclaimer so RingCentral SMS can be configured.

## Completed in this Site

- `/privacy/`: a review draft describing the observed consultation flow, proposed mobile-data restrictions, provider use, retention decisions, security boundaries, and user choices.
- `/terms/#sms-program`: a review draft scoped to appointment, service/project updates, and customer support. Includes affirmative consent, no purchase condition, STOP, HELP, variable frequency, rates, delivery limitations, and non-transferable consent.
- `/terms/#website-information`: website and AI demonstration limitations, third-party marks, scoped engagements, and distinction between website text and carrier approval.
- `/terms/`: a linked overview.
- Footer links on the homepage and all new pages; privacy links near collection and final booking confirmation.
- Explicit notice that a consultation is not SMS enrollment. The existing form collects no phone number or SMS opt-in, and no consent collection or SMS delivery is represented as live.

## Business details to confirm before finalizing

1. Exact registered entity and DBA/brand relationship; public business contact address.
2. A monitored support/privacy email and support number. Do not use screenshot phone numbers without verification; the screenshot indicates a number-change request.
3. Actual SMS use cases: service-related only, marketing, or both. The current draft does not authorize marketing.
4. Real retention periods and deletion process for booking, CRM, messaging, consent, suppression, and provider records; applicable jurisdictions and legal bases.
5. Who owns and handles privacy requests, STOP/HELP responses, other withdrawal requests, and incidents.

## Operational prerequisites

- These pages are private review drafts on the existing owner-private Site. Carrier reviewers need accessible website/policy links. The private review URL is not ready for TCR submission. Publish approved pages on an authorized public domain (preferably the registered brand’s `nuvato.ai`) with working footer and consent-form links. Do not silently widen the Site’s audience or represent nuvato.ai routes as live.
- The original nuvato.ai source and host have not been changed. Its public booking workflow remains separate.
- If web opt-in is selected, implement a real consent record before activating the form: number, program/use case, exact versioned disclosure, affirmative choice, server timestamp, source, and appropriate evidence. Add an optional unchecked checkbox beside the phone field; do not gate ordinary service inquiries on SMS consent. A browser-only checkbox is insufficient evidence storage.
- Verify the number belongs to the subscriber and consider confirmation/double opt-in; never use purchased or third-party opt-in lists.
- Register the actual business, campaign, and sender numbers with matching disclosures and real sample messages. Protect EINs and private account data; do not put them on the website.
- Configure and test opt-out, suppression, HELP, non-SMS withdrawal requests, and any re-enrollment process for the actual RingCentral account. Official product documentation differs by SMS product and configuration; do not assume STOP handling is universally automatic.
- The existing website contains “Invoice Chaser” and “Collections Reminder” agents. RingCentral’s content policy prohibits debt-collection campaigns and identifies certain debt-collection businesses as ineligible. Ask RingCentral to assess the real business and intended messaging before registration; do not conceal or relabel these services to bypass review. The new draft is service-related, not approval to send collections texts.
- A qualified legal reviewer should approve final language for the actual operator, jurisdictions, practices, and message program. These drafts and successful deployment do not certify compliance or guarantee registration.

## Primary sources checked

- https://support.ringcentral.com/sms-registration.html — brand information, linked policies, message types, standard disclosures, optional unchecked consent when using web enrollment.
- https://www.ringcentral.com/terms//sms-mms-content-policies.html — campaign-specific consent, recordkeeping, prohibited content/use cases, opt-out obligations.
- https://developers.ringcentral.com/guide/messaging/sms/messaging-consent-management — sender/recipient pair consent management and opt-out controls.
- https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/ — notice transparency considerations; applicability depends on the actual operator and users.
- https://privacy.gov.ph/the-right-to-be-informed/ — Philippine notice considerations, where applicable; not an assumption about Nuvato’s legal domicile.

## Verification boundaries

The pages are checked through TypeScript, server rendering, link/anchor checks, and the production build. Supported browser QA is unavailable in this environment. No real appointment, SMS, email, carrier registration, or public-access change is performed as part of this edit.
