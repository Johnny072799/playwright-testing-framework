# Playwright Test Architecture Guidelines

This document outlines the architectural patterns and standards for UI test automation using Playwright Test (`@playwright/test`). These guidelines are project-agnostic — apply them to any repo built on Playwright Test, regardless of the application under test.

**Typical dependency footprint:**
- `@playwright/test` — test runner, assertions, built-in fixtures
- `dotenv` (optional) — `.env` file loading
- Any domain-specific client libraries the project genuinely needs (a data-seeding SDK, an API client, a faker-style data generator) — add only when there's a real need

Avoid dependencies on legacy test frameworks (Cucumber/Gherkin runners, custom "automation foundation" wrapper packages) and third-party assertion libraries (`chai`, etc.) — Playwright's built-in `test`/`expect` and fixtures cover this.

---

## Core Principles

### 1. Separation of Concerns

| Layer | Responsibility |
|---|---|
| **Test Files** (`.spec.ts`) | Orchestration only — declare dependencies, perform actions, assert outcomes |
| **Page Objects** | Page-specific locators and interaction methods. Framework-agnostic (accept `Page`, nothing else) |
| **Fixtures** | Lifecycle management and dependency injection. Setup and teardown co-located |
| **Support Classes** | Reusable domain-specific utilities. No framework coupling |
| **Configuration** | Centralized in `playwright.config.ts` and `.env` files |

### 2. Classes Over Loose Functions

Organize related behavior as methods on a class, not as standalone exported functions. This keeps code discoverable and self-documenting. When a new team member needs to understand a piece of domain logic, they should find a class (e.g. `OrderUtils`, `TestDataBuilder`), not hunt through a flat file of exported functions.

### 3. No Duplication of Existing Abstractions

Before creating a new interface, type, wrapper function, or utility class, check if one already exists:
- In the codebase itself (search before you create)
- In any domain-specific client library the project depends on
- In `@playwright/test` (for `Page`, `Locator`, `BrowserContext`, `APIRequestContext`, etc.)

If an existing type is close but not quite right, **extend** it rather than copying it.

### 4. No Zero-Value Wrappers

If a function simply calls a Playwright API with no additional logic, do not wrap it. Use the API directly.

Wrapping `page.goto(url)` in a `navigateTo(url)` function adds indirection with zero benefit.

A wrapper earns its existence only when it adds real value: retry logic, logging, domain-specific defaults, or multi-step orchestration.

---

## Target Directory Structure

```
repo-root/
├── playwright.config.ts          # Browsers, timeouts, reporters, base URL, option fixtures
├── .env.template                 # Project-specific env vars (base URL, credentials, workers, etc.)
├── fixtures/
│   ├── index.ts                  # Composes all fixtures, exports the single `test` and `expect`
│   ├── auth.fixtures.ts          # Auth/session setup + teardown, if split out
│   ├── pages.fixtures.ts         # All POM fixtures (loginPage, dashboardPage, etc.)
│   └── ...                       # Additional domain fixture files only when needed
├── tests/
│   ├── login/
│   │   └── login.spec.ts
│   ├── checkout/
│   │   └── checkout.spec.ts
│   └── ...
├── pages/                        # Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── ...
├── support/                      # Domain-specific utility classes (data builders, orchestration flows)
│   ├── TestDataBuilder.ts
│   ├── OrderUtils.ts
│   └── ...
└── package.json
```

Small projects can flatten this (e.g. a single `fixtures/index.ts`, no domain subfolders under `tests/`) — the layer boundaries (fixtures / pages / support / tests) matter more than the exact folder depth.

---

## Fixture File Organization

### The Rule: One `fixtures/` folder, files organized by domain, one `index.ts` entry point

Every repo has a `fixtures/` folder with a single `index.ts` that composes and re-exports the final `test` and `expect`. Every spec file imports from this single entry point — never from individual fixture files directly.

```ts
// Every spec file, always:
import { test, expect } from '../../fixtures';

// NEVER import from individual fixture files in spec files:
// import { test } from '../../fixtures/auth.fixtures';  // DON'T
```

### How Many Files?

**Small repos (1–5 custom fixtures):** A single `fixtures/index.ts` is fine.
```
fixtures/
└── index.ts
```

