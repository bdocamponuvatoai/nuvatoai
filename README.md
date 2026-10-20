<div align="center">

<img src="https://ik.imagekit.io/isakglobalventures/nuvato/brand/nuvato-logo.png?tr=orig-true" alt="Nuvato AI" width="260" />

# Nuvato AI — Marketing Site

**Websites · AI Agents · Automation · Documentation · Enterprise Platforms**

Next.js 16 App Router · React 19 · TypeScript · Vercel

_Built by **Blair** — Lead Website Developer, Nuvato AI_

</div>

---

## Overview

The public website for **Nuvato AI**, part of the Isak Global Ventures family. It presents five services, a searchable catalog of twelve AI agents, the delivery process, security posture, and FAQs, and ends with a four-step consultation flow that books a live appointment.

- **Server-rendered.** Every section, service panel, agent, and FAQ answer is in the initial HTML. Only interactive pieces (header, service tabs, agent catalog, consultation form, booking dialog) hydrate on the client.
- **Live booking.** Visitors pick a slot from the real Nuvato calendar. Requests are validated, rate-limited, and forwarded to the existing booking service. Nothing is booked until the visitor confirms.
- **Strict security.** Per-request CSP nonce, HSTS, frame denial, and a locked-down permissions policy.
- **Legal pages.** Privacy Policy, Terms & Disclaimer, and SMS Terms at `/privacy/`, `/terms/`, and `/sms-terms/`.

## Tech stack

| Layer           | Choice                                                                         |
| --------------- | ------------------------------------------------------------------------------ |
| Framework       | Next.js 16 App Router (Turbopack), React 19, TypeScript (strict)               |
| Styling         | Hand-authored CSS with design tokens (`app/styles/`); fonts via `next/font`    |
| Icons           | `lucide-react`                                                                 |
| Validation      | `zod` on the booking API                                                       |
| Rate limiting   | Upstash Redis REST (Vercel Marketplace); in-memory fallback in development     |
| Hosting         | Vercel                                                                         |
| Quality         | ESLint (`next/core-web-vitals`), Prettier, Vitest, GitHub Actions              |
| Package manager | pnpm 11.25.0 (pinned via `packageManager`), Node ≥ 22.13                       |

## Quick start

```sh
corepack enable            # provides the pinned pnpm
pnpm install
cp .env.example .env.local # optional for local development
pnpm dev                   # http://localhost:3000
```

Booking works locally without Redis: the rate limiter falls back to an in-memory store outside production. Availability and bookings call the live `nuvato.ai` booking service, so **only confirm a booking if you intend to create a real appointment**.

## Scripts

| Command                          | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `pnpm dev`                       | Development server                                        |
| `pnpm build` / `pnpm start`      | Production build and server                               |
| `pnpm lint`                      | ESLint                                                    |
| `pnpm typecheck`                 | TypeScript                                                |
| `pnpm test` / `pnpm test:watch`  | Vitest suite (rendering, SEO, legal, security, booking)   |
| `pnpm format` / `format:check`   | Prettier                                                  |
| `pnpm check`                     | Typecheck, lint, format check, and tests — what CI runs   |
| `pnpm test:assets`               | Check that every registered image exists in ImageKit (network) |

## Project structure

```
app/
  layout.tsx            Root layout: fonts, metadata, dynamic rendering for CSP nonces
  page.tsx              Homepage + JSON-LD
  privacy/ terms/ sms-terms/   Legal pages
  api/availability/     GET  — read-only bridge to the booking service
  api/bookings/         POST — validated, rate-limited booking
  robots.ts sitemap.ts manifest.ts   Metadata routes
  favicon.ico icon1.png icon2.png apple-icon.png   App icons (served from the site's domain)
  error.tsx global-error.tsx not-found.tsx
  fonts/                Self-hosted woff2 files (loaded with next/font/local)
  styles/               Global CSS, one file per area
components/
  home/                 Homepage sections; *Section.tsx are server components
  legal/LegalPage.tsx   Legal page layout, header, and footer
  BrandLogo.tsx ToolConnections.tsx
lib/
  content.ts            Services, agents, process, FAQs
  legal-content.ts      Legal copy and publication dates
  site-config.ts        Fixed business facts
  env.ts                Deployment settings from environment variables
  seo.ts                Metadata helpers and structured data
  security.ts           CSP and security headers
  booking.ts            Booking handler (validation, same-origin, upstream)
  rate-limit.ts         Hashed, windowed booking counters
  assets.ts             Registry of ImageKit images and their URLs
  imagekit-loader.ts    next/image loader
proxy.ts                Per-request CSP nonce
tests/                  Vitest suites
```

