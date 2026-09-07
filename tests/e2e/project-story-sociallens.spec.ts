import { test, expect } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

/**
 * A9 — network + behaviour proof for the SocialLens visual world.
 *
 * Each test runs in a fresh context, so nothing is warmed by a previous test.
 * JS requests are recorded from before navigation.
 */

const LENS_CHUNK = /SocialLensStory-[\w-]+\.js$/;
const LENS_STAGE = /idempotent daily snapshots/;
const FLOW_STAGE = /SocialLens processing flow/;

function recordJs(page: Page) {
  const urls: string[] = [];
  page.on('request', (r: Request) => {
    if (r.resourceType() === 'script' || r.url().endsWith('.js')) urls.push(r.url());
  });
  return urls;
}

const lensHits = (urls: string[]) => urls.filter(u => LENS_CHUNK.test(u));

test.describe('A9 — SocialLens story lazy loading (network evidence)', () => {
  test('STEP 1–6 — absent on load, arrives once near SocialLens, then served from cache', async ({ page }) => {
    const js = recordJs(page);

    // STEP 1 — initial load, no scrolling
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(js.length, 'initial JS requests recorded').toBeGreaterThan(0);
    expect(lensHits(js), 'SocialLens chunk must NOT load on initial page visit').toEqual([]);

    // STEP 2 — scroll through Hero and Experience, stop before Projects
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    expect(lensHits(js), 'still absent while only Experience is on screen').toEqual([]);

    // STEP 3 — approach Ember. Its own chunk may load; SocialLens sits a full card
    // below, so the mount gate must still not have fired.
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const afterEmber = lensHits(js).length;

    // STEP 4 — approach SocialLens: exactly one request
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    expect(lensHits(js).length, 'SocialLens chunk loads once it is approached').toBe(1);
    expect(afterEmber).toBeLessThanOrEqual(1);
    await expect(page.getByRole('img', { name: LENS_STAGE })).toBeVisible();

    // STEP 5 — continue past SocialLens: no duplicate request
    await page.getByRole('heading', { name: 'IncidentPilot', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.locator('#education').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    expect(lensHits(js).length, 'no duplicate fetch further down the page').toBe(1);

    // STEP 6 — reverse back to SocialLens: cached, no refetch
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    expect(lensHits(js).length, 'chunk must not be re-fetched on reverse scroll').toBe(1);
    await expect(page.getByRole('img', { name: LENS_STAGE })).toBeVisible();
  });

  test('fast scrolling still fetches the chunk exactly once', async ({ page }) => {
    const js = recordJs(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    for (let i = 0; i < 4; i++) {
      await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
      await page.locator('#hero, header').first().scrollIntoViewIfNeeded();
    }
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    expect(lensHits(js).length).toBe(1);
    await expect(page.getByRole('img', { name: LENS_STAGE })).toBeVisible();
  });

  // STEP 7 — resilience
  test('a blocked story chunk falls back to the existing SocialLens FlowDemo', async ({ page }) => {
    await page.route(LENS_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // the custom visual is gone, the pre-existing FlowDemo took over
    await expect(page.getByRole('img', { name: LENS_STAGE })).toHaveCount(0);
    const flow = page.getByRole('img', { name: FLOW_STAGE });
    await expect(flow).toBeVisible();
    await expect(flow).toContainText('PostgreSQL time-series store');
    await expect(flow).toContainText('REST analytics APIs');

    // card content stays complete and usable
    const card = page.locator('#projects article').filter({ hasText: 'Creator Analytics & Intelligence Platform' });
    await expect(card.getByRole('heading', { name: 'SocialLens', exact: true })).toBeVisible();
    await expect(card).toContainText('ingests YouTube metrics');
    await expect(card).toContainText('Java · Spring Boot · PostgreSQL · OAuth 2.0 · REST APIs');
    await expect(card.locator('a[href="https://github.com/AruruGunabhiram/SocialLens"]')).toBeVisible();

    const toggle = page.locator('button[aria-controls="featured-detail-sociallens"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#featured-detail-sociallens')).toBeVisible();

    // explorer still works
    await page.locator('button[aria-controls="project-explorer"]').click();
    await expect(page.locator('#project-explorer')).toBeVisible();
    await expect(page.locator('#project-explorer')).toContainText('8 projects');
  });
});

test.describe('A9 — SocialLens static modes', () => {
  test('recruiter mode renders the complete static SocialLens system', async ({ page }) => {
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    const stage = page.getByRole('img', { name: LENS_STAGE });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('YouTube metrics');
    await expect(stage).toContainText('Scheduled ingest');
    await expect(stage).toContainText('OAuth');
    await expect(stage).toContainText('postgresql · snapshot history');
    await expect(stage).toContainText('Idempotent write');
    await expect(stage).toContainText('Analytics API');
    await expect(stage).toContainText('7 / 30 / 90-day trends');
  });

  test('reduced motion renders the complete static SocialLens system', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    const stage = page.getByRole('img', { name: LENS_STAGE });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('Idempotent write');
    await expect(stage).toContainText('Analytics API');
    await ctx.close();
  });
});

test.describe('A9 — SocialLens responsive & accessibility', () => {
  test('no horizontal overflow, no tab stops, compact composition on mobile', async ({ page }) => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
      const stage = page.getByRole('img', { name: LENS_STAGE });
      await expect(stage).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

      const focusables = await stage.locator('button, a, input, select, textarea, [tabindex]').count();
      expect(focusables, `tab stops inside visual at ${width}px`).toBe(0);
      expect(await stage.locator('[aria-live]').count(), `aria-live at ${width}px`).toBe(0);

      const primary = await stage.locator('[data-story-node="primary"]').count();
      if (width < 768) expect(primary, `primary nodes at ${width}px`).toBeLessThanOrEqual(4);
      else expect(primary, `primary nodes at ${width}px`).toBeLessThanOrEqual(5);
    }
  });

  test('only one project story animates at a time', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'SocialLens', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const lens = page.getByRole('img', { name: LENS_STAGE });
    await expect(lens).toBeVisible();
    // SocialLens holds the active slot; Ember stands down
    await expect(lens).not.toContainText('Paused offscreen');
    const ember = page.getByRole('img', { name: /durable orchestrator/ });
    if (await ember.count()) await expect(ember).toContainText('Paused offscreen');
  });
});
