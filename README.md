<div align="center">

<img src="public/brand/nuvato-logo.png" alt="Nuvato AI" width="260" />

# Nuvato AI — Marketing Site

**Websites · AI Agents · Automation · Documentation · Enterprise Platforms**

Next.js App Router · React 19 · TypeScript · Vinext + Vite · Cloudflare Workers · D1

_Built by **Blair** — Lead Website Developer, Nuvato AI_

</div>

---

## Contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Quick start](#quick-start)
4. [Scripts](#scripts)
5. [Project structure](#project-structure)
6. [Architecture](#architecture)
7. [Navigation system](#navigation-system)
8. [Design system](#design-system)
9. [Security](#security)
10. [SEO and metadata](#seo-and-metadata)
11. [Accessibility](#accessibility)
12. [Responsive design and browser support](#responsive-design-and-browser-support)
13. [Legal and compliance](#legal-and-compliance)
14. [Performance](#performance)
15. [Configuration](#configuration)
16. [Database](#database)
17. [Quality checks](#quality-checks)
18. [Deployment](#deployment)
19. [Launch checklist](#launch-checklist)
20. [Contributing](#contributing)
21. [Troubleshooting](#troubleshooting)
22. [Further documentation](#further-documentation)
23. [Credits](#credits)

---

## Overview

This is the public website for **Nuvato AI**, part of the Isak Global Ventures family. It presents five services, a searchable catalog of twelve AI agents, the delivery process, security posture, and FAQs. It ends with a four-step consultation flow that books a live appointment.

Key capabilities:

- **Server-rendered landing page.** All content, including every agent, service panel, and FAQ answer, is in the initial HTML for search engines and no-JS visitors.
- **Live booking.** Visitors pick a slot from the real Nuvato calendar. The request is validated, rate-limited, and forwarded to the existing booking service. Nothing is booked until the visitor explicitly confirms.
- **Glass navigation.** A floating, frosted bar adapts its tone to the section beneath it and has a sliding highlight, a glass services menu, and a frosted mobile sheet. See [Navigation system](#navigation-system).
- **Strict security headers.** A per-request CSP nonce, HSTS, COOP, and a locked-down permissions policy.
- **Legal pages.** Privacy Policy and Terms, including the SMS program disclosures, at `/privacy/` and `/terms/`.

> **Status:** The site currently runs as a private review deployment with search indexing turned off. Going live on the public domain is a one-file change; see the [Launch checklist](#launch-checklist).

---

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16 App Router** (via **Vinext 1.0 beta**) | Next.js APIs (`metadata`, route handlers, `headers()`) compiled by Vite for Workers |
| UI | **React 19.2**, TypeScript 5.9 (strict) | Client components only where interaction requires it |
| Styling | Hand-authored CSS with design tokens | Tailwind 4 and shadcn/ui primitives are available in `components/ui` but are not used by the marketing pages |
| Icons | `lucide-react` | Tree-shaken per icon |
| Validation | `zod` | Server-side schema for booking payloads |
| Runtime | **Cloudflare Workers** (`nodejs_compat`) | Entry point: `build/sites-worker.ts` |
| Data | **Cloudflare D1** + **Drizzle ORM** | Rate-limit counters only. No personal data is stored |
| Tooling | Vite 8, ESLint 9 (`next/core-web-vitals`, `next/typescript`), Wrangler 4 | |
| Package manager | **pnpm 11.25.0** (pinned), Node **≥ 22.13** | |

---

## Quick start

```sh
# 1. Use Node 22.13+ and the pinned pnpm
corepack enable            # or: npm i -g pnpm@11.25.0

# 2. Install exactly what the lockfile specifies
pnpm install --frozen-lockfile

# 3. Start the dev server (http://localhost:5173)
pnpm dev
```

Run the full quality gate before you open a pull request:

```sh
pnpm check   # typecheck + lint + 331 automated site checks
pnpm build   # production build into dist/
```

> **Windows:** `pnpm install:ci` uses Linux-only tools (`flock`, GNU `timeout`). On Windows or macOS, use `pnpm install --frozen-lockfile`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite/Vinext dev server with HMR on port 5173, with a local D1 emulated by Miniflare |
| `pnpm build` | Production build. Outputs the client assets and the Worker bundle to `dist/` |
| `pnpm start` | Serves the built Worker locally with Wrangler (`dist/server/wrangler.json`) |
| `pnpm typecheck` | `tsc --noEmit` in strict mode |
| `pnpm lint` | ESLint with the Next.js Core Web Vitals and TypeScript rules |
| `pnpm verify` | 331 SSR, content, SEO, security-header, validation, and mocked-booking checks. **It never sends a real booking.** |
| `pnpm check` | `typecheck` + `lint` + `verify`, the pre-merge gate |
| `pnpm db:generate` | Generates a Drizzle migration after you edit `db/schema.ts` |

---

## Project structure

```text
nuvato-ai/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout: metadata, fonts, JSON-LD (nonce'd)
│   ├── page.tsx                 # Home → <NuvatoSite/> (dynamic, for per-request CSP nonce)
│   ├── not-found.tsx            # Branded 404
│   ├── error.tsx                # Route error boundary with retry
│   ├── privacy/ · terms/        # Legal pages
│   ├── api/
│   │   ├── availability/        # GET  → read-only proxy to the booking calendar
│   │   └── bookings/            # POST → validated, rate-limited booking forwarder
│   ├── robots.txt/ · sitemap.xml/
│   ├── components/
│   │   ├── NuvatoSite.tsx       # Landing page sections + consultation wizard
│   │   ├── SiteHeader.tsx       # Glass navigation, services menu, mobile sheet
│   │   ├── Booking.tsx          # Calendar → review → confirmation dialog
│   │   ├── AgentsSection.tsx    # Scroll-driven agent story
│   │   ├── AgentDirectory.tsx   # Searchable, filterable agent catalog
│   │   ├── ToolConnections.tsx  # Integration logo map
│   │   ├── BrandLogo.tsx        # Shared lockup
│   │   └── LegalPage.tsx        # Legal layout, header, and footer
│   ├── lib/
│   │   ├── site-config.ts       # ★ Deployment settings (origin, indexing, upstreams)
│   │   ├── content.ts           # Services, agents, process, FAQs: one source of truth
│   │   ├── legal-content.ts     # Privacy & Terms copy
│   │   ├── seo.ts               # Metadata helpers + schema.org graph
│   │   ├── security.ts          # CSP + security headers
│   │   └── rate-limit.ts        # D1-backed, hashed, windowed counters
│   ├── globals.css              # Tokens, base, and section styles
│   ├── navigation.css           # Navigation system
│   ├── agents.css · directory.css · tools.css
│   └── polish.css               # Site-wide refinements (loaded last)
├── build/sites-worker.ts        # Worker entry: nonce, CSP, security headers
├── db/ · drizzle/               # Drizzle schema + SQL migrations
├── public/                      # Brand assets, self-hosted fonts, tool logos, manifest
├── scripts/                     # Build, install, and verification tooling
├── components/ui/               # Vendored shadcn/ui primitives (not used by marketing pages)
└── docs/                        # Design, implementation, and hand-off notes
```

---

## Architecture

### Request lifecycle

```text
Browser ──▶ Cloudflare Worker (build/sites-worker.ts)
              │  1. Generate a per-request nonce
              │  2. Attach CSP + x-nonce + x-site-path to the request
              ▼
            Vinext fetch handler ──▶ Next.js App Router (RSC + SSR)
              │                         layout.tsx reads x-nonce for the JSON-LD script
              ▼
            applySecurityHeaders()  →  CSP, HSTS, COOP, nosniff, Referrer & Permissions policy,
                                       no-store for HTML/JSON, X-Robots-Tag while unindexed
```

### Booking flow

```text
Consultation wizard (4 steps, client-validated)
   └─▶ Booking dialog
         ├─ GET  /api/availability?type=MT-1|MT-2   → upstream calendar (15 s timeout, no-store)
         └─ POST /api/bookings  (only after explicit "Confirm booking")
               1. Same-origin + Sec-Fetch-Site check          → 403
               2. Content-Type must be application/json       → 415
               3. Streamed body cap (12 KB)                   → 413
               4. Zod schema validation                       → 400
               5. Honeypot field                              → 400
               6. D1 rate limit (5/email, 10/IP per 15 min)   → 429 + Retry-After
                  └─ storage unavailable → fail closed        → 503
               7. Forward an explicit field allowlist upstream (30 s timeout, never retried)
                  ├─ ok          → 200 { meetLink, eventId }
                  ├─ 429         → 429
                  ├─ other 4xx   → 409 "choose another time"
                  └─ 5xx/timeout → 502 { uncertain: true } "check your email before retrying"
```

Design decisions:

- **Writes are never retried automatically.** A timed-out request may still have created an appointment, so the UI tells the visitor to check their email. This prevents double bookings.
- **No local copy of inquiry data.** The rate limiter stores only SHA-256 hashes of `window + email` and `window + IP`, plus counts and expiry times.
- **Only real availability.** If the calendar can't be loaded, the dialog says so and links to the original booking page. It never generates placeholder slots.

---

## Navigation system

`app/components/SiteHeader.tsx` and `app/navigation.css`

| Feature | Implementation |
| --- | --- |
| **Frosted glass** | `backdrop-filter: saturate(180%) blur(20px)` on the bar's `::before` layer. Keeping the filter off the bar lets the services menu blur the page itself, because a nested backdrop root would only blur the bar. |
| **Adaptive tone** | Sections marked `data-nav-tone="dark"` (hero, Why Nuvato, stats band, contact, footer bar) switch the bar to its dark tone while it sits over them. All colors are custom properties, so the switch is one attribute that cross-fades. |
| **Sliding highlight** | A single pill follows the hovered or focused item, then returns to the current section. It is positioned imperatively, so pointer movement never re-renders React. It appears in place instead of sliding in from its previous position. |
| **Scroll-spy and progress** | `aria-current="location"` marks the section in view. A 1px hairline at the base of the bar shows reading progress. |
| **Services menu** | A glass disclosure panel with staggered cards. It supports ArrowDown to enter, Escape to close and return focus, and closes on outside click or focus. `inert` while closed. |
| **Mobile sheet** | A native `<dialog>` (`showModal`) for a built-in focus trap and top-layer stacking. Full-screen frosted sheet on phones, floating glass card from 600px. Enter and exit animations, staggered links, scroll lock. Focus moves to the destination heading after navigation. |
| **Graceful fallbacks** | `@supports not (backdrop-filter)` uses opaque surfaces. `prefers-reduced-transparency`, `prefers-contrast: more`, and `prefers-reduced-motion` are all respected. Hidden when printing. |

To add a dark section, put `data-nav-tone="dark"` on its outermost element. No other change is needed.

---

## Design system

**Tokens** (in `:root`, `app/globals.css`):

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#0A1230` | Primary text, dark surfaces |
| `--blue` | `#1A56F0` | Brand accent, primary actions |
| `--signal` | `#4D8BFF` | Accent on dark surfaces, focus ring |
| `--mint` | `#36E0A8` | Positive or confirmation details |
| `--page` / `--ice` | `#F4F7FC` / `#EEF3FB` | Page and panel backgrounds |
| `--ease` | `cubic-bezier(.16,1,.3,1)` | Standard motion curve |

**Type:** Sora (headings), Inter (body), and IBM Plex Mono (labels). The fonts are self-hosted WOFF2 files with size-adjusted fallbacks to prevent layout shift, and both primary faces are preloaded.

**CSS organization:** `globals.css` holds the base system and sections. Each feature has its own file (`navigation`, `agents`, `directory`, `tools`). `polish.css` is loaded last for cross-cutting refinements.

---

## Security

| Control | Where |
| --- | --- |
| Content-Security-Policy with a per-request **nonce**. No `unsafe-inline` scripts, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` | `app/lib/security.ts`, `build/sites-worker.ts` |
| `Strict-Transport-Security: max-age=31536000; includeSubDomains` | `security.ts` |
| `Cross-Origin-Opener-Policy: same-origin`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` | `security.ts` |
| `Permissions-Policy` denies camera, microphone, geolocation, payment, and USB | `security.ts` |
| `Cache-Control: private, no-store` on HTML and JSON | `security.ts` |
| Booking: origin check, JSON-only, body cap, Zod schema, honeypot, field allowlist, D1 rate limit that fails closed | `app/api/bookings/route.ts` |
| Outbound requests go only to the configured booking origin, with timeouts | `site-config.ts`, API routes |
| No secrets in the repo. `.env*` is git-ignored | `.gitignore` |

To report a vulnerability, email the Nuvato AI engineering team. Don't open a public issue.

---

## SEO and metadata

- Full Next.js `metadata`: canonical URLs, Open Graph, Twitter cards, icons, web manifest, and theme color.
- A **schema.org graph** (`app/lib/seo.ts`) with Organization (and its parent organization), WebSite, WebPage, a service `OfferCatalog`, an agent `ItemList`, and an `FAQPage` whose text matches the visible copy exactly. There are no ratings or reviews in it.
- `/sitemap.xml` and `/robots.txt` are generated from `siteConfig`.
- Indexing is controlled by one flag. See [Configuration](#configuration).

---

## Accessibility

- A skip link, landmark roles, a single `h1` per page, and a logical heading order. The verify suite checks all of these.
- Keyboard support: the service explorer and the workflow demo are proper ARIA tablists (arrow keys, Home, End). The services menu and mobile sheet manage focus.
- Visible `:focus-visible` rings everywhere. All touch targets are at least 44px.
- Form fields have persistent labels and `autocomplete` attributes. Errors are linked with `aria-describedby`, announced with `role="alert"`, and focus moves to the first invalid field.
- Animated counters expose their final value to screen readers. Decorative visuals are `aria-hidden`, and illustrative mockups are labeled as illustrative.
- `prefers-reduced-motion`, `prefers-reduced-transparency`, and `prefers-contrast` are honored.

---

## Responsive design and browser support

**Mobile first.** Base styles target the smallest screen. Layout widens through `min-width` breakpoints at 560, 600, 768, 1024, 1100, 1280, 1440, and 1920px. One codebase serves every size; there is no separate mobile site.

| Rule | Detail |
| --- | --- |
| No horizontal scroll | Checked at 320, 360, 375, 390, 414, 600, 768, 1024, 1280, 1440, and 1920px |
| Touch targets | Interactive elements are at least 44px tall |
| Minimum text | 11px for monospace labels; body copy is 14–18px |
| No input zoom on iOS | Form fields are at least 16px below 768px |
| Notch and home indicator | `viewport-fit=cover` plus `env(safe-area-inset-*)` on fixed elements |
| Viewport height | `dvh` units with `vh` fallbacks |

**Supported browsers** (the Vite build target, "Baseline widely available"):

| Browser | Minimum version |
| --- | --- |
| Chrome / Edge | 111 |
| Firefox | 114 |
| Safari (macOS and iOS) | 16.4 |
| Samsung Internet and other Chromium browsers | equivalent to Chrome 111 |

Enhancements degrade gracefully. Glass blur falls back to opaque surfaces, `text-wrap: balance` is ignored where unsupported, and `-webkit-` prefixes cover Safari's `backdrop-filter`. `color-scheme: light` keeps native controls consistent in every engine, including on devices in dark mode.

---

## Legal and compliance

The Privacy Policy (`/privacy/`) and Terms & Disclaimer (`/terms/`) come from `app/lib/legal-content.ts`. Both are published as final text: effective October 17, 2026, version 1.0. The effective date, last-updated date, and version are set in `legalMeta`. Update them whenever the text changes.

| Area | Covered |
| --- | --- |
| Privacy: notice | What is collected, why, sources, providers, international transfers, retention, security, children, changes |
| Privacy: GDPR and UK GDPR | Legal bases for processing, rights of access, correction, deletion, restriction, portability, and objection, and the right to complain |
| Privacy: U.S. state laws (CCPA/CPRA and others) | Categories collected, no sale or sharing, no use of sensitive data, rights to know, delete, and correct, appeals, non-discrimination, authorized agents, **Global Privacy Control** honored |
| Privacy: SMS (TCPA, CTIA, carrier rules) | Separate opt-in, no purchase condition, STOP and HELP, frequency and rates, mobile data never sold or shared for marketing |
| Terms of use | Acceptance, eligibility, acceptable use, intellectual property, warranty disclaimer, limitation of liability, indemnity, changes, severability |
| Disclaimer | Website information isn't professional advice, demos are illustrative, AI limits, third-party marks |
| Accessibility | A WCAG 2.2 AA statement, with a way to report barriers |
| Cookies | No banner is needed: the site sets no advertising or analytics cookies and uses no trackers. Adding any requires a consent mechanism and a policy update first |
| Points of collection | The form and the booking confirmation link to the Terms and the Privacy Policy, and state that booking doesn't enroll you in SMS |

**Business decisions in the text**

| Item | Value |
| --- | --- |
| Business | Nuvato AI, Chicago, Illinois, United States (`siteConfig.business`) |
| Contact for legal, privacy, accessibility, and SMS help | `legal@nuvato.ai` (`siteConfig.business.legalEmail`) |
| Governing law and venue | Illinois law, with disputes in the state or federal courts of Cook County |
| Liability cap for website use | US $100. Paid services are governed by their own contracts |
| Inquiry and booking data retention | 2 years after last contact, then deleted or de-identified |
| SMS consent and opt-out records | Up to 4 years after messaging ends, the window for claims about text messages |
| Illinois-specific | No biometric data collected (BIPA); breach notice per the Personal Information Protection Act |

**Not reviewed by a lawyer.** The text follows common best practices, but no attorney has reviewed it. Have counsel review it when practical, especially before activating SMS or expanding outside the U.S. Nothing here is legal advice.

---

## Performance

- Self-hosted, preloaded variable fonts with metric-matched fallbacks (low CLS).
- Images are pre-sized static assets with explicit `width` and `height`, `loading="lazy"`, and `decoding="async"`. The Workers runtime has no `next/image` optimizer, so plain `<img>` is used on purpose (see `eslint.config.mjs`).
- Scroll handlers are passive and run at most once per animation frame. The navigation highlight writes styles directly instead of re-rendering.
- Reveal and in-view animations use `IntersectionObserver` and are skipped entirely under reduced motion.
- No analytics, ad pixels, or third-party scripts.

> Lighthouse and real-device profiling have **not** been run yet. Add them to the launch checklist for your target domain.

---

## Configuration

All deployment-specific values are in **`app/lib/site-config.ts`**:

```ts
export const siteConfig = {
  origin: 'https://…',                 // canonical origin (no trailing slash)
  indexable: false,                    // true only on the public production domain
  bookingServiceOrigin: 'https://nuvato.ai',
  loginUrl: 'https://nuvato.ai/login',
  parentOrganizationUrl: 'https://isakglobalventures.com/',
} as const;
```

`indexable` controls the `robots` metadata, `/robots.txt`, and the `X-Robots-Tag` header together, so they can't fall out of sync.

The app reads no runtime environment variables. Cloudflare bindings are declared in `.openai/hosting.json`: `DB` → D1.

---

## Database

D1 holds one table, `booking_limits`, which stores short-lived abuse-prevention counters.

```sh
# After editing db/schema.ts
pnpm db:generate

# Apply to a Cloudflare D1 database bound as DB
npx wrangler d1 execute <database-name> --remote --file drizzle/0000_dashing_wasp.sql
```

If the binding is missing or unavailable, booking **fails closed** with a 503. It never skips rate limiting.

---

## Quality checks

| Gate | Command | Status at hand-off |
| --- | --- | --- |
| Types | `pnpm typecheck` | ✅ 0 errors |
| Lint | `pnpm lint` | ✅ 0 errors, 0 warnings |
| Site checks | `pnpm verify` | ✅ 331 / 331 |
| Production build | `pnpm build` | ✅ |
| Browser check | Chrome, 1440px and 390px | ✅ Navigation tones, menu, mobile sheet, focus handling, legal pages, 404 |

`pnpm verify` server-renders the site and checks content completeness, unique IDs, anchors, section order, legal structure, structured data, meta description length, security headers, booking validation, rate-limit behavior (including fail-closed), and mocked upstream outcomes. Its output is written to `.sites-runtime/qa/` (git-ignored).

Not covered yet: end-to-end browser tests, Lighthouse, Google Rich Results validation, and a real booking against production. Do that last one with an authorized test appointment.

---

## Deployment

The same codebase deploys to **Vercel** (official Next.js build) or **Cloudflare Workers** (Vinext build). Pages and components are shared; only the build command and two platform adapters differ.

| | Vercel | Cloudflare Workers |
| --- | --- | --- |
| Build | `pnpm build:vercel` (`next build`, set in `vercel.json`) | `pnpm build` (Vinext writes `dist/`) |
| Security headers and CSP nonce | `proxy.ts`, which only runs when `VERCEL=1` | `build/sites-worker.ts` |
| Booking rate-limit store | Upstash Redis (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) | Cloudflare D1 bound as `DB` |

Both platforms share `app/lib/security.ts` and `app/lib/rate-limit.ts`, so the headers and limits are identical. If the rate-limit store is missing or unreachable, booking **fails closed** with a 503 on either platform.

### Vercel

1. Import the GitHub repository in Vercel. `vercel.json` sets the install and build commands, so no dashboard overrides are needed.
2. Connect **Upstash Redis** from the Vercel Marketplace: **Storage → Create → Upstash → Redis**, then connect it to the project. This injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Redeploy afterwards.
3. Add the domain `www.nuvato.ai` (and `nuvato.ai` redirecting to it) under **Settings → Domains**.
4. Before launch, update `siteConfig.origin` and `siteConfig.indexable`. See the [Launch checklist](#launch-checklist).

> Vercel preview deployments inject the Vercel toolbar script, which the strict CSP blocks. This only affects previews and doesn't break the site.

### Cloudflare Workers

- **Current host:** the Sites platform. Its identity and D1 binding are declared in `.openai/hosting.json`.
- **Your own Cloudflare account:** create a D1 database, apply the migration, set the real `database_id` for the `DB` binding, then deploy the built Worker with Wrangler.

---

## Launch checklist

- [ ] Set `siteConfig.origin` to the production domain.
- [ ] Set `siteConfig.indexable` to `true`. Then confirm `/robots.txt` allows crawling and the HTML no longer sends `X-Robots-Tag`.
- [ ] Create the `legal@nuvato.ai` mailbox, or a forward to a monitored inbox, and confirm that someone checks it. Privacy requests have legal response deadlines.
- [ ] Set up the 2-year retention schedule: delete or de-identify inquiry and booking records after 2 years in the booking service and CRM.
- [ ] Optional but recommended: have an attorney review the Privacy Policy and Terms.
- [ ] Connect Upstash Redis in Vercel so booking works (see [Deployment](#deployment)).
- [ ] SMS registration (RingCentral): once the site is live on `www.nuvato.ai`, confirm https://www.nuvato.ai/privacy/ and https://www.nuvato.ai/sms-terms/ load, then submit them as the Privacy Policy and Terms & Conditions links.
- [ ] Have the client confirm the agent descriptions marked `review: true` in `app/lib/content.ts`.
- [ ] Bind a production D1 database as `DB` and apply the migrations.
- [ ] Place one authorized end-to-end test booking and confirm the calendar invite and email.
- [ ] Run Lighthouse (mobile and desktop) and the Google Rich Results test on the live URL.
- [ ] Update `frame-ancestors` in `securityPolicy()` if the site should no longer be embeddable in ChatGPT.
- [ ] Add a `security.txt` and connect uptime monitoring.

---

## Contributing

**Workflow**

1. Branch from `main`: `feat/…`, `fix/…`, or `chore/…`.
2. Keep changes small and focused, and match the style of the surrounding code.
3. Run `pnpm check && pnpm build` locally. Every PR must pass both.
4. Open a PR with a summary, screenshots for UI changes (desktop and mobile), and test notes.

**Conventions**

- Content belongs in `app/lib/content.ts`, not in components.
- Use client components only when interaction requires them.
- Put new colors and motion values in the tokens, then reference them.
- New dark sections need `data-nav-tone="dark"`.
- Every interactive element needs a keyboard path and a visible focus state.
- Don't add third-party scripts, trackers, or remote fonts without updating the CSP and this README.
- Don't add fabricated testimonials, metrics, logos, or ratings. Mockups must be labeled illustrative.

**Commit style:** imperative mood, for example `feat(nav): add adaptive glass tone`.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `pnpm: command not found` | `corepack enable` or `npm i -g pnpm@11.25.0` |
| `pnpm install:ci` fails on Windows or macOS | Use `pnpm install --frozen-lockfile`. The CI installer needs Linux `flock` and GNU `timeout` |
| Booking returns 503 locally | The D1 binding or table is missing. Restart `pnpm dev` so Miniflare creates local state, and apply the migration |
| Calendar says "temporarily unavailable" | The upstream availability service is unreachable from your network |
| Lint reports files in `.sites-runtime/` | Update to the current `eslint.config.mjs`, which ignores generated output |

---

## Further documentation

| Document | Contents |
| --- | --- |
| [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) | Delivered features, content gaps, validation limits |
| [`docs/UI-UX-REVIEW.md`](docs/UI-UX-REVIEW.md) | Original audit and redesign rationale |
| [`docs/SEARCH-AND-MOTION.md`](docs/SEARCH-AND-MOTION.md) | Agent directory search and motion design |
| [`docs/TOOL-LOGOS.md`](docs/TOOL-LOGOS.md) | Tool-logo sourcing and licensing |
| [`docs/SMS-REGISTRATION-HANDOFF.md`](docs/SMS-REGISTRATION-HANDOFF.md) | SMS program registration notes |
| [`EXPORT-README.md`](EXPORT-README.md) | Notes from the original source export. `EXPORT-MANIFEST.json` checksums describe that export, not later changes |

---

## Credits

<table>
<tr>
<td>

**Built by Blair**<br/>
Lead Website Developer, Nuvato AI

Architecture, front-end engineering, the glass navigation system, booking integration, security hardening, and production readiness.

</td>
</tr>
</table>

Nuvato AI is part of the **[Isak Global Ventures](https://isakglobalventures.com/)** family.

Third-party tool logos belong to their owners and do not imply a partnership. Icon licenses are in [`docs/licenses/`](docs/licenses/).

© Nuvato AI. All rights reserved. Proprietary and confidential. Not for redistribution.
