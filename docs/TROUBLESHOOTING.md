# Troubleshooting

[← README](../README.md) · [Index](INDEX.md)

## 1. `npm` or `node` not found

**Cause:** Shell config (e.g. `.zshrc`) not loaded, or Node not in PATH (common with nvm/fnm).

**Fix:**
```bash
source ~/.nvm/nvm.sh   # if using nvm
# or
eval "$(fnm env)"     # if using fnm
```

Or reinstall Node via [nodejs.org](https://nodejs.org) (LTS) or Homebrew: `brew install node`.

---

## 2. Playwright browsers not installed

**Error:** Tests fail with browser launch errors.

**Fix:**
```bash
npx playwright install
```

---

## 3. Missing environment variables

**Error:** `Missing required environment variable "BASE_URL"`.

**Fix:** Copy and edit the env file:
```bash
cp tests/cucumber/env/.env.example tests/cucumber/env/.env
```

Edit `tests/cucumber/env/.env` and set `BASE_URL` (and `USERNAME`/`USER_PASSWORD` for login scenarios).

---

## 4. Timeouts (elements not found, slow tests)

**Cause:** Elements load slowly or selectors don't match.

**Fix:**
- Prefer condition-based waits: `await locator.waitFor({ state: "visible" })` instead of fixed `waitForTimeout`.
- For autocomplete/async UI, wait for loading state to finish (e.g. filter by `hasNotText: "Searching"`).
- Increase Playwright timeout in page objects if needed: `{ timeout: 15000 }`.

---

## 5. Headed vs headless differences

**Symptom:** Tests pass headless but fail when the browser is visible (or vice versa).

**Fix:**
- Run headed to observe: `npm run test:e2e:headed`
- Use `PWDEBUG=1` for step-through debugging: `npm run test:e2e:debug`
- Some timing issues appear only in one mode; prefer condition-based waits for stability.

---

## 6. Cursor/VSCode terminal doesn't load Node or aliases

**Cause:** Integrated terminal may not source `.zshrc` or use a login shell.

**Fix:** Add to Cursor settings:
```json
"terminal.integrated.shellArgs.osx": ["-l"]
```
This forces a login shell so `.zshrc` is sourced.

---

## Anti-patterns and fixes

| Anti-pattern                      | Problem                          | Solution                                        |
|-----------------------------------|----------------------------------|-------------------------------------------------|
| Functions in step files           | Violates separation of concerns  | Move to page objects or support utilities       |
| Passing World to support classes  | Creates framework dependency     | Pass only needed data as parameters             |
| Hardcoded waits / `waitForTimeout`| Flaky tests, slow execution      | Use condition-based waits (`locator.waitFor`)   |
| Locators in step definitions      | Brittle, duplicated selectors    | Put all locators in page objects                |
| Business logic in steps           | Hard to maintain, reuse          | Put logic in page objects or support            |
