# Project Structure

[← README](../README.md) · [Index](INDEX.md)

## Folder layout

```
tests/cucumber/
├── features/                   # Gherkin feature files (.feature)
│   ├── admin/                  # Domain: admin features
│   │   └── user-management/
│   │       └── users.feature
│   ├── login/                  # Domain: login features
│   │   ├── login.feature
│   │   └── forgot-password.feature
│   └── example.feature         # Standalone features
├── steps/                      # Step definitions (Given, When, Then)
│   ├── admin/
│   │   └── user-management/
│   │       └── users-steps.ts
│   ├── common-steps.ts         # Shared steps (e.g. error message assertions)
│   ├── login/
│   │   ├── login-steps.ts
│   │   ├── login-user-test-data-steps.ts
│   │   └── forgot-password-steps.ts
│   ├── navigation-steps.ts     # Side nav, page navigation
│   └── example-steps.ts
├── support/                    # Hooks, world, config, page objects, utilities
│   ├── pages/                  # Page object classes (all locators and logic)
│   │   ├── base-page.ts        # Base class: common locators; all pages extend it
│   │   ├── common-page.ts      # Shared locators (extends BasePage); used when no specific page
│   │   ├── login-page.ts
│   │   ├── forgot-password-page.ts
│   │   ├── navigation-page.ts  # Side nav locators
│   │   └── user-management/
│   │       ├── users-page.ts       # User list page
│   │       └── add-user-page.ts    # Add user form page
│   ├── user-test-data.ts       # UserData (framework-agnostic); User interface
│   ├── dropdown-utils.ts       # Shared dropdown selection utility
│   ├── wait-for.ts             # Retry utility for waiting on conditions
│   ├── config.ts               # Environment/config
│   ├── world.ts                # CustomWorld (page, context, state)
│   ├── worldState.ts           # Key-value store for sharing data between steps
│   └── hooks.ts                # Before/After hooks (browser lifecycle)
├── env/
│   ├── .env.example            # Template for env vars
│   └── .env                    # Your local env (gitignored)
└── cucumber-profiles.ts        # Profile definitions (smoke, regression, login)
```

---

## How it fits together

1. **Features** – Describe behavior in Gherkin (Given/When/Then). Group by domain in subfolders (e.g. `features/login/`).

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
| Feature files   | `name.feature` (lowercase, kebab-case) | `login.feature`, `forgot-password.feature` |
| Step definitions| `name-steps.ts` or `domain-purpose-steps.ts` | `login-steps.ts`, `login-user-test-data-steps.ts` |
| Page objects    | `name-page.ts` (kebab-case + `-page`)  | `login-page.ts`, `add-user-page.ts`      |
| Support files   | `camelCase.ts` or `kebab-case.ts`      | `world.ts`, `config.ts`, `user-test-data.ts` |

### Organization

- **Domain folders** – Group features and steps by area (e.g. `features/login/`, `steps/login/`).
- **User test data steps** – Use `{domain}-user-test-data-steps.ts` for steps that set up user credentials in state (e.g. "I am a valid user").

### Variables and identifiers

| Type                        | Pattern             | Example                            |
|-----------------------------|---------------------|------------------------------------|
| Classes                     | PascalCase          | `ExamplePage`, `CustomWorld`       |
| Variables, functions, methods | camelCase         | `examplePage`, `openHomePage()`    |
| Environment variables       | SCREAMING_SNAKE_CASE | `BASE_URL`, `HEADLESS`            |
| Tags                        | `@kebab-case`       | `@smoke`, `@my-tag`, `@regression` |
