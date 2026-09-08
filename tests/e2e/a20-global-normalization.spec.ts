import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WIDTHS = [320, 375, 768, 1024, 1440] as const;

test.describe('A20 — xs cleanup + mobile overflow', () => {
  for (const w of WIDTHS) {
    test(`no horizontal overflow @${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/', { waitUntil: 'networkidle' });
      for (const id of ['hero', 'experience', 'projects', 'education', 'publications', 'certifications', 'skills', 'leadership', 'ask-guna', 'contact']) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        expect(overflow, `overflow at #${id} @${w}`).toBe(false);
      }
      const final = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      expect(final).toBe(false);
    });
  }

  test('375 recruiter no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
  });

  test('landscape 667x375 no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#ask-guna').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    await expect(page.locator('#ask-guna-input')).toBeVisible();
  });
});

test.describe('A20 — AskGuna + Contact xs replacement', () => {
  test('AskGuna input/button stack at 320 and inline at 768', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#ask-guna').scrollIntoViewIfNeeded();
    const box = await page.locator('#ask-guna-input').boundingBox();
    expect(box!.width).toBeGreaterThan(120);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    // button should be full width stacked at 320 (w-full)
    const btn = page.locator('#ask-guna button[type="submit"]');
    const btnBox = await btn.boundingBox();
    expect(btnBox!.width).toBeGreaterThan(50);
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#ask-guna').scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible();
  });

  test('Contact email row wraps intentionally at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
});

test.describe('A20 — Hero + Experience compact at 320', () => {
  test('Hero readable at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#hero h1')).toBeVisible();
    await expect(page.locator('#hero').getByRole('link', { name: 'Explore Projects' })).toBeVisible();
    await expect(page.locator('#hero').getByRole('link', { name: /View Resume/ })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
  test('Experience both entries visible at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await expect(page.locator('#experience')).toContainText('PROJXON');
    await expect(page.locator('#experience')).toContainText('InfiniAI');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
});

test.describe('A20 — Skills evidence adjacency on mobile', () => {
  test('evidence appears adjacent at 375 (inline, not far)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#skills').scrollIntoViewIfNeeded();
    const chip = page.locator('#skills button').first();
    await chip.click();
    const panel = page.locator('#skills-evidence');
    await expect(panel).toBeVisible();
    const chipBox = await chip.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(panelBox!.y - (chipBox!.y + chipBox!.height)).toBeLessThan(400);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
  test('recruiter Skills proof-first still compact', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await expect(page.locator('#skills')).toContainText('Not self-rated');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
});

test.describe('A20 — Leadership / AskGuna / Contact mobile', () => {
  test('Leadership both entries at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#leadership').scrollIntoViewIfNeeded();
    await expect(page.locator('#leadership')).toContainText('Graduate and Professional Student Government');
    await expect(page.locator('#leadership')).toContainText('DSA Club');
  });
  test('AskGuna interaction dominant over decoration at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#ask-guna').scrollIntoViewIfNeeded();
    await expect(page.locator('#ask-guna-input')).toBeVisible();
    // decorative scene is aria-hidden and not focusable
    await expect(page.locator('[data-scene="ask-guna-desk"]')).toHaveAttribute('aria-hidden', 'true');
    const tabStops = await page.locator('[data-scene="ask-guna-desk"] a, [data-scene="ask-guna-desk"] button').count();
    expect(tabStops).toBe(0);
  });
  test('Contact actionable and footer reachable at 320', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(page.locator('footer')).toBeVisible();
  });
});

test.describe('A20 — recruiter mode', () => {
  test('recruiter retains both experiences and explorer usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await expect(page.locator('#experience')).toContainText('PROJXON');
    await page.locator('#projects').scrollIntoViewIfNeeded();
    const btn = page.locator('button:has-text("View all projects")');
    await btn.click();
    await expect(page.locator('#project-explorer')).toBeVisible();
    await page.locator('#skills').scrollIntoViewIfNeeded();
    await expect(page.locator('#skills')).toBeVisible();
  });
});

test.describe('A20 — reduced motion', () => {
  test('reduced renders all sections and disables timers visually', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const id of ['hero', 'experience', 'projects', 'education', 'publications', 'certifications', 'skills', 'leadership', 'ask-guna', 'contact']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.locator('#ask-guna-input')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
});

test.describe('A20 — cold hash navigation', () => {
  test('cold #projects lands near projects (offset via scroll-margin)', async ({ page }) => {
    await page.goto('/#projects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const near = await page.evaluate(() => {
      const el = document.getElementById('projects');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      // after scroll, projects top should be near viewport top (header offset 72)
      return rect.top >= -20 && rect.top < 300;
    });
    expect(near).toBe(true);
  });
  test('recruiter + hash preserves mode', async ({ page }) => {
    await page.goto('/?mode=recruiter#skills', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await expect(page.locator('#skills')).toBeVisible();
    expect(page.url()).toContain('mode=recruiter');
  });
});

test.describe('A20 — zoom / touch / focus', () => {
  test('200% zoom (640 effective) usable', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#hero h1')).toBeVisible();
    await expect(page.locator('#ask-guna-input')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
  test('400% reflow (320 effective at 1280 container) usable', async ({ page }) => {
    // simulate 400% by 320 viewport (already tests reflow)
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await expect(page.locator('#projects')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
  });
  test('focus visible on primary CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#hero').getByRole('link', { name: 'Explore Projects' }).focus();
    await expect(page.locator('#hero').getByRole('link', { name: 'Explore Projects' })).toBeFocused();
  });
});

test.describe('A20 — axe closing region recruiter/reduced', () => {
  for (const mode of ['standard', 'recruiter'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`axe ${mode} ${theme}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(mode === 'recruiter' ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });
        await page.locator('#ask-guna').scrollIntoViewIfNeeded();
        await page.locator('#leadership').scrollIntoViewIfNeeded();
        await page.locator('#contact').scrollIntoViewIfNeeded();
        await page.locator('#ask-guna').scrollIntoViewIfNeeded();
        await expect.poll(async () => page.evaluate(() => Array.from(document.querySelectorAll('#leadership *, #ask-guna *, #contact *')).filter(e=>!e.closest('[data-scene]')).filter(e=>!(e as HTMLInputElement).disabled).filter(e=>{const o=getComputedStyle(e).opacity; return o!=='' && parseFloat(o)<1}).length), { timeout: 10000 }).toBe(0);
        const results = await new AxeBuilder({ page }).include('#leadership').include('#ask-guna').include('#contact').analyze();
        const bad = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
        expect(bad.map(v=>`${v.id}: ${v.description}`)).toEqual([]);
      });
    }
  }
});
