# Contributing

How to make changes to the Nuvato AI site. Read the [README](README.md) for setup and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the site works.

## Setup

Requirements: **Node.js 24** (see `.nvmrc`) and **pnpm 11.25.0**, which Corepack installs from `packageManager` in `package.json`.

```sh
nvm use                # or install Node 24 another way
corepack enable        # provides the pinned pnpm
pnpm install
pnpm dev               # http://localhost:3000
```

No environment variables are needed for local development. See [`.env.example`](.env.example) for what each one does.

> The booking dialog shows the **live** Calendly calendar. You can browse it safely, but **confirming a time creates a real appointment.** Cancel any test booking from the Calendly confirmation email.

## Workflow

1. **Branch from `main`.** Never commit to `main` directly. Name branches by type: `feat/agent-search`, `fix/booking-timezone`, `docs/architecture`, `chore/upgrade-next`.
2. **Make focused changes.** One concern per pull request is easier to review and to revert.
3. **Check locally** before pushing:
   ```sh
   pnpm check   # typecheck, lint, format check, unit tests
   pnpm build   # production build
   ```
   Run `pnpm format` to fix formatting.
4. **Open a pull request** into `main` and fill in the template. CI must pass, and the pull request needs a review from a code owner.
5. **Check the Vercel preview** linked on the pull request, especially for visual changes.
6. **Merge.** Merging to `main` deploys to production.

### Commit messages

Follow the existing history: a short imperative subject (≤ 72 characters), a blank line, then a body explaining **why**, with bullets for separate changes.

```
Fix booking times shown in the wrong time zone

The calendar formatted slots in the browser's zone but labelled them
in the business zone. Format and label both in the selected zone.
```

Never commit secrets, `.env` files, or customer data. See [SECURITY.md](SECURITY.md).

## Code conventions

