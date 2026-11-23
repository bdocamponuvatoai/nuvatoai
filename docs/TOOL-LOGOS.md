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

## Social icons

The footer links to Nuvato AI's own LinkedIn, Facebook, Instagram, and TikTok profiles (`siteConfig.social`). Each icon is the network's official glyph from [Bootstrap Icons](https://github.com/twbs/icons) 1.11.3 (MIT, see [licenses/bootstrap-icons-LICENSE.txt](licenses/bootstrap-icons-LICENSE.txt)), all drawn on the same 16×16 grid so they read as one set. Every network's brand guidelines allow a single-color version, so they're drawn in `currentColor` and take the footer's colors.

The path data is inlined in `components/SocialLinks.tsx`, so the icons cost no request and nothing loads from the networks. Each SVG was one static `<path>`, with no scripts or external references. Source files (`https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/<name>.svg`) and their SHA-256 checksums:

| Icon          | SHA-256                                                            |
| ------------- | ------------------------------------------------------------------ |
| linkedin.svg  | `ddcbb2735eea12f090ea0ee371d1b9a3462531dc11efd0e944adc2d38c71e2df` |
| facebook.svg  | `fccefddbce24b7acef96fcdb75aa9bc37dc1d6e725efa8b32eca6b619ff153ff` |
| instagram.svg | `19e53b107d19b81cc92217e9389b5d1cf98a7637ed965a5d07d6e84e8d200cb0` |
| tiktok.svg    | `0647764edf4ee235bb49ffd6860dc2c0bf3b3e1bdace49469a8c0c0bc07f8ca6` |

The marks remain owned by LinkedIn, Meta, and TikTok. To add a network, add it to `siteConfig.social` and its glyph to `GLYPHS` in `SocialLinks.tsx`; the TypeScript types require both.

## Nuvato mark

`nuvato/brand/nuvato-integration-mark.png` in ImageKit is the full-resolution transparent master, refined from the original Nuvato logo and favicon. `nuvato-integration-mark.webp` is the optimized display version the site uses. The original wordmark (`nuvato-logo.png`) is stored alongside them. The app icons in `app/` (`favicon.ico`, `icon1.png`, `icon2.png`, `apple-icon.png`) were generated from the master.
