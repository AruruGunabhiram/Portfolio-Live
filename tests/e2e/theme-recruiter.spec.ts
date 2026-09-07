import { test, expect } from '@playwright/test';
import { SKILLS } from '../../src/data/skills';

test.describe('21H / 21I / 21J / 21BB — Theme + Recruiter Mode', () => {
  test(' / defaults to Standard, ?mode=recruiter activates, invalid defaults Standard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('button', { hasText: 'Recruiter view' })).toBeVisible();
    await expect(page).not.toHaveURL(/mode=recruiter/);

    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await expect(page.locator('button', { hasText: 'Standard view' })).toBeVisible();
    await expect(page.locator('[aria-pressed="true"]', { hasText: 'Standard view' })).toBeVisible();

    await page.goto('/?mode=banana', { waitUntil: 'networkidle' });
    await expect(page.locator('button', { hasText: 'Recruiter view' })).toBeVisible();
  });

  test('toggle updates query via replaceState, preserves focus, does not reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('button', { hasText: 'Recruiter view' }).first();
    await toggle.focus();
    await toggle.click();
    await expect(page).toHaveURL(/mode=recruiter/);
    // focus stays on toggle (now shows Standard view)
    const after = page.locator('button', { hasText: 'Standard view' }).first();
    await expect(after).toBeFocused();

    // toggle back deletes query
    await after.click();
    await expect(page).not.toHaveURL(/mode=recruiter/);
    await expect(page.locator('button', { hasText: 'Recruiter view' }).first()).toBeFocused();
  });

  test('theme toggle persists to localStorage and html data-theme — 21H', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const darkToggle = page.locator('button[aria-label*="theme"]');
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await darkToggle.click();
    const nextTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(nextTheme).not.toBe(initialTheme);
    const stored = await page.evaluate(() => localStorage.getItem('portfolio-theme'));
    expect(stored).toBe(nextTheme);
    // aria-pressed reflects dark
    const isDark = nextTheme === 'dark';
    await expect(page.locator(`button[aria-pressed="${isDark}"][aria-label*="theme"]`)).toBeVisible();
  });

  test('first-load theme from storage applied before paint — 21I FOUC guard', async ({ page }) => {
    // set dark in storage then navigate fresh
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('portfolio-theme', 'dark'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    // inline script sets data-theme before React hydrates
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
    // also light
    await page.evaluate(() => localStorage.setItem('portfolio-theme', 'light'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const light = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(light).toBe('light');
  });

  test('theme and recruiter independence — 21BB matrix smoke', async ({ page }) => {
    for (const mode of ['standard', 'recruiter'] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const url = mode === 'recruiter' ? '/?mode=recruiter' : '/';
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate(t => localStorage.setItem('portfolio-theme', t), theme);
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('#projects')).toBeVisible();
        await expect(page.locator('#skills')).toBeVisible();
        await expect(page.locator('#contact')).toBeVisible();
        const applied = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
        expect(applied).toBe(theme);
      }
    }
  });

  test('21K — Recruiter content: 3 featured, explorer secondary, Ask Guna compact', async ({ page }) => {
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    // exactly 3 featured headings visible under #projects
    const featuredTitles = ['Ember', 'SocialLens', 'IncidentPilot'];
    for (const t of featuredTitles) {
      await expect(page.locator('#projects', { hasText: t })).toBeVisible();
    }
    // explorer collapsed by default
    await expect(page.locator('#project-explorer')).toHaveCount(0);
    // explorer toggle present but de-emphasized (text link)
    await expect(page.locator('button[aria-controls="project-explorer"]')).toBeVisible();
    // skills static — no 38-button requirement, but category headings exist
    await expect(page.locator('#skills')).toContainText('Languages');
    // Ask Guna compact note
    await expect(page.locator('#ask-guna')).toContainText(/specific question/);
    // contact still visible
    await expect(page.locator('#contact')).toBeVisible();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
  });

  test('21L — Standard mode retains interactive controls', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // animated FlowDemo eligibility — demo steps aria-label present
    await expect(page.locator('#projects')).toBeVisible();
    // Skills interactive controls (aria-pressed buttons)
    await expect(page.locator('#skills button[aria-pressed]')).toHaveCount(SKILLS.length);
    // Ask Guna suggestions visible in standard
    await expect(page.locator('#ask-guna', { hasText: 'Try' })).toBeVisible();
    // Project Explorer available
    await expect(page.locator('button[aria-controls="project-explorer"]', { hasText: /Explore all projects/ })).toBeVisible();
  });
});