- **Server components by default.** Add `'use client'` only when a component needs state, effects, or event handlers. Keep client components small: when a server-rendered section needs one interactive element, extract just that element (see `ServiceLink`).
- **Content belongs in `lib/`,** not in components: copy in `lib/content.ts`, legal text in `lib/legal-content.ts`, business facts in `lib/site-config.ts`.
- **Imports** use the `@/` alias (`@/lib/content`) across folders, and relative paths (`./HomeState`) within a folder.
- **Styles** go in the matching file in `app/styles/` (see the table in [ARCHITECTURE.md](docs/ARCHITECTURE.md#styling)). Use the design tokens in `globals.css` instead of new hard-coded colors. `polish.css` must stay last in the import order.
- **Accessibility is required:** semantic HTML, keyboard support, visible focus, `alt` text (empty for decorative images), and `prefers-reduced-motion` support for any animation.
- **No inline `<script>`.** The CSP blocks it. JSON-LD (`type="application/ld+json"`) is the only exception, because browsers don't execute it.
- **Keep all content in the HTML.** Filtering and tabs toggle `hidden`; they never remove content, so search engines see everything.

Formatting is automatic (Prettier: single quotes, 100-character lines). ESLint uses `next/core-web-vitals` and `next/typescript` and must pass with zero warnings.

## Common tasks

### Edit copy

Change the text in `lib/content.ts`. Structured data (`lib/seo.ts`) is generated from the same data, so it updates automatically.

### Add or remove an agent, service, or FAQ

Some counts appear in tests and in written copy. Update all of them together:

| Change            | Also update                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Agent             | Its `category` must match a team in `TEAMS` (`components/home/AgentDirectory.tsx`). Counts in `tests/home.test.tsx` and `tests/seo.test.ts`. Copy: "12 ready-made agents" (`AgentsSection.tsx`), "browse all twelve" (`AgentDirectory.tsx`). |
| Service           | Its icon in `components/home/service-icons.ts` (same order) and summary in `SiteHeader.tsx`. Counts in both test files and the hidden-panel count in `tests/home.test.tsx`. Copy: "Five services" (`Hero.tsx`, `ServicesSection.tsx`, `SiteHeader.tsx`). |
| FAQ               | The count in `tests/home.test.tsx`.                                                                           |
| Tool              | Upload `tools/<name>.svg` to ImageKit (see below) and add the name to `toolNames`.                            |

Agents with `review: true` show "Description for client review" and are left out of structured data until approved.

### Add an image

1. Upload it in the ImageKit dashboard to `nuvato/brand/` or `nuvato/tools/`. Keep the exact file name and turn **off** "Use unique file name".
2. Register its path in `images` in `lib/assets.ts`.
3. Render it with `<Image src={images.yourImage} width={…} height={…} alt="…" />` from `next/image`.
4. Run `pnpm test:assets` to confirm ImageKit serves it.

Never add images to the repository. Only app icons (`app/favicon.ico`, `app/icon*.png`, `app/apple-icon.png`) live here.

### Change the booking setup

Bookings are handled by Calendly (see [ARCHITECTURE.md](docs/ARCHITECTURE.md#booking-flow)).

- **Hours, buffers, reminders, and notice periods** are set in the Calendly dashboard. No code change is needed.
- **The event link, name, or duration** are in `siteConfig.consultation` (`lib/site-config.ts`). Update them if the Calendly event type changes. The link must stay on `https://calendly.com`.
- **Booking questions** must stay in this order, because the site pre-fills them by position (`a1`–`a3` in `lib/calendly.ts`): 1. Company, 2. Services of interest, 3. Project details. If you add or reorder questions, update `calendlyEmbedUrl()` and `tests/calendly.test.ts`.
- **Never add a phone-number question or text reminders.** The form, the booking dialog, and the Privacy Policy all state that booking doesn't collect a phone number or enroll anyone in SMS, and the SMS carrier registration depends on it.

### Add a page

1. Create `app/<route>/page.tsx` and export `metadata` using `pageMetadata()` from `lib/seo.ts`.
2. Add the path, with a trailing slash, to `sitePaths` in `lib/seo.ts` so it appears in the sitemap.
3. Use `next/link` for links to it.

### Change legal text

1. Edit `lib/legal-content.ts`.
2. Update `updated` and `version` in `legalMeta` (or a document's own `updated`).
3. **SMS Terms:** keep every carrier-required statement. `tests/legal.test.tsx` lists them, and changing them can break the RingCentral / TCR registration. See [docs/SMS-REGISTRATION-HANDOFF.md](docs/SMS-REGISTRATION-HANDOFF.md).
4. Material changes should be reviewed by whoever owns legal for Nuvato AI.

### Add an environment variable

1. Read it in `lib/env.ts`, with a safe default.
2. Document it in `.env.example` and the README's configuration table.
3. Add it in Vercel (Project Settings → Environment Variables). Use type **Secret** for credentials and **Config** for everything else.
4. Only use the `NEXT_PUBLIC_` prefix for values that are safe for anyone to see. They are embedded in browser JavaScript.

### Add a third-party service or script

This affects security and privacy, so plan it in the pull request description:

- Allow its domain in the CSP (`lib/security.ts`) for exactly the directive it needs.
- Update the Privacy Policy if it receives visitor data, and add a consent mechanism if it sets non-essential cookies.
- Keep any credentials on the server (a route handler or server component). Never expose them through `NEXT_PUBLIC_` variables.

## Dependencies

- Use **pnpm** only; commit `pnpm-lock.yaml`. Versions are pinned exactly.
- `pnpm-workspace.yaml` blocks releases younger than **7 days** and only lets allowlisted packages run install scripts. If an install fails because a version is too new, wait or choose an older patch release.
- `overrides` in `pnpm-workspace.yaml` patch vulnerable sub-dependencies. Remove each one once `pnpm audit` passes without it.
- Dependabot opens weekly update pull requests. Review the changelog for anything beyond a patch release, and read the matching guide in `node_modules/next/dist/docs/` before upgrading Next.js.
- Run `pnpm audit` after changing dependencies. CI fails on any high or critical vulnerability.

## Getting help

Open an issue or ask the code owner listed in `.github/CODEOWNERS`. For security problems, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
