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
- **Live booking:** a Calendly scheduler inside the site's own booking dialog, pre-filled with the visitor's answers. Nothing is booked until the visitor confirms a time.
- **Secure by default:** per-request CSP nonce, strict headers, and no server-side secrets.
- **Privacy-first analytics:** Google Analytics through Google Tag Manager, loaded only on production and only after a visitor accepts in the consent banner.
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

No environment variables are needed.

> The booking dialog shows the **live** Calendly calendar. Browsing it is safe; **confirming a time creates a real appointment.**

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
  blog/                 Blog index and posts (/blog/<slug>/)
  robots.ts sitemap.ts manifest.ts   Metadata routes
  favicon.ico icon1.png icon2.png apple-icon.png   App icons
  error.tsx global-error.tsx not-found.tsx
  fonts/                Self-hosted fonts (next/font/local)
  styles/               Global CSS, one file per area
components/
  home/                 Homepage sections and their interactive parts
  legal/                Legal page layout
  blog/                 Blog index, article layout, and header
  analytics/            Consent banner and the consent-gated Google tag
content/blog/           Approved blog posts (MDX) and their JSON-LD, stored as delivered
lib/                    Content, configuration, Calendly, ImageKit, analytics, SEO, blog, and security (no React)
mdx-components.tsx      MDX element mapping (required by @next/mdx)
proxy.ts                Per-request CSP nonce
tests/                  Vitest suites
docs/                   Architecture and project documentation
```

## Configuration

Environment variables are read in `lib/env.ts` and documented in [`.env.example`](.env.example). None hold secrets. Set them in Vercel → Project Settings → Environment Variables, with type **Config**.

| Variable                            | Required    | Purpose                                                                                              |
| ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| `SITE_URL`                          | No          | Canonical origin for links, the sitemap, and social cards. Defaults to `https://nuvato.ai` on Vercel. |
| `SITE_INDEXABLE`                    | No          | `false` closes production to search engines. Previews are always `noindex`.                          |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | No          | Overrides the ImageKit folder (defaults to `https://ik.imagekit.io/isakglobalventures/nuvato`).      |
| `ENABLE_ANALYTICS`                  | No          | `true` turns analytics on outside production, for testing. Production deployments always have it on. |

`SITE_URL` and `SITE_INDEXABLE` are read at build time, so redeploy after changing them.

The Calendly event link, meeting name, and duration are in `siteConfig.consultation` (`lib/site-config.ts`). Availability, reminders, and booking questions are managed in the Calendly dashboard.

The Google Tag Manager container ID is in `siteConfig.analytics`. **Before adding any tag to the container,** read [Add or change an analytics tag](CONTRIBUTING.md#add-or-change-an-analytics-tag): tags from new vendors are blocked by the CSP until the code allows them, and may need a Privacy Policy update.

## Deployment

Hosted on Vercel. `vercel.json` sets the install command (`pnpm install --frozen-lockfile`) and build command.

- **Pull requests** get a preview deployment, which search engines never index.
- **Merging to `main`** deploys to production.
- **Only `nuvato.ai` is indexed.** Production allows every crawler, AI crawlers included, and every other host (such as the deployment's own `*.vercel.app` address) sends `X-Robots-Tag: noindex`. Canonical links, Open Graph, structured data, and the sitemap always name `https://nuvato.ai`.

After a production deploy, both of these should confirm it is open to search:

```sh
curl -sI https://nuvato.ai/blog/what-is-an-sop/ | grep -i x-robots-tag   # prints nothing
curl -s https://nuvato.ai/robots.txt   # Allow: /, and Sitemap: https://nuvato.ai/sitemap.xml
```

## Launch checklist

- [ ] Place one test booking through the site, confirm the "You're booked" screen, the confirmation email, and the calendar invite, then cancel it in Calendly.
- [ ] In Calendly, confirm the Discovery call's questions are, in order, Company, Services of interest, and Project details, with no phone number or text reminders.
- [ ] Add `nuvato.ai` to Google Search Console and Bing Webmaster Tools, submit `https://nuvato.ai/sitemap.xml` in both, and request indexing for `/blog/` and each post.
- [ ] Confirm someone monitors `legal@nuvato.ai`. Privacy requests have legal deadlines.
- [ ] Set up the 2-year retention schedule in Calendly and the CRM.
- [ ] Have the client approve the agent descriptions marked `review: true` in `lib/content.ts`.
- [ ] SMS registration: once live on `nuvato.ai`, confirm `/privacy/` and `/sms-terms/` load, then submit them to RingCentral.
- [ ] In Google Analytics (Admin → Data collection and Data retention): keep Google signals and ads personalization **off**, and set event data retention to 14 months or less. The Privacy Policy depends on both.
- [ ] Accept analytics on the live site and confirm visits appear in the GA4 Realtime report; then use Cookie settings to decline and confirm they stop.
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
