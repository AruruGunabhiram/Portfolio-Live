import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const TIMESLING_STAGE = /macOS menu-bar timer utility where preset or custom timers/i;
const TIMESLING_CHUNK = '**/assets/TimeSlingStory-*.js';

function recordTimeSlingJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    if (/\/assets\/TimeSlingStory-.*\.js(?:\?|$)/.test(request.url())) requests.push(request.url());
  });
  return requests;
}

async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
}

async function scrollToTimeSling(page: Page, expectStory = true) {
  await openExplorer(page);
  await page.locator('#project-explorer').getByRole('heading', { name: 'TimeSling', exact: true }).scrollIntoViewIfNeeded();
  if (expectStory) {
    const stage = page.getByRole('img', { name: TIMESLING_STAGE });
    await expect(stage).toBeAttached();
    await stage.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(700);
}

test.describe('A13 — TimeSling lazy network', () => {
  test('stays absent until the TimeSling explorer card approaches, then loads only once', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const requests = recordTimeSlingJs(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(requests).toHaveLength(0);
    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    expect(requests).toHaveLength(0);
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    expect(requests).toHaveLength(0);
    await openExplorer(page);
    await page.waitForTimeout(350);
    expect(requests).toHaveLength(0);
    await scrollToTimeSling(page);
    expect(requests).toHaveLength(1);
    await page.locator('#hero').scrollIntoViewIfNeeded();
    await scrollToTimeSling(page);
    expect(requests).toHaveLength(1);
  });
});

test.describe('A13 — TimeSling product visual and accessibility', () => {
  test('is compact, readable, and passive at every target viewport', async ({ page }) => {
    const limits: Record<number, number> = { 320: 390, 375: 380, 768: 490, 1024: 510, 1440: 510 };
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
      await scrollToTimeSling(page);
      const stage = page.getByRole('img', { name: TIMESLING_STAGE });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      const box = await stage.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height, `story height at ${width}px`).toBeLessThanOrEqual(limits[width]);
      expect(await stage.locator('[data-story-node="primary"]').count()).toBe(width < 768 ? 4 : 5);
      for (const text of ['Create timer', 'TimeSling · menu-bar panel', 'snapped stack', 'Concurrent state', 'Timer complete']) await expect(stage).toContainText(text);
      expect(await stage.locator('button, a, input, select, textarea, [tabindex]').count()).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} preserves the menu-bar utility and timer-stack meaning`, async ({ page }) => {
      const dark = mode.endsWith('dark');
      const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
      await scrollToTimeSling(page);
      const stage = page.getByRole('img', { name: TIMESLING_STAGE });
      await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('Menu-bar utility');
      await expect(stage).toContainText('custom drag');
      await expect(stage).toContainText('TimeSling · menu-bar panel');
      if (recruiter) {
        await expect(stage).toContainText('Static product state');
        await expect(stage).toContainText('Timer complete');
      }
    });
  }

  test('reduced motion shows the complete static product state', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToTimeSling(page);
    const stage = page.getByRole('img', { name: TIMESLING_STAGE });
    await expect(stage).toContainText('Static product state');
    await expect(stage).toContainText('distinct progress · 3 timers');
    await expect(stage).toContainText('Timer complete');
    await context.close();
  });
});

test.describe('A13 — TimeSling chunk failure', () => {
  test('preserves the card, details, repository, and explorer when the lazy chunk fails', async ({ page }) => {
    await page.route(TIMESLING_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToTimeSling(page, false);
    await page.waitForTimeout(500);
    await expect(page.getByRole('img', { name: TIMESLING_STAGE })).toHaveCount(0);
    const card = page.locator('#project-explorer article').filter({ hasText: 'macOS Productivity App' });
    await expect(card.getByRole('heading', { name: 'TimeSling', exact: true })).toBeVisible();
    await expect(card.locator('a[href="https://github.com/AruruGunabhiram/TimeSling-fresh"]')).toBeVisible();
    await card.locator('button[aria-controls="explorer-detail-timesling"]').click();
    const detail = page.locator('#explorer-detail-timesling');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Native macOS menu bar utility');
    await expect(detail.getByRole('link', { name: /repository on GitHub/i })).toBeVisible();
    await expect(page.locator('#project-explorer')).toContainText('8 projects');
  });
});
