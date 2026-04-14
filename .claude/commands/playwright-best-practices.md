# Playwright Test Architecture Guidelines

This document outlines the architectural patterns and standards for UI test automation using Playwright Test (`@playwright/test`). These guidelines apply to all repos that have completed (or are completing) migration off `@ncino/test-automation-framework`.

**Target dependency footprint per repo:**
- `@playwright/test` — test runner, assertions, built-in fixtures
- `@ncino/salesforce-automation` — Salesforce connections, record management, cleanup
- `dotenv` (optional) — `.env` file loading

Everything from nTAF, `@ncino/automation-foundation`, `@cucumber/cucumber`, and `chai` is eliminated.

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

Organize related behavior as methods on a class, not as standalone exported functions. This keeps code discoverable and self-documenting. When a new team member needs to understand loan operations, they should find a `LoanUtils` class, not hunt through a flat file of 20 exported functions.

### 3. No Duplication of Existing Abstractions

Before creating a new interface, type, wrapper function, or utility class, check if one already exists:
- In the codebase itself (search before you create)
- In `@ncino/salesforce-automation` (for Salesforce types and connection interfaces)
- In `@playwright/test` (for `Page`, `Locator`, `BrowserContext`, `APIRequestContext`, etc.)

If an existing type is close but not quite right, **extend** it rather than copying it.

### 4. No Zero-Value Wrappers

If a function simply calls a Playwright API with no additional logic, do not wrap it. Use the API directly.

The old nTAF wrappers (`BrowserActions`, `NavigationActions`, `Elements`) no longer apply. Wrapping `page.goto(url)` in a `navigateTo(url)` function adds indirection with zero benefit.

A wrapper earns its existence only when it adds real value: retry logic, logging, domain-specific defaults, or multi-step orchestration.

---

## Target Directory Structure

```
repo-root/
├── playwright.config.ts          # Browsers, timeouts, reporters, base URL, option fixtures
├── .env.template                 # TEST_WORKERS, HEADLESS, REPORTS_PATH, etc.
├── fixtures/
│   ├── index.ts                  # Composes all fixtures, exports the single `test` and `expect`
│   ├── salesforce.fixtures.ts    # Salesforce connection + record management + cleanup
│   ├── pages.fixtures.ts         # All POM fixtures (loginPage, loanPage, dashboardPage, etc.)
│   └── ...                       # Additional domain fixture files only when needed
├── tests/
│   ├── loans/
│   │   ├── create-loan.spec.ts
│   │   └── loan-details.spec.ts
│   ├── onboarding/
│   │   └── client-onboarding.spec.ts
│   └── ...
├── pages/                        # Page Object Models
│   ├── LoanPage.ts
│   ├── DashboardPage.ts
│   └── ...
├── support/                      # Domain-specific utility classes
│   ├── loan-utils.ts
│   ├── offer-utils.ts
│   └── ...
└── package.json
```

---

## Fixture File Organization

### The Rule: One `fixtures/` folder, files organized by domain, one `index.ts` entry point

Every repo has a `fixtures/` folder with a single `index.ts` that composes and re-exports the final `test` and `expect`. Every spec file imports from this single entry point — never from individual fixture files directly.

```ts
// Every spec file, always:
import { test, expect } from '../../fixtures';

// NEVER import from individual fixture files in spec files:
// import { test } from '../../fixtures/salesforce.fixtures';  // DON'T
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
├── salesforce.fixtures.ts      # Salesforce connection, record mgmt, cleanup
└── pages.fixtures.ts           # All POM fixtures (loginPage, loanPage, etc.)
```

**Large repos (15+ custom fixtures):** Add domain files as needed.
```
fixtures/
├── index.ts
├── salesforce.fixtures.ts
├── pages.fixtures.ts
├── auth.fixtures.ts            # Authentication fixtures (multi-role, SSO, etc.)
└── api.fixtures.ts             # API client fixtures
```

### Composing Multiple Fixture Files in `index.ts`

