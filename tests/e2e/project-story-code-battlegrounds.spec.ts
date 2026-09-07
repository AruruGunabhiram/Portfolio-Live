import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const CODE_STAGE = /collaborative coding session where participants stay synchronized/i;
const CODE_CHUNK = '**/assets/CodeBattlegroundsStory-*.js';

function recordCodeStoryJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    const url = request.url();
    if (/\/assets\/CodeBattlegroundsStory-.*\.js(?:\?|$)/.test(url)) requests.push(url);
  });
  return requests;
}

async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
}

async function scrollToCodeBattlegrounds(page: Page, expectCustomStory = true) {
  await openExplorer(page);
  await page
    .locator('#project-explorer')
    .getByRole('heading', { name: 'Code Battlegrounds', exact: true })
    .scrollIntoViewIfNeeded();
  if (expectCustomStory) {
    const stage = page.getByRole('img', { name: CODE_STAGE });
    await expect(stage).toBeAttached();
    await stage.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(700);
}

test.describe('A12 — Code Battlegrounds lazy network', () => {
  test('stays absent until its explorer card is near, then loads exactly once across reverse navigation', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    const requests = recordCodeStoryJs(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(requests).toHaveLength(0);

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    expect(requests).toHaveLength(0);

    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    expect(requests).toHaveLength(0);

    await page.getByRole('heading', { name: 'IncidentPilot', exact: true }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    expect(requests).toHaveLength(0);

    await openExplorer(page);
    await page.waitForTimeout(350);
    expect(requests, 'opening a long mobile explorer must not fetch a far-away secondary story').toHaveLength(0);

    await scrollToCodeBattlegrounds(page);
    expect(requests).toHaveLength(1);
    await expect(page.getByRole('img', { name: CODE_STAGE })).toBeVisible();

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await scrollToCodeBattlegrounds(page);
    expect(requests).toHaveLength(1);
  });
});

test.describe('A12 — Code Battlegrounds visual and accessibility', () => {
  test('meets responsive height, object-count, overflow, semantics, and interaction limits', async ({ page }) => {
    const heightLimits: Record<number, number> = {
      320: 430,
      375: 420,
      768: 540,
      1024: 560,
      1440: 560,
    };

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
      await scrollToCodeBattlegrounds(page);
      const stage = page.getByRole('img', { name: CODE_STAGE });
      await expect(stage).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

      const box = await stage.boundingBox();
      expect(box, `stage geometry at ${width}px`).not.toBeNull();
      expect(box!.height, `story height at ${width}px`).toBeLessThanOrEqual(heightLimits[width]);

      const primary = await stage.locator('[data-story-node="primary"]').count();
      expect(primary, `primary concepts at ${width}px`).toBe(width < 768 ? 4 : 5);
      await expect(stage).toContainText('Coding challenge');
      await expect(stage).toContainText('Shared editor');
      await expect(stage).toContainText('2 CONNECTED · SYNCED');
      await expect(stage).toContainText('Realtime sync');
      await expect(stage).toContainText('Socket.IO');
      await expect(stage).toContainText('submission queued');
      await expect(stage).toContainText('Judge0 execution');
      await expect(stage).toContainText('Test results');
      await expect(stage).toContainText('EXECUTION COMPLETE');

      expect(
        await stage.locator('button, a, input, select, textarea, [tabindex]').count(),
        `focusable controls at ${width}px`
      ).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} preserves collaboration, synchronization, execution, and feedback`, async ({ page }) => {
      const dark = mode.endsWith('dark');
      const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
      await scrollToCodeBattlegrounds(page);
      const stage = page.getByRole('img', { name: CODE_STAGE });
      await expect(stage).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('participant A · participant B');
      await expect(stage).toContainText('Realtime sync');
      await expect(stage).toContainText('submission queued');
      await expect(stage).toContainText('Judge0 execution');
      await expect(stage).toContainText('Test results');
      if (recruiter) {
        await expect(stage).toContainText('Static system');
        await expect(stage).toContainText('EXECUTION COMPLETE');
      }
    });
  }

  test('reduced motion renders the complete final static system', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToCodeBattlegrounds(page);
    const stage = page.getByRole('img', { name: CODE_STAGE });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('2 CONNECTED · SYNCED');
    await expect(stage).toContainText('submission queued');
    await expect(stage).toContainText('Judge0 execution · complete');
    await expect(stage).toContainText('feedback synchronized to shared session');
    await context.close();
  });
});

test.describe('A12 — Code Battlegrounds chunk failure', () => {
  test('falls back to the existing demo while keeping links, details, inventory, and earlier stories usable', async ({ page }) => {
    await page.route(CODE_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });

    await page.getByRole('heading', { name: 'Ember', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('img', { name: /durable orchestrator/i })).toBeVisible();

    await scrollToCodeBattlegrounds(page, false);
    await page.waitForTimeout(500);
    await expect(page.getByRole('img', { name: CODE_STAGE })).toHaveCount(0);

    const explorer = page.locator('#project-explorer');
    const card = explorer.locator('article').filter({ hasText: 'Full-Stack Collaborative Coding Platform' });
    await expect(card.getByRole('heading', { name: 'Code Battlegrounds', exact: true })).toBeVisible();
    await expect(card).toContainText('React · TypeScript · Vite · +9');
    await expect(card.locator('a[href="https://github.com/Kanyarasi2026/code-battle-grounds"]')).toBeVisible();
    await expect(card.locator('a[href="https://code-battle-grounds.vercel.app"]')).toBeVisible();
    await expect(card.getByRole('img', { name: /Code Battlegrounds flow/i })).toBeVisible();

    await card.locator('button[aria-controls="explorer-detail-code-battlegrounds"]').click();
    const detail = page.locator('#explorer-detail-code-battlegrounds');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('real-time collaborative coding platform');
    await expect(detail).toContainText('Real-time collaborative editor using Socket.IO');
    await expect(detail).toContainText('React · TypeScript · Vite · Node.js · Express');
    await expect(detail.getByRole('link', { name: /repository on GitHub/i })).toBeVisible();
    await expect(detail.getByRole('link', { name: /live demo/i })).toBeVisible();
    await expect(explorer).toContainText('8 projects');
  });
});
