/**
 * Site URL — single source for canonical / OG / sitemap / robots.
 *
 * PRODUCTION DOMAIN AUDIT (Phase 20A): NOT PROVEN
 * No verifiable production domain found in:
 *  - README
 *  - package.json / package metadata
 *  - index.html / manifest
 *  - Netlify / Vercel config (none present)
 *  - git remote (github only, no deployed URL)
 *
 * This value is the intended canonical origin. Replace the placeholder
 * with the real HTTPS production URL before go-live (Phase 22).
 * Keep a single origin — no trailing slash.
 *
 * When domain becomes proven:
 *  1. Update SITE_URL here.
 *  2. Keep index.html canonical / og:url / sitemap.xml / robots.txt in sync
 *     (they duplicate this string statically for crawler availability pre-JS).
 */
export const SITE_URL = 'https://gunabhiram-aruru.dev';

/** Canonical root with trailing slash policy: origin + '/' */
export const CANONICAL_URL = `${SITE_URL}/`;
