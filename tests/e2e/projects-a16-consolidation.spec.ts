import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const FEATURED = [
  ['ember', 'Ember'],
  ['sociallens', 'SocialLens'],
  ['incidentpilot', 'IncidentPilot'],
] as const;

const ADDITIONAL = [
  ['clinical-reconciliation', 'Clinical Reconciliation'],
  ['code-battlegrounds', 'Code Battlegrounds'],
  ['timesling', 'TimeSling'],
  ['zenco', 'Zenco'],
  ['nostalgia', 'Nostalgia'],
] as const;

const CHUNK_NAME: Record<string, string> = {
  ember: 'EmberStory',
  sociallens: 'SocialLensStory',
  incidentpilot: 'IncidentPilotStory',
  'clinical-reconciliation': 'ClinicalReconciliationStory',
  'code-battlegrounds': 'CodeBattlegroundsStory',
  timesling: 'TimeSlingStory',
  zenco: 'ZencoStory',
  nostalgia: 'NostalgiaStory',
};

function recordStoryRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    if (Object.values(CHUNK_NAME).some(name => request.url().includes(`/${name}-`))) {
      requests.push(request.url());
    }
  });
  return requests;
}

function requestCount(requests: string[], id: string) {
  return requests.filter(url => url.includes(`/${CHUNK_NAME[id]}-`)).length;
}

async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
}

async function loadFeatured(page: Page, id: string) {
  const article = page.locator(`#projects article:has(button[aria-controls="featured-detail-${id}"])`);
  await article.scrollIntoViewIfNeeded();
  await expect(article.locator(`[data-project-story="${id}"] [role="img"]`)).toBeVisible();
}

async function selectAdditional(page: Page, id: string) {
  await openExplorer(page);
  const toggle = page.locator(`button[aria-controls="explorer-detail-${id}"]`);
  await toggle.scrollIntoViewIfNeeded();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  const story = page.locator(`[data-project-story="${id}"]`);
  await story.scrollIntoViewIfNeeded();
  await expect(story.locator('[role="img"]')).toBeVisible();
  return story;
}

test.describe('A16 — project-system consolidation', () => {
  test('all eight story chunks follow selected-only request sequencing and remain cached', async ({ page }) => {
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 375, height: 800 });
    const requests = recordStoryRequests(page);

    await page.goto('/', { waitUntil: 'networkidle' });
    for (const id of Object.keys(CHUNK_NAME)) expect(requestCount(requests, id), `${id} initial`).toBe(0);

    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    for (const id of Object.keys(CHUNK_NAME)) expect(requestCount(requests, id), `${id} at Experience`).toBe(0);

    for (const [id] of FEATURED) {
      await loadFeatured(page, id);
      expect(requestCount(requests, id), `${id} first approach`).toBe(1);
    }

    await openExplorer(page);
    await page.waitForTimeout(300);
    for (const [id] of ADDITIONAL) {
      expect(requestCount(requests, id), `${id} after explorer open`).toBe(0);
      await expect(page.locator(`[data-project-story="${id}"]`)).toHaveCount(0);
    }

    for (const [id] of ADDITIONAL) {
      await selectAdditional(page, id);
      expect(requestCount(requests, id), `${id} selected`).toBe(1);
    }

    await page.locator('#hero').scrollIntoViewIfNeeded();
    for (const [id] of [...FEATURED, ...ADDITIONAL]) {
      expect(requestCount(requests, id), `${id} after reverse scroll`).toBe(1);
    }
  });

  test('co-built attribution is visible only on Code Battlegrounds, Zenco and Nostalgia', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await openExplorer(page);

    for (const [id] of [...FEATURED, ...ADDITIONAL]) {
      const article = page.locator(`#project-explorer article:has(button[aria-controls="explorer-detail-${id}"])`);
      if (['code-battlegrounds', 'zenco', 'nostalgia'].includes(id)) {
        await expect(article.getByText('Co-built', { exact: true })).toBeVisible();
      } else {
        await expect(article.getByText('Co-built', { exact: true })).toHaveCount(0);
      }
    }

    await expect(page.locator('#projects')).not.toContainText(/commit percentage|\d+%/i);
  });

  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`${width}px keeps every loaded story within 40px of its reservation`, async ({ page }) => {
      test.setTimeout(45_000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });

      for (const [id] of FEATURED) await loadFeatured(page, id);
      await openExplorer(page);

      for (const [id] of ADDITIONAL) {
        const story = await selectAdditional(page, id);
        const geometry = await story.evaluate(element => {
          const stage = element.querySelector<HTMLElement>('[role="img"]')!;
          const reserved = Number.parseFloat(getComputedStyle(element).getPropertyValue('--story-reserved-height'));
          return { loaded: stage.getBoundingClientRect().height, reserved };
        });
        expect(geometry.loaded - geometry.reserved, `${id} ${width}px layout shift`).toBeLessThanOrEqual(40);
        expect(await story.locator('button, a, input, select, textarea, [tabindex]').count()).toBe(0);
      }

      const labels = await page.locator('#projects [data-project-story] [role="img"]').evaluateAll(stages =>
        stages.map(stage => stage.getAttribute('aria-label'))
      );
      expect(new Set(labels).size).toBe(labels.length);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }

  test('Projects passes axe in Standard/Recruiter × Light/Dark with an expanded secondary story', async ({ page }) => {
    test.setTimeout(45_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1024, height: 900 });

    for (const recruiter of [false, true]) {
      for (const theme of ['light', 'dark'] as const) {
        await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
        await page.evaluate(value => localStorage.setItem('portfolio-theme', value), theme);
        await page.reload({ waitUntil: 'networkidle' });
        await selectAdditional(page, 'code-battlegrounds');

        const results = await new AxeBuilder({ page }).include('#projects').analyze();
        expect(
          results.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? '')),
          `${recruiter ? 'Recruiter' : 'Standard'} ${theme}`
        ).toEqual([]);
      }
    }
  });
});
