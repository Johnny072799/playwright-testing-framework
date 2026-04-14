# Create a New Playwright Spec File

Create a new Playwright test spec file from scratch using the project's fixture infrastructure.

## Input

The user will describe the test they want to create. This could be:

- A feature description (e.g. "test that a user can reset their password")
- A specific page or flow to test
- A set of acceptance criteria or scenarios

## File Placement

First, look at where existing spec files live:

```bash
find . -name "*.spec.ts" -not -path "*/node_modules/*"
```

Follow the same directory structure and naming convention. Use `kebab-case` for the filename.

If the project has domain-based subdirectories (e.g. `tests/login/`, `tests/admin/`), place the new spec in the matching domain folder. Create the directory if it doesn't exist.

## Fixture Import

Always import from the project's fixtures entry point — never directly from `@playwright/test` or individual fixture files:

```typescript
import { test, expect } from '../../fixtures';
```

Read `fixtures/index.ts` to understand what named exports are available. If the project exposes multiple named test variants (e.g. for different roles or service connections), use the appropriate one. When in doubt, use the default `test` export.

## Spec File Template

```typescript
import { test, expect } from '../../fixtures';
// Import page objects as needed:
// import { LoginPage } from '../../pages/LoginPage';

test.describe('Feature Name', { tag: ['@tag'] }, () => {

  test('descriptive test name', async ({ page /*, other fixtures */ }) => {
    // Arrange
    // ...

    // Act
    // ...

    // Assert
    await expect(page.locator('[data-testid="..."]')).toBeVisible();
  });

});
```

## Page Objects

### Finding existing page objects

Before creating a new page object, check what already exists:

```bash
find . -path "*/pages/*.ts" -not -path "*/node_modules/*"
```

Reuse existing page objects rather than duplicating locators.

### Creating a new page object

If the test needs a page object that doesn't exist yet, create it in the project's `pages/` directory:

```typescript
import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  someElement(): Locator {
    return this.page.locator('[data-testid="some-element"]');
  }

  async doSomething(): Promise<void> {
    await this.someElement().click();
  }
}
```

### Page object rules

- Import `Page` and `Locator` as types from `@playwright/test`
- Extend the project's `BasePage` (or equivalent base class) for shared locators
- No assertions inside page objects — return values or perform actions only
- No zero-value wrapper methods (don't wrap a single Playwright API call with no added logic)
- Store the page as `protected readonly page: Page` — accept nothing else in the constructor unless the class genuinely needs it

## Common Patterns

### Parameterized tests (data-driven)

```typescript
const cases = [
  { description: 'case A', input: 'a', expected: 'result A' },
  { description: 'case B', input: 'b', expected: 'result B' },
];

for (const { description, input, expected } of cases) {
  test(`feature: ${description}`, async ({ page }) => {
    // test body using input and expected
  });
}
```

### Serial tests (shared mutable state or ordered execution)

```typescript
test.describe.serial(
  'Settings-dependent tests',
  { tag: ['@notInParallel'] },
  () => {
    test('step one', async ({ page }) => {
      // runs first
    });

    test('step two', async ({ page }) => {
      // runs after step one completes
    });
  }
);
```

### Shared state across serial tests

```typescript
let sharedId: string;

test.describe.serial('Feature with setup', { tag: ['@notInParallel'] }, () => {
  test('Background: complete setup flow', async ({ page }) => {
    test.setTimeout(300_000);
    // ... setup that produces sharedId
    sharedId = await doSetup(page);
  });

  test('Verify result A', async ({ page }) => {
    // uses sharedId from setup
  });
});
```

### Long E2E tests

Full end-to-end flows often exceed the default timeout. Add `test.setTimeout()` at the top of the test body:

```typescript
test('Full flow end to end', async ({ page }) => {
  test.setTimeout(600_000); // 10 minutes
  // ... test body
});
```

### Nested describes for feature grouping

```typescript
test.describe('Feature Name', { tag: ['@tag'] }, () => {
  test.describe('Scenario group A', () => {
    test('scenario 1', async ({ page }) => { /* ... */ });
    test('scenario 2', async ({ page }) => { /* ... */ });
  });

  test.describe('Scenario group B', () => {
    test('scenario 3', async ({ page }) => { /* ... */ });
  });
});
```

## Assertions

Always use Playwright's built-in `expect` — no third-party assertion libraries:

```typescript
await expect(page).toHaveURL(/expected-path/);
await expect(page).toHaveTitle(/expected title/);
await expect(locator).toBeVisible({ timeout: 30_000 });
await expect(locator).toContainText('expected text');
await expect(locator).toHaveValue('expected value');
await expect(locator).toBeEnabled();
await expect(locator).toBeHidden();
await expect(locator).toHaveCount(3);
```

## Post-Creation Verification (MANDATORY)

After creating the spec file:

1. **Check TypeScript compiles:**
   ```bash
   npx tsc --noEmit
   ```
2. **Run the new test:**
   ```bash
   npx playwright test <path-to-spec> --reporter=list
   ```

If there is no `playwright.config.ts` at the root, discover it first:

```bash
find . -name "playwright.config.ts" -not -path "*/node_modules/*"
```

## Rules

- NEVER define helper functions (`function` or `async function`) in spec files. All reusable logic must live in support/utility classes. Only test-specific inline setup stays in the test body.
- ALWAYS import `test` and `expect` from the project's `fixtures/` entry point — never from `@playwright/test` directly.
- NEVER use `page.waitForTimeout()` — use locator assertions or `waitFor({ state })` instead.
- ALWAYS prefer `data-testid` or `data-cy` selectors when available; fall back to `getByRole`, `getByText`, or `getByLabel`.
- ALWAYS run the test after creation to validate it works.
