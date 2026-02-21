# E2E Test Framework

A Playwright + Cucumber (TypeScript) setup for browser end-to-end tests. Built for SaaS products and handoff to in-house teams.

---

## Quick start

```bash
npm install
npx playwright install
cp tests/cucumber/env/.env.example tests/cucumber/env/.env
```

Edit `tests/cucumber/env/.env`: set `BASE_URL` (and `USERNAME` / `USER_PASSWORD` for login scenarios).

```bash
npm run test
```

If that passes, setup is done.

---

## Core commands

| Command                         | What it does                  |
|---------------------------------|-------------------------------|
| `npm run test`                  | Run all tests (headless)      |
| `npm run test -- -p smoke`      | Run smoke profile             |
| `npm run test -- -p regression` | Run regression profile        |
| `npm run test -- -t @my-tag`    | Run scenarios with `@my-tag`  |
| `npm run test:e2e:headed`       | Run with visible browser      |
| `npm run test:e2e:debug`        | Run with Playwright inspector |

---

## Tags & profiles

**Tags** (e.g. `@smoke`, `@regression`) filter scenarios. **Profiles** (e.g. `smoke`, `regression`) are named configs that apply a tag filter. Profiles are defined in `tests/cucumber/cucumber-profiles.ts`.

→ Full guide: [docs/RUNNING_TESTS.md](docs/RUNNING_TESTS.md)

---

## Environment variables

| Variable       | Required | Description                        |
|----------------|----------|------------------------------------|
| `BASE_URL`     | Yes      | App under test                     |
| `USERNAME`     | No†      | Test user (for login)              |
| `USER_PASSWORD`  | No†      | Test password (for login)          |
| `HEADLESS`     | No       | `true` / `false` (default: `true`) |
| `START_MAXIMIZED` | No    | `true` / `false` (default: `false`)|
| `PARALLEL`     | No       | Workers (default: `1`)             |

†Required for login scenarios.

→ Full reference: [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)

---

## Artifacts

On failure, screenshots go to `artifacts/screenshots/` and traces to `artifacts/traces/`. View traces with:

```bash
npx playwright show-trace artifacts/traces/<trace-filename>.zip
```

→ Details: [docs/ARTIFACTS_AND_REPORTING.md](docs/ARTIFACTS_AND_REPORTING.md)

---

## Project layout

```
tests/cucumber/
├── features/     # Gherkin (.feature)
├── steps/        # Step definitions
├── support/      # Pages, config, world, hooks
├── env/          # .env (gitignored)
└── cucumber-profiles.ts
```

→ Full structure and conventions: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

---

## Contributing

Follow the patterns in [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md): thin steps, locators in page objects, Given steps mould the world. Add `@regression` at Feature level for new feature files.

→ Full rules: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## CI

No CI config is included. Recommended: run `npm run test -- -p smoke` on every PR; run `npm run test -- -p regression` before merge or nightly.

→ Recommended approach: [docs/CI.md](docs/CI.md)

---

## Troubleshooting

Common issues: Node/npm not found, Playwright not installed, missing env vars, timeouts, headed vs headless differences.

→ Top 6 issues and fixes: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## Documentation

| Doc                                      | Description                          |
|------------------------------------------|--------------------------------------|
| [docs/INDEX.md](docs/INDEX.md)           | Full doc index                       |
| [docs/RUNNING_TESTS.md](docs/RUNNING_TESTS.md) | Tags, profiles, debug          |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Layout, conventions        |
| [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) | Page objects, steps, patterns  |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Env vars                         |
| [docs/ARTIFACTS_AND_REPORTING.md](docs/ARTIFACTS_AND_REPORTING.md) | Screenshots, traces   |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common errors               |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution rules             |
| [docs/CI.md](docs/CI.md)                 | CI setup                             |