### Homepage architecture

`components/home/HomePage.tsx` composes the page. Static sections are server components. Shared client state (the open service tab, a service or agent picked elsewhere on the page, and the open booking) lives in `HomeState.tsx` and is read with `useHomeState()`. For example, "Deploy" in the agent catalog pre-fills the consultation form, and "What we do" in a server-rendered section opens a service tab through the small `ServiceLink` client component.

## Configuration

Deployment settings are environment variables (see [`.env.example`](.env.example)), read in `lib/env.ts`:

| Variable                                  | Purpose                                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `SITE_URL`                                | Canonical origin for canonical URLs, Open Graph, sitemap, JSON-LD. Defaults to the Vercel production domain. |
| `SITE_INDEXABLE`                          | `true` lets search engines index the site. Ignored on preview deployments, which are always `noindex`.      |
| `BOOKING_SERVICE_ORIGIN`                  | Booking upstream. Defaults to `https://nuvato.ai`.                                                          |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN`    | Upstash Redis for booking rate limits. **Required in production**: without them, booking returns 503.      |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`       | Optional. ImageKit folder that serves images. Defaults to `https://ik.imagekit.io/isakglobalventures/nuvato`. |

`SITE_URL` and `SITE_INDEXABLE` are read at build time for `robots.txt`, the sitemap, and the `X-Robots-Tag` header, so redeploy after changing them.

Fixed business facts (address, legal contact, login URL) live in `lib/site-config.ts`.

### Images (ImageKit)

ImageKit is the single source of truth for site imagery; the repo has no `public/` folder. Images render with `next/image` and a custom loader (`lib/imagekit-loader.ts`) that requests the width each screen needs, as WebP or AVIF where supported, never upscaled. SVG tool logos, the social card, and the structured-data logo are served exactly as uploaded (`tr=orig-true`), because ImageKit's automatic conversion would rasterize SVGs and drop PNG transparency. The CSP allows images from the ImageKit folder only.

| Folder in ImageKit (`nuvato/`) | Contents                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| `brand/`                       | Brand mark, logo, social card, IGV logo, and master artwork |
| `tools/`                       | Tool logos, named after the tool in lowercase (`hubspot.svg`) |

To add an image: upload it to the right folder in the ImageKit dashboard (keep the exact file name; turn off "unique file name"), add its path to `images` in `lib/assets.ts`, and render it with `<Image src={images.yourImage} … />`. `pnpm test:assets`, which CI runs, fails if a registered image is missing from ImageKit. Favicons, app icons, and fonts stay in `app/` because browsers fetch them from the site's own domain.

## Security

