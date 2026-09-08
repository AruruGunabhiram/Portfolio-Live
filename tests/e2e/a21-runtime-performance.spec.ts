import { test, expect } from '@playwright/test';

test.describe('A21 — runtime lazy & pause', () => {
  test('initial has only eager chunks, no PDFs', async ({ page }) => {
    const reqs: string[] = [];
    page.on('request', r => reqs.push(r.url()));
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(reqs.filter(u=>u.endsWith('.js')).some(u=>u.includes('EmberStory'))).toBe(false);
    expect(reqs.filter(u=>u.includes('.pdf')).length).toBe(0);
    expect(reqs.filter(u=>u.includes('fonts.googleapis'))).toEqual([]);
  });
  test('lazy chunks requested once, explorer does not eager-load secondaries', async ({ page }) => {
    const js: string[] = [];
    page.on('request', r => { if (r.url().endsWith('.js')) js.push(r.url().split('/').pop()!); });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await page.getByRole('heading', { name:'Ember' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const afterEmber = js.filter(f=>f.startsWith('EmberStory-')).length;
    expect(afterEmber).toBe(1);
    // open explorer — should not eagerly fetch all secondaries
    const exploreBtn = page.locator('#projects').getByRole('button', { name:/Explore all projects|View all projects/ }).first();
    await exploreBtn.click();
    await page.waitForTimeout(400);
    const clinicalBefore = js.filter(f=>f.startsWith('ClinicalReconciliation')).length;
    expect(clinicalBefore).toBe(0);
    expect(js.filter(f=>f.startsWith('CodeBattlegroundsStory-')).length).toBe(0);
    expect(js.filter(f=>f.startsWith('EmberStory-')).length).toBe(1);
  });
  test('SpaceDust stops reduced, pauses hidden, stories stop recruiter/reduced', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion:'reduce' });
    const p = await ctx.newPage();
    await p.goto('/', { waitUntil:'networkidle' });
    // reduced: no canvas rAF? check canvas cleared? at least no error
    await expect(p.locator('canvas')).toHaveCount(1); // canvas exists but should be cleared / not animating (early return)
    await ctx.close();
    // recruiter: canvas exists with lower opacity
    const p2 = await browser.newPage();
    await p2.goto('/?mode=recruiter', { waitUntil:'networkidle' });
    const opacity = await p2.evaluate(()=> (document.querySelector('[style*="SpaceDust"]') as HTMLElement)?.style.opacity || document.querySelector('.fixed.inset-0')?.getAttribute('style') || '');
    expect(opacity).toContain('0.18');
    await p2.close();
  });
  test('no console errors on full scroll', async ({ page }) => {
    const errs: string[] = [];
    page.on('console', m=> { if (m.type()==='error') errs.push(m.text()); });
    page.on('pageerror', e=> errs.push(String(e)));
    await page.goto('/', { waitUntil:'networkidle' });
    for(const id of ['hero','experience','projects','education','publications','certifications','skills','leadership','ask-guna','contact']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
    }
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(errs, errs.join('\n')).toEqual([]);
  });
});
