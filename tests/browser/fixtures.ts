import { test as base, expect, type Page, type Route } from '@playwright/test';

export const requestId = 'a13bd758-91c2-4db6-adc5-0e6de1575745';
export const brief = 'A customer order management website for our team';

type Submission = { body: Record<string, unknown>; key: string };
type Reply = { status?: number; body?: object; abort?: boolean };
type MockRequests = {
  submissions: Submission[];
  reply: (reply: Reply) => void;
};

// Exercise the real Turnstile component/script loader, but never Cloudflare.
// A deliberate click also lets tests verify missing-token and renewal states.
const turnstileScript = `
let sequence = 0;
const widgets = new Map();
window.turnstile = {
  render(container, options) {
    const id = 'mock-' + (++sequence);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Complete test verification';
    button.onclick = () => {
      options.callback('browser-token-' + id);
      button.textContent = 'Test verification complete';
      button.disabled = true;
    };
    container.appendChild(button);
    widgets.set(id, button);
    return id;
  },
  remove(id) { widgets.get(id)?.remove(); widgets.delete(id); }
};
`;

export const test = base.extend<{ mockRequests: MockRequests }>({
  mockRequests: [async ({ context, baseURL }, use) => {
    if (baseURL !== 'http://127.0.0.1:3107') throw new Error('Browser tests must use the isolated local server');
    const submissions: Submission[] = [];
    const replies: Reply[] = [];
    const unexpected: string[] = [];
    const guard = async (route: Route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === 'https://challenges.cloudflare.com' && url.pathname === '/turnstile/v0/api.js') {
        return route.fulfill({ contentType: 'application/javascript', body: turnstileScript });
      }
      // Block all third-party traffic, including analytics, production forms
      // and remote images. Only local read requests may reach the web server.
      if (url.origin !== baseURL) return route.abort('blockedbyclient');
      if (url.pathname === '/api/requests' && request.method() === 'POST') {
        submissions.push({ body: request.postDataJSON(), key: request.headers()['idempotency-key'] });
        const reply = replies.shift();
        if (!reply) {
          unexpected.push('Unconfigured /api/requests submission');
          return route.abort('blockedbyclient');
        }
        if (reply.abort) return route.abort('failed');
        return route.fulfill({ status: reply.status ?? 201, json: reply.body ?? { id: requestId } });
      }
      if (url.pathname.startsWith('/api/') || !['GET', 'HEAD'].includes(request.method())) {
        unexpected.push(`${request.method()} ${url.pathname}`);
        return route.abort('blockedbyclient');
      }
      return route.continue();
    };
    await context.route('**/*', guard);
    await use({ submissions, reply: reply => replies.push(reply) });
    expect(unexpected, 'No unmocked API writes may escape the browser').toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function switchLanguage(page: Page, lang: 'mn' | 'en') {
  const toggle = page.getByRole('button', { name: 'Хэл солих', exact: true });
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
}

export async function verify(page: Page) {
  await page.getByRole('button', { name: 'Complete test verification', exact: true }).click();
}

export async function expectNoOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
  )).toBeLessThanOrEqual(1);
}

export async function fillContact(page: Page) {
  const contact = page.locator('#contact');
  await contact.getByLabel('Name', { exact: true }).fill('Browser Test');
  await contact.getByLabel('Email', { exact: true }).fill('browser@example.com');
  await contact.getByLabel('Brief', { exact: true }).fill(brief);
}
