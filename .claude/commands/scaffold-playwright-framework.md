# Scaffold a Playwright Framework

Set up a brand-new Playwright Test automation framework in a repo that doesn't have one yet: directory structure, config, base classes, environment files, and baseline CI workflows. This is the first step for any repo, run once right after cloning — before `create-playwright-spec` writes the first test.

This skill implements the structure defined in `playwright-best-practices` — read that skill first if any decision below is ambiguous.

## When to Run This

Check whether the framework already exists before doing anything:

```bash
find . -name "playwright.config.ts" -not -path "*/node_modules/*"
ls fixtures/index.ts pages/BasePage.ts 2>/dev/null
```

If `playwright.config.ts` and `fixtures/index.ts` both already exist, **stop** — tell the user the framework is already scaffolded and point them to `create-playwright-spec` instead. Do not overwrite an existing setup.

## Interactive Discovery

Use `AskUserQuestion` to gather this before writing anything:

### Step 1 — Base URL (required)

> **What's the base URL of the application these tests will drive?**

This goes into `env/.env` and `env/.env.example` as `BASE_URL`. Never guess or invent one.

### Step 2 — Package manager

Detect from lockfiles first — don't ask if this is unambiguous:

```bash
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
```

If none exist and there's no `package.json` yet, ask the user (default: npm).

## Steps to Scaffold

### 1. Directory structure

```bash
mkdir -p fixtures pages support tests env .github/workflows
```

### 2. `package.json` and dependencies

If `package.json` doesn't exist, create it first (`npm init -y` or equivalent for the detected package manager), then add dependencies without clobbering any existing scripts:

```bash
npm install -D @playwright/test @types/node dotenv prettier
npx playwright install --with-deps chromium
```

Only add a domain-specific client library (data-seeding SDK, faker-style generator) if the user has already told you one is needed — don't add `@faker-js/faker` speculatively.

Add convenience scripts to `package.json` — merge these in, don't overwrite any existing `scripts` entries with the same name:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression",
    "test:headed": "playwright test --headed",
    "report": "playwright show-report"
  }
}
```

`run-playwright-tests` checks `package.json` for scripts like these, so scaffolding them up front keeps that skill's discovery working from the start.

### 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "types": ["node"]
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. `playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "env/.env") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: parseInt(process.env.TEST_RETRIES || "0", 10),
  workers: parseInt(process.env.TEST_WORKERS || "5", 10),
  reporter: [
    ["html", { open: "never", outputFolder: process.env.REPORTS_PATH || "playwright-report" }],
  ],
  timeout: 60_000,
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS !== "false",
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

### 5. `env/.env.example` and `env/.env`

```
# Required
BASE_URL=<value from Step 1>

# Test user credentials (fill in once a login-dependent spec needs them)
USERNAME=
USER_PASSWORD=

# Browser options
HEADLESS=true

# Parallel workers (1 = sequential)
TEST_WORKERS=5

# Retry failed tests (0 = no retries)
TEST_RETRIES=0

# Report output directory
REPORTS_PATH=playwright-report
```

`env/.env.example` is committed with blank/placeholder values. `env/.env` is the real, gitignored file — populate `BASE_URL` from Step 1; leave credentials blank until a spec needs them.

### 6. `.gitignore`

Append (don't overwrite) if a `.gitignore` already exists:

```
# Env
env/.env

# Playwright
node_modules/
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/playwright/.auth/
```

### 7. `pages/BasePage.ts`

Keep this minimal — no app-specific locators or wrapper methods. Adding a `navigateTo(url)` that just calls `page.goto(url)` is a zero-value wrapper per `playwright-best-practices`; don't add it here. Real shared behavior (common nav, skeleton-loader waits) gets added later, only when two or more page objects actually need it.

```ts
import { type Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}
}
```

### 8. `fixtures/index.ts`

Start with no custom fixtures — `create-playwright-spec` adds the first page-object fixture when it creates the first spec.

```ts
import { test as base } from "@playwright/test";

export const test = base.extend({});
export { expect } from "@playwright/test";
```

### 9. Baseline CI workflows

Create these four files. They form a working orchestrator from day one, so `playwright-regression-workflow` has something to add new suites to later — don't skip this even though `tests/` is still empty at scaffold time (the workflows simply won't find any matching-tagged tests until specs exist).

