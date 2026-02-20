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

Edit `tests/cucumber/env/.env` and set `BASE_URL` (and any other required URLs) to the app you’re testing. For login scenarios, also set `USER_EMAIL` and `USER_PASSWORD`. See `.env.example` for the full list.

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

`-- -p smoke` passes the profile flag to the test runner, which runs only scenarios tagged `@smoke`. Profiles are defined in `tests/cucumber/cucumber-profiles.ts`; you can add more there.

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
| `npm run test:e2e:debug -- -t @login` | Debug with Playwright inspector (tag-specific) |

---

## Project layout (what’s what)

```
tests/cucumber/
├── features/                   # Gherkin feature files (.feature)
│   ├── login/                  # Domain folder: features grouped by area
│   │   ├── login.feature
│   │   └── forgot-password.feature
│   └── example.feature         # Or at root for standalone features
├── steps/                      # Step definitions (Given, When, Then)
│   ├── login/                  # Domain folder: steps grouped by area
│   │   ├── login-steps.ts              # Page/flow steps (being on page, login actions)
│   │   ├── login-user-test-data-steps.ts  # User test data setup
│   │   └── forgot-password-steps.ts
│   └── example-steps.ts        # Or at root for standalone steps
├── support/                    # Hooks, world, config, page objects, utilities
│   ├── pages/                  # Page object classes (all locators and logic)
│   │   ├── login-page.ts
│   │   └── forgot-password-page.ts
│   ├── user-test-data.ts       # UserData class and User interface
│   ├── wait-for.ts             # Retry utility for waiting on conditions
│   ├── config.ts               # Environment/config
│   ├── world.ts                # CustomWorld (page, context, state)
│   ├── worldState.ts           # Key-value store for sharing data between steps
│   └── hooks.ts                # Before/After hooks (browser lifecycle)
├── env/
│   ├── .env.example            # Template for env vars
│   └── .env                    # Your local env (gitignored)
└── cucumber-profiles.ts        # Profile definitions (smoke, regression, etc.)
```

**How it fits together**

1. **Features** describe behavior in Gherkin (Given/When/Then). Group by domain in subfolders (e.g. `features/login/`).
2. **Steps** are thin: they create page objects and call methods; no locators or config logic. Group by domain in subfolders (e.g. `steps/login/`).
3. **Page objects** hold all locators, interaction logic, and assertions. They may import config and utilities (e.g. `wait-for.ts`) for retry logic.
4. **World** gives each scenario a fresh `page`, `context`, and `state`. Use `state.get<T>(key)` and `state.set(key, value)` to share data between steps.
5. **Hooks** start/stop the browser and capture screenshots on failure.

Steps stay thin; all locators and logic live in page objects. New step files in `steps/` (including subfolders) are picked up automatically via a glob.

---

## Naming conventions

**Files**

| Type | Pattern | Example |
|------|---------|---------|
| Feature files | `name.feature` (lowercase, kebab-case) | `login.feature`, `forgot-password.feature` |
| Step definitions | `name-steps.ts` or `domain-purpose-steps.ts` | `login-steps.ts`, `login-user-test-data-steps.ts`, `forgot-password-steps.ts` |
| Page objects | `name-page.ts` (kebab-case + `-page`) | `login-page.ts`, `forgot-password-page.ts` |
| Support files | `camelCase.ts` or `kebab-case.ts` | `world.ts`, `worldState.ts`, `config.ts`, `user-test-data.ts` |

**Organization**

- **Domain folders**: Group features and steps by area (e.g. `features/login/`, `steps/login/`).
- **User test data steps**: Use `{domain}-user-test-data-steps.ts` for steps that set up user credentials in state (e.g. "I am a valid user", "I do not have a valid username").

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
| `USER_EMAIL` | No† | Test user email (required for login scenarios) |
| `USER_PASSWORD` | No† | Test user password (required for login scenarios) |
| `HEADLESS` | No | `true` = headless, `false` = visible browser (default: `true`) |
| `START_MAXIMIZED` | No | `true` = maximize window when headed (default: `false`) |
| `PARALLEL` | No | Number of workers for parallel execution (default: `1` = sequential) |

---

## Failure artifacts

When a scenario fails, the framework saves two kinds of artifacts to help you debug:

### Screenshots

**Location:** `artifacts/screenshots/`  
**Format:** PNG (full-page screenshot)  
**Filename:** Scenario name, sanitized (e.g. `open_the_homepage_and_verify_the_title_contains_example_.png`)

A full-page screenshot of the browser at the moment of failure. Use it to see the UI state when the test failed—useful when an assertion fails or an element is missing.

**How to use:** Open the `.png` file in any image viewer or in the Cucumber report if you use a reporter that shows attachments.

### Playwright traces

**Location:** `artifacts/traces/`  
**Format:** `.zip` (Playwright trace archive)  
**Filename:** Scenario name, sanitized (e.g. `open_the_homepage_and_verify_the_title_contains_example_.zip`)

A trace is a detailed recording of the test run: screenshots at each action, DOM snapshots, network requests, and a timeline. It lets you step through the test and inspect the page at any point.

**How to use:** Open the trace in Playwright’s Trace Viewer:

```bash
npx playwright show-trace artifacts/traces/<trace-filename>.zip
```

The Trace Viewer opens in your browser so you can move through the timeline, inspect DOM, and view network activity at each step.

### Cucumber report attachments

Both the screenshot and trace are attached to the failed scenario in the Cucumber report. If your reporter displays attachments (e.g. HTML report or CI output), you can view them there without opening the files directly.
