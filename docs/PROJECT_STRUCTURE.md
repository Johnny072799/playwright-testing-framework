# Project Structure

[← README](../README.md) · [Index](INDEX.md)

This document describes the **conventions and patterns** for organizing the framework. Adapt the domain and feature names to your application.

## How it fits together

1. **Features** – Describe behavior in Gherkin (Given/When/Then). Group by domain in subfolders (e.g. `features/auth/`, `features/checkout/`).

2. **Steps** – Stay thin: create page objects and call methods; no locators or config logic. Group by domain in subfolders. Put shared steps (e.g. error assertions) in `steps/common-steps.ts`.

3. **Given steps mould the world** – They set up state (e.g. user data). Invalid or missing data is created here (clear the field). Subsequent methods should adapt to whatever data they receive.

4. **Page objects** – All extend `BasePage`; hold locators, interaction logic, and assertions. Shared locators (errors, toasts) live in `BasePage`; if they change, update once. Page objects may import config and utilities (e.g. `wait-for.ts`) for retry logic.

5. **World** – Each scenario gets a fresh `page`, `context`, and `state`. Use `state.get<T>(key)` and `state.set(key, value)` to share data between steps.

6. **Hooks** – Start/stop the browser and capture screenshots on failure.

New step files in `steps/` (including subfolders) are picked up automatically via a glob.

---

## Naming conventions

### Files

| Type            | Pattern                                | Example                                  |
|-----------------|----------------------------------------|------------------------------------------|
| Feature files   | `name.feature` (lowercase, kebab-case) | `sign-in.feature`, `checkout.feature` |
| Step definitions| `name-steps.ts` or `{domain}-purpose-steps.ts` | `auth-steps.ts`, `auth-user-test-data-steps.ts` |
| Page objects    | `name-page.ts` (kebab-case + `-page`)  | `sign-in-page.ts`, `checkout-form-page.ts` |
| Support files   | `kebab-case.ts`      | `world.ts`, `config.ts`, `user-test-data.ts` |

### Organization

- **Domain folders** – Group features and steps by area (e.g. `features/auth/`, `steps/auth/`).
- **User test data steps** – Use `{domain}-user-test-data-steps.ts` for steps that set up user credentials in state (e.g. "I am a valid user").

### Variables and identifiers

| Type                        | Pattern             | Example                            |
|-----------------------------|---------------------|------------------------------------|
| Classes                     | PascalCase          | `ExamplePage`, `CustomWorld`       |
| Variables, functions, methods | camelCase         | `examplePage`, `openHomePage()`    |
| Environment variables       | SCREAMING_SNAKE_CASE | `BASE_URL`, `HEADLESS`            |
| Tags                        | `@kebab-case`       | `@smoke`, `@my-tag`, `@regression` |
