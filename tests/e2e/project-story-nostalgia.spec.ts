import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const NOSTALGIA_STAGE = /browser extension workflow where copied text is captured/i;
const NOSTALGIA_CHUNK = '**/assets/NostalgiaStory-*.js';

function recordNostalgiaJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => { if (/\/assets\/NostalgiaStory-.*\.js(?:\?|$)/.test(request.url())) requests.push(request.url()); });
  return requests;
}
async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
}
async function scrollToNostalgia(page: Page, expectStory = true) {
  await openExplorer(page);
  const toggle = page.locator('button[aria-controls="explorer-detail-nostalgia"]');
  await toggle.scrollIntoViewIfNeeded();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  if (expectStory) { const stage = page.getByRole('img', { name: NOSTALGIA_STAGE }); await expect(stage).toBeAttached(); await stage.scrollIntoViewIfNeeded(); }
  await page.waitForTimeout(700);
}

test.describe('A15 — Nostalgia lazy network', () => {
  test('does not load early, loads once near Nostalgia, and stays cached after return', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 }); const requests = recordNostalgiaJs(page);
    await page.goto('/', { waitUntil: 'networkidle' }); expect(requests).toHaveLength(0);
    await page.locator('#hero').scrollIntoViewIfNeeded(); await page.waitForTimeout(250); expect(requests).toHaveLength(0);
    await page.locator('#experience').scrollIntoViewIfNeeded(); await page.waitForTimeout(250); expect(requests).toHaveLength(0);
    await openExplorer(page); await page.waitForTimeout(350); expect(requests).toHaveLength(0);
    await scrollToNostalgia(page); expect(requests).toHaveLength(1);
    await page.locator('#hero').scrollIntoViewIfNeeded(); await scrollToNostalgia(page); expect(requests).toHaveLength(1);
  });
});

test.describe('A15 — Nostalgia visual and accessibility', () => {
  test('is compact, passive, and readable at every target viewport', async ({ page }) => {
    const limits: Record<number, number> = { 320: 350, 375: 340, 768: 410, 1024: 430, 1440: 430 };
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 }); await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' }); await scrollToNostalgia(page);
      const stage = page.getByRole('img', { name: NOSTALGIA_STAGE });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      const box = await stage.boundingBox(); expect(box).not.toBeNull(); expect(box!.height, `story height at ${width}px`).toBeLessThanOrEqual(limits[width]);
      expect(await stage.locator('[data-story-node="primary"]').count()).toBe(width < 768 ? 3 : 4);
      for (const text of ['Reusable text snippet', 'Saved snippets', 'LOCAL STORAGE', 'Reuse snippet']) await expect(stage).toContainText(text);
      expect(await stage.locator('button, a, input, select, textarea, [tabindex]').count()).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} keeps local capture and reuse readable`, async ({ page }) => {
      const dark = mode.endsWith('dark'); const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' }); await scrollToNostalgia(page);
      const stage = page.getByRole('img', { name: NOSTALGIA_STAGE }); await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('stored locally in browser'); await expect(stage).toContainText('ready to paste');
      if (recruiter) await expect(stage).toContainText('Static workflow');
    });
  }

  test('reduced motion renders the completed static workflow', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' }); const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' }); await scrollToNostalgia(page);
    const stage = page.getByRole('img', { name: NOSTALGIA_STAGE }); await expect(stage).toContainText('Static workflow'); await expect(stage).toContainText('LOCAL STORAGE'); await expect(stage).toContainText('ready to paste'); await context.close();
  });
});

test.describe('A15 — Nostalgia chunk failure', () => {
  test('keeps the project card, details, repository, and explorer usable when the lazy chunk fails', async ({ page }) => {
    await page.route(NOSTALGIA_CHUNK, route => route.abort()); await page.goto('/', { waitUntil: 'networkidle' }); await scrollToNostalgia(page, false); await page.waitForTimeout(500);
    await expect(page.getByRole('img', { name: NOSTALGIA_STAGE })).toHaveCount(0);
    const card = page.locator('#project-explorer article').filter({ hasText: 'Browser Extension / Productivity Tool' });
    await expect(card.getByRole('heading', { name: 'Nostalgia', exact: true })).toBeVisible(); const detail = page.locator('#explorer-detail-nostalgia');
    await expect(detail).toBeVisible(); await expect(detail).toContainText('Built with a friend'); await expect(detail).toContainText('chrome.storage.local'); await expect(detail.getByRole('link', { name: /repository on GitHub/i })).toBeVisible(); await expect(page.locator('#project-explorer')).toContainText('8 projects');
  });
});
