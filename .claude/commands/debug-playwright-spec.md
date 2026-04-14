# Debug a Playwright Test

Diagnose and fix a failing Playwright test.

## Input

The user will provide one of:

- A test file path and the error output
- A test name that's failing
- A screenshot or trace file path
- A general description of the failure

## Debugging Workflow

### Step 1: Locate the Config and Reproduce the Failure

Find the Playwright config if not already known:

```bash
find . -name "playwright.config.ts" -not -path "*/node_modules/*"
```

Run the failing test to get the full error output:

```bash
npx playwright test <path-to-spec> --reporter=list
```

For a specific test by name:

```bash
npx playwright test --grep "test name"
```

### Step 2: Analyze the Error

#### Fixture / Setup Errors (error before the test body runs)

- **Missing environment variable** — read the error message, identify the variable name, check the project's `.env` file (find it with `find . -name ".env" -not -path "*/node_modules/*"`).
- **Service connection failed** — credentials misconfigured or the target service is unreachable. Check `.env` values and network access.
- **Fixture dependency missing** — a fixture depends on another that wasn't set up. Read `fixtures/index.ts` to understand the dependency chain.

#### Locator / Element Errors (test body failures)

- `locator.click: Target closed` — page navigated away before the action completed. Add `waitForLoadState()` before the action or increase the timeout.
- `Timeout ... waiting for locator(...)` — element not found. Check the selector, confirm the page loaded, or increase the timeout.
- `strict mode violation: locator ... resolved to N elements` — multiple elements match. Make the locator more specific (add a filter, scope to a parent, or use `nth()`).
- `expect.toBeVisible: Timeout` — element exists in the DOM but is not visible. Check for loaders, overlapping modals, or CSS `display: none`.

#### Navigation Errors

- `net::ERR_CONNECTION_REFUSED` — app is not running or `BASE_URL` / `baseURL` is wrong. Confirm the target URL in `.env` and `playwright.config.ts`.
- `page.waitForURL: Timeout` — navigation didn't complete. Check whether the preceding action (e.g. login) succeeded and whether there's a redirect.

#### Assertion Errors

- `expect(received).toHaveURL(expected)` — URL didn't match. Add `console.log(page.url())` to log the actual URL.
- `expect(received).toContainText(expected)` — text mismatch. Check for extra whitespace, dynamic content, or a loading state that hasn't resolved.
- `expect(received).toBeVisible()` — element not visible. Use the trace or screenshot to see the page state at the time of the failure.

#### Timeout Exceeded

- Default global timeout is set in `playwright.config.ts` (`timeout`). If a full end-to-end flow is timing out, add `test.setTimeout(600_000)` at the top of the test body.
- Distinguish between "stuck waiting for a transition" (wrong selector or missing wait) and "running slowly but completing" (needs a higher timeout).

### Step 3: Use Playwright Debug Tools

#### View the trace

Traces are saved on failure in `test-results/<test-name>/trace.zip`:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

The trace viewer shows a timeline of every action, network request, and DOM snapshot — the fastest way to understand what the test saw.

#### View the screenshot

Screenshots on failure are saved at `test-results/<test-name>/test-failed-1.png`. Read the file to view it directly.

#### Run in headed mode

```bash
npx playwright test <path-to-spec> --headed
```

#### Run with Playwright Inspector (step-by-step)

```bash
npx playwright test <path-to-spec> --debug
```

#### Run with verbose API logging

```bash
DEBUG=pw:api npx playwright test <path-to-spec>
```

### Step 4: Common Fixes

#### Timing issues

```typescript
// Wait for network to settle after a navigation or form submission
await page.waitForLoadState('networkidle');

// Wait for a specific element before interacting with it
await page.locator('[data-testid="element"]').waitFor({ state: 'visible', timeout: 30_000 });

// Assert visibility — Playwright auto-waits on assertions
await expect(page.locator('[data-testid="element"]')).toBeVisible({ timeout: 30_000 });
```

#### Flaky selectors

Prefer selectors in this order:

```typescript
// 1. Test IDs (most stable)
page.locator('[data-testid="submit-btn"]');
page.locator('[data-cy="submit-btn"]');

// 2. ARIA roles (semantic and stable)
page.getByRole('button', { name: 'Submit' });

// 3. Visible text
page.getByText('Welcome back');

// 4. Labels (for form inputs)
page.getByLabel('Email address');

// 5. Scope to a parent to resolve ambiguity
page.locator('.card').filter({ hasText: 'Order' }).locator('[data-testid="details-btn"]');
```

#### Custom component state (checkboxes, toggles, dropdowns)

Custom UI components (e.g. styled checkboxes, Vue/React toggles) may not respond correctly to standard Playwright state-checking methods like `isChecked()`. Avoid retry loops that check state and re-click — this can toggle the element on and off. Instead:

- Use a single `.click()` matching the approach in the page object
- Verify success by asserting that the **expected downstream effect** occurred (e.g. a dependent field appeared)

#### `page.waitForTimeout()` in the codebase

If you find `page.waitForTimeout()` causing intermittent failures, replace it with a deterministic wait:

```typescript
// Instead of:
await page.waitForTimeout(3000);

// Wait for the specific condition that the timeout was masking:
await expect(page.locator('[data-testid="result"]')).toBeVisible();
// or
await page.locator('[data-testid="spinner"]').waitFor({ state: 'hidden' });
```

### Step 5: Verify the Fix

1. Run the specific test:
   ```bash
   npx playwright test <path-to-spec> --reporter=list
   ```
2. Confirm TypeScript still compiles:
   ```bash
   npx tsc --noEmit
   ```
3. If the test was flaky, run it several times to confirm it's stable:
   ```bash
   npx playwright test <path-to-spec> --repeat-each=3
   ```

## Environment File Reference

Find the project's env file:

```bash
find . -name ".env" -not -path "*/node_modules/*"
find . -name ".env.template" -not -path "*/node_modules/*"
```

Check `playwright.config.ts` for which variables are required — look at the `use:` block and any `process.env` references. Cross-reference against the `.env.template` to identify missing values.
