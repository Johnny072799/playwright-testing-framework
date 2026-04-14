# Migrate Cucumber Scenario to Playwright

Migrate a Cucumber feature file and its step definitions to a native Playwright spec file.

## Input

The user will provide one of:

- A feature file path (e.g. `tests/cucumber/features/login.feature`)
- A feature file name (e.g. `login.feature`)
- A scenario name to migrate

## Migration Process

### Step 1: Read the Source Files

1. Read the feature file to understand scenarios, steps, and tags.
2. Find the corresponding step definition file(s) — check the project's Cucumber step definitions directory (commonly `tests/cucumber/src/step-definitions/` or similar).
3. Find any page objects used in the step definitions.

### Step 2: Map Cucumber Concepts to Playwright

| Cucumber | Playwright |
|---|---|
| `Feature` | `test.describe('Feature name', ...)` |
| `Scenario` | `test('scenario name', ...)` |
| `Scenario Outline` + `Examples` | `for...of` loop calling `test()` with unique names |
| `@tag` annotations | `test.describe('name', { tag: ['@tag'] }, ...)` or `test('name', { tag: [...] }, ...)` |
| `@notInParallel` tag | `test.describe.serial('name', { tag: ['@notInParallel'] }, () => { ... })` |
| `Rule` keyword | Nested `test.describe` (or `test.describe.serial` if serial) inside the outer `test.describe` |
| Rule-level `Background` | Inline setup in each test (not `test.beforeEach` — each test needs its own fixture context) |
| `Before` hooks | Playwright fixtures or `test.beforeEach()` |
| `After` hooks | Fixture teardown or `test.afterEach()` |
| `Given/When/Then` steps | Inline code, page object methods, or shared utility class calls |
| `ScenarioWorld` properties | Fixture parameters or local `const` variables |
| `DataTable` | Inline arrays of `Record<string, string>` objects |

### Step 3: Determine the Correct Fixture Import

Read the project's `fixtures/index.ts` (or equivalent entry point) to understand what named exports are available. Common patterns:

- A single default `test` export for most tests
- Named exports for specialized test variants (e.g. tests needing API clients, auth, or third-party service connections)

Always import from the fixtures entry point — never directly from `@playwright/test` or individual fixture files:

```ts
// Always:
import { test, expect } from '../../fixtures';

// Or a named variant if the project provides one:
import { someNamedTest as test, expect } from '../../fixtures';
```

When in doubt, use the default `test` export and add fixture parameters as needed.

### Step 4: Create the Spec File

Determine the output location by looking at where existing Playwright spec files live in the project. Follow the same directory structure. Place the new file at the appropriate path and use `kebab-case` for the filename.

### Step 5: Migrate Page Objects

If the step definitions use page objects that don't yet exist in the Playwright test directory:

1. Read the original page object from the Cucumber source.
2. Create a new version in the Playwright pages directory that:
   - Accepts `Page` in the constructor
   - Imports `type Page` and `type Locator` from `@playwright/test` (not `playwright`)
   - Removes any inheritance from legacy framework base classes — either extend the project's own base page class or hold `page` directly
   - Replaces any legacy framework helpers (wait utilities, env helpers) with direct Playwright APIs or project-local equivalents

### Step 6: Replace Legacy Framework Imports

When migrating, identify and replace any imports from the old test framework:

| Pattern to remove | Replacement |
|---|---|
| Legacy wait/utility helpers from a framework package | Direct Playwright API or project-local utility |
| Legacy base page class from the framework | Project's own base page class or direct `Page` usage |
| Legacy page object base classes (`extends FrameworkPage`) | Remove the `extends` or use the project's base class |
| Framework runner or world imports | Remove entirely — Playwright handles lifecycle via fixtures |

### Step 7: Replace ScenarioWorld Properties

Properties that lived on `ScenarioWorld` (or equivalent) become either fixture parameters or local `const` variables:

- **Fixture parameters** — resources provided by fixtures (connections, test data objects, page instances, API clients)
- **Local `const` variables** — values computed or accumulated during the test (IDs returned by operations, state built up during the test body)

Read the project's `fixtures/index.ts` to know which fixture names are available, then replace `world.X` with the matching fixture parameter name.

### Step 8: Preserve Cucumber Step Comments

When converting Gherkin steps to Playwright code, add inline comments that reference the original Cucumber step keyword and intent. This preserves traceability between the Gherkin scenarios and the Playwright code.

**Comment format:** `// <Keyword>: <step description>`

Use `Background:` for Background steps and `Given:`, `When:`, `Then:`, `And:` for scenario steps.

**Example:**

