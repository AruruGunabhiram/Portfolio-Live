import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const ZENCO_STAGE = /collaborative developer-tooling workflow where a VS Code extension/i;
const ZENCO_CHUNK = '**/assets/ZencoStory-*.js';

function recordZencoJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    if (/\/assets\/ZencoStory-.*\.js(?:\?|$)/.test(request.url())) requests.push(request.url());
  });
  return requests;
}
async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
}
async function scrollToZenco(page: Page, expectStory = true) {
  await openExplorer(page);
  const toggle = page.locator('button[aria-controls="explorer-detail-zenco"]');
  await toggle.scrollIntoViewIfNeeded();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  if (expectStory) {
    const stage = page.getByRole('img', { name: ZENCO_STAGE });
    await expect(stage).toBeAttached();
    await stage.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(700);
}

test.describe('A14 — Zenco lazy network', () => {
  test('does not load early, loads once near Zenco, and stays cached after reverse navigation', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const requests = recordZencoJs(page);
    await page.goto('/', { waitUntil: 'networkidle' }); expect(requests).toHaveLength(0);
    await page.locator('#hero').scrollIntoViewIfNeeded(); await page.waitForTimeout(250); expect(requests).toHaveLength(0);
    await page.locator('#experience').scrollIntoViewIfNeeded(); await page.waitForTimeout(250); expect(requests).toHaveLength(0);
    await openExplorer(page); await page.waitForTimeout(350); expect(requests).toHaveLength(0);
    await scrollToZenco(page); expect(requests).toHaveLength(1);
    await page.locator('#hero').scrollIntoViewIfNeeded(); await scrollToZenco(page); expect(requests).toHaveLength(1);
  });
});

test.describe('A14 — Zenco visual and accessibility', () => {
  test('is compact, passive, and readable at every target viewport', async ({ page }) => {
    const limits: Record<number, number> = { 320: 390, 375: 380, 768: 470, 1024: 490, 1440: 490 };
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 }); await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' }); await scrollToZenco(page);
      const stage = page.getByRole('img', { name: ZENCO_STAGE });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      const box = await stage.boundingBox(); expect(box).not.toBeNull(); expect(box!.height, `story height at ${width}px`).toBeLessThanOrEqual(limits[width]);
      expect(await stage.locator('[data-story-node="primary"]').count()).toBe(width < 768 ? 4 : 5);
      for (const text of ['Editor workspace', 'VS Code extension', 'Python CLI engine', 'Editor result', 'Stable interface']) await expect(stage).toContainText(text);
      expect(await stage.locator('button, a, input, select, textarea, [tabindex]').count()).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} preserves the editor-extension-engine boundary`, async ({ page }) => {
      const dark = mode.endsWith('dark'); const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' }); await scrollToZenco(page);
      const stage = page.getByRole('img', { name: ZENCO_STAGE }); await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('VS Code API'); await expect(stage).toContainText('Python CLI engine'); await expect(stage).toContainText('insight returned to workflow');
      if (recruiter) { await expect(stage).toContainText('Static workflow'); await expect(stage).toContainText('RETURNED'); }
    });
  }

  test('reduced motion renders the complete static workflow', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' }); const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' }); await scrollToZenco(page);
    const stage = page.getByRole('img', { name: ZENCO_STAGE }); await expect(stage).toContainText('Static workflow'); await expect(stage).toContainText('request ↔ response'); await expect(stage).toContainText('RETURNED'); await context.close();
  });
});

test.describe('A14 — Zenco chunk failure', () => {
  test('keeps the project card, details, repository, and explorer usable when the lazy chunk fails', async ({ page }) => {
    await page.route(ZENCO_CHUNK, route => route.abort()); await page.goto('/', { waitUntil: 'networkidle' }); await scrollToZenco(page, false); await page.waitForTimeout(500);
    await expect(page.getByRole('img', { name: ZENCO_STAGE })).toHaveCount(0);
    const card = page.locator('#project-explorer article').filter({ hasText: 'Modular Developer Tooling System' });
    await expect(card.getByRole('heading', { name: 'Zenco', exact: true })).toBeVisible(); const detail = page.locator('#explorer-detail-zenco');
    await expect(detail).toBeVisible(); await expect(detail).toContainText('collaborative class project'); await expect(detail).toContainText('VS Code extension integration'); await expect(detail.getByRole('link', { name: /repository on GitHub/i })).toBeVisible(); await expect(page.locator('#project-explorer')).toContainText('8 projects');
  });
});