**Medium repos (5–15 custom fixtures):** Split by domain concern.
```
fixtures/
├── index.ts                    # Composes and re-exports test + expect
├── auth.fixtures.ts            # Auth/session setup, cleanup
└── pages.fixtures.ts           # All POM fixtures (loginPage, etc.)
```

**Large repos (15+ custom fixtures):** Add domain files as needed.
```
fixtures/
├── index.ts
├── auth.fixtures.ts
├── pages.fixtures.ts
├── data.fixtures.ts            # Test data seeding / cleanup
└── api.fixtures.ts             # API client fixtures
```

### Composing Multiple Fixture Files in `index.ts`

**Option A — chain `.extend()`:**
```ts
// fixtures/index.ts
import { test as authTest } from './auth.fixtures';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

export const test = authTest.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
});

export { expect } from '@playwright/test';
```

**Option B — `mergeTests`:**
```ts
// fixtures/index.ts
import { mergeTests } from '@playwright/test';
import { test as authTest } from './auth.fixtures';
import { test as pagesTest } from './pages.fixtures';

export const test = mergeTests(authTest, pagesTest);
export { expect } from '@playwright/test';
```

### What NOT to Do

```
// BAD: one file per fixture
fixtures/
├── index.ts
├── loginPage.fixture.ts
├── dashboardPage.fixture.ts
├── authSession.fixture.ts
└── authCleanup.fixture.ts

// BAD: fixtures mirroring test structure
fixtures/
├── checkout.fixtures.ts
├── onboarding.fixtures.ts
├── dashboard.fixtures.ts
└── ...
```

---

## Test Files (`.spec.ts`)

Test files are the orchestration layer. Each `test()` call is a self-contained scenario that declares its dependencies, performs actions, and asserts outcomes.

### Rules

**DO:**
- Destructure only the fixtures the test actually needs
- Use `const` / `let` for all test state (state lives in function scope, not on a shared object)
- Group related tests with `test.describe` for logical organization
- Use Playwright's `expect` exclusively for all assertions
- Use `test.describe` tags as an array (`{ tag: ['@smoke'] }`) for test categorization
- Keep tests focused: one logical scenario per `test()` call
- Always import from `fixtures/index.ts`

**DON'T:**
- Store mutable state outside the test function (e.g. a `let` assigned in `beforeEach` that tests then reference) — if a test needs a configured page object, provide it via a fixture instead
- Use `chai` or any assertion library other than Playwright's `expect`
- Use `page.waitForTimeout()` — use auto-waiting locator assertions instead
- Create helper functions directly in spec files (move to support classes or page objects)
- Import `test` or `expect` from individual fixture files or directly from `@playwright/test`

### Example

```ts
// tests/checkout/checkout.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Checkout', { tag: ['@smoke'] }, () => {
  test('complete a purchase', async ({ page, authenticatedPage: _, checkoutPage }) => {
    await checkoutPage.addItemToCart('sku-123');
    await checkoutPage.submitOrder();

    await expect(page.getByText('Order confirmed')).toBeVisible();
  });
});
```

---

## Page Object Model (POM)

Page objects encapsulate all page-specific interactions, locators, and methods. They accept a Playwright `Page` in their constructor and expose typed methods. They do not import from `@playwright/test` (only from playwright types), and do not reference fixtures or any test runner concept.

### Structure

Each page class contains:
- **Locators** — element selectors as properties or getter methods
- **Action Methods** — methods that interact with the page
- **Verification Helpers** — methods that return state for the test to assert on
- **No assertions** — POMs return values; tests make assertions

### Rules

**DO:**
- Create one class per logical page or component
- Keep all page interactions within the page class
- Use meaningful method names that describe the action
- Handle waiting and synchronization within methods (Playwright auto-waits on locator actions)
- Use base page classes for truly shared elements (e.g., common navigation, skeleton loader waits)
- Import types with `import { type Page, type Locator } from '@playwright/test'`

**DON'T:**
- Share locators between unrelated pages
- Put business logic in page objects
- Import or reference fixtures or test runner concepts
- Create wrapper methods that just call a single Playwright API with no added logic

### Example

```ts
// pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = page.locator('[data-testid="email-field"]');
    this.passwordField = page.locator('[data-testid="password-field"]');
    this.loginButton = page.locator('[data-testid="sign-in-btn"]');
  }

  async login(username: string, password: string) {
    await this.emailField.fill(username);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }
}
```

