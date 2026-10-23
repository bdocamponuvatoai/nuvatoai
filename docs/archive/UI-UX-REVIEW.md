> This initial audit is retained for history. The October 16 redesign and current verification status are documented in [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).

# Nuvato AI redesign: UI and UX review

Source: https://nuvato.ai/, retrieved 15 October 2026. Reviewed the live homepage HTML, styles, content, navigation, form code, original assets, and public availability response. No authenticated areas were accessed. Browser-based visual inspection was unavailable in this environment.

## Brand preserved

The logo and favicon are the exact PNG files served by the original website. The core palette remains deep navy `#0a1230`, electric blue `#1a56f0`, blue `#4d8bff`, cyan `#5db4ff`, cool white `#f4f7fc`, and white. The original Inter/Sora type pairing is retained with locally hosted variable fonts.

## Changes and their purpose

| Source experience | Redesign | Benefit |
| --- | --- | --- |
| Five overview cards followed by five detailed service sections | An overview followed by a keyboard-accessible service explorer | Reduces repetition while retaining descriptions, benefits, and service-specific calls to action |
| A long catalog of 12 agents | Featured examples, department filters, search by agent or integration, and an expand control | Makes discovery faster without removing any agent |
| Service and agent links all lead to the same contact anchor | Service and agent actions prefill the relevant inquiry | Preserves the visitor’s context |
| Command-center sample metrics can resemble live business results | An explicitly labeled, interactive workflow demonstration | Explains the work without inventing customer outcomes or implying live telemetry |
| Contact inputs rely largely on placeholder text | Persistent labels, native validation, autocomplete, and clear optional notes | Improves form comprehension and accessibility |
| Availability code includes local fallback slot generation when remote availability is missing | Only upstream availability is rendered; errors and empty calendars are explicit | Prevents a visitor from choosing invented availability |
| Dense recurring cards and similarly weighted sections | Large editorial hero, open service section, contrasting navy agent catalog, process, governance, FAQ, and consultation sections | Creates a clearer reading hierarchy and varied pacing |

## Content inventory

- All five offerings: websites; AI agents; automation; SOPs and workflow documentation; enterprise platform development.
- Service descriptions and detailed capabilities retained in the service explorer.
- All 12 agents, descriptions, integration names, and four departments retained.
- Custom-agent offer and indicative two-to-four-week timeline retained.
- All four delivery stages retained.
- All four governance capabilities retained.
- All seven questions and answers retained, including ownership, fixed scoping, timing, support, and approval gates.
- Original client login destination retained at `https://nuvato.ai/login`.
- Original consultation types retained: discovery call (30 minutes) and scoping workshop (60 minutes).
- No fabricated testimonials, customer logos, commercial results, certifications, or pricing added. Tool names denote integrations, not customer endorsements.

## Booking behavior

`GET /api/availability` reads Nuvato’s existing public `/api/availability` service. `POST /api/bookings` validates a visitor’s confirmed request, then passes it to the existing public booking service. The server assigns hosts. Times come from the original service and are converted for the visitor’s selected timezone.

The redesigned Site does not create a separate CRM, copy private account data, invent appointments, or store inquiry records locally. It does not send a booking until the visitor explicitly confirms. Unknown network outcomes are labeled unconfirmed and are never retried automatically. The original booking page remains available as a fallback.

## Validation and remaining verification

- TypeScript type checking passed.
- Production Vinext build passed using the maintained Sites runtime and Next.js App Router source structure.
- Automated checks cover content inventory, server-rendered markup, internal anchors, local assets, keyboard accessibility hooks, reduced motion, and booking endpoint validation and mocked outcomes.
- A read-only request to the original availability service succeeded.
- No real test appointment, email, calendar invitation, or CRM entry was created.
- Responsive CSS covers desktop, tablet, and mobile, including narrow 320px layouts. Browser screenshots, interaction testing in a real browser, and visual overflow verification remain unperformed because the supported browser capability was unavailable.
- The actual booking POST must be verified with an authorized real appointment before treating the redesign as a replacement for the original site.

The new Site is deployed privately. The original `nuvato.ai` domain, hosting, source, login, and access settings were not modified. Search indexing is intentionally disabled on this private review version.
