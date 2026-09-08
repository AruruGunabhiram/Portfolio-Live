import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const CLINICAL_STAGE = /Multiple synthetic medication-source records/;
const CLINICAL_CHUNK = '**/assets/ClinicalReconciliationStory-*.js';

function recordClinicalJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    const url = request.url();
    if (/\/assets\/ClinicalReconciliationStory-.*\.js(?:\?|$)/.test(url)) requests.push(url);
  });
  return requests;
}

async function scrollToFeatured(page: Page, name: string) {
  await page
    .locator('#projects article[class*="py-7"]')
    .getByRole('heading', { name, exact: true })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
}

async function openExplorer(page: Page) {
  const toggle = page.locator('button[aria-controls="project-explorer"]');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await expect(page.locator('#project-explorer')).toBeVisible();
  await page.waitForTimeout(300);
}

async function scrollToClinical(page: Page) {
  await openExplorer(page);
  const toggle = page.locator('button[aria-controls="explorer-detail-clinical-reconciliation"]');
  await toggle.scrollIntoViewIfNeeded();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  await page.waitForTimeout(700);
}

test.describe('A11 — Clinical Reconciliation lazy network', () => {
  test('is absent remotely, loads once near its explorer card, and stays cached on reverse', async ({ page }) => {
    const requests = recordClinicalJs(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(requests).toHaveLength(0);

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(requests).toHaveLength(0);

    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(requests).toHaveLength(0);

    await scrollToFeatured(page, 'Ember');
    expect(requests).toHaveLength(0);
    await scrollToFeatured(page, 'SocialLens');
    expect(requests).toHaveLength(0);
    await scrollToFeatured(page, 'IncidentPilot');
    expect(requests).toHaveLength(0);

    await scrollToClinical(page);
    expect(requests).toHaveLength(1);
    await expect(page.getByRole('img', { name: CLINICAL_STAGE })).toBeVisible();

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    await scrollToClinical(page);
    expect(requests).toHaveLength(1);
  });
});

test.describe('A11 — Clinical Reconciliation visual and accessibility', () => {
  test('meets responsive object, height, overflow, and interaction limits', async ({ page }) => {
    const heightLimits: Record<number, number> = {
      320: 460,
      375: 450,
      768: 590,
      1024: 600,
      1440: 600,
    };

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
      await scrollToClinical(page);
      const stage = page.getByRole('img', { name: CLINICAL_STAGE });
      await expect(stage).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);

      const box = await stage.boundingBox();
      expect(box, `stage geometry at ${width}px`).not.toBeNull();
      expect(box!.height, `story height at ${width}px`).toBeLessThanOrEqual(heightLimits[width]);

      const primary = await stage.locator('[data-story-node="primary"]').count();
      expect(primary, `primary objects at ${width}px`).toBe(width < 768 ? 4 : 6);
      await expect(stage).toContainText(/medication comparison.*discrepancy workspace/i);
      await expect(stage).toContainText('value conflict');
      await expect(stage).toContainText('missing field');
      await expect(stage).toContainText(/human review/i);
      await expect(stage).toContainText(/reconciled result/i);

      expect(
        await stage.locator('button, a, input, select, textarea, [tabindex]').count(),
        `focusable controls at ${width}px`
      ).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} preserves comparison, uncertainty, review, and accepted result`, async ({ page }) => {
      const dark = mode.endsWith('dark');
      const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
      await scrollToClinical(page);
      const stage = page.getByRole('img', { name: CLINICAL_STAGE });
      await expect(stage).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('Medication-source records');
      await expect(stage).toContainText(/discrepancy workspace/i);
      await expect(stage).toContainText('Data quality');
      await expect(stage).toContainText(/human review/i);
      await expect(stage).toContainText('Reconciled result');
      if (recruiter) {
        await expect(stage).toContainText('Static system');
        await expect(stage).toContainText('APPROVED');
        await expect(stage).toContainText('ACCEPTED');
      }
    });
  }

  test('reduced motion renders the complete final static story', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToClinical(page);
    const stage = page.getByRole('img', { name: CLINICAL_STAGE });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('value conflict');
    await expect(stage).toContainText('missing field');
    await expect(stage).toContainText('APPROVED');
    await expect(stage).toContainText('ACCEPTED');
    await context.close();
  });
});

test.describe('A11 — Clinical Reconciliation chunk failure', () => {
  test('leaves the explorer card and detail UI usable without inventing a fallback demo', async ({ page }) => {
    await page.route(CLINICAL_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToClinical(page);
    await page.waitForTimeout(500);

    await expect(page.getByRole('img', { name: CLINICAL_STAGE })).toHaveCount(0);
    const explorer = page.locator('#project-explorer');
    const card = explorer.locator('article').filter({ hasText: 'Medication Review Platform' });
    await expect(card.getByRole('heading', { name: 'Clinical Reconciliation', exact: true })).toBeVisible();
    await expect(card).toContainText('Python · FastAPI · React · +3');
    const detail = page.locator('#explorer-detail-clinical-reconciliation');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('full-stack medication reconciliation and data-quality review');
    await expect(detail).toContainText('Reconciles conflicting medication records');
    await expect(detail).toContainText('Python · FastAPI · React · Supabase · PostgreSQL · Docker');
    await expect(detail.getByRole('link', { name: /repository on GitHub/i })).toBeVisible();
    await expect(detail.getByRole('link', { name: /live demo/i })).toBeVisible();
    await expect(detail.locator('[role="img"]')).toHaveCount(0);
  });
});