- **CSP:** `proxy.ts` generates a nonce per request; Next.js applies it to its scripts. `script-src` allows only `'self'` and the nonce (`'unsafe-eval'` in development only, for React's debugging). `frame-ancestors 'none'`.
- **Static headers** (`next.config.ts`): HSTS, `nosniff`, `X-Frame-Options: DENY`, COOP, Referrer-Policy, Permissions-Policy; `X-Robots-Tag: noindex` until `SITE_INDEXABLE` is enabled.
- **Booking API:** same-origin check (proxy-aware), JSON-only, streamed 12 KB body limit, zod validation, honeypot, and rate limits of 5 attempts per email and 10 per IP per 15 minutes. Counter keys are SHA-256 hashes; no raw email or IP is stored. The limiter fails closed. Writes are never retried, and an uncertain upstream result tells the visitor to check their email rather than claiming success.
- No cookies, analytics, or third-party scripts.

## Navigation system

`components/home/SiteHeader.tsx` and `app/styles/navigation.css`

| Feature               | Implementation                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frosted glass**     | `backdrop-filter` on the bar's `::before` layer, so the services menu can blur the page itself.                                                      |
| **Adaptive tone**     | Sections marked `data-nav-tone="dark"` switch the bar to its dark tone while it sits over them.                                                      |
| **Sliding highlight** | One pill follows the hovered or focused item, positioned imperatively so pointer movement never re-renders React.                                    |
| **Scroll-spy**        | `aria-current="location"` marks the section in view; a hairline shows reading progress.                                                              |
| **Services menu**     | Disclosure panel: ArrowDown to enter, Escape to close and return focus, closes on outside click or focus, `inert` while closed.                      |
| **Mobile sheet**      | Native `<dialog>` (`showModal`) for a built-in focus trap. Focus moves to the destination heading after navigation.                                  |
| **Fallbacks**         | Opaque surfaces without `backdrop-filter`; respects reduced transparency, increased contrast, and reduced motion.                                    |

To add a dark section, put `data-nav-tone="dark"` on its outermost element.

## Legal and compliance

Legal copy lives in `lib/legal-content.ts`. Publication dates and version are in `legalMeta`; update them whenever the text changes. The SMS Terms follow the RingCentral / TCR carrier registration requirements and must stay in sync with the registered campaign (see [`docs/SMS-REGISTRATION-HANDOFF.md`](docs/SMS-REGISTRATION-HANDOFF.md)). The test suite asserts every carrier-required phrase.

| Item                                             | Value                                                    |
| ------------------------------------------------ | -------------------------------------------------------- |
| Business                                         | Nuvato AI, Chicago, Illinois, United States              |
| Contact for legal, privacy, accessibility, SMS   | `legal@nuvato.ai`                                        |
| Governing law and venue                          | Illinois; state or federal courts of Cook County         |
| Liability cap for website use                    | US $100 (paid services are governed by their contracts)  |
| Inquiry and booking data retention               | 2 years after last contact                               |
| SMS consent and opt-out records                  | Up to 4 years after messaging ends                       |

**Not reviewed by a lawyer.** Have counsel review the text, especially before activating SMS or expanding outside the U.S.

## Deployment (Vercel)

1. Import the repository in Vercel. `vercel.json` sets the framework, `pnpm install --frozen-lockfile`, and `pnpm build`.
2. Connect **Upstash Redis** from the Vercel Marketplace (Storage → Upstash). It adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Set `SITE_URL` for Production. Leave `SITE_INDEXABLE` unset until launch.
4. Deploy. CI (`.github/workflows/ci.yml`) runs `pnpm check` and `pnpm build` on every push and pull request.

## Launch checklist

- [ ] Set `SITE_URL=https://www.nuvato.ai` and `SITE_INDEXABLE=true` for Production, redeploy, then confirm `/robots.txt` allows crawling and pages no longer send `X-Robots-Tag`.
- [ ] Connect Upstash Redis, then place one authorized end-to-end test booking and confirm the calendar invite and email.
- [ ] If this site replaces `nuvato.ai`, point `BOOKING_SERVICE_ORIGIN` at the booking service's own host so the API doesn't proxy to itself.
- [ ] Create the `legal@nuvato.ai` mailbox (or a forward) and confirm someone monitors it. Privacy requests have legal deadlines.
- [ ] Set up the 2-year retention schedule in the booking service and CRM.
- [ ] Have the client confirm the agent descriptions marked `review: true` in `lib/content.ts`.
- [ ] SMS registration: once live on `www.nuvato.ai`, confirm `/privacy/` and `/sms-terms/` load, then submit them to RingCentral.
- [ ] Run Lighthouse (mobile and desktop) and the Google Rich Results test on the live URL.
- [ ] Add a `security.txt` and uptime monitoring.
- [ ] Optional: attorney review of the Privacy Policy and Terms.

## Further documentation

| Document                                                             | Contents                                          |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md)     | Delivered features and content gaps (historical)  |
| [`docs/UI-UX-REVIEW.md`](docs/UI-UX-REVIEW.md)                       | Original audit and redesign rationale             |
| [`docs/SEARCH-AND-MOTION.md`](docs/SEARCH-AND-MOTION.md)             | Agent directory search and motion design          |
| [`docs/TOOL-LOGOS.md`](docs/TOOL-LOGOS.md)                           | Tool-logo sourcing and licensing                  |
| [`docs/SMS-REGISTRATION-HANDOFF.md`](docs/SMS-REGISTRATION-HANDOFF.md) | SMS program registration notes                  |

Documents in `docs/` predate the move from Vinext/Cloudflare to Next.js on Vercel; file paths in them may refer to the old layout.

## Credits

**Built by Blair**, Lead Website Developer, Nuvato AI.

Nuvato AI is part of the **[Isak Global Ventures](https://isakglobalventures.com/)** family. Third-party tool logos belong to their owners and do not imply a partnership. Icon licenses are in [`docs/licenses/`](docs/licenses/).

© Nuvato AI. All rights reserved. Proprietary and confidential.
