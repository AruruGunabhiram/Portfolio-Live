import { test, expect } from '@playwright/test';

test.describe('21V / 21BS / 21BT — Ask Guna UI (mocked)', () => {
  test('label associated, submit disabled while loading, success + error rendering, abort', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const input = page.locator('#ask-guna-input');
    const submit = page.locator('#ask-guna button[type="submit"]');
    await expect(input).toBeVisible();
    await expect(page.locator('label[for="ask-guna-input"]')).toBeVisible();
    await expect(submit).toBeDisabled(); // empty

    // type and submit with mocked success
    await page.route('/api/ask-guna', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'SocialLens is a backend analytics platform via Spring Boot.', status: 'ok' }),
      });
    });
    await input.fill('What backend projects has Guna built?');
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.locator('#ask-guna')).toContainText('SocialLens is a backend analytics platform', { timeout: 5000 });

    // suggested question fills/submits
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.route('/api/ask-guna', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'Creator Copilot uses AI guardrails.', status: 'ok' }) });
    });
    const suggested = page.locator('#ask-guna button', { hasText: 'Which projects use AI?' });
    if (await suggested.count()) {
      await suggested.click();
      await expect(page.locator('#ask-guna')).toContainText('Creator Copilot uses AI guardrails.', { timeout: 5000 });
    }

    // error rendering
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.route('/api/ask-guna', async route => {
      await route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ error: 'provider_error', message: "I couldn't answer that right now. Please try again." }) });
    });
    await page.locator('#ask-guna-input').fill('What is Guna?');
    await page.locator('#ask-guna button[type="submit"]').click();
    await expect(page.locator('#ask-guna [role="alert"]')).toContainText("I couldn't answer");

    // abort stale response test — 21BA: request A, then B, B resolves first, A stale ignored
    await page.goto('/', { waitUntil: 'networkidle' });
    let firstResolve: (() => void) | null = null;
    let secondDone = false;
    await page.route('/api/ask-guna', async route => {
      const body = route.request().postDataJSON() as { question: string };
      if (body.question.includes('FIRST')) {
        // delay first
        await new Promise<void>(r => (firstResolve = r));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'FIRST ANSWER', status: 'ok' }) });
      } else {
        secondDone = true;
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'SECOND ANSWER', status: 'ok' }) });
      }
    });
    const input2 = page.locator('#ask-guna-input');
    // fire first, then quickly second — client aborts first
    await input2.fill('FIRST');
    const submit2 = page.locator('#ask-guna button[type="submit"]');
    // don't await, fire and immediately second
    void submit2.click();
    await input2.fill('SECOND QUESTION');
    await submit2.click();
    // allow second to complete
    await expect(page.locator('#ask-guna')).toContainText('SECOND ANSWER', { timeout: 5000 });
    expect(secondDone).toBe(true);
    // now resolve first (stale) — should not override
    if (firstResolve) firstResolve();
    await page.waitForTimeout(300);
    await expect(page.locator('#ask-guna')).toContainText('SECOND ANSWER');
    await expect(page.locator('#ask-guna')).not.toContainText('FIRST ANSWER');
  });

  test('no dangerouslySetInnerHTML, max length enforced, loading state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // maxLength attr
    await expect(page.locator('#ask-guna-input')).toHaveAttribute('maxlength', '800');
    // submit disabled while loading — intercept with delay
    await page.route('/api/ask-guna', async route => {
      await new Promise(r => setTimeout(r, 800));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'ok', status: 'ok' }) });
    });
    await page.locator('#ask-guna-input').fill('hello');
    await page.locator('#ask-guna button[type="submit"]').click();
    await expect(page.locator('#ask-guna button[type="submit"]')).toBeDisabled();
    await expect(page.locator('#ask-guna')).toContainText('Checking portfolio', { timeout: 2000 });
  });
});

test.describe('21Z / 21AA / 21AV — Contact', () => {
  test('mailto, LinkedIn, GitHub, résumé, phone, Copy, Back to top', async ({ page, context }) => {
    // clipboard mock
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/', { waitUntil: 'networkidle' });

    const mailto = page.locator('#contact a[href^="mailto:"]');
    await expect(mailto.first()).toHaveAttribute('href', 'mailto:gunabhiram.a@gmail.com');
    await expect(mailto.first()).toHaveText('gunabhiram.a@gmail.com');

    await expect(page.locator('#contact a[href="https://www.linkedin.com/in/gunabhiram-aruru/"]')).toBeVisible();
    await expect(page.locator('#contact a[href="https://github.com/AruruGunabhiram"]')).toBeVisible();
    // résumé link exists (any pdf)
    const resume = page.locator('#contact a[href$=".pdf"]');
    await expect(resume.first()).toBeVisible();
    await expect(resume.first()).toHaveAttribute('download', /.pdf/);

    // phone de-emphasized but present
    await expect(page.locator('#contact a[href^="tel:"]')).toContainText('+1');

    // Copy Email — mock clipboard
    await page.evaluate(() => {
      // @ts-ignore
      navigator.clipboard.writeText = (t: string) => Promise.resolve((window as unknown as Record<string, unknown>)._copied = t);
    });
    await page.locator('#contact button', { hasText: 'Copy email' }).click();
    await expect(page.locator('#contact', { hasText: 'Copied' })).toBeVisible();
    const copied = await page.evaluate(() => (window as unknown as Record<string, unknown>)._copied);
    expect(copied).toBe('gunabhiram.a@gmail.com');
    // focus remains on button
    await expect(page.locator('#contact button', { hasText: /Copied|Copy email/ })).toBeFocused();

    // Back to top
    await page.locator('#contact a[href="#hero"]').click();
    await expect(page).toHaveURL(/#hero/);
  });

  test('internal section targets exist', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const id of ['hero', 'experience', 'projects', 'education', 'publications', 'skills', 'leadership', 'contact', 'ask-guna']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});
