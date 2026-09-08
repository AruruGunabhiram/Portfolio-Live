import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';

const INCIDENT_STAGE = /Incident evidence from CI logs/;
const EMBER_STAGE = /durable orchestrator/;
const SOCIAL_STAGE = /idempotent daily snapshots/;
const INCIDENT_CHUNK = '**/assets/IncidentPilotStory-*.js';

function recordStoryJs(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: Request) => {
    const url = request.url();
    if (/\/assets\/(EmberStory|SocialLensStory|IncidentPilotStory)-.*\.js(?:\?|$)/.test(url)) {
      requests.push(url);
    }
  });
  return requests;
}

function storyCounts(requests: string[]) {
  const count = (name: string) => requests.filter(url => url.includes(`/${name}-`)).length;
  return {
    ember: count('EmberStory'),
    sociallens: count('SocialLensStory'),
    incidentpilot: count('IncidentPilotStory'),
  };
}

async function scrollToProject(page: Page, name: string) {
  await page.locator('#projects article[class*="py-7"]').getByRole('heading', { name, exact: true }).scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
}

test.describe('A10 — IncidentPilot lazy network', () => {
  test('loads near the third story exactly once and stays cached on reverse scroll', async ({ page }) => {
    const requests = recordStoryJs(page);
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(storyCounts(requests)).toEqual({ ember: 0, sociallens: 0, incidentpilot: 0 });

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    expect(storyCounts(requests).incidentpilot).toBe(0);

    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(350);
    expect(storyCounts(requests).incidentpilot).toBe(0);

    await scrollToProject(page, 'Ember');
    expect(storyCounts(requests).incidentpilot).toBe(0);

    await scrollToProject(page, 'SocialLens');
    const nearSocial = storyCounts(requests);
    expect(nearSocial.incidentpilot).toBeLessThanOrEqual(1);

    await scrollToProject(page, 'IncidentPilot');
    expect(storyCounts(requests).incidentpilot).toBe(1);
    await expect(page.getByRole('img', { name: INCIDENT_STAGE })).toBeVisible();

    await page.locator('#hero').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await scrollToProject(page, 'IncidentPilot');
    expect(storyCounts(requests).incidentpilot).toBe(1);
  });
});

test.describe('A10 — IncidentPilot visual and accessibility', () => {
  test('meets responsive object, height, overflow, and interaction limits', async ({ page }) => {
    const heightLimits: Record<number, number> = {
      320: 470,
      375: 480,
      768: 600,
      1024: 625,
      1440: 625,
    };

    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
      await scrollToProject(page, 'IncidentPilot');
      const stage = page.getByRole('img', { name: INCIDENT_STAGE });
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
      await expect(stage).toContainText(/grounding.*citation verification/);
      await expect(stage).toContainText(/human approval/i);
      await expect(stage).toContainText('GitHub dry-run');

      expect(
        await stage.locator('button, a, input, select, textarea, [tabindex]').count(),
        `focusable controls at ${width}px`
      ).toBe(0);
      expect(await stage.locator('[aria-live], [role="status"], [role="alert"]').count()).toBe(0);
    }
  });

  for (const mode of ['standard-light', 'standard-dark', 'recruiter-light', 'recruiter-dark'] as const) {
    test(`${mode} preserves the complete evidence-to-dry-run architecture`, async ({ page }) => {
      const dark = mode.endsWith('dark');
      const recruiter = mode.startsWith('recruiter');
      await page.addInitScript(theme => localStorage.setItem('portfolio-theme', theme), dark ? 'dark' : 'light');
      await page.goto(recruiter ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
      await scrollToProject(page, 'IncidentPilot');
      const stage = page.getByRole('img', { name: INCIDENT_STAGE });
      await expect(stage).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('data-theme', dark ? 'dark' : 'light');
      await expect(stage).toContainText('Failure evidence');
      await expect(stage).toContainText('cited file');
      await expect(stage).toContainText('Deterministic safety');
      await expect(stage).toContainText(/human approval/i);
      await expect(stage).toContainText('GitHub dry-run');
      if (recruiter) await expect(stage).toContainText('Static system');
    });
  }

  test('reduced motion renders the final static story', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToProject(page, 'IncidentPilot');
    const stage = page.getByRole('img', { name: INCIDENT_STAGE });
    await expect(stage).toBeVisible();
    await expect(stage).toContainText('Static system');
    await expect(stage).toContainText('grounded ✓');
    await expect(stage).toContainText('APPROVED');
    await expect(stage).toContainText('DRY-RUN READY');
    await context.close();
  });
});

test.describe('A10 — IncidentPilot chunk failure', () => {
  test('leaves all project content and the other visual worlds usable', async ({ page }) => {
    await page.route(INCIDENT_CHUNK, route => route.abort());
    await page.goto('/', { waitUntil: 'networkidle' });
    await scrollToProject(page, 'IncidentPilot');
    await page.waitForTimeout(700);

    await expect(page.getByRole('img', { name: INCIDENT_STAGE })).toHaveCount(0);
    const card = page.locator('#projects article').filter({ hasText: 'Approval-Gated Incident Investigator' });
    await expect(card.getByRole('heading', { name: 'IncidentPilot', exact: true })).toBeVisible();
    await expect(card).toContainText('approval-gated incident investigation assistant');
    await expect(card).toContainText('Sequential investigation workflow');
    await expect(card).toContainText('Python · FastAPI · Pydantic · Gemini API · Pytest');
    await expect(card.locator('a[href="https://github.com/AruruGunabhiram/IncidentPilot"]')).toBeVisible();

    const toggle = page.locator('button[aria-controls="featured-detail-incidentpilot"]');
    await toggle.click();
    await expect(page.locator('#featured-detail-incidentpilot')).toBeVisible();

    await page.locator('button[aria-controls="project-explorer"]').click();
    await expect(page.locator('#project-explorer')).toBeVisible();
    await expect(page.locator('#project-explorer')).toContainText('8 projects');

    await scrollToProject(page, 'SocialLens');
    await expect(page.getByRole('img', { name: SOCIAL_STAGE })).toBeVisible();
    await scrollToProject(page, 'Ember');
    await expect(page.getByRole('img', { name: EMBER_STAGE })).toBeVisible();
  });
});