**Option A — chain `.extend()`:**
```ts
// fixtures/index.ts
import { test as salesforceTest } from './salesforce.fixtures';
import { LoginPage } from '../pages/LoginPage';
import { LoanPage } from '../pages/LoanPage';
import { DashboardPage } from '../pages/DashboardPage';

export const test = salesforceTest.extend<{
  loginPage: LoginPage;
  loanPage: LoanPage;
  dashboardPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  loanPage: async ({ page }, use) => { await use(new LoanPage(page)); },
  dashboardPage: async ({ page }, use) => { await use(new DashboardPage(page)); },
});

export { expect } from '@playwright/test';
```

**Option B — `mergeTests`:**
```ts
// fixtures/index.ts
import { mergeTests } from '@playwright/test';
import { test as salesforceTest } from './salesforce.fixtures';
import { test as pagesTest } from './pages.fixtures';

export const test = mergeTests(salesforceTest, pagesTest);
export { expect } from '@playwright/test';
```

### What NOT to Do

```
// BAD: one file per fixture
fixtures/
├── index.ts
├── loginPage.fixture.ts
├── loanPage.fixture.ts
├── dashboardPage.fixture.ts
├── salesforceConnection.fixture.ts
├── salesforceRecordManagement.fixture.ts
└── salesforceCleanup.fixture.ts

// BAD: fixtures mirroring test structure
fixtures/
├── loans.fixtures.ts
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
- Use `test.describe` tags (`{ tag: '@smoke' }`) for test categorization
- Keep tests focused: one logical scenario per `test()` call
- Always import from `fixtures/index.ts`

**DON'T:**
- Store mutable state outside the test function
- Use `chai` or any assertion library other than Playwright's `expect`
- Use `page.waitForTimeout()` — use auto-waiting locator assertions instead
- Create helper functions directly in spec files (move to support classes or page objects)
- Import `test` or `expect` from individual fixture files or directly from `@playwright/test`

### Example

```ts
// tests/loans/create-loan.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Loan Creation', { tag: '@smoke' }, () => {
  test('create a loan application', async ({
    page,
    salesforceConnection,
    salesforceRecordManagement,
  }) => {
    const { connectionData } = salesforceConnection;

    await page.goto(
      `${connectionData.orgUrl}/secur/frontdoor.jsp?sid=${connectionData.accessToken}`
    );

    const loanId = await salesforceRecordManagement.createRecord('LLC_BI__Loan__c', {
      Name: 'Test Loan',
      LLC_BI__Amount__c: 500000,
    });

    await page.goto(
      `${connectionData.orgUrl}/lightning/r/LLC_BI__Loan__c/${loanId}/view`
    );
    await expect(page.getByText('Test Loan')).toBeVisible();

    // Cleanup is automatic via salesforceRecordManagement fixture teardown
  });
});
```

---

## Page Object Model (POM)

Page objects encapsulate all page-specific interactions, locators, and methods. They accept a Playwright `Page` in their constructor and expose typed methods. They do not import from `@playwright/test` (only from playwright types), and do not reference fixtures, World objects, or any test runner concept.

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
- Import or reference fixtures, World, or test runner concepts
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
  readonly useSsoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = page.locator('[data-cy="email-field"]');
    this.passwordField = page.locator('[data-cy="password-field"]');
    this.loginButton = page.locator('[data-cy="sign-in-btn"]');
    this.useSsoButton = page.locator('[data-cy="Use sso"]');
  }

  async login(username: string, password: string) {
    await this.page.waitForLoadState('networkidle');
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

Fixtures are Playwright's dependency injection system. They replace `ScenarioWorld`, Cucumber hooks, and manual browser lifecycle management. Each fixture provides exactly one resource with co-located setup and teardown.

### Rules

**DO:**
- One fixture per concern (e.g., `salesforceConnection`, `salesforceRecordManagement`, `loginPage`) — no god-fixtures
- Co-locate setup and teardown in the same fixture using the `use()` pattern
- Use worker-scoped fixtures (`{ scope: 'worker' }`) for expensive operations like account creation or service connections
- Use auto fixtures (`{ auto: true }`) for cross-cutting concerns like failure screenshots or logging
- Use option fixtures (`{ option: true }`) for configuration that varies per project or environment
- Declare fixture dependencies explicitly in the fixture signature
- Export a single `test` and `expect` from `fixtures/index.ts`

**DON'T:**
- Create a "god fixture" that bundles multiple concerns into one object (recreates the World anti-pattern)
- Put teardown in `test.afterEach` when it pairs with fixture setup (use the fixture's post-`use()` teardown instead)
- Manually manage browser/context lifecycle (Playwright's built-in `page`, `context`, `browser` fixtures handle this)
- Create test-scoped fixtures for expensive operations (use worker scope instead)

### Example: Salesforce Fixtures

```ts
// fixtures/salesforce.fixtures.ts
import { test as base } from '@playwright/test';
import {
  Connections,
  SalesforceRecordManagement,
  SalesforceRecordCleanup,
} from '@ncino/salesforce-automation';

