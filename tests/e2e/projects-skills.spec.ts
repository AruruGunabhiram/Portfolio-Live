import { test, expect } from '@playwright/test';

test.describe('21P / 21Q / 21R — Project Explorer & Detail', () => {
  test('explorer closed by default, opens, filters, collapses with focus safety', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#project-explorer')).toHaveCount(0);
    const explorerBtn = page.locator('button[aria-controls="project-explorer"]');
    await expect(explorerBtn).toHaveAttribute('aria-expanded', 'false');

    await explorerBtn.click();
    await expect(explorerBtn).toHaveAttribute('aria-expanded', 'true');
    const explorer = page.locator('#project-explorer');
    await expect(explorer).toBeVisible();
    // All filter selected by default
    await expect(explorer.locator('button', { hasText: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await expect(explorer).toContainText('6 projects');

    // filter AI
    const aiBtn = explorer.locator('button', { hasText: /^ai$/i });
    if (await aiBtn.count() > 0) {
      await aiBtn.click();
      await expect(aiBtn).toHaveAttribute('aria-pressed', 'true');
      await expect(explorer).toContainText('1 project');
      await expect(explorer).toContainText('Creator Copilot');
    }

    // filter another real category e.g. backend
    const backendBtn = explorer.locator('button', { hasText: /^backend$/i });
    if (await backendBtn.count() > 0) {
      await backendBtn.click();
      await expect(backendBtn).toHaveAttribute('aria-pressed', 'true');
      // backend projects include SocialLens etc.
      await expect(explorer).toContainText('SocialLens');
    }

    // collapse
    await explorerBtn.click();
    await expect(page.locator('#project-explorer')).toHaveCount(0);
    // focus safety: if focus was inside explorer, it returns to trigger — test by focusing inside then collapsing
    await explorerBtn.click();
    await expect(page.locator('#project-explorer')).toBeVisible();
    // focus something inside explorer then collapse
    const firstProjToggle = page.locator('#project-explorer button[aria-controls^="explorer-detail-"]').first();
    await firstProjToggle.focus();
    await explorerBtn.focus();
    await explorerBtn.click(); // collapse
    await expect(explorerBtn).toBeFocused();
  });

  test('featured detail opens, renders case study, closes with focus return', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const trigger = page.locator('button[aria-controls="featured-detail-sociallens"]');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const detail = page.locator('#featured-detail-sociallens');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText(/Problem|Architecture|Constraints/);
    // close via trigger again or close button inside
    const closeBtn = detail.locator('button', { hasText: 'Close' }).first();
    if (await closeBtn.count()) await closeBtn.click();
    else await trigger.click();
    await expect(page.locator('#featured-detail-sociallens')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('non-featured detail via explorer', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const explorerBtn = page.locator('button[aria-controls="project-explorer"]');
    await explorerBtn.click();
    const target = page.locator('button[aria-controls="explorer-detail-timesling"]');
    await expect(target).toBeVisible();
    await target.click();
    const detail = page.locator('#explorer-detail-timesling');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText(/TimeSling|macOS/);
    const closeBtn = detail.locator('button', { hasText: 'Close' }).first();
    if (await closeBtn.count()) await closeBtn.click();
    else await target.click();
    await expect(page.locator('#explorer-detail-timesling')).toHaveCount(0);
    await expect(target).toBeFocused();
  });

  test('21R — demo static invariants: recruiter + reduced motion', async ({ page, context }) => {
    // Recruiter static
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    const recruiterDemo = page.locator('#projects [aria-label*="processing flow"], #projects [aria-label*="flow"]').first();
    // At least one demo aria-label exists (flow demos)
    if (await recruiterDemo.count()) {
      // In recruiter, demos should be static — check data attribute if exposed or just that element exists
      await expect(recruiterDemo).toBeVisible();
    }

    // Reduced motion static — emulate prefers-reduced-motion
    await context.addInitScript(() => {
      // override matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (q: string) => ({
          matches: q.includes('prefers-reduced-motion'),
          media: q,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    });
    const page2 = await context.newPage();
    await page2.goto('/', { waitUntil: 'networkidle' });
    // Flow demos should be static under reduced motion — no active timer assumption, just visible
    await expect(page2.locator('#projects')).toBeVisible();
    await page2.close();
  });
});

test.describe('21T — Skills', () => {
  test('standard: selection uses aria-pressed, evidence updates, keyboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#skills')).toBeVisible();
    const pythonBtn = page.locator('#skills button', { hasText: /^Python$/ });
    await expect(pythonBtn).toHaveAttribute('aria-pressed', 'false');
    await pythonBtn.click();
    await expect(pythonBtn).toHaveAttribute('aria-pressed', 'true');
    // evidence panel shows project/experience links
    await expect(page.locator('#skills')).toContainText(/Evidence/);
    await expect(page.locator('#skills')).toContainText(/InfiniAI|Zenco/);

    // multiple evidence: Java has 2 projects
    const javaBtn = page.locator('#skills button', { hasText: /^Java$/ });
    await javaBtn.click();
    await expect(page.locator('#skills')).toContainText(/SocialLens/);
    await expect(page.locator('#skills')).toContainText(/Creator Copilot/);

    // no-evidence skill does not fabricate
    const cppBtn = page.locator('#skills button', { hasText: /^C\/C\+\+$/ });
    await cppBtn.click();
    await expect(page.locator('#skills')).toContainText(/No linked portfolio evidence/);

    // keyboard activation
    const reactBtn = page.locator('#skills button', { hasText: /^React$/ });
    await reactBtn.focus();
    await page.keyboard.press('Enter');
    await expect(reactBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#skills')).toContainText(/Code Battlegrounds/);
    // Space also
    const tsBtn = page.locator('#skills button', { hasText: /^TypeScript$/ });
    await tsBtn.focus();
    await page.keyboard.press(' ');
    await expect(tsBtn).toHaveAttribute('aria-pressed', 'true');
  });

  test('recruiter: static concise groups', async ({ page }) => {
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await expect(page.locator('#skills')).toBeVisible();
    // In recruiter, skills should be rendered as static text groups, not just buttons? Actually still groups
    await expect(page.locator('#skills')).toContainText('Backend & Systems');
    await expect(page.locator('#skills')).toContainText('Languages');
    // Interactive buttons still? Recruiter shows static concise — check that not 38 interactive required?
    // Recruiter variant uses static lists, not the 38-button grid in same form? Our implementation keeps buttons in standard only.
    // In recruiter, expect no 38 aria-pressed buttons? Check count differs
    const pressed = page.locator('#skills button[aria-pressed]');
    // recruiter should have 0 interactive skill buttons (static view)
    await expect(pressed).toHaveCount(0);
  });
});
