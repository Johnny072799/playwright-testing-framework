# E2E Test Code Review Checklist

[← README](../README.md) · [Index](INDEX.md)

Use this checklist when reviewing test-related changes. For each item, verify compliance and report pass (✅) or violation (❌) with the file and line reference.

---

## 1. Gherkin (Feature files)

| # | Check | Pass |
|---|-------|------|
| 1.1 | Given = preconditions/state, When = action, Then = verification | |
| 1.2 | And used for chaining steps of same type (not repeated Given/When/Then) | |
| 1.3 | Data tables: `\|` pipes vertically aligned | |
| 1.4 | New feature files have `@regression` at Feature level | |
| 1.5 | Feature files: `name.feature` (lowercase, kebab-case) | |
| 1.6 | Grouped by domain in subfolders (e.g. `features/auth/`, `features/checkout/`) | |

---

## 2. Step definitions

| # | Check | Pass |
|---|-------|------|
| 2.1 | Each step declared once; keyword matches role (Given/When/Then) | |
| 2.2 | Steps contain only orchestration—no business logic, no helper functions | |
| 2.3 | No complex data transformations in steps | |
| 2.4 | No locators in step files—all in page objects | |
| 2.5 | Steps call page object methods, use world state, perform assertions | |
| 2.6 | When steps call `state.get<T>(key)` at start when data needed | |
| 2.7 | Step files: `name-steps.ts` or `{domain}-user-test-data-steps.ts` | |
| 2.8 | Grouped by domain (e.g. `steps/auth/`, `steps/checkout/`) | |
| 2.9 | Empty-field validation: individual explicit Given steps (no factory/mapping) | |

---

## 3. Page objects

| # | Check | Pass |
|---|-------|------|
| 3.1 | All page objects extend `BasePage` | |
| 3.2 | Locators return `Locator`, not actions (e.g. not `textContent()`) | |
| 3.3 | One page per screen (list vs form = separate pages) | |
| 3.4 | Shared locators (errors, toasts) in `BasePage` or `common-page.ts` | |
| 3.5 | File naming: `name-page.ts` (kebab-case + `-page`) | |
| 3.6 | Class naming: PascalCase (e.g. `LoginPage`) | |
| 3.7 | Locator methods: camelCase, return `Locator` | |
| 3.8 | Action methods: `async camelCase()` | |

---

## 4. Support utilities

| # | Check | Pass |
|---|-------|------|
| 4.1 | No world object or Cucumber types passed to support classes | |
| 4.2 | Accept primitives, `Locator`, or domain types only | |
| 4.3 | Static methods when no instance state | |
| 4.4 | Page objects import utilities; steps do not | |
| 4.5 | JSDoc on complex or non-obvious methods | |

---

## 5. Waits and data

| # | Check | Pass |
|---|-------|------|
| 5.1 | Condition-based waits only (no `waitForTimeout`, no arbitrary sleeps) | |
| 5.2 | Typed interfaces for method params (e.g. `User`) | |
| 5.3 | Data from config/faker, not hardcoded in steps | |
| 5.4 | Given clears/modifies data; methods adapt to empty fields (no omit flags) | |

---

## 6. Framework independence

| # | Check | Pass |
|---|-------|------|
| 6.1 | No Cucumber-specific code outside step definitions | |
| 6.2 | Support utilities usable in any TypeScript project | |
| 6.3 | Page objects depend only on driver (Page/Locator) | |

---

## 7. Naming and structure

| # | Check | Pass |
|---|-------|------|
| 7.1 | Error messages meaningful | |
| 7.2 | Methods have single responsibility | |
| 7.3 | File/class/variable naming per PROJECT_STRUCTURE | |

---

## Review output format

For each violation, report:
- **File:** path
- **Line(s):** number(s)
- **Check:** checklist item (e.g. 2.4)
- **Issue:** what is wrong
- **Fix:** suggested change

Summarize: X passed, Y failed. List all violations with fixes.
