import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PANEL = '#skills-evidence';

async function gotoSkills(page: Page, search = '') {
  await page.goto(`/${search}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#skills')?.scrollIntoView());
  await page.waitForTimeout(400);
}

const chip = (page: Page, name: string) =>
  page
    .locator('#skills button')
    // skill names contain regex metacharacters, e.g. "Design Patterns (Strategy, Factory)"
    .filter({ hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })
    .first();

async function select(page: Page, name: string) {
  const button = chip(page, name);
  await button.click();
  await expect(page.locator(PANEL)).toBeVisible();
  // the panel is keyed by skill id, so wait for it to actually carry this selection
  // rather than racing the remount that follows the click
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(PANEL)).toContainText(name);
}

test.describe('A18 — Skills / evidence linking', () => {
  // ── evidence content, one panel, canonical labels ────────────────────────
  test('a multi-source skill shows its evidence with quiet source types', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Python');
    const panel = page.locator(PANEL);
    await expect(panel).toContainText('4 linked sources');
    await expect(panel.locator('.skill-evidence__row')).toHaveCount(4);
    // canonical order: the experience reference comes first in skills.ts
    await expect(panel.locator('.skill-evidence__row').first()).toContainText('InfiniAI');
    await expect(panel).toContainText('Ember');
    await expect(panel).toContainText('IncidentPilot');
    await expect(panel).toContainText('Clinical Reconciliation');
    // exactly one panel exists on the page at any time
    await expect(page.locator(PANEL)).toHaveCount(1);
  });

  test('a single-source skill is pluralised correctly', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Docker');
    await expect(page.locator(PANEL)).toContainText('1 linked source');
    await expect(page.locator(PANEL).locator('.skill-evidence__row')).toHaveCount(1);
  });

  test('a zero-evidence skill stays honest and shows no fabricated proof', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Git');
    const panel = page.locator(PANEL);
    await expect(panel).toContainText('No linked portfolio evidence yet');
    await expect(panel.locator('.skill-evidence__row')).toHaveCount(0);
  });

  test('design-patterns gains no invented evidence (A7B regression guard)', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Design Patterns (Strategy, Factory)');
    const panel = page.locator(PANEL);
    await expect(panel).toContainText('No linked portfolio evidence yet');
    await expect(panel).not.toContainText('Zenco');
  });

  // ── §41: navigation for every source type ────────────────────────────────
  const NAV: Array<[skill: string, evidence: string, target: string]> = [
    ['Java', 'SocialLens', '#projects'],
    ['Flask', 'InfiniAI', '#experience'],
    ['Explainable AI', 'IEEE', '#publications'],
    ['AWS', 'AWS Certified Solutions Architect', '#certifications'],
    ['DSA', 'DSA Club', '#leadership'],
  ];

  for (const [skill, evidence, target] of NAV) {
    test(`${skill} evidence navigates to ${target}`, async ({ page }) => {
      await gotoSkills(page);
      await select(page, skill);
      const link = page.locator(`${PANEL} a`).filter({ hasText: evidence }).first();
      await expect(link).toHaveAttribute('href', target);
      await link.click();
      // assert the destination section is on screen, not an exact scroll offset
      const section = page.locator(target);
      await expect(section).toBeInViewport({ timeout: 5000 });
    });
  }

  // ── mobile ───────────────────────────────────────────────────────────────
  test('at 375 the evidence appears beside the tapped skill, not far down the page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSkills(page);
    await select(page, 'Python');
    const gap = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('#skills button')).find(
        b => b.textContent?.trim() === 'Python'
      )!;
      const panel = document.querySelector('#skills-evidence')!;
      return Math.round(panel.getBoundingClientRect().top - btn.getBoundingClientRect().bottom);
    });
    // before A18 this was ~960px — the panel sat below the entire skill list
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(200);
  });

  test('mobile expands one skill at a time', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoSkills(page);
    await select(page, 'Python');
    await expect(page.locator(PANEL)).toHaveCount(1);
    await select(page, 'AWS');
    await expect(page.locator(PANEL)).toHaveCount(1);
    await expect(page.locator(PANEL)).toContainText('AWS Certified Solutions Architect');
    await expect(chip(page, 'Python')).toHaveAttribute('aria-expanded', 'false');
  });

  test('no horizontal overflow at 320 with evidence expanded', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await gotoSkills(page);
    await select(page, 'Explainable AI');
    const over = await page.evaluate(() => {
      const d = document.documentElement;
      return d.scrollWidth - d.clientWidth;
    });
    expect(over).toBeLessThanOrEqual(0);
  });

  // ── keyboard / focus ─────────────────────────────────────────────────────
  test('skills are operable by keyboard with a visible focus ring', async ({ page }) => {
    await gotoSkills(page);
    const python = chip(page, 'Python');
    await python.focus();
    await expect(python).toBeFocused();
    await expect(python).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('Enter');
    await expect(python).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(PANEL)).toContainText('4 linked sources');

    // Space collapses it again
    await page.keyboard.press(' ');
    await expect(python).toHaveAttribute('aria-expanded', 'false');

    const outline = await python.evaluate(el => getComputedStyle(el).outlineWidth);
    expect(outline).not.toBe('0px');
  });

  test('aria-controls points at the panel that actually exists', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Python');
    const controls = await chip(page, 'Python').getAttribute('aria-controls');
    expect(controls).toBe('skills-evidence');
    await expect(page.locator(`#${controls}`)).toHaveCount(1);
  });

  test('evidence needs no hover — a plain click is enough', async ({ page }) => {
    await gotoSkills(page);
    await chip(page, 'React').dispatchEvent('click');
    await expect(page.locator(PANEL)).toContainText('3 linked sources');
  });

  // ── recruiter + reduced motion ───────────────────────────────────────────
  test('recruiter mode shows evidence without interaction and no scores', async ({ page }) => {
    await gotoSkills(page, '?mode=recruiter');
    const skills = page.locator('#skills');
    await expect(skills).toContainText('Python');
    await expect(skills).toContainText('Ember');
    expect(await skills.textContent()).not.toMatch(/\d+\s?%/);
    expect(await skills.textContent()).not.toMatch(/\b(Expert|Advanced|Intermediate)\b/);
  });

  test('reduced motion keeps the evidence interaction fully usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoSkills(page);
    await select(page, 'Python');
    await expect(page.locator(PANEL)).toContainText('4 linked sources');
    await expect(page.locator(PANEL).locator('.skill-evidence__row')).toHaveCount(4);
  });

  // ── neighbours unchanged ─────────────────────────────────────────────────
  test('Skills does not pin scroll — the next section stays reachable', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'Python');
    await page.locator('#leadership').scrollIntoViewIfNeeded();
    await expect(page.locator('#leadership')).toBeInViewport();
  });

  test('no score, exam code or validation number anywhere in Skills', async ({ page }) => {
    await gotoSkills(page);
    await select(page, 'AWS');
    const html = (await page.locator('#skills').innerHTML()).toLowerCase();
    expect(html).not.toContain('915');
    expect(html).not.toContain('saa-c03');
    expect(html).not.toContain('validation');
  });

  // ── §43: focused axe across the mode/theme matrix ────────────────────────
  for (const mode of ['standard', 'recruiter'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`axe — Skills ${mode} ${theme}: no critical or serious violations`, async ({ page }) => {
        // drive the app's own theme resolution rather than forcing the attribute,
        // which would desync ThemeContext from the CSS custom properties
        await page.emulateMedia({ colorScheme: theme });
        await gotoSkills(page, mode === 'recruiter' ? '?mode=recruiter' : '');
        if (mode === 'standard') await select(page, 'Python');
        // axe blends colours against whatever is painted, so a half-finished fade
        // reports contrast failures that do not exist in the settled state
        await expect
          .poll(
            () =>
              page.evaluate(
                () =>
                  Array.from(document.querySelectorAll('#skills *')).filter(e => {
                    const o = getComputedStyle(e).opacity;
                    return o !== '' && parseFloat(o) < 1;
                  }).length
              ),
            { timeout: 6000 }
          )
          .toBe(0);

        const results = await new AxeBuilder({ page }).include('#skills').analyze();
        const bad = results.violations.filter(
          v => v.impact === 'critical' || v.impact === 'serious'
        );
        expect(bad.map(v => `${v.id}: ${v.description}`)).toEqual([]);
      });
    }
  }
});
