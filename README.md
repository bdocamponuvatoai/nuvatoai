<div align="center">

<img src="https://ik.imagekit.io/isakglobalventures/nuvato/brand/nuvato-logo.png?tr=orig-true" alt="Nuvato AI" width="260" />

# Nuvato AI — Marketing Site

**Websites · AI Agents · Automation · Documentation · Enterprise Platforms**

Next.js 16 App Router · React 19 · TypeScript · Vercel · ImageKit

_Built by **Blair** — Lead Website Developer, Nuvato AI_

</div>

---

The public website for **Nuvato AI**, part of the Isak Global Ventures family. It presents five services, a searchable catalog of twelve AI agents, the delivery process, security posture, and FAQs, and ends with a four-step consultation flow that books a live appointment.

- **Server-rendered:** all content is in the initial HTML; only interactive parts hydrate.
- **Live booking:** validated, rate-limited, and forwarded to the existing booking service. Nothing is booked until the visitor confirms.
- **Secure by default:** per-request CSP nonce, strict headers, no cookies or third-party scripts.
- **Legal pages:** Privacy Policy, Terms & Disclaimer, and SMS Terms.

## Documentation

| Read this                                            | To learn                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)         | How the site works: rendering, booking flow, security model, images, styles, tests |
| [CONTRIBUTING.md](CONTRIBUTING.md)                   | How to make changes: workflow, conventions, and step-by-step common tasks |
| [SECURITY.md](SECURITY.md)                           | Reporting vulnerabilities, handling secrets, repository settings      |
| [docs/SMS-REGISTRATION-HANDOFF.md](docs/SMS-REGISTRATION-HANDOFF.md) | SMS program (RingCentral / TCR) registration requirements |
| [docs/TOOL-LOGOS.md](docs/TOOL-LOGOS.md)             | Where the tool logos come from and their licenses                     |
| [docs/archive/](docs/archive/)                       | Historical notes from the previous platform                           |

## Quick start

Requires **Node.js 24** (`.nvmrc`) and **pnpm 11.25.0**, which Corepack provides.

```sh
corepack enable
pnpm install
pnpm dev        # http://localhost:3000
```

No environment variables are needed locally. Booking falls back to an in-memory rate limiter in development.

> Availability and bookings use the **live** `nuvato.ai` booking service. Browsing the calendar is safe; **confirming a booking creates a real appointment.**

## Scripts

| Command                         | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `pnpm dev`                      | Development server                                             |
| `pnpm build` / `pnpm start`     | Production build and server                                    |
| `pnpm check`                    | Typecheck, lint, format check, and unit tests                  |
| `pnpm lint` / `pnpm typecheck`  | ESLint (zero warnings) / TypeScript                            |
| `pnpm test` / `pnpm test:watch` | Vitest unit tests                                              |
| `pnpm test:assets`              | Check that every registered image exists in ImageKit (network) |
| `pnpm format`                   | Format with Prettier                                           |

CI (`.github/workflows/ci.yml`) runs `pnpm audit`, `pnpm check`, `pnpm test:assets`, and `pnpm build` on every pull request and on `main`.

## Project structure

```
app/                    Routes (App Router)
  layout.tsx            Root layout: fonts, metadata, per-request rendering for CSP nonces
  page.tsx              Homepage + JSON-LD
  privacy/ terms/ sms-terms/   Legal pages
  api/availability/     GET  — read-only bridge to the booking service
  api/bookings/         POST — validated, rate-limited booking
  robots.ts sitemap.ts manifest.ts   Metadata routes
  favicon.ico icon1.png icon2.png apple-icon.png   App icons
  error.tsx global-error.tsx not-found.tsx
  fonts/                Self-hosted fonts (next/font/local)
  styles/               Global CSS, one file per area
components/
  home/                 Homepage sections and their interactive parts
  legal/                Legal page layout
lib/                    Content, configuration, and server logic (no React)
proxy.ts                Per-request CSP nonce
tests/                  Vitest suites
docs/                   Architecture and project documentation
```