type SalesforceFixtures = {
  salesforceConnection: {
    connection: SalesforceConnection;
    connectionData: SalesforceConnectionData;
    userStorage?: OrgUserStorage;
  };
  salesforceRecordManagement: SalesforceRecordManagement;
};

type SalesforceOptions = {
  onePasswordItem: string;
  onePasswordSection: string;
};

export const test = base.extend<SalesforceFixtures & SalesforceOptions>({
  onePasswordItem: ['', { option: true }],
  onePasswordSection: ['', { option: true }],

  salesforceConnection: async ({ onePasswordItem, onePasswordSection }, use) => {
    const result = await Connections.connectToSalesforce(onePasswordItem, onePasswordSection);
    await use({
      connection: result.connection,
      connectionData: result.connection.sfConnData,
      userStorage: result.userStorage,
    });
  },

  salesforceRecordManagement: async ({ salesforceConnection }, use) => {
    const mgmt = new SalesforceRecordManagement(salesforceConnection.connection);
    await use(mgmt);
    // Teardown: automatic cleanup of all records created during the test
    const cleanup = new SalesforceRecordCleanup(
      salesforceConnection.connection,
      mgmt.storage,
      { attemptToFindChildRecords: true },
    );
    await cleanup.cleanupRecordsWithCompositeCollections();
  },
});

export { expect } from '@playwright/test';
```

---

## Support Classes

Support classes provide reusable, domain-specific utilities that are not page-specific. They are plain TypeScript classes that operate on data, orchestrate multi-step domain operations, or provide shared helpers.

### Rules

**DO:**
- Organize related functions as methods on a class (e.g., `OfferUtils`, `LoanUtils`, `UserDataBuilder`)
- Use static methods when the class holds no instance state
- Use `process.env` directly for environment variables
- Accept specific parameters, not framework objects
- Add JSDoc comments for complex methods
- Keep classes focused: one domain concept per class

**DON'T:**
- Create standalone exported functions outside of a class
- Duplicate interfaces or types that already exist in `@ncino/salesforce-automation` or `@playwright/test`
- Create wrapper classes around Playwright APIs that add no logic (no `BrowserActions`, no `NavigationActions`, no `Elements`)
- Pass fixture objects or `page` to support classes unless the class genuinely needs to perform UI interactions (in which case it should probably be a page object instead)

### Example

```ts
// support/offer-utils.ts
import { OffersPage } from '../pages/OffersPage';

export class OfferUtils {
  /**
   * Parses the offer details (APR, Term, Payments) from the offer card.
   */
  static parseOfferDetails(offerText: string): { apr: string; term: string; payment: string } {
    const aprMatch = offerText.match(/APR\s+([\d.]+)/);
    const termMatch = offerText.match(/Term\s+([\d]+)/);
    const paymentsMatch = offerText.match(/Payments\s+\$([\d.,]+)/);
    if (!aprMatch || !termMatch || !paymentsMatch) {
      throw new Error('Failed to parse offer details from the string.');
    }
    return { apr: aprMatch[1], term: termMatch[1], payment: paymentsMatch[1] };
  }

