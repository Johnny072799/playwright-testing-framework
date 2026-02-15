# E2E Test Framework

A Playwright + Cucumber (TypeScript) setup for browser end-to-end tests. This guide is for developers who need to run these tests on a new machine or onboard to the project.

---

## First-time setup (what you need to run the tests)

If you’re new to the team or cloning the repo for the first time, do this once on your machine:

### 1. Install Node.js

The framework needs Node.js (which includes npm). If you don’t have it:

- Download the **LTS** build from [nodejs.org](https://nodejs.org), or
- If you use Homebrew: `brew install node`

After installing, open a new terminal and run:

```bash
node --version
npm --version
```

You should see version numbers.

### 2. Install project dependencies

In the project root:

```bash
npm install
npx playwright install
```

`npm install` pulls in Cucumber, Playwright, and TypeScript. `npx playwright install` downloads the browser binaries (Chromium, etc.) Playwright uses.

### 3. Configure environment variables

Copy the example env file into your local env:

```bash
cp tests/cucumber/env/.env.example tests/cucumber/env/.env
```

Edit `tests/cucumber/env/.env` and set `BASE_URL` to the app you’re testing (e.g. `https://staging.myapp.com`). Other variables are optional.

### 4. Run the tests

```bash
npm run test
```

If that passes, setup is done.

---

## Profiles and tags (plain English)

**Profiles** and **tags** both control which tests run, but in different ways.

### Tags

Tags are labels you add to scenarios in feature files, e.g. `@smoke`, `@regression`, `@my-tag`. They’re like labels on a folder: you can choose to run only the scenarios with a given label.

**Commands to run by tag:**

```bash
npm run test -- -t @smoke
npm run test -- -t @my-tag
```

The `--` tells npm to pass the rest of the command to Cucumber. You can use any tag you define in your features.

### Profiles

Profiles are named bundles of settings (e.g. which tags to run, format, paths). Think of them as saved configurations. The project defines profiles like `smoke`, `regression`, and `my-tag` that combine the base setup with a specific tag filter.

**Commands to run by profile:**

```bash
npm run test -- -p smoke
npm run test -- -p regression
npm run test -- -p my-tag
```

`-- -p smoke` passes the profile flag to the test runner, which “use the smoke profile,” which runs only scenarios tagged `@smoke`. Profiles are defined in `tests/cucumber/cucumber-profiles.ts`; you can add more there.

### When to use which

- Use **tags** when you want to filter by one or more tags on the fly: `npm run test -- -t "@wip"`.
- Use **profiles** when you want a named, reusable config (e.g. `smoke`, `regression`) that you or CI can run with `npm run test -- -p profile-name` (notice there is no "@" included when running profiles).

---

## Commands

| Command | What it does |
|--------|---------------|
| `npm run test` | Run all tests (headless) |
| `npm run test -- -p smoke` | Run only the smoke profile |
| `npm run test -- -t @my-tag` | Run only scenarios with `@my-tag` |
| `npm run test:e2e:debug` | Run with Playwright inspector for debugging |

---

## Project layout (what’s what)

```
tests/cucumber/
├── features/           # Gherkin feature files (.feature)
├── steps/              # Step definitions (Given, Then, etc.)
├── support/            # Hooks, world, config, page objects
│   ├── pages/          # Page object classes
│   ├── config.ts       # Environment/config
│   ├── world.ts        # CustomWorld (page, context, state)
│   ├── worldState.ts   # Key-value store for sharing data between steps
│   └── hooks.ts        # Before/After hooks (browser lifecycle)
├── env/
│   ├── .env.example    # Template for env vars
│   └── .env            # Your local env (gitignored)
└── cucumber-profiles.ts # Profile definitions (smoke, regression, etc.)
```

**How it fits together**

1. **Features** describe behavior in Gherkin (Given/When/Then).
2. **Steps** implement those sentences and call page objects.
3. **Page objects** hold the actual Playwright calls (click, type, assertions).
4. **World** gives each scenario a fresh `page`, `context`, and `state`.
5. **Hooks** start/stop the browser and capture screenshots on failure.

Steps stay thin; interaction logic lives in page objects. New step files in `steps/` are picked up automatically via a glob.

---

## Naming conventions

**Files**

| Type | Pattern | Example |
|------|---------|---------|
| Feature files | `name.feature` (lowercase, descriptive) | `example.feature` |
| Step definitions | `name-steps.ts` (kebab-case + `-steps`) | `example-steps.ts` |
| Page objects | `name-page.ts` (kebab-case + `-page`) | `example-page.ts` |
| Support files | `camelCase.ts` | `world.ts`, `worldState.ts`, `config.ts`, `hooks.ts` |

**Variables and identifiers**

| Type | Pattern | Example |
|------|---------|---------|
| Classes | PascalCase | `ExamplePage`, `CustomWorld`, `WorldState` |
| Variables, functions, methods | camelCase | `examplePage`, `openHomePage()`, `baseUrl` |
| Environment variables | SCREAMING_SNAKE_CASE | `BASE_URL`, `HEADLESS`, `START_MAXIMIZED` |
| Tags | `@kebab-case` | `@smoke`, `@my-tag`, `@regression` |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | Yes | Base URL of the app under test |
| `HEADLESS` | No | `true` = headless, `false` = visible browser (default: `true`) |
| `START_MAXIMIZED` | No | `true` = maximize window when headed (default: `false`) |
| `TEST_USER_EMAIL` | No | Optional test user email |
| `TEST_USER_PASSWORD` | No | Optional test user password |

---

## Failure artifacts

On failure, the framework saves:

- **Screenshots** → `artifacts/screenshots/`
- **Playwright traces** → `artifacts/traces/`

These are also attached to the Cucumber report so you can inspect them in the output.
