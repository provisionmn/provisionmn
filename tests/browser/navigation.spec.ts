import { test, expect, switchLanguage, expectNoOverflow } from './fixtures';

test('routes, language persistence, navigation and viewport layout', async ({ page, isMobile }) => {
  for (const path of ['/', '/services', '/calculator', '/quote']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    await expectNoOverflow(page);
    await switchLanguage(page, 'en');
    await expectNoOverflow(page);
    await switchLanguage(page, 'mn');
  }
  await switchLanguage(page, 'en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const header = page.getByRole('banner');
  if (isMobile) {
    const open = header.getByRole('button', { name: 'Цэс нээх' });
    await open.click();
    await expect(header.getByRole('button', { name: 'Цэс хаах' })).toHaveAttribute('aria-expanded', 'true');
    await expectNoOverflow(page);
    await page.keyboard.press('Escape');
    await expect(open).toHaveAttribute('aria-expanded', 'false');
    await open.click();
  }
  await header.getByRole('button', { name: 'Contact', exact: true }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.locator('#contact')).toBeInViewport();
  if (isMobile) await expect(header.getByRole('button', { name: 'Цэс нээх' })).toHaveAttribute('aria-expanded', 'false');
  await header.getByRole('button', { name: 'Гэрэл/бараан горим солих' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expectNoOverflow(page);
});

test('hero serves static mobile artwork and seeks desktop video on scroll', async ({ page, isMobile }) => {
  const mediaRequests: string[] = [];
  page.on('request', request => {
    if (/hero-(scrub\.mp4|poster\.jpg)/.test(request.url())) mediaRequests.push(request.url());
  });
  await page.goto('/');
  if (isMobile) {
    await expect(page.locator('.static-hero')).toBeVisible();
    await expect(page.locator('.scrub-video')).toBeHidden();
    await page.locator('.static-hero a[href="/calculator"]').click();
    await expect(page).toHaveURL(/\/calculator$/);
    expect(mediaRequests).toEqual([]);
  } else {
    const video = page.locator('.scrub-video');
    await expect(video).toBeVisible();
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
    await page.locator('#home').evaluate(element => {
      window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY + element.clientHeight - window.innerHeight);
    });
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 15_000 }).toBeGreaterThan(4);
    await page.locator('#home a[href="/calculator"]:visible').click();
    await expect(page).toHaveURL(/\/calculator$/);
  }
});
