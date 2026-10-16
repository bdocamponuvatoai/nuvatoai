# Nuvato AI refinement — October 16, 2026

The supplied Pasted text.txt is the source brief for this revision. Existing original brand artwork and the booking service integration are preserved.

## Delivered

- One landing page in the requested section order, with the exact headline and core service copy, all five services and twelve agents in server-rendered HTML, and six native FAQ accordions.
- Inset navy hero, overlapping illustrative Command Center, service explorer, bento interface examples, agent filters, delivery steps, offering figures, security panel, and four-step consultation form.
- Mobile navigation dialog, anchor scroll spy, sticky consultation action, back-to-top, once-only reveals, optional motion, keyboard service tabs, and progressive layout breakpoints at 560/768/1024/1280/1440/1920.
- Consultation details lead to the existing live calendar. A booking is submitted only after the visitor reviews and explicitly confirms. Confirmation only appears after an affirmative upstream response. Ambiguous writes are not automatically retried.
- Server input validation, 12KB streamed request limit, strict same-origin JSON submission, server honeypot, D1-backed booking rate limits (5 attempts per email and 10 per connection IP per 15-minute window), Retry-After handling, and fail-closed behavior if counters are unavailable. Short-lived windowed SHA-256 keys replace raw email/IP in the counter table; these hashes are not described as anonymization. Expired counters are deleted during later attempts.
- Per-request nonce CSP passed into Vinext's native nonce handling; no unsafe-inline scripts. Inline styles remain allowed for React styles and pointer coordinates. HSTS, nosniff, referrer and permissions policies, restrictive base/form/object/frame directives. ChatGPT and the same origin can frame the site for its private viewing experience.
- Only /privacy/ and /terms/ legal pages; former routes redirect. Existing mobile-data, opt-out, consent, AI, and demonstration disclosures remain. SMS enrollment is disabled.
- Self-hosted Sora, Inter, IBM Plex Mono; size-adjusted fallback faces; Open Graph/Twitter metadata, 1200×630 social image, favicon/app icon sizes, manifest, three-route sitemap, Organization/WebSite/FAQ schema.

## Intentional review boundaries

- The original Nuvato artwork is unmodified. Only a dark-wordmark version was available, so it is displayed on a white tile over dark surfaces. No replacement white logo was invented.
- Updated in the following revision: the supplied IGV logo strip is now integrated and links to Isak Global Ventures. See SEARCH-AND-MOTION.md for the current agents, branding, and search changes.
- Nine agent descriptions are explicitly marked for client review. Their descriptions say only what their names imply. No unsupported integrations are assigned to them.
- Legal operator, address, support email/phone, retention practices, and jurisdictional requirements still need confirmation. These documents are labeled review drafts and are not a promise of carrier approval. Finance messaging use cases require separate RingCentral eligibility review.
- This remains the existing owner-private Site and does not replace nuvato.ai. Its own host is canonical, and noindex/robots disallow remain until a deliberate public launch and domain cutover. SEO metadata alone does not make a private site indexable.
- The multi-step form continues into the real calendar rather than pretending that an inquiry was delivered. No notification inbox or standalone inquiry storage is fabricated. Details are held in page memory until booking confirmation.

## Validation

TypeScript checking, production packaging, deterministic server rendering, content/anchor/schema/asset checks, legal-route checks, security-header checks, and mocked booking/abuse-limit outcomes are run locally. The verification script creates no real booking or SMS.

Browser control is unavailable in this environment. The specified viewport/landscape matrix, rendered overflow/contrast/focus behavior, mobile Lighthouse, Core Web Vitals, Google's Rich Results Test, and a real authorized booking remain unverified. No performance score or certification is claimed. Check those before a public domain launch.


### Tool logos and transparent brand mark — 15 October 2026

Expanded “Your tools, working together” into a full-width connection diagram covering the same fourteen tools already present in the content inventory. Added local SVG logos to that diagram, the agent tool tags, and the expandable integration list. Desktop uses two seven-tool rows joined to the Nuvato hub; smaller screens reflow to a readable grid with no marquee or canvas.

Generated a transparent Nuvato symbol refinement from the supplied original mark and wordmark. Its alpha channel was checked; the full-resolution PNG is retained and the interface uses a 192px WebP derivative. The header/footer wordmark and linked original IGV logo are preserved. Added ice blue, pale mint, slate blue, and white surfaces around the existing navy/electric-blue palette. No new animation dependency, third-party image requests, scripts, analytics, or application permissions were added.

Tool asset provenance and hashes are in `tool-logo-sources.json`; license and trademark notes are in `TOOL-LOGOS.md`. The diagram explicitly presents integration examples, with availability and permissions scoped per project.

Verification: TypeScript, the existing SSR/content/security/booking checks, SVG element and external-reference validation, alpha-channel inspection, and production build. Browser rendering and Lighthouse were unavailable in this environment and are not claimed.


### Navigation and brand lockup — 16 October 2026 (Asia/Manila)

Replaced the homepage header with a consistent light navigation surface. The header remains visible while scrolling. Primary destinations cover services, AI agents, process, Why Nuvato, and security; the original login destination remains. The services disclosure presents all five services and selecting one updates the existing service panel. Booking remains connected to the existing consultation flow.

The mobile navigation uses a native modal dialog with a scrollable navigation region, service accordion, prominent consultation link, secondary FAQ/privacy links, and login. Escape, click outside, focus-out dismissal for the desktop disclosure, native modal focus containment, body-scroll restoration, breakpoint closure, and focus transfer to the destination heading are implemented. Links and tool descriptions remain server-rendered.

The Nuvato lockup uses the same transparent refined N asset from the preceding iteration with carefully spaced live typography in the existing Sora typeface. No new symbol or brand colors were introduced. Header, drawer, footer, and legal pages share the same brand component. The original logo files and IGV artwork are retained.

Adjusted anchor offsets and the sticky agent workspace to clear the persistent header. Added no libraries, image requests, permissions, or changes to booking, legal text, security headers, indexing, or sharing.

Validation: TypeScript and existing server-rendered content, anchors, metadata, legal, header-security and booking checks; production build through the normal publishing workflow. Browser interaction, responsive screenshots, and Lighthouse were unavailable and are not claimed as verified.


### Editorial agent directory — 16 October 2026 (Asia/Manila)

Rebuilt “Find your starting point” as an open editorial directory. Removed the repeated boxed agent grid, raised icon tiles, filled category pills, and dark featured card from this section. The new layout uses a larger two-line heading, a desktop team index that stays in view, and grouped horizontal agent entries with hairline divisions. Sales, Operations, Finance, and Support each have a heading and a short task-oriented introduction. Mobile entries stack in reading order, and team filters use a native horizontally scrollable strip.

Search matches agent names, categories, descriptions, and tools. Team counts reflect the current query. Zero results provide a reset control. Existing agent descriptions, review labels, original agent fragment IDs, tool logos, and deployment callbacks are retained. All twelve entries and descriptions remain in the initial server-rendered HTML, including those subsequently hidden by filtering. Custom agent and integration sections use the same open layout without surrounding cards.

No new runtime dependency or remote asset request was added. No security, legal, SEO metadata, or access configuration was changed. TypeScript and 274 existing content/navigation/metadata/security/booking checks passed. Production build uses the normal publishing workflow. Browser visual, responsive interaction, and Lighthouse checks remain unavailable.
