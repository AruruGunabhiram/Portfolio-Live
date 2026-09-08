import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * A19 — Leadership → Ask Guna → Contact → Footer.
 *
 * The desk scene and the closing mark are decorative, so nothing here asserts
 * pixels. What is asserted is that the real interaction is untouched, that the
 * scene mirrors interaction state without owning any of it, and that the
 * closing region stays reachable and overflow-free across the whole matrix.
 */

const SCENE = '[data-scene="ask-guna-desk"]';
const CONTACT_SCENE = '[data-scene="contact-send"]';
const LEAD_SCENE = '[data-scene="leadership-outreach"]';

/** Ask Guna is lazily mounted — scroll it into view and wait for the real input. */
async function gotoClosing(page: Page, query = '') {
  await page.goto(`/${query}`, { waitUntil: 'networkidle' });
  await page.locator('#ask-guna').scrollIntoViewIfNeeded();
  await expect(page.locator('#ask-guna-input')).toBeVisible({ timeout: 10_000 });
}

const sceneState = (page: Page) => page.locator(SCENE).getAttribute('data-scene-state');

test.describe('A19 — Ask Guna desk scene (mocked API)', () => {
  test('scene tracks idle → typing → thinking → answer without touching the interaction', async ({ page }) => {
    let release: (() => void) | null = null;
    await page.route('/api/ask-guna', async route => {
      await new Promise<void>(r => (release = r));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'SocialLens is a Spring Boot analytics backend.', status: 'ok' }),
      });
    });

    await gotoClosing(page);
    await expect(page.locator(SCENE)).toHaveAttribute('data-scene-state', 'idle');

    const input = page.locator('#ask-guna-input');
    await input.fill('Which projects use Java?');
    await expect(page.locator(SCENE)).toHaveAttribute('data-scene-state', 'typing');

    await page.locator('#ask-guna button[type="submit"]').click();
    await expect(page.locator(SCENE)).toHaveAttribute('data-scene-state', 'thinking');
    // the real controls, not the scene, are what disable during flight
    await expect(input).toBeDisabled();

    await expect.poll(() => release !== null).toBe(true);
    release!();
    await expect(page.locator('#ask-guna')).toContainText('SocialLens is a Spring Boot analytics backend.');
    await expect(page.locator(SCENE)).toHaveAttribute('data-scene-state', 'answer');
    await expect(input).toBeEnabled();
  });

  test('error keeps the scene calm and leaks no provider detail', async ({ page }) => {
    await page.route('/api/ask-guna', route =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'provider_error',
          message: "I couldn't answer that right now. Please try again.",
          detail: 'upstream 500 from model provider api_key=sk-should-never-render',
        }),
      })
    );
    await gotoClosing(page);
    await page.locator('#ask-guna-input').fill('anything');
    await page.locator('#ask-guna button[type="submit"]').click();

    await expect(page.locator('#ask-guna [role="alert"]')).toContainText("I couldn't answer");
    await expect(page.locator(SCENE)).toHaveAttribute('data-scene-state', 'error');

    const sceneText = (await page.locator(SCENE).innerText()).trim();
    expect(sceneText).toBe('');
    const sectionHtml = await page.locator('#ask-guna').innerHTML();
    expect(sectionHtml).not.toContain('sk-should-never-render');
    expect(sectionHtml).not.toContain('provider_error');
    expect(sectionHtml).not.toContain('upstream 500');
  });

  test('keyboard alone drives the whole interaction, and the scene takes no focus', async ({ page }) => {
    await page.route('/api/ask-guna', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Answered via keyboard.', status: 'ok' }),
      })
    );
    await gotoClosing(page);
    const input = page.locator('#ask-guna-input');
    await input.focus();
    await page.keyboard.type('what did Guna build?');
    await page.keyboard.press('Enter');
    await expect(page.locator('#ask-guna')).toContainText('Answered via keyboard.');

    // no element inside the decorative scene can ever hold focus
    const tabStops = await page.locator(`${SCENE} a, ${SCENE} button, ${SCENE} input, ${SCENE} [tabindex]`).count();
    expect(tabStops).toBe(0);
    await expect(page.locator(SCENE)).toHaveAttribute('aria-hidden', 'true');
    // exactly one real input / submit in the section
    expect(await page.locator('#ask-guna input').count()).toBe(1);
    expect(await page.locator('#ask-guna button[type="submit"]').count()).toBe(1);
  });

  test('the desk scene lives in the lazy AskGuna chunk, not the initial bundle', async ({ page }) => {
    const js: string[] = [];
    page.on('response', r => {
      const u = r.url();
      if (u.endsWith('.js')) js.push(u.split('/').pop()!);
    });
    await page.goto('/', { waitUntil: 'networkidle' });

    // The entry HTML must not load or preload AskGuna — it is reached through
    // React.lazy, which is what keeps it out of the budgeted initial total.
    const html = await (await page.request.get('/')).text();
    expect(html).not.toContain('AskGuna');

    // It still arrives as its own chunk, separate from main.
    const askGunaChunk = js.find(f => f.startsWith('AskGuna-'));
    expect(askGunaChunk).toBeTruthy();

    // And the scene travels inside it rather than leaking into main.
    const mainName = html.match(/\/assets\/(index-[^"']+\.js)/)?.[1];
    expect(mainName).toBeTruthy();
    const mainSrc = await (await page.request.get(`/assets/${mainName}`)).text();
    expect(mainSrc).not.toContain('ask-guna-desk');
    const chunkSrc = await (await page.request.get(`/assets/${askGunaChunk}`)).text();
    expect(chunkSrc).toContain('ask-guna-desk');

    await page.locator('#ask-guna').scrollIntoViewIfNeeded();
    await expect(page.locator(SCENE)).toBeVisible();
  });

  test('reduced motion keeps the full interface and settles the scene', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('/api/ask-guna', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Reduced-motion answer.', status: 'ok' }),
      })
    );
    await gotoClosing(page);
    await expect(page.locator(SCENE)).toBeVisible();
    await page.locator('#ask-guna-input').fill('still usable?');
    await page.locator('#ask-guna button[type="submit"]').click();
    await expect(page.locator('#ask-guna')).toContainText('Reduced-motion answer.');
  });

  test('recruiter mode keeps Ask Guna usable and the scene static', async ({ page }) => {
    await page.route('/api/ask-guna', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ answer: 'Recruiter answer.', status: 'ok' }),
      })
    );
    await gotoClosing(page, '?mode=recruiter');
    await expect(page.locator(SCENE)).toBeVisible();
    await page.locator('#ask-guna-input').fill('quick question');
    await page.locator('#ask-guna button[type="submit"]').click();
    await expect(page.locator('#ask-guna')).toContainText('Recruiter answer.');
  });
});

