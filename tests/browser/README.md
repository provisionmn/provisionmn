# Browser regression tests (PRO-100)

Run from the repository root with Node 22:

```sh
npm ci
npx playwright install chromium webkit
npm run test:browser
npm run test:browser:report
```

On Linux/CI, install browser OS dependencies with
`npx playwright install --with-deps chromium webkit`.
For one case use, for example,
`npm run test:browser -- --project=mobile-webkit --grep calculator`.
The runner builds the app and starts its own production-mode Next server on
`http://127.0.0.1:3107`, then stops it when finished. The port must be free;
an existing server is deliberately never reused. The build needs network
access for the existing `next/font` Google Fonts downloads.

## Coverage

All cases run in desktop Chromium (1440×900), mobile Chromium (390×844,
touch), and mobile WebKit (iPhone 13, 390×664 viewport). Mobile emulation
checks responsive behavior; it is not a physical-device Safari certification.

- Calculator required fields, short descriptions, pricing, optional features,
  Mongolian/English switching, real App Router navigation and quote prefill.
- Quote validation/focus, real Radix dropdown interaction, mocked submission,
  returned reference and starting a fresh request.
- Contact validation in both languages, missing CAPTCHA token, confirmation,
  clearing the form, network/503/429/403/400 errors, data preservation and retry
  with the same idempotency key and a fresh CAPTCHA token.
- All four routes in both languages without document-level horizontal
  overflow, persistent language after reload, desktop/mobile navigation,
  mobile menu dismissal, theme toggle and primary hero calculator links.
- Desktop video metadata/scroll seeking and the mobile static hero that must
  not request the video or poster. These are functional browser assertions,
  not pixel snapshots or a subjective video smoothness/contrast audit.

## Test boundaries and production safety

| Layer | Real behavior | Mocked / not proved |
| --- | --- | --- |
| `npm test` (Vitest/jsdom) | Components, schemas, API handler branches, notification logic | Browser layout, live CAPTCHA, API persistence and SMTP are mocked; the optional storage case is separate below. |
| `npm run test:browser` (Playwright) | Production build, hydration, browser layout, navigation, user input, fetch payloads, retry state, local hero media | `/api/requests` responses and the Turnstile script are intercepted. No database commit, CAPTCHA Siteverify or email delivery is proved. |
| `PG_INTEGRATION_URL=... npm test -- tests/request-storage.test.tsx` | PostgreSQL transactions, persistence, deduplication, throttling and notification outbox behavior | Uses connection-local TEMP tables on a disposable test database; SMTP is an injected mock. Does not connect the browser to the API or test live CAPTCHA/SMTP. |
| Manual CAPTCHA/SMTP smoke | Real widget, hostname/action verification, API→DB commit, worker and controlled inbox delivery | Not automated by this suite. PRO-83/PRO-89 already recorded production verification; this task does not reopen it. |

The browser suite has **no configurable remote base URL**. Its auto fixture
rejects any base URL other than the fixed loopback origin, blocks third-party
traffic (including analytics and remote images), blocks service workers, and
intercepts every form POST. Each test must explicitly queue a mock response;
an unconfigured API write aborts and fails the test. Only local GET/HEAD
requests can reach Next. The widget replacement exists only in the Playwright
fixture, with a visible test verification button; the production app has no
test bypass.

The test server explicitly disables mail and analytics and clears database,
SMTP and CAPTCHA secrets, taking precedence over Next `.env` files. Its public
widget key is a mock-only marker. **Do not deploy the `.next` output from this
test build**; rebuild normally for a real release. CI builds the deployable
Docker image separately with its normal configuration.

For the optional database test, create a disposable local database or test
container and supply that connection string as `PG_INTEGRATION_URL`. Never
reuse production credentials. The existing test creates TEMP tables in a
single session and removes them when the connection closes. Without that
variable it is reported as skipped; a green default Vitest run does not imply
that PostgreSQL was exercised.

A future live smoke check should be a deliberate operator action using a
separate staging DB, real staging CAPTCHA credentials and a controlled test
mailbox. Verify the UI reference against the persisted row and received
notification. Do not point an automated form test at `provision.mn` or submit
real production requests/emails. The existing production home-page HTTP
health check is unaffected.

## CI and diagnostics

The `browser` job in `.github/workflows/docker.yml` runs on the same PR,
main/tag push and manual triggers as the existing pipeline. Both `quality`
and `browser` must pass before the Docker build/push job. CI retries a failed
test once; the original failure retains its diagnostics.

- HTML report: `.context/browser-report/index.html`.
- Failure screenshot, trace and error context: `.context/browser-results/`.
- GitHub Actions artifact: `browser-test-results`, retained for 14 days,
  uploaded even when tests fail (unless the run is cancelled).
- Open a trace: `npx playwright show-trace path/to/trace.zip`.

Artifacts contain only synthetic form data. `.context/` is excluded from Git,
ESLint and the Docker context. No production secrets are needed by this job.
Runner setup follows the official [Playwright web server](https://playwright.dev/docs/test-webserver),
[network mocking](https://playwright.dev/docs/network) and
[CI](https://playwright.dev/docs/ci-intro) documentation.
