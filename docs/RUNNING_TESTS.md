# Running Tests

[← README](../README.md) · [Index](INDEX.md)

## Tags vs profiles

**Tags** are labels on scenarios (e.g. `@smoke`, `@regression`). Use them to filter by one or more tags on the fly.

**Profiles** are named configs that combine base setup with a tag filter. Use them for repeatable runs (e.g. CI, nightly).

The `--` tells npm to pass arguments to Cucumber.

### Run by tag

```bash
npm run test -- -t @smoke
npm run test -- -t @login
npm run test -- -t "@smoke and @login"
```

### Run by profile

```bash
npm run test -- -p smoke
npm run test -- -p regression
npm run test -- -p login
```

Profiles (`smoke`, `regression`, `login`) are defined in `tests/cucumber/cucumber-profiles.ts`. Add more there as needed.

### Tag strategy

- **@regression** – Add at the **Feature** level so all scenarios inherit it. Regression runs the full suite.
- **@smoke** – Add at the **Scenario** level for happy-path tests only. Smoke runs a quick sanity check.

By placing `@regression` on the Feature, every scenario (including smoke ones) is included when running regression.

**When adding new feature files**, add `@regression` at the Feature level so those scenarios are included in regression runs.

### When to use which

- Use **tags** when you want to filter on the fly: `npm run test -- -t "@wip"`.
- Use **profiles** when you want a named config for you or CI: `npm run test -- -p smoke` (no `@` in the profile name).

---

## Debug modes

**Headed** – Browser visible (non-headless):

```bash
npm run test:e2e:headed
npm run test:e2e:headed -- -p smoke
```

**Debug** – Playwright inspector for stepping through tests:

```bash
npm run test:e2e:debug
npm run test:e2e:debug -- -t @login
```

---

## Running a single feature or scenario

Use tags to narrow scope:

```bash
npm run test -- -t @login
npm run test -- -t "@my-specific-scenario"
```

Or pass a feature path (Cucumber supports this; profiles may need path overrides):

```bash
npx cucumber-js tests/cucumber/features/login/login.feature
```

---

## Parallel execution

Parallelism is controlled by the `PARALLEL` env var (default: `1` = sequential). See [ENVIRONMENT.md](ENVIRONMENT.md).

---

## CI usage patterns

See [CI.md](CI.md) for recommended CI setup and command patterns.