### Wrapping POMs in Fixtures

When a POM is reused across multiple test files, wrap it in a fixture:

```ts
// fixtures/index.ts (or fixtures/pages.fixtures.ts)
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

If a POM is only used in a single spec file, inline instantiation is fine:

```ts
test('verify login button', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await expect(loginPage.loginButton).toBeVisible();
});
```

---

## Fixtures

Fixtures are Playwright's dependency injection system. Each fixture provides exactly one resource with co-located setup and teardown.

### Rules

**DO:**
- One fixture per concern (e.g., `authSession`, `loginPage`) — no god-fixtures
- Co-locate setup and teardown in the same fixture using the `use()` pattern
- Push per-test preconditions (navigation, seeding, auth) into the fixture that provides the relevant object, rather than a `beforeEach` block in the spec — this avoids mutable shared state at the describe scope
- Use worker-scoped fixtures (`{ scope: 'worker' }`) for expensive operations like account creation or service connections
- Use auto fixtures (`{ auto: true }`) for cross-cutting concerns like failure screenshots or logging
- Use option fixtures (`{ option: true }`) for configuration that varies per project or environment
- Declare fixture dependencies explicitly in the fixture signature
- Export a single `test` and `expect` from `fixtures/index.ts`

**DON'T:**
- Create a "god fixture" that bundles multiple unrelated concerns into one object
- Put teardown in `test.afterEach` when it pairs with fixture setup (use the fixture's post-`use()` teardown instead)
- Manually manage browser/context lifecycle (Playwright's built-in `page`, `context`, `browser` fixtures handle this)
- Create test-scoped fixtures for expensive operations (use worker scope instead)

### Example: Auth Fixture

```ts
// fixtures/auth.fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type AuthFixtures = {
  authenticatedPage: void;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await page.goto(process.env.BASE_URL!);
    await loginPage.login(process.env.USERNAME!, process.env.PASSWORD!);
    await use();
  },
});

export { expect } from '@playwright/test';
```

---

## Support Classes

Support classes provide reusable, domain-specific utilities that are not page-specific. They are plain TypeScript classes that operate on data, orchestrate multi-step domain operations, or provide shared helpers (e.g. test data builders, multi-step flows that span several page objects).

### Rules

**DO:**
- Organize related functions as methods on a class (e.g., `TestDataBuilder`, `OrderUtils`)
- Use static methods when the class holds no instance state
- Use `process.env` directly for environment variables
- Accept specific parameters, not framework objects — unless the class genuinely orchestrates UI interaction across page objects (e.g. a multi-step login/onboarding flow), in which case accepting a `Page` is appropriate
- Add a short comment for complex methods only where the *why* isn't obvious
- Keep classes focused: one domain concept per class

**DON'T:**
- Create standalone exported functions outside of a class
- Duplicate interfaces or types that already exist in a dependency or `@playwright/test`
- Create wrapper classes around Playwright APIs that add no logic
- Pass fixture objects to support classes (a plain `Page` is fine when genuinely needed)

### Example

```ts
// support/OrderUtils.ts

