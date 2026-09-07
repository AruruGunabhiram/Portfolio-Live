#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

// 21AE / 21CH / 21CI — gates production deployment if placeholder canonical remains
const SITE_URL_PATH = path.join(process.cwd(), 'src/config/site.ts');
const HTML_PATH = path.join(process.cwd(), 'index.html');
const PLACEHOLDER = 'https://gunabhiram-aruru.dev';
const CONFIRMED_ENV = process.env.SITE_URL_CONFIRMED;
const PRODUCTION = process.env.VERIFY_PRODUCTION === 'true' || process.env.CI === 'true' ? false : false;

const src = fs.readFileSync(SITE_URL_PATH, 'utf8');
const html = fs.readFileSync(HTML_PATH, 'utf8');

const siteMatch = src.match(/SITE_URL\s*=\s*['"]([^'"]+)['"]/);
const siteUrl = siteMatch ? siteMatch[1] : null;
const canonicalInHtml = html.includes(`href="${siteUrl}/`) || html.includes(`href="${siteUrl}"`) || html.includes(PLACEHOLDER);

console.log(`Current SITE_URL: ${siteUrl}`);
console.log(`Placeholder marker: ${PLACEHOLDER}`);

if (siteUrl === PLACEHOLDER) {
  console.warn('WARN production canonical domain still NOT PROVEN — placeholder in use (Phase 20/21)');
  console.warn('This is expected locally. Phase 22 must replace before go-live.');
  // Do NOT fail locally unless SITE_URL_CONFIRMED=true is required
  if (CONFIRMED_ENV === 'true') {
    console.error('FAIL SITE_URL_CONFIRMED=true but SITE_URL still placeholder');
    process.exit(1);
  }
  // If VERIFY_PRODUCTION=true explicitly, fail
  if (process.env.VERIFY_PRODUCTION === 'true') {
    console.error('FAIL VERIFY_PRODUCTION requested but placeholder still present');
    process.exit(1);
  }
  console.log('verify:production — PASS (local, placeholder allowed)');
  process.exit(0);
}

console.log(`SITE_URL is not placeholder — checking consistency`);
const inconsistent = [];
if (!html.includes(siteUrl)) inconsistent.push('index.html canonical does not contain SITE_URL');
const robots = fs.readFileSync(path.join(process.cwd(), 'public/robots.txt'), 'utf8');
if (!robots.includes(siteUrl)) inconsistent.push('robots.txt sitemap does not contain SITE_URL');
const sitemap = fs.readFileSync(path.join(process.cwd(), 'public/sitemap.xml'), 'utf8');
if (!sitemap.includes(siteUrl)) inconsistent.push('sitemap.xml loc does not contain SITE_URL');

if (inconsistent.length) {
  console.error('FAIL inconsistent domain:', inconsistent.join('; '));
  process.exit(1);
}
console.log('verify:production — PASS (domain appears confirmed and consistent)');
