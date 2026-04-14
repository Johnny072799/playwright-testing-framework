# Run Playwright Tests

Run Playwright tests for this project.

## Input

The user will specify what to run. This could be:

- "run all tests"
- A specific test file or directory path
- A tag to filter by (e.g. `@smoke`, `@login`)
- A test name pattern

## Pre-Flight: Discover the Config

First, locate the Playwright config file. Check common locations:

```bash
find . -name "playwright.config.ts" -not -path "*/node_modules/*"
```

Use the discovered path in all commands below (referred to as `<config>`). If multiple configs exist, ask the user which one to use.

Also confirm the env file is present if the config loads one:

```bash
# Look for .env loading in the config
grep -n "dotenv\|\.env" <config>
```

## Commands

### Run all tests

```bash
npx playwright test --config <config>
```

### Run a specific spec file

```bash
npx playwright test --config <config> <path/to/spec.ts>
```

### Run by test name (grep)

```bash
npx playwright test --config <config> --grep "test name pattern"
```

### Run by tag

```bash
npx playwright test --config <config> --grep "@smoke"
npx playwright test --config <config> --grep "@login"
```

### Run by Playwright project (if multiple projects are defined in the config)

```bash
npx playwright test --config <config> --project=<project-name>
```

To list available projects:

```bash
npx playwright test --config <config> --list-projects 2>/dev/null || grep -A5 "projects:" <config>
```

### Run with options

```bash
# Headed mode (see the browser)
npx playwright test --config <config> <path> --headed

# Single worker (serial execution)
npx playwright test --config <config> <path> --workers=1

# With retries
npx playwright test --config <config> <path> --retries=2

# With verbose reporter
npx playwright test --config <config> <path> --reporter=list

# Debug mode (step through with inspector)
npx playwright test --config <config> <path> --debug
```

### Using npm scripts (if defined)

Check `package.json` for available Playwright scripts:

```bash
grep -A1 '"playwright' package.json
```

## Pre-Flight Checks

Before running tests, verify:

1. **Environment file exists** — check where the config loads it from, then confirm it's present with required variables filled in.

2. **TypeScript compiles** cleanly — find the tsconfig for the test directory:
   ```bash
   find . -name "tsconfig.json" -not -path "*/node_modules/*"
   npx tsc --project <test-tsconfig> --noEmit
   ```

3. **Browsers are installed**:
   ```bash
   npx playwright install chromium
   ```

## Viewing Results

### HTML Report

After a test run, find and open the HTML report:

```bash
# Discover report output location from config
grep -A2 "html\|outputFolder\|REPORTS_PATH" <config>

# Then open it
npx playwright show-report <reports-path>
```

### Trace Viewer

For failed tests, view the trace:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

### Other report files

Check the config's `reporter` array for JSON and JUnit output paths:

```bash
grep -A3 "reporter" <config>
```

## Notes

- Default Playwright timeout is 30 seconds per action; global test timeout is set in the config.
- Screenshots, video, and traces are typically captured on failure — check the `use:` block in the config.
- If tests import from a `fixtures/` directory, ensure all fixture dependencies (e.g. external service connections) are configured in the env file before running.
