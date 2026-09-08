import { test, expect } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

/**
 * A8 — network proof that project visual worlds are lazy.
 *
 * Each test uses a fresh context (Playwright default), so nothing is warmed by a
 * previous test. JS requests are recorded from before navigation.
 */

const EMBER_CHUNK = /EmberStory-[\w-]+\.js$/;

function recordJs(page: Page) {
  const urls: string[] = [];
  page.on('request', (r: Request) => {
    if (r.resourceType() === 'script' || r.url().endsWith('.js')) urls.push(r.url());
  });
  return urls;
}

const emberHits = (urls: string[]) => urls.filter(u => EMBER_CHUNK.test(u));

test.describe('A8 — Ember story lazy loading (network evidence)', () => {
  test('STEP 1–4 — chunk is absent on load, arrives only near Ember, and is fetched once', async ({ page }) => {
    const js = recordJs(page);

    // STEP 1 — initial load, no scrolling
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(js.length, 'initial JS requests recorded').toBeGreaterThan(0);
    expect(emberHits(js), 'Ember chunk must NOT load on initial page visit').toEqual([]);

    // STEP 2 — scroll to Experience, stop before Projects
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const afterExperience = emberHits(js).length;

    // STEP 3 — approach Ember (first featured project)
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);

    const afterEmber = emberHits(js);
    expect(afterEmber.length, 'Ember chunk must load once Ember is approached').toBe(1);
    expect(afterEmber.length).toBeGreaterThan(afterExperience - 1);

    // the story itself is now on screen
    const stage = page.getByRole('img', { name: /durable orchestrator/ });
    await expect(stage).toBeVisible();

    // STEP 4 — continue to the other featured projects: no second copy
    await page.getByRole('heading', { name: 'IncidentPilot', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.locator('#education').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    // reverse back to Ember
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    expect(emberHits(js).length, 'chunk must not be re-fetched').toBe(1);
  });

  test('STEP 5 — direct load at #projects never blocks project content, story still loads', async ({ page }) => {
    const js = recordJs(page);
    await page.goto('/#projects', { waitUntil: 'networkidle' });

    // Project content is rendered and complete regardless of the visual.
    await expect(page.getByRole('heading', { name: 'Ember', exact: true })).toBeAttached();
    await expect(page.locator('#projects')).toContainText('Personal AI Execution Assistant');
    await expect(page.locator('#projects')).toContainText('Durable orchestrator over modular capabilities');

    // A20 — cold hash navigation now re-applies after mount (generic rAF scroll),
    // so #projects lands near the projects section and the Ember chunk will load
    // shortly after, rather than staying at the top with no fetch.
    await page.waitForTimeout(900);
    const afterHash = emberHits(js).length;
    // It may already have fetched (hash scrolled) or will on explicit scroll — both are lazy, not eager on initial.
    // Ensure we end with exactly one fetch once Ember is in view.
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('img', { name: /durable orchestrator/ })).toBeVisible();
    expect(emberHits(js).length).toBe(1);
    expect(afterHash <= 1).toBeTruthy();
  });

  test('a blocked story chunk leaves the Ember card fully usable', async ({ page }) => {
    await page.route(EMBER_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);

    // title, subtitle, summary, highlights, technologies and the details toggle survive
    await expect(page.getByRole('heading', { name: 'Ember', exact: true })).toBeVisible();
    await expect(page.locator('#projects')).toContainText('Personal AI Execution Assistant');
    await expect(page.locator('#projects')).toContainText('FastAPI');
    const toggle = page.locator('button[aria-controls="featured-detail-ember"]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('#featured-detail-ember')).toBeVisible();

    // explorer still works
    await page.locator('button[aria-controls="project-explorer"]').click();
    await expect(page.locator('#project-explorer')).toBeVisible();
    await expect(page.locator('#project-explorer')).toContainText('8 projects');
  });

  test('recruiter mode renders the complete static Ember system', async ({ page }) => {
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    const stage = page.getByRole('img', { name: /durable orchestrator/ });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('COMPLETED');
    await expect(stage).toContainText('Deterministic gate');
    await expect(stage).toContainText('Semantic reasoning');
    await expect(stage).toContainText('Human approval / handoff');
    await expect(stage).toContainText('Controlled worker');
    await expect(stage).toContainText('Auditable state');
  });

  test('reduced motion renders the complete static Ember system', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    const stage = page.getByRole('img', { name: /durable orchestrator/ });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('COMPLETED');
    await ctx.close();
  });

  test('no horizontal overflow and no tab stops in the Ember visual across viewports', async ({ page }) => {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
      await expect(page.getByRole('img', { name: /durable orchestrator/ })).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

      const focusables = await page
        .getByRole('img', { name: /durable orchestrator/ })
        .locator('button, a, input, select, textarea, [tabindex]')
        .count();
      expect(focusables, `tab stops inside visual at ${width}px`).toBe(0);

      // compact composition at mobile widths
      const primary = await page
        .getByRole('img', { name: /durable orchestrator/ })
        .locator('[data-story-node="primary"]')
        .count();
      if (width < 768) expect(primary, `primary nodes at ${width}px`).toBeLessThanOrEqual(4);
      else expect(primary, `primary nodes at ${width}px`).toBeLessThanOrEqual(7);
    }
  });

  test('Ember card shows no fake GitHub/live affordance', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const card = page.locator('#projects article').filter({ hasText: 'Personal AI Execution Assistant' });
    await expect(card).toBeVisible();
    await expect(card.locator('a')).toHaveCount(0);
    await expect(card.locator('button:disabled')).toHaveCount(0);
  });
});