```gherkin
# Cucumber
Background:
  Given a user is logged in
  And they are on the dashboard

Scenario: User views their profile
  When they navigate to profile settings
  Then they see their account details
```

```typescript
// Playwright
test('User views their profile', async ({ page, loginPage }) => {
  // Background: User is logged in
  await loginPage.login(credentials.username, credentials.password);

  // Background: Navigate to dashboard
  await expect(page).toHaveURL(/dashboard/);

  // When: Navigate to profile settings
  await page.getByRole('link', { name: 'Profile' }).click();

  // Then: Verify account details are visible
  await expect(page.getByText('Account Details')).toBeVisible();
});
```

When calling shared utility methods that encapsulate multiple steps, the comment should describe the aggregate action:

```typescript
// Background: Complete onboarding flow
await OnboardingFlows.completeRegistration(page, userInfo);
```

### Step 9: Use Shared Utility Classes Instead of Helper Functions

**CRITICAL: Spec files must NOT contain helper functions.** All reusable logic must live in utility classes under the project's `support/` directory. If a sequence of interactions or verifications is repeated across tests, it belongs in a shared class — never as a standalone `function` or `async function` defined in the spec file.

Before writing inline helper logic, check what shared utility classes already exist:

```bash
find . -path "*/support/*.ts" -not -path "*/node_modules/*" | head -30
```

**When to create a new utility class vs. keep logic inline:**

- Repeated across 2+ tests in the spec → extract to a shared class in `support/`
- Repeated across multiple spec files → extract to a shared class in `support/`
- One-off setup specific to a single test → keep inline
- Test data configuration (building objects, setting fields) → keep inline

**Example:**

```typescript
// WRONG — helper function defined in spec file
async function completeCheckoutFlow(page, cart, userInfo) {
  // ... 20 lines of checkout steps
}

// CORRECT — call an existing or new shared utility class
import { CheckoutFlows } from '../../support/checkout-flows';

await CheckoutFlows.completeCheckout(page, cart, userInfo);
```

## Example Migration

### Cucumber (Before)

```gherkin
@smoke @login
Feature: User Login
  Scenario: User logs in successfully
    Given the user navigates to the login page
    When the user enters valid credentials
    Then the user should see the dashboard
```

### Playwright (After)

```typescript
import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';

test.describe('User Login', { tag: ['@smoke', '@login'] }, () => {
  test('User logs in successfully', async ({ page, userCredentials }) => {
    const loginPage = new LoginPage(page);

    // Given: Navigate to login page
    await page.goto('/login');

    // When: Enter valid credentials
    await loginPage.login(userCredentials.username, userCredentials.password);

    // Then: Verify dashboard is visible
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

## Common Migration Patterns

### Scenario Outline → Parameterized Tests

```typescript
const validationCases = [
  { description: 'invalid email', email: 'bad', expectedError: 'Invalid email' },
  { description: 'empty password', email: 'user@example.com', expectedError: 'Enter password' },
];

for (const { description, email, expectedError } of validationCases) {
  test(`validation: ${description}`, async ({ page }) => {
    // ... test body using the case values
  });
}
```

### @notInParallel → test.describe.serial

```typescript
test.describe.serial(
  'Settings configuration',
  { tag: ['@notInParallel'] },
  () => {
    test('enable feature', async ({ page, settingsFixture }) => {
      await settingsFixture.enable('some-feature');
      // ... assertions — settings auto-restored on fixture teardown
    });

    test('verify feature is active', async ({ page }) => {
      // runs after the previous test completes
    });
  }
);
```

### DataTable → Inline Array

```gherkin
# Cucumber
Given the following settings are configured:
    | Setting Name     | Group Name | Value |
    | feature_enabled  | features   | true  |
```

```typescript
// Playwright
await settingsFixture.applySettings([
  { 'Setting Name': 'feature_enabled', 'Group Name': 'features', Value: 'true' }
]);
```

### Cucumber Rule → Nested test.describe

Cucumber's `Rule` keyword groups scenarios under a business rule within a feature. Each Rule maps to a nested `test.describe` (or `test.describe.serial` when scenarios need serial execution).

```gherkin
# Cucumber
Feature: Product Selection
    Rule: Logged-in users
        Background:
            Given the user is logged in
        Scenario: User sees personalised recommendations
            Then I see recommended products

    Rule: Guest users
        Background:
            Given the user is not logged in
        Scenario: Guest sees default recommendations
            Then I see default products
