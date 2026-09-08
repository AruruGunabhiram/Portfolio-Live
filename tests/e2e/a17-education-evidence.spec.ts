import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const WIDTHS = [320, 375, 768, 1024, 1440] as const;

async function gotoHome(page: Page, opts: { recruiter?: boolean; theme?: 'light' | 'dark' } = {}) {
  await page.goto(opts.recruiter ? '/?mode=recruiter' : '/');
  if (opts.theme) {
    await page.evaluate(t => {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    }, opts.theme);
  }
  await page.waitForLoadState('networkidle');
}

async function scrollThrough(page: Page) {
  // walk the page so every whileInView reveal fires
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

async function sectionBox(page: Page, id: string) {
  return page.locator(`#${id}`).boundingBox();
}

test.describe('A17 — Education / Publications / Certifications', () => {
  test('canonical academic + publication facts render, no invented credential', async ({ page }) => {
    await gotoHome(page);
    await scrollThrough(page);

    const edu = page.locator('#education');
    await expect(edu).toBeVisible();
    await expect(edu.getByRole('heading', { name: 'Education', level: 2 })).toBeVisible();
    await expect(edu.getByText('University of Colorado Boulder')).toBeVisible();
    await expect(edu.locator('article').getByText('MS Computer Science')).toBeVisible();
    await expect(edu.getByText('Aug 2025 – May 2027')).toBeVisible();

    const pub = page.locator('#publications');
    await expect(pub.getByRole('heading', { name: 'Publications', level: 2 })).toBeVisible();
    await expect(pub.getByText('IEEE')).toBeVisible();

    const cert = page.locator('#certifications');
    await expect(cert).toBeVisible();
    await expect(cert.getByRole('heading', { name: 'Certifications', level: 2 })).toBeVisible();
    await expect(cert.getByText('AWS Certified Solutions Architect - Associate')).toBeVisible();
    await expect(cert.getByText('Amazon Web Services (AWS)')).toBeVisible();
    await expect(cert.getByText('2026', { exact: true })).toBeVisible();
    await expect(cert.getByText('Issued August 30, 2026. Valid through August 30, 2029.')).toBeVisible();

    // the certificate prints no exam code and the score is private
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('saa-c03');
    expect(body).not.toContain('915');
    expect(body).not.toContain('/1000');
    const html = (await page.content()).toLowerCase();
    expect(html).not.toContain('ea628dde');
    expect(html).not.toContain('aws.amazon.com/verification');
    expect(html).not.toContain('verify credential');
  });

  test('certificate link opens the real public artifact and it is served', async ({ page, request }) => {
    await gotoHome(page);
    await scrollThrough(page);

    // A18 added a second, issuer-hosted verification link alongside the local artifact
    await expect(page.locator('#certifications a')).toHaveCount(2);
    const link = page.locator('#certifications a').filter({ hasText: 'View certificate' });
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    expect(href).toBe('/AWS%20Certified%20Solutions%20Architect%20-%20Associate%20certificate.pdf');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    // the anchor is keyboard reachable
    await link.focus();
    await expect(link).toBeFocused();

    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');
    const body = await res.body();
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
    expect(body.length).toBeGreaterThan(1000);
  });

  test('education chronology visual shows real years only, and is compact', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoHome(page);
    await scrollThrough(page);

    const chrono = page.locator('.edu-chrono');
    await expect(chrono).toBeVisible();
    const years = await chrono.locator('.edu-chrono__years span').allInnerTexts();
    expect(years).toEqual(['2021', '2025', '2025', '2027']);

    // in-progress marker is chronology, not a percentage
    await expect(chrono.locator('.edu-chrono__state')).toHaveText('in progress');
    expect(await chrono.locator('.edu-chrono__degree').allInnerTexts()).toEqual(['BS', 'MS']);
    const text = await chrono.innerText();
    expect(text).not.toMatch(/\d+%/);

    const box = await chrono.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThan(260);
  });

  test('publication reads as document evidence, certification frame absent while data is empty', async ({ page }) => {
    await gotoHome(page);
    await scrollThrough(page);
    await expect(page.locator('.pub-doc')).toHaveCount(1);
    await expect(page.locator('.pub-doc__sheet')).toHaveCount(3);
    await expect(page.locator('.cert-proof')).toHaveCount(1);
    await expect(page.locator('.cert-proof__corner')).toHaveCount(4);
    await expect(page.locator('.cert-proof')).toHaveAttribute('aria-hidden', 'true');
    // abstract geometry only — the proof visual states nothing itself
    expect((await page.locator('.cert-proof').innerText()).trim()).toBe('');
  });

  test('sections stay connected via the shared evidence sequence', async ({ page }) => {
    await gotoHome(page);
    await scrollThrough(page);
    const seq = page.locator('.evidence-seq');
    await expect(seq).toHaveCount(3); // education + publications + certifications
    await expect(page.locator('#education .evidence-seq .evidence-seq__dot[data-on]')).toHaveCount(1);
    await expect(page.locator('#publications .evidence-seq .evidence-seq__dot[data-on]')).toHaveCount(2);
    await expect(page.locator('#certifications .evidence-seq .evidence-seq__dot[data-on]')).toHaveCount(3);
  });

  test('recruiter mode is static across the evidence region', async ({ page }) => {
    await gotoHome(page, { recruiter: true });
    await scrollThrough(page);
    await expect(page.locator('.evidence-seq')).toHaveCount(0);
    await expect(page.locator('.pub-doc')).toHaveCount(0);
    await expect(page.locator('.cert-proof')).toHaveCount(0);
    await expect(page.locator('.edu-chrono')).toHaveCount(0);
    // proof still scannable
    await expect(page.locator('#education').getByText('University of Colorado Boulder')).toBeVisible();
    await expect(page.locator('#publications').getByText('IEEE')).toBeVisible();
    await expect(
      page.locator('#certifications').getByText('AWS Certified Solutions Architect - Associate')
    ).toBeVisible();
    await expect(
      page.locator('#certifications a').filter({ hasText: 'View certificate' })
    ).toHaveCount(1);
    await expect(
      page.locator('#certifications a').filter({ hasText: 'Verify with issuer' })
    ).toHaveCount(1);
  });

  test('reduced motion renders the complete final state', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHome(page);
    await scrollThrough(page);

    const chrono = page.locator('.edu-chrono');
    await expect(chrono).toBeVisible();
    await expect(chrono.locator('.edu-chrono__years span').first()).toBeVisible();
    await expect(page.locator('.pub-doc__sheet--front')).toBeVisible();
    await expect(page.locator('#education article').getByText('MS Computer Science')).toBeVisible();
    await expect(page.locator('.cert-proof')).toBeVisible();
    await expect(
      page.locator('#certifications').getByText('AWS Certified Solutions Architect - Associate')
    ).toBeVisible();

    // no element left invisible waiting on an animation
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.edu-chrono *, .pub-doc *, .cert-proof *')).filter(
        el => parseFloat(getComputedStyle(el).opacity) === 0
      ).length
    );
    expect(hidden).toBe(0);
  });

  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoHome(page);
      await scrollThrough(page);

      const overflow = await page.evaluate(
        w => ({ scrollW: document.documentElement.scrollWidth, client: w }),
        width
      );
      expect(overflow.scrollW).toBeLessThanOrEqual(overflow.client + 1);

      for (const id of ['education', 'publications', 'certifications']) {
        const box = await sectionBox(page, id);
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(-1);
        expect(box!.width).toBeLessThanOrEqual(width + 1);
      }
    });
  }

  test('evidence region is quieter than Projects and Skills stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoHome(page);
    await scrollThrough(page);

    const projects = await sectionBox(page, 'projects');
    const edu = await sectionBox(page, 'education');
    const pub = await sectionBox(page, 'publications');
    const cert = await sectionBox(page, 'certifications');
    expect(projects).not.toBeNull();
    expect(edu).not.toBeNull();
    expect(pub).not.toBeNull();
    expect(cert).not.toBeNull();

    // intensity reduction: each evidence section is far shorter than the Projects world
    expect(edu!.height).toBeLessThan(projects!.height);
    expect(pub!.height).toBeLessThan(projects!.height);
    expect(cert!.height).toBeLessThan(projects!.height);
    // and none exceeds a screen on its own
    expect(edu!.height).toBeLessThan(900);
    expect(cert!.height).toBeLessThan(900);

    // Skills still follows the evidence region
    await expect(page.locator('#skills')).toHaveCount(1);
    const skills = await sectionBox(page, 'skills');
    expect(skills!.y).toBeGreaterThan(cert!.y);
  });

  test('evidence visuals add no tab stops', async ({ page }) => {
    await gotoHome(page);
    await scrollThrough(page);
    const focusables = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.edu-chrono, .pub-doc, .cert-proof, .evidence-seq, .edu-boundary')).reduce(
        (n, el) => n + el.querySelectorAll('a, button, input, select, textarea, [tabindex]').length,
        0
      )
    );
    expect(focusables).toBe(0);
    await expect(
      page.locator('#education [aria-live], #publications [aria-live], #certifications [aria-live]')
    ).toHaveCount(0);
  });
});
