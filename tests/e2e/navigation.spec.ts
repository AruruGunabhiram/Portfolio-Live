import { test, expect } from '@playwright/test';

const NAV_IDS = ['experience', 'projects', 'education', 'publications', 'skills', 'leadership', 'contact'];

test.describe('21M / 21O — Header navigation + skip link', () => {
  test('desktop anchors have correct href and target exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // desktop nav only visible on md+
    await page.setViewportSize({ width: 1024, height: 800 });
    for (const id of NAV_IDS) {
      const link = page.locator(`nav[aria-label="Primary"] a[href="#${id}"]`);
      await expect(link, `nav link #${id} exists`).toHaveCount(1);
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('clicking nav changes hash and section visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.click('nav[aria-label="Primary"] a[href="#projects"]');
    await expect(page).toHaveURL(/#projects/);
    await expect(page.locator('#projects')).toBeVisible();
  });

  test('hash + recruiter query — 21BC', async ({ page }) => {
    await page.goto('/?mode=recruiter#projects', { waitUntil: 'networkidle' });
    await expect(page.locator('#projects')).toBeVisible();
    // recruiter mode should be active
    await expect(page.locator('button[aria-pressed="true"]', { hasText: /Standard view/ })).toBeVisible();
  });

  test('skip link reaches main-content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // first Tab should focus skip link
    await page.keyboard.press('Tab');
    const skip = page.locator('a[href="#main-content"]');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });
});

test.describe('21N — Mobile menu', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('open, focus, Escape, click, resize', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('button[aria-controls="mobile-nav"]');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // 1. open
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = page.locator('#mobile-nav');
    await expect(mobileNav).toBeVisible();

    // 2. first link receives focus (within 100ms)
    const firstLink = mobileNav.locator('a, button').first();
    await expect(firstLink).toBeFocused({ timeout: 2000 });

    // 3. Escape closes and returns focus to trigger
    await page.keyboard.press('Escape');
    await expect(mobileNav).toBeHidden();
    await expect(toggle).toBeFocused();

    // 4. reopen and click Projects
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    const projLink = mobileNav.locator('a[href="#projects"]').first();
    await projLink.click();
    await expect(mobileNav).toBeHidden();
    await expect(page).toHaveURL(/#projects/);

    // 5. resize to desktop closes menu (if open again)
    await toggle.click();
    await expect(mobileNav).toBeVisible();
    await page.setViewportSize({ width: 1024, height: 800 });
    // media query listener closes
    await expect(mobileNav).toBeHidden({ timeout: 2000 });
  });
});