```

```typescript
// Playwright
test.describe('Product Selection', () => {
  test.describe('Logged-in users', () => {
    test('User sees personalised recommendations', async ({ page, authFixture }) => {
      // Background: inline (not beforeEach — each test needs its own fixture context)
      await authFixture.loginAs('standard-user');

      await expect(page.getByTestId('recommended-products')).toBeVisible();
    });
  });

  test.describe('Guest users', () => {
    test('Guest sees default recommendations', async ({ page }) => {
      await expect(page.getByTestId('default-products')).toBeVisible();
    });
  });
});
```

### Long E2E Tests — test.setTimeout()

Full end-to-end flow tests often exceed the default timeout. Add `test.setTimeout()` at the top of the test body:

```typescript
test('Full application flow with verification', async ({ page, ... }) => {
  test.setTimeout(600_000); // 10 minutes for full E2E flow
  // ... test body
});
```

Use this when the Cucumber equivalent had explicit step-level timeouts totalling more than the default.

### Serial Tests With Shared State

For scenarios that run a shared background flow once, followed by multiple independent verification tests:

```typescript
// Shared state populated by the background test and read by verification tests
let sharedId: string;

test.describe.serial('Feature with shared setup', { tag: ['@notInParallel'] }, () => {
  test('Background: complete the setup flow', async ({ page, ... }) => {
    test.setTimeout(300_000);
    // Full UI flow that produces sharedId
    sharedId = await doSetupAndGetId(page);
  });

  test('Verify record A', async ({ apiFixture }) => {
    const record = await apiFixture.getById(sharedId);
    expect(record.status).toBe('active');
  });

  test('Verify record B', async ({ apiFixture }) => {
    // Uses sharedId from the background test
  });
});
```

### Scenario Outline with State-Changing Background → Independent Tests

When a Cucumber Scenario Outline runs multiple Examples, each Example gets a **fresh Background**. If the Background changes persistent state (e.g. user registration, data creation), serial tests sharing state will fail because the first test's side effects affect subsequent tests. In these cases, each test must be fully independent:

```typescript
// WRONG — serial tests share state; first test's data affects subsequent tests
test.describe.serial('Registration flow', () => {
  test('Background: register user', async ({ page }) => { /* ... */ });
  test('Case A', async ({ page }) => { /* user already registered — BREAKS */ });
  test('Case B', async ({ page }) => { /* user already registered — BREAKS */ });
});

// CORRECT — each test is fully independent with its own complete flow
for (const testCase of testCases) {
  test(`Registration: ${testCase.description}`, async ({ page, ... }) => {
    // Full background flow inline
    // Test-specific assertions
  });
}
```

### try/catch + test.skip() for Known Bugs

When a known bug means a record or state may not exist, use `try/catch` with `test.skip()` to gracefully skip rather than fail:

```typescript
test('Verify optional record exists', async ({ apiFixture }) => {
  try {
    const record = await apiFixture.getRecord({ timeout: 30_000 });
    expect(record).toBeDefined();
  } catch {
    test.skip(true, 'TICKET-123: Record not created in this scenario (known bug)');
  }
});
```

## Lessons Learned

### Custom Component State — Don't Over-Engineer Interactions

Custom UI components (e.g. styled checkboxes, dropdowns, toggles) may not respond reliably to standard Playwright state-checking methods like `isChecked()`. Instead of writing retry loops that check state, mirror the approach in the original Cucumber step definitions. If the Cucumber implementation used a simple `.click()`, do the same — verify success by asserting that the expected downstream effect occurred (e.g. a dependent field appeared).

### Match the Existing Implementation Before Innovating

When migrating page interactions, match the Cucumber page object's approach first. Every interaction pattern in the Cucumber code was validated against the test environment. "Smarter" approaches (retry loops, multi-strategy fallbacks, complex wait conditions) can introduce bugs. Get the test green first, then optimize if there's a real problem.

### Environment Variables and Config Paths

Playwright loads env vars from a specific file (check `playwright.config.ts` for the `dotenv` call and the path passed to it). This is often a separate `.env` file from the one Cucumber uses. Confirm the correct file exists and is populated before running migrated tests.

### AriaRole Type

`AriaRole` is not directly exported from `@playwright/test`. Extract it from the `getByRole` signature when you need it as a type:

```typescript
type AriaRole = Parameters<Page['getByRole']>[0];
```

### Page Object Imports

When creating Playwright page objects:
- Import `Page` and `Locator` as types from `@playwright/test`, not from `playwright`
- Use `import { type Page, type Locator } from '@playwright/test'`

### Scenario Outline Examples That Modify Shared State Need Independent Tests

If each Cucumber Example in a Scenario Outline re-runs the Background (which has side effects), migrating to serial Playwright tests that share state will break. Each Playwright test must re-run its own background setup independently. See the "Scenario Outline with State-Changing Background" pattern above.
