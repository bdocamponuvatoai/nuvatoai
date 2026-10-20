# Tool logo provenance

The fourteen tool names come from the existing Nuvato content inventory; their marks identify integration examples, not customers or certified partners. The visible site states that availability and access are scoped and that no partnership is implied.

The logos are stored in ImageKit at `nuvato/tools/<tool>.svg` (see `lib/assets.ts`) and served from Nuvato's own ImageKit folder. No third-party logo CDN or tracking request is made by the browser.

`tool-logo-sources.json` records each source, collection key, license, and SHA-256 checksum. Ten SVGs are from the gilbarbara/logos collection via Iconify (CC0-1.0). HubSpot, QuickBooks, and DocuSign symbols are from Simple Icons via Iconify (CC0-1.0); their `currentColor` is resolved to a fixed color for external SVG image rendering. Google Sheets is from homarr-labs/dashboard-icons (Apache-2.0 repository). Repository licensing does not grant trademark rights; marks remain owned by their respective companies.

Sources:

- https://github.com/gilbarbara/logos
- https://github.com/simple-icons/simple-icons
- https://github.com/iconify/icon-sets
- https://github.com/homarr-labs/dashboard-icons

The imported SVGs were parsed and restricted to static vector elements. Scripts, event attributes, external references, raster embeds, and foreign objects were excluded. Images are displayed using ordinary image elements with empty alt text beside visible tool names to avoid duplicate announcements.

## Nuvato mark

`nuvato/brand/nuvato-integration-mark.png` in ImageKit is the full-resolution transparent master, refined from the original Nuvato logo and favicon. `nuvato-integration-mark.webp` is the optimized display version the site uses. The original wordmark (`nuvato-logo.png`) is stored alongside them. The app icons in `app/` (`favicon.ico`, `icon1.png`, `icon2.png`, `apple-icon.png`) were generated from the master.
