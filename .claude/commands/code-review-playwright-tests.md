# Code Review: Playwright Test

Review a Playwright spec file (or a set of changed files in a PR) against the project's architecture standards. Produce a structured report of violations, warnings, and a pass/fail verdict.

## Input

The user will provide one of:
- A spec file path (e.g. `tests/playwright/consumer/login.spec.ts`)
- A list of changed files (e.g. from a PR description or `git diff --name-only`)
- A general request to review the current branch's changes

If given a PR or branch, determine the base branch first:

```bash
git remote show origin | grep "HEAD branch"
```

Then run:

```bash
git diff origin/<base-branch> --name-only
```

Read each relevant `.spec.ts`, page object, support class, and fixture file before reporting.

## Review Checklist

For each file reviewed, check every item below. Group findings by file and severity.

### Spec Files (`.spec.ts`)

| # | Check | Severity |
|---|---|---|
| 1 | No helper functions (`function` or `async function`) defined in the spec file | Error |
| 2 | No business logic or utility logic inline — belongs in support classes or page objects | Error |
| 3 | All imports come from the project's fixtures entry point (e.g. `fixtures/index.ts` or `fixtures/`) — never from individual fixture files or `@playwright/test` directly | Error |
| 4 | `expect` from Playwright only — no third-party assertion libraries (e.g. `chai`), no `throw new Error` as an assertion | Error |
| 5 | No `page.waitForTimeout()` calls | Error |
| 6 | All test state uses `const`/`let` within the test function — no mutable shared state between tests | Error |
| 7 | No debug-only tags or focused tests left in (`test.only`, `test.describe.only`, or ad-hoc debug tags) | Error |
| 8 | `test.describe` uses a tag array (`{ tag: ['@tagname'] }`) — not a bare string | Warning |
| 9 | Each `test()` covers one logical scenario | Warning |
| 10 | Serial tests (`test.describe.serial`) are only used when tests genuinely depend on shared state or ordering | Warning |

### Page Objects

| # | Check | Severity |
|---|---|---|
| 11 | Locators are defined in the page class, not inline in the spec | Error |
| 12 | No assertions inside page objects — they return values or perform actions only | Error |
| 13 | No imports from legacy test framework packages (e.g. nTAF, Cucumber step definition directories, or automation foundation packages) | Error |
| 14 | Does not inherit from a legacy framework base class — uses a project-appropriate base class or no base class | Error |
| 15 | No zero-value wrapper methods (methods that only call one Playwright API with no added logic) | Warning |
| 16 | `Page` and `Locator` imported as types from `@playwright/test` (not from `playwright`) | Warning |

### Support Classes

| # | Check | Severity |
|---|---|---|
| 17 | Related functions are organized as methods on a class — no standalone exported functions | Error |
| 18 | No duplicate interfaces or types that already exist in project dependencies or `@playwright/test` | Error |
| 19 | No wrapper classes around Playwright APIs that add no logic | Error |
| 20 | Types imported from their canonical source, not re-declared locally | Error |
| 21 | No `page.waitForTimeout()` calls | Error |

### Fixtures

| # | Check | Severity |
|---|---|---|
| 22 | One concern per fixture — no god-fixtures bundling multiple concerns into one object | Error |
| 23 | Setup and teardown co-located using the `use()` pattern — teardown not delegated to `test.afterEach` | Error |
| 24 | Fixture files organized by domain concern (not one file per fixture, not mirroring the test directory structure) | Warning |
| 25 | `fixtures/index.ts` (or the project's designated entry point) is the single export point for `test` and `expect` | Error |

## Output Format

Structure your report as follows:

```
## Code Review: Playwright Architecture

### [filename.spec.ts](path/to/file.spec.ts)

**Errors** (must fix before merge):
- [Check #1] No helper functions in spec files — `async function setupUser(...)` on line 42 must move to a support class
- [Check #5] `page.waitForTimeout(3000)` on line 87 — replace with an explicit locator assertion

**Warnings** (should fix):
- [Check #8] `test.describe` tag should be an array: `{ tag: ['@smoke'] }` not `{ tag: '@smoke' }`

---

### [SomePage.ts](path/to/SomePage.ts)

**Errors:**
- [Check #12] Assertion `expect(...).toBeVisible()` on line 33 belongs in the spec, not the page object

---

## Summary

| Severity | Count |
|---|---|
| Errors | 3 |
| Warnings | 1 |

**Verdict:** FAIL — resolve all errors before merging.
```

If no issues are found in a file, note `No issues found.` for that file.

## Verdict Rules

- **PASS** — zero errors (warnings are acceptable)
- **FAIL** — one or more errors

## Rules

- Read every changed file before reporting — do not guess at violations from filenames alone.
- Report the exact line number and a brief code snippet for each finding.
- Do not suggest fixes beyond what the checklist requires — this is a review, not a rewrite.
- Do not report style preferences (variable naming, comment style) unless they violate a named convention in the checklist.
- If a file cannot be read or does not exist, note it and skip.