  /**
   * Waits for the offers screen to load by checking card title visibility.
   */
  static async waitForOffersScreenToLoad(offersPage: OffersPage): Promise<void> {
    await offersPage.cardTitle.waitFor({ state: 'visible', timeout: 60000 });
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
  timeout: 120_000,
  retries: parseInt(process.env.TEST_RETRIES || '0'),
  workers: parseInt(process.env.TEST_WORKERS || '5'),
  fullyParallel: true,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
    onePasswordItem: process.env.ONEPASSWORD_ITEM || '',
    onePasswordSection: process.env.ONEPASSWORD_SECTION || '',
  },
  reporter: [
    ['html', { open: 'never', outputFolder: process.env.REPORTS_PATH || 'tests/playwright/reports/' }],
    ['json', { outputFile: 'tests/playwright/reports/test-results.json' }],
    ['junit', { outputFile: 'tests/playwright/reports/junit-results.xml' }],
  ],
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

### `.env.template`

```
ONEPASSWORD_ITEM=
ONEPASSWORD_SECTION=
TEST_WORKERS=5
HEADLESS=true
REPORTS_PATH=tests/playwright/reports/
TEST_RETRIES=0
```

---

## Best Practices

### Naming Conventions

| Target | Convention |
|---|---|
| Files | `kebab-case` (`create-loan.spec.ts`, `loan-utils.ts`) |
| Class files | `PascalCase` (`LoanPage.ts`) |
| Classes | `PascalCase` (`LoanPage`, `OfferUtils`) |
| Methods / variables | `camelCase` (`createLoan`, `loanId`) |
| Constants | `UPPER_SNAKE_CASE` for env vars only; regular `const` uses `camelCase` |
| Test descriptions | Plain language describing user-visible behavior |

### Wait Strategies

- **Prefer Playwright's auto-waiting.** Locator actions (`click()`, `fill()`, `waitFor()`) and web assertions (`toBeVisible()`, `toHaveText()`) auto-wait by default.
- **Never use `page.waitForTimeout()`.** This is an arbitrary sleep and creates flaky tests. Wait for a specific condition instead.
- **Use `page.waitForLoadState()` sparingly** — only when you genuinely need to wait for network idle (e.g., after `frontdoor.jsp` authentication).
- Playwright reveals, not causes, race conditions. If a test is flaky after migration, the timing issue was pre-existing. Fix the root cause with proper auto-waiting assertions.

### Error Handling

- Provide meaningful error messages in support class methods
- Use `console.debug` for diagnostic logging
- Use `test.info().attach()` for custom artifacts (screenshots, logs) on failure

### Data Management

- Use API-based data creation via `salesforceRecordManagement` instead of UI flows for test data setup
- Let fixture teardown handle cleanup automatically
- Never hardcode test data that should come from environment configuration

---

## Code Organization Rules

### Rule 1: Classes, Not Loose Functions

```ts
// BAD: loose functions scattered in a file
export function parseLoanAmount(text: string): number { ... }
export function formatLoanName(name: string): string { ... }
export function validateLoanStatus(status: string): boolean { ... }

// GOOD: organized as a class
export class LoanUtils {
  static parseLoanAmount(text: string): number { ... }
  static formatLoanName(name: string): string { ... }
  static validateLoanStatus(status: string): boolean { ... }
}
```

### Rule 2: No Duplicate Interfaces

```ts
// BAD: re-declaring a type that already exists in @ncino/salesforce-automation
interface SalesforceConnectionInfo {
  orgUrl: string;
  accessToken: string;
}

// GOOD: import the existing type
import { SalesforceConnectionData } from '@ncino/salesforce-automation';

// GOOD: extend if you need extra fields
interface ExtendedConnectionData extends SalesforceConnectionData {
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
async function authenticateAndNavigate(
  page: Page,
  connectionData: SalesforceConnectionData,
  targetPath: string,
) {
  await page.goto(
    `${connectionData.orgUrl}/secur/frontdoor.jsp?sid=${connectionData.accessToken}`
  );
  await page.waitForLoadState('networkidle');
  await page.goto(`${connectionData.orgUrl}${targetPath}`);
}
```

### Rule 4: Single Source of Truth for Types

```ts
// fixtures/index.ts — canonical export for all fixture types
export { test, expect } from './salesforce.fixtures';
export type { SalesforceFixtures, SalesforceOptions } from './salesforce.fixtures';

// Every spec file imports from this single source
import { test, expect } from '../../fixtures';
```