export class OrderUtils {
  static parseOrderTotal(orderText: string): number {
    const match = orderText.match(/Total:\s+\$([\d.,]+)/);
    if (!match) {
      throw new Error('Failed to parse order total from the string.');
    }
    return parseFloat(match[1].replace(',', ''));
  }
}
```

---

## Configuration Standards

### `playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: parseInt(process.env.TEST_RETRIES || '0'),
  workers: parseInt(process.env.TEST_WORKERS || '5'),
  fullyParallel: true,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
  },
  reporter: [
    ['html', { open: 'never', outputFolder: process.env.REPORTS_PATH || 'playwright-report/' }],
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

### `.env.template`

```
BASE_URL=
USERNAME=
PASSWORD=
TEST_WORKERS=5
HEADLESS=true
REPORTS_PATH=playwright-report/
TEST_RETRIES=0
```

---

## Best Practices

### Naming Conventions

Pick one convention per project and apply it consistently — the specific casing matters less than uniformity across every file of a given kind.

| Target | Convention | Example |
|---|---|---|
| Spec files | `kebab-case` or `camelCase` (match the rest of the repo) | `create-order.spec.ts` or `createOrder.spec.ts` |
| Page/class files | Match the exported class name (`PascalCase`) | `LoginPage.ts`, `OrderUtils.ts` |
| Classes | `PascalCase` | `LoginPage`, `OrderUtils` |
| Methods / variables | `camelCase` | `createOrder`, `orderId` |
| Constants | `UPPER_SNAKE_CASE` for env vars only; regular `const` uses `camelCase` |
| Test descriptions | Plain language describing user-visible behavior |

### Locator Strategy

Playwright's official guidance ranks locators by how closely they reflect what a real user or assistive technology perceives — not by resistance to markup changes. In order of preference:

1. `getByRole()` — reflects how users and assistive technology perceive the page
2. `getByText()` — for non-interactive elements (divs, spans)
3. `getByLabel()` — for form fields
4. `getByPlaceholder()` — for form elements without a label but with placeholder text
5. `getByAltText()` — for images and other elements supporting `alt`
6. `getByTitle()` — for elements with a `title` attribute
7. `getByTestId()` (`data-testid`, `data-cy`) — fallback when no user-facing locator works
8. CSS/XPath (`page.locator(...)`) — last resort only

Test IDs are the most resilient to markup churn, but they aren't user-facing. Reach for them when the app's semantic markup is genuinely poor, or when the team has explicitly standardized on test-ID-based testing — not as the default first choice.

### Wait Strategies

- **Prefer Playwright's auto-waiting.** Locator actions (`click()`, `fill()`, `waitFor()`) and web assertions (`toBeVisible()`, `toHaveText()`) auto-wait by default.
- **Never use `page.waitForTimeout()`.** This is an arbitrary sleep and creates flaky tests. Wait for a specific condition instead.
- **Use `page.waitForLoadState()` sparingly** — only when you genuinely need to wait for network idle after a navigation or redirect-heavy auth flow.
- Playwright reveals, not causes, race conditions. If a test is flaky, the timing issue is pre-existing. Fix the root cause with proper auto-waiting assertions.

### Error Handling

- Provide meaningful error messages in support class methods
- Use `console.debug` for diagnostic logging
- Use `test.info().attach()` for custom artifacts (screenshots, logs) on failure

### Data Management

- Prefer API-based or fixture-based data creation over UI flows for test data setup where a client is available (e.g. a faker-based generator, a seeding API)
- Let fixture teardown handle cleanup automatically
- Never hardcode test data that should come from environment configuration

---

## Code Organization Rules

### Rule 1: Classes, Not Loose Functions

```ts
// BAD: loose functions scattered in a file
export function parseOrderTotal(text: string): number { ... }
export function formatOrderName(name: string): string { ... }
export function validateOrderStatus(status: string): boolean { ... }

// GOOD: organized as a class
export class OrderUtils {
  static parseOrderTotal(text: string): number { ... }
  static formatOrderName(name: string): string { ... }
  static validateOrderStatus(status: string): boolean { ... }
}
```

### Rule 2: No Duplicate Interfaces

```ts
// BAD: re-declaring a type that already exists in a dependency
interface ConnectionInfo {
  url: string;
  token: string;
}

// GOOD: import the existing type
import { ConnectionData } from 'some-client-library';

// GOOD: extend if you need extra fields
interface ExtendedConnectionData extends ConnectionData {
  customField: string;
}
```

### Rule 3: No Zero-Value Wrappers

```ts
// BAD: wrapper adds nothing
async function navigateToUrl(page: Page, url: string) {
  await page.goto(url);
}

// GOOD: use the API directly
await page.goto(url);

// GOOD: wrapper adds real value (multi-step orchestration)
async function loginAndNavigate(page: Page, credentials: Credentials, targetPath: string) {
  await page.goto(process.env.BASE_URL!);
  await page.locator('[data-testid="username"]').fill(credentials.username);
  await page.locator('[data-testid="password"]').fill(credentials.password);
  await page.locator('[data-testid="submit"]').click();
  await page.waitForLoadState('networkidle');
  await page.goto(`${process.env.BASE_URL}${targetPath}`);
}
```

### Rule 4: Single Source of Truth for Types

```ts
// fixtures/index.ts — canonical export for all fixture types
export { test, expect } from './auth.fixtures';
export type { AuthFixtures } from './auth.fixtures';

// Every spec file imports from this single source
import { test, expect } from '../../fixtures';
```
