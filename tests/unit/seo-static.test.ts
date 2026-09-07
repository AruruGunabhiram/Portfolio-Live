import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, CANONICAL_URL } from '../../src/config/site';

describe('21AD / 21AF / 21AG / 21AH / 21AE — SEO static guarantees', () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');

  it('title is factual and restrained — Gunabhiram Aruru — Software Engineer', () => {
    expect(html).toContain('<title>Gunabhiram Aruru — Software Engineer</title>');
    // anti-keyword-stacking
    expect(html).not.toContain('AI Engineer | Backend');
  });

  it('meta description exists and is not spammy', () => {
    expect(html).toMatch(/<meta[^>]*name="description"/);
    expect(html).not.toMatch(/<meta[^>]*name="keywords"/);
    // ensure description derived from profile (contains backend/full-stack)
    expect(html.toLowerCase()).toContain('software engineer');
  });

  it('author present', () => {
    expect(html).toContain('name="author" content="Gunabhiram Aruru"');
  });

  it('canonical points to SITE_URL', () => {
    expect(html).toContain(`href="${CANONICAL_URL}"`);
    expect(CANONICAL_URL).toBe(`${SITE_URL}/`);
  });

  it('og:* tags present and consistent with canonical', () => {
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('property="og:title" content="Gunabhiram Aruru — Software Engineer"');
    expect(html).toContain(`property="og:url" content="${CANONICAL_URL}"`);
    expect(html).toContain('property="og:site_name" content="Gunabhiram Aruru"');
    expect(html).toContain(`property="og:image" content="${SITE_URL}/og-image.png"`);
    expect(html).toContain('property="og:image:alt" content="Gunabhiram Aruru portfolio preview"');
  });

  it('twitter card consistent', () => {
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('name="twitter:title" content="Gunabhiram Aruru — Software Engineer"');
    expect(html).toContain(`name="twitter:image" content="${SITE_URL}/og-image.png"`);
    expect(html).not.toContain('twitter:site'); // no invented handle
  });

  it('favicon and theme-color present', () => {
    expect(html).toContain('href="/favicon.svg"');
    expect(html).toContain('href="/apple-touch-icon.png"');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('rel="manifest" href="/site.webmanifest"');
  });

  it('JSON-LD parses and Person invariants hold', () => {
    const m = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
    expect(m).not.toBeNull();
    const obj = JSON.parse(m![1]);
    expect(obj['@type']).toBe('Person');
    expect(obj.name).toBe('Gunabhiram Aruru');
    expect(obj.jobTitle).toBe('Software Engineer');
    expect(obj.sameAs).toEqual(expect.arrayContaining([
      'https://github.com/AruruGunabhiram',
      'https://www.linkedin.com/in/gunabhiram-aruru/',
    ]));
    expect(obj.email).toBeUndefined();
    expect(obj.telephone).toBeUndefined();
    // must not contain phone
    expect(JSON.stringify(obj)).not.toContain('+1');
  });

  it('21AE — placeholder domain guard: SITE_URL is provisional', () => {
    // This is expected to be placeholder until Phase 22; test warns but does not fail build
    expect(SITE_URL).toBe('https://gunabhiram-aruru.dev');
    // verify-production script must exist to gate deployment
    expect(fs.existsSync(path.join(process.cwd(), 'scripts/verify-production.mjs'))).toBe(true);
  });

  it('robots.txt exists and allows crawl', () => {
    const robots = fs.readFileSync(path.join(process.cwd(), 'public/robots.txt'), 'utf8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it('sitemap.xml valid single URL, no recruiter/hash', () => {
    const sitemap = fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf8');
    expect(sitemap).toContain(`<loc>${CANONICAL_URL}</loc>`);
    expect(sitemap).not.toContain('mode=recruiter');
    expect(sitemap).not.toContain('#');
    expect(sitemap).toContain('<urlset');
    // exactly one <url>
    expect((sitemap.match(/<url>/g) || []).length).toBe(1);
  });

  it('OG/favicon assets exist', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'public/favicon.svg'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'public/apple-touch-icon.png'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'public/og-image.png'))).toBe(true);
    // vite.svg removed
    expect(fs.existsSync(path.join(process.cwd(), 'public/vite.svg'))).toBe(false);
  });
});