## Configuration

Environment variables are read in `lib/env.ts` and documented in [`.env.example`](.env.example). Set them in Vercel → Project Settings → Environment Variables.

| Variable                               | Required             | Purpose                                                                                 |
| -------------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | **Production**       | Upstash Redis for booking rate limits. Added by the Vercel Marketplace integration. Without them, booking returns 503. |
| `SITE_URL`                             | Recommended          | Canonical origin for links, the sitemap, and social cards. Defaults to the Vercel production domain. |
| `SITE_INDEXABLE`                       | At launch            | `true` allows search indexing. Ignored on preview deployments, which are always `noindex`. |
| `BOOKING_SERVICE_ORIGIN`               | Only if `nuvato.ai` moves | Booking upstream. Defaults to `https://nuvato.ai`.                                  |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`    | No                   | Overrides the ImageKit folder (defaults to `https://ik.imagekit.io/isakglobalventures/nuvato`). |

`SITE_URL` and `SITE_INDEXABLE` are read at build time, so redeploy after changing them. Use type **Secret** in Vercel for the Redis token and **Config** for the rest.

## Deployment

Hosted on Vercel. `vercel.json` sets the install command (`pnpm install --frozen-lockfile`) and build command.

- **Pull requests** get a preview deployment, which search engines never index.
- **Merging to `main`** deploys to production.

## Launch checklist

- [ ] Connect **Upstash Redis** in Vercel, then place one authorized test booking and confirm the calendar invite and email.
- [ ] Set `SITE_URL=https://www.nuvato.ai` and `SITE_INDEXABLE=true` for Production, redeploy, and confirm `/robots.txt` allows crawling.
- [ ] If this site replaces `nuvato.ai`, point `BOOKING_SERVICE_ORIGIN` at the booking service's own host so the API doesn't call itself.
- [ ] Confirm someone monitors `legal@nuvato.ai`. Privacy requests have legal deadlines.
- [ ] Set up the 2-year retention schedule in the booking service and CRM.
- [ ] Have the client approve the agent descriptions marked `review: true` in `lib/content.ts`.
- [ ] SMS registration: once live on `www.nuvato.ai`, confirm `/privacy/` and `/sms-terms/` load, then submit them to RingCentral.
- [ ] Run Lighthouse and the Google Rich Results test on the live URL.
- [ ] Apply the repository settings in [SECURITY.md](SECURITY.md#repository-settings-checklist), and add uptime monitoring.
- [ ] Optional: attorney review of the Privacy Policy and Terms.

## Legal and compliance

Legal copy lives in `lib/legal-content.ts`; see [CONTRIBUTING.md](CONTRIBUTING.md#change-legal-text) before editing it.

| Item                                           | Value                                                   |
| ---------------------------------------------- | ------------------------------------------------------- |
| Business                                       | Nuvato AI, Chicago, Illinois, United States             |
| Contact for legal, privacy, accessibility, SMS | `legal@nuvato.ai`                                       |
| Governing law and venue                        | Illinois; state or federal courts of Cook County        |
| Liability cap for website use                  | US $100 (paid services are governed by their contracts) |
| Inquiry and booking data retention             | 2 years after last contact                              |
| SMS consent and opt-out records                | Up to 4 years after messaging ends                      |

**Not reviewed by a lawyer.** Have counsel review the text, especially before activating SMS or expanding outside the U.S.

## Credits

**Built by Blair**, Lead Website Developer, Nuvato AI.

Nuvato AI is part of the **[Isak Global Ventures](https://isakglobalventures.com/)** family. Third-party tool logos belong to their owners and do not imply a partnership; see [docs/TOOL-LOGOS.md](docs/TOOL-LOGOS.md). Icon licenses are in [`docs/licenses/`](docs/licenses/).

© Nuvato AI. All rights reserved.