test.describe('A19 — Contact ending', () => {
  test('real actions stay correct and the visual adds no control', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const contact = page.locator('#contact');
    await contact.scrollIntoViewIfNeeded();

    await expect(contact.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expect(contact.locator('a[href="https://www.linkedin.com/in/gunabhiram-aruru/"]')).toBeVisible();
    await expect(contact.locator('a[href="https://github.com/AruruGunabhiram"]')).toBeVisible();

    const resume = contact.locator('a[href$=".pdf"]');
    await expect(resume).toBeVisible();
    const resumeHref = await resume.getAttribute('href');
    const res = await page.request.get(resumeHref!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('pdf');

    await expect(page.locator(CONTACT_SCENE)).toBeVisible();
    await expect(page.locator(CONTACT_SCENE)).toHaveAttribute('aria-hidden', 'true');
    expect(await page.locator(`${CONTACT_SCENE} a, ${CONTACT_SCENE} button, ${CONTACT_SCENE} [tabindex]`).count()).toBe(0);
    expect((await page.locator(CONTACT_SCENE).innerText()).trim()).toBe('');
  });

  test('recruiter mode omits the decorative ending and never fetches its chunk', async ({ page }) => {
    const js: string[] = [];
    page.on('response', r => {
      const u = r.url();
      if (u.endsWith('.js')) js.push(u.split('/').pop()!);
    });
    await page.goto('/?mode=recruiter', { waitUntil: 'networkidle' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
    await expect(page.locator(CONTACT_SCENE)).toHaveCount(0);
  });

  test('footer stays reachable past the ending', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('navigation', { name: 'Footer' })).toBeVisible();
  });
});

test.describe('A19 — Leadership', () => {
  test('canonical entries render and the visual introduces nothing interactive', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const lead = page.locator('#leadership');
    await lead.scrollIntoViewIfNeeded();
    await expect(lead.getByRole('heading', { name: 'Leadership', exact: true })).toBeVisible();

    await expect(page.locator(LEAD_SCENE)).toBeVisible();
    await expect(page.locator(LEAD_SCENE)).toHaveAttribute('aria-hidden', 'true');
    expect(await page.locator(`${LEAD_SCENE} a, ${LEAD_SCENE} button, ${LEAD_SCENE} [tabindex]`).count()).toBe(0);
    // renders no text at all, so it can assert no unverified impact figure
    expect((await page.locator(LEAD_SCENE).innerText()).trim()).toBe('');
  });
});

