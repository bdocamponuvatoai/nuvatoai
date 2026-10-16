# Nuvato AI — Complete Codebase

Exported 16 October 2026 from source revision 2aae3f3c7155b3d283638d55f7d10e5ccfe54f2c.

This archive includes the latest navigation redesign, transparent Nuvato brand assets, fourteen tool logos, agent scrollytelling, the editorial agent directory, booking flow, privacy and terms pages, and all associated source, styles, local fonts, configuration, migrations, tests, and documentation.

## Local setup

Use Node.js 22.13 or newer and pnpm 11.25.0 (the version pinned in package.json). Extract the ZIP and open the nuvato-ai directory.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The portable development command uses http://localhost:5173.

```sh
pnpm typecheck
pnpm verify
pnpm build
```

These commands are provided by the project. The original source passed its production build and 274 automated checks before export. A fresh dependency install on your machine has not been tested.

## Runtime and deployment

This is a Next.js App Router project running through Vinext and Vite for Cloudflare Workers. It includes the Worker entrypoint and Sites build integration. It is not a static HTML-only export.

The booking rate limiter requires a D1 database bound as DB. Apply the SQL migration in drizzle/0000_dashing_wasp.sql to the database used by your environment. Booking fails closed if its rate-limit storage is unavailable. Availability and explicitly confirmed bookings use the existing nuvato.ai API endpoints; the verification script mocks booking requests.

The included .openai/hosting.json retains the identity and binding declaration for the existing Site. A separate deployment needs its own authorized hosting setup and database. No deployment credentials, environment secrets, database contents, or Git history are included.

The exported source retains private-review noindex settings, current canonical URLs, and legal drafts. These have not been changed by packaging. See docs/IMPLEMENTATION-STATUS.md for the complete implementation notes.

## Main files

- app/components/NuvatoSite.tsx — overall landing page and inquiry flow
- app/components/SiteHeader.tsx and app/navigation.css — navigation and mobile menu
- app/components/BrandLogo.tsx — shared logo lockup
- app/components/AgentsSection.tsx and app/agents.css — agent storytelling
- app/components/AgentDirectory.tsx and app/directory.css — searchable agent directory
- app/components/ToolConnections.tsx and app/tools.css — tool-logo connections
- app/components/Booking.tsx and app/api/ — booking interface and endpoints
- app/lib/ — content, legal text, metadata, and security
- public/ — logos, fonts, tool icons, social images, and favicons
- db/ and drizzle/ — database schema and migration
- build/ and scripts/ — Worker integration, build, install, and verification utilities

## Archive contents

All tracked project source files are included without modification, apart from the generated TypeScript incremental cache, which is omitted. The standard next-env.d.ts declarations are included when available.

Excluded: installed dependencies, generated build output, build caches, local runtime state, Git history, environment files, and credentials. These are not needed in a source handoff. The lockfile is included so dependencies can be installed.

EXPORT-MANIFEST.json records the source revision and SHA-256 checksum of every included project file. Original README.md and project documentation are preserved.