**`.github/workflows/pw-regression-template.yml`** (reusable job template):

```yaml
name: PW Regression Template

on:
  workflow_call:
    inputs:
      playwright_tag:
        required: true
        type: string
      workers:
        required: false
        type: string
        default: '5'
      report_name:
        required: false
        type: string
        default: playwright-report

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test --grep "${{ inputs.playwright_tag }}"
      env:
        TEST_WORKERS: ${{ inputs.workers }}
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: ${{ inputs.report_name }}
        path: playwright-report/
        retention-days: 30
```

**`.github/workflows/pw-orchestrator.yml`** (runs smoke on push/PR, regression on manual dispatch):

```yaml
name: PW Regression Orchestrator

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      workers:
        description: 'Number of parallel workers'
        required: false
        default: '5'

jobs:
  run-smoke:
    if: github.event_name == 'push' || github.event_name == 'pull_request'
    uses: ./.github/workflows/pw-regression-template.yml
    with:
      playwright_tag: '@smoke'
      workers: ${{ inputs.workers || '5' }}
      report_name: playwright-report-smoke

  run-regression:
    if: github.event_name == 'workflow_dispatch'
    uses: ./.github/workflows/pw-regression-template.yml
    with:
      playwright_tag: '@regression'
      workers: ${{ inputs.workers || '5' }}
      report_name: playwright-report-regression
```

**`.github/workflows/pw-smoke.yml`** and **`.github/workflows/pw-regression.yml`** (standalone manual-dispatch entry points, same shape, only `playwright_tag`/`report_name` differ):

```yaml
name: PW Smoke Tests

on:
  workflow_dispatch:
    inputs:
      workers:
        description: 'Number of parallel workers'
        required: false
        default: '5'

jobs:
  run-smoke:
    uses: ./.github/workflows/pw-regression-template.yml
    with:
      playwright_tag: '@smoke'
      workers: ${{ inputs.workers || '5' }}
      report_name: playwright-report-smoke
```

Do not also create a separate basic `playwright.yml` — the orchestrator's `run-smoke` job already covers push/PR CI. A second push-triggered workflow duplicates the same run.

### 10. Verify the CI YAML

```bash
for f in .github/workflows/pw-*.yml; do
  ruby -ryaml -e "YAML.safe_load(File.read('$f')); puts '$f VALID'"
done
```

## Validation (MANDATORY)

```bash
npx tsc --noEmit
npx playwright --version
find . -maxdepth 2 -not -path "./node_modules*" -not -path "./.git*" | sort
```

Confirm the tree matches: `fixtures/index.ts`, `pages/BasePage.ts`, `support/` (empty), `tests/` (empty), `env/.env.example`, `env/.env`, `playwright.config.ts`, `tsconfig.json`, `.gitignore`, `.github/workflows/pw-*.yml`.

## Rules

- ALWAYS check for an existing `playwright.config.ts` / `fixtures/index.ts` before scaffolding — never overwrite an existing setup, merge/append instead (especially `.gitignore`).
- ALWAYS use `AskUserQuestion` for the base URL — never guess or invent one.
- NEVER commit `env/.env` — only `env/.env.example`. Confirm `.gitignore` covers it before finishing.
- Keep `pages/BasePage.ts` and `fixtures/index.ts` minimal. No app-specific locators, no speculative fixtures, no zero-value wrapper methods — those get added by `create-playwright-spec` as real specs are written.
- Do not add an example/placeholder spec file — `tests/` stays empty until `create-playwright-spec` creates the first real one.
- After scaffolding completes and validation passes, tell the user the next step is `create-playwright-spec`.