// ── §44: the closing journey across the mode / theme / width matrix ─────────
const WIDTHS = [320, 375, 768, 1024, 1440];

for (const width of WIDTHS) {
  for (const mode of ['standard', 'recruiter'] as const) {
    test(`closing journey @${width} ${mode}: reachable, no overflow, no scroll jail`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.route('/api/ask-guna', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'ok', status: 'ok' }) })
      );
      await page.goto(mode === 'recruiter' ? '/?mode=recruiter' : '/', { waitUntil: 'networkidle' });

      for (const id of ['skills', 'leadership', 'ask-guna', 'contact']) {
        const section = page.locator(`#${id}`);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        // the page never traps the scroll at any station on the way down
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        );
        expect(overflow, `horizontal overflow at #${id} @${width}`).toBe(false);
      }

      // Ask Guna remains usable at every width
      await page.locator('#ask-guna').scrollIntoViewIfNeeded();
      const input = page.locator('#ask-guna-input');
      await expect(input).toBeVisible();
      const box = await input.boundingBox();
      expect(box!.width).toBeGreaterThan(120);
      expect(box!.height).toBeGreaterThanOrEqual(44); // touch target

      // Contact actions and the footer are still reachable at the end
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
      await page.locator('footer').scrollIntoViewIfNeeded();
      await expect(page.locator('footer')).toBeVisible();
    });
  }
}

test('reduced motion: the whole closing region still renders and scrolls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  for (const id of ['leadership', 'ask-guna', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  await expect(page.locator('#ask-guna-input')).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(overflow).toBe(false);
});

// ── §45: focused axe on the three closing sections ─────────────────────────
for (const mode of ['standard', 'recruiter'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`axe — closing region ${mode} ${theme}: no critical or serious violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.route('/api/ask-guna', route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ answer: 'ok', status: 'ok' }) })
      );
      await gotoClosing(page, mode === 'recruiter' ? '?mode=recruiter' : '');
      await page.locator('#contact').scrollIntoViewIfNeeded();
      await page.locator('#leadership').scrollIntoViewIfNeeded();

      // axe blends colours against what is painted; wait for every entrance to settle
      await expect
        .poll(
          () =>
            page.evaluate(() =>
              Array.from(document.querySelectorAll('#leadership *, #ask-guna *, #contact *'))
                // decorative scenes hold sub-1 opacity as their settled state, and
                // axe skips their aria-hidden subtrees anyway
                .filter(e => !e.closest('[data-scene]'))
                // a disabled control's dimming is its resting style, not a fade,
                // and axe exempts disabled controls from contrast rules
                .filter(e => !(e as HTMLInputElement).disabled)
                .filter(e => {
                  const o = getComputedStyle(e).opacity;
                  return o !== '' && parseFloat(o) < 1;
                }).length
            ),
          { timeout: 8000 }
        )
        .toBe(0);

      const results = await new AxeBuilder({ page })
        .include('#leadership')
        .include('#ask-guna')
        .include('#contact')
        .analyze();
      const bad = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      expect(bad.map(v => `${v.id}: ${v.description}`)).toEqual([]);
    });
  }
}
