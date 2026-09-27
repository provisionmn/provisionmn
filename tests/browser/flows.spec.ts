import { test, expect, brief, requestId, switchLanguage, verify, expectNoOverflow, fillContact } from './fixtures';

test('calculator validation, bilingual prefill and quote submission', async ({ page, isMobile, mockRequests }) => {
  await page.goto('/calculator');
  const next = () => page.getByRole('button', { name: isMobile ? 'Үргэлжлүүлэх' : 'Үнийн санал авах', exact: true });
  await next().click();
  await expect(page.getByRole('radio', { name: /^Вэб сайт/ })).toBeFocused();
  await expect(page).toHaveURL(/\/calculator$/);
  // Card radios intentionally hide the native input; use their visible label.
  await page.locator('label').filter({ has: page.getByRole('radio', { name: /^Вэб сайт/ }) }).click();
  await page.locator('label').filter({ has: page.getByRole('radio', { name: /^Энгийн/ }) }).click();
  await page.getByRole('textbox').fill('  too short  ');
  await next().click();
  await expect(page.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('textbox').fill(brief);
  await switchLanguage(page, 'en');
  await expect(page.getByRole('radio', { name: /^Website/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /^Simple/ })).toBeChecked();
  await page.getByRole('checkbox', { name: /API integration/ }).check();
  await page.locator('label').filter({ has: page.getByRole('radio', { name: /^Urgent/ }) }).click();
  await expectNoOverflow(page);
  await page.getByRole('button', { name: isMobile ? 'Continue' : 'Request a quote', exact: true }).click();
  await expect(page).toHaveURL(/\/quote$/);
  await expect(page.getByRole('combobox', { name: /Project type/ })).toHaveText('Website development');
  await expect(page.getByLabel(/Detailed project description/)).toHaveValue(brief);
  await expect(page.getByText(/₮4,840,000/)).toBeVisible();
  await switchLanguage(page, 'mn');
  await expect(page.getByRole('combobox', { name: /Төслийн төрөл/ })).toHaveText('Вэб сайт хөгжүүлэлт');
  await expect(page.getByLabel(/Төслийн дэлгэрэнгүй тайлбар/)).toHaveValue(brief);
  await page.getByRole('button', { name: 'Хүсэлт илгээх', exact: true }).click();
  await expect(page.getByLabel(/Овог нэр/)).toBeFocused();
  expect(mockRequests.submissions).toHaveLength(0);
  await switchLanguage(page, 'en');
  await expect(page.getByRole('alert').first()).toHaveText('Please enter your name.');
  await page.getByLabel(/Full name/).fill('Browser Test');
  await page.getByLabel(/Email address/).fill('quote@example.com');
  await page.getByLabel(/Phone number/).fill('99112233');
  await page.getByRole('combobox', { name: /Budget/ }).click();
  await page.getByRole('option', { name: 'Let’s discuss' }).click();
  await verify(page);
  mockRequests.reply({});
  await page.getByRole('button', { name: 'Send request', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Request received' })).toBeVisible();
  await expect(page.getByText(requestId, { exact: true })).toBeVisible();
  expect(mockRequests.submissions).toHaveLength(1);
  expect(mockRequests.submissions[0].body).toMatchObject({
    kind: 'quote', projectType: 'website', complexity: 'simple', features: ['api'],
    estimatedHours: 55, estimatedPrice: 4840000, timeline: 'urgent', budget: 'discuss', description: brief,
  });
  await expectNoOverflow(page);
  await page.getByRole('button', { name: 'Start a new request' }).click();
  await expect(page.getByLabel(/Full name/)).toHaveValue('');
  await expect(page.getByLabel(/Detailed project description/)).toHaveValue('');
  await expect(page.getByRole('combobox', { name: /Project type/ })).toHaveText('Select a project type');
});

test('contact validates in both languages, requires verification and resets after success', async ({ page, mockRequests }) => {
  await page.goto('/#contact');
  const contact = page.locator('#contact');
  await contact.getByRole('button', { name: 'Илгээх', exact: true }).click();
  await expect(contact.getByLabel('Нэр', { exact: true })).toBeFocused();
  await expect(contact.getByRole('alert')).toHaveCount(3);
  await switchLanguage(page, 'en');
  await contact.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(contact.getByRole('alert')).toContainText(['Enter your name', "That email address isn't valid", 'Write at least 20 characters']);
  await fillContact(page);
  await contact.getByLabel('Email', { exact: true }).fill('invalid');
  await contact.getByLabel('Brief', { exact: true }).fill('  too short  ');
  await contact.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(contact.getByRole('alert')).toHaveCount(2);
  expect(mockRequests.submissions).toHaveLength(0);
  await fillContact(page);
  await contact.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(contact.getByRole('alert')).toHaveText('Complete the verification and submit again.');
  expect(mockRequests.submissions).toHaveLength(0);
  await verify(page);
  mockRequests.reply({});
  await contact.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(contact.getByRole('heading', { name: 'Brief received' })).toBeVisible();
  await expect(contact.getByText(new RegExp(requestId))).toBeVisible();
  expect(mockRequests.submissions[0].body).toMatchObject({ kind: 'contact', name: 'Browser Test', email: 'browser@example.com', description: brief });
  await expectNoOverflow(page);
  await contact.getByRole('button', { name: 'Send another' }).click();
  await expect(contact.getByLabel('Name', { exact: true })).toHaveValue('');
  await expect(contact.getByLabel('Brief', { exact: true })).toHaveValue('');
});

for (const failure of ['network', 'server', 'rate-limit', 'captcha', 'validation'] as const) {
  test(`contact preserves data and retries after ${failure} failure`, async ({ page, mockRequests }) => {
    await page.goto('/#contact');
    await switchLanguage(page, 'en');
    await fillContact(page);
    await verify(page);
    const responses = {
      network: { abort: true },
      server: { status: 503, body: { error: 'unavailable' } },
      'rate-limit': { status: 429, body: { error: 'rate_limited' } },
      captcha: { status: 403, body: { error: 'captcha_failed' } },
      validation: { status: 400, body: { error: 'invalid_request', fields: ['email', 'untrusted-field'] } },
    };
    const messages = {
      network: 'We could not confirm', server: 'We could not confirm',
      'rate-limit': 'Too many requests', captcha: 'Complete the verification',
      validation: 'Email: enter a valid address',
    };
    mockRequests.reply(responses[failure]);
    const contact = page.locator('#contact');
    await contact.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(contact.getByRole('alert')).toContainText(messages[failure]);
    await expect(contact.getByRole('heading', { name: 'Brief received' })).toHaveCount(0);
    await expect(contact.getByLabel('Name', { exact: true })).toHaveValue('Browser Test');
    await expect(contact.getByLabel('Brief', { exact: true })).toHaveValue(brief);
    await expect(contact.getByText('untrusted-field')).toHaveCount(0);
    await verify(page);
    mockRequests.reply({});
    await contact.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(contact.getByRole('heading', { name: 'Brief received' })).toBeVisible();
    expect(mockRequests.submissions).toHaveLength(2);
    const [first, retry] = mockRequests.submissions;
    expect(first.key).toMatch(/^[0-9a-f-]{36}$/i);
    expect(retry.key).toBe(first.key);
    expect(retry.body.captchaToken).not.toBe(first.body.captchaToken);
    expect({ ...retry.body, captchaToken: undefined }).toEqual({ ...first.body, captchaToken: undefined });
  });
}
