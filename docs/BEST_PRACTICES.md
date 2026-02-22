# Best Practices

[← README](../README.md) · [Index](INDEX.md)

## Design for testability

**If we consider how we will test the application before or while we develop it, testing becomes a natural extension of development rather than a burdensome afterthought.**

Think about selectors, flows, and data needs up front. Collaborate with the app team on stable attributes (e.g. `data-testid`) when feasible. This reduces friction later and keeps tests maintainable.

---

## Page object pattern

### Core principle

**Steps stay thin** – create page objects and call methods; no locators or config logic.

**Page objects hold all locators, interaction logic, and assertions.**

### All locators belong in page objects

❌ **BAD** – Locator in step definition:

```typescript
Then("I should see the error message", async function (this: CustomWorld) {
  const errorLocator = this.page.locator(".oxd-alert-content-text");
  const errorText = await errorLocator.textContent();
});
```

✅ **GOOD** – Locator in page object:

```typescript
// In login-page.ts
errorMessage(): Locator {
  return this.page.locator(".oxd-alert-content-text");
}

// In login-steps.ts
Then("I should see the error message", async function (this: CustomWorld) {
  const loginPage = new LoginPage(this.page);
  const errorText = await loginPage.errorMessage().textContent();
});
```

### Page objects return locators, not actions

❌ **BAD** – Direct action in locator method:

```typescript
errorMessage(): Promise<string | null> {
  return this.page.locator(".oxd-alert-content-text").textContent();
}
```

✅ **GOOD** – Return `Locator`, call action in step or page method:

```typescript
errorMessage(): Locator {
  return this.page.locator(".oxd-alert-content-text");
}
```

### Steps orchestrate, page objects execute

Steps: create page objects, call methods, use world state, assert.

Page objects: hold locators, contain interaction logic, handle waits, import config/utilities as needed.

### Step DON'Ts

- Include business logic or helper functions—move to page objects or support
- Perform complex data transformations—keep steps thin
- Pass the world object to support classes—pass only needed data as parameters

---

## One page per screen

When navigation goes to a different URL or distinct UI (e.g. list vs. add form), use a separate page object.

✅ **GOOD** – `users-page.ts` (list) and `add-user-page.ts` (form)  
❌ **BAD** – Single page with locators for both list and form

---

## Base page and shared locators

All page objects extend `BasePage`. Shared locators (errors, toasts) live there—if they change, update once. Use `common-page.ts` (which extends `BasePage`) when you need common locators without a specific page context. Put shared assertion steps in `common-steps.ts`.

---

## Shared utilities

Extract repeated interaction patterns into support utilities (e.g. `dropdown-utils.ts`, `wait-for.ts`). Page objects import and use them; steps do not.

**Keep helpers framework-agnostic**: avoid passing the world object or Cucumber-specific types. Accept primitives, `Locator`, or domain types. This keeps support code portable and reusable across framework changes.

Use static methods when a utility has no instance state. Add JSDoc for complex or non-obvious methods.

---

## Waits

**Use condition-based waits instead of fixed timeouts.** Wait for the actual UI state (element visible, text changed, loading finished).

✅ **GOOD** – `await locator.waitFor({ state: "visible" })`, filter by `hasNotText: "Searching"`, `waitFor` from `wait-for.ts`  
❌ **BAD** – `await page.waitForTimeout(2000)` or arbitrary sleeps

---

## Typed data

Use typed interfaces (e.g. `User`) for method parameters. Pass domain objects rather than inline anonymous objects.

## Data management

- Use data generators (e.g. faker) or config for test data rather than hardcoding in steps
- Clean up test data after execution when tests create records that could affect other runs

---

## Given, When, Then

- **Given** – Set up preconditions and state. Invalid or missing data belongs here—clear or modify the data (e.g. `essUser.userRole = ""`).
- **When** – Perform the action under test (e.g. click, submit, navigate). Use page object methods. Verify required data is in the world before calling.
- **Then** – Verify the outcome. Perform immediate UI checks (e.g. element visible, text correct, error message shown).

### When (actions)

- Use methods from page object classes to interact with elements.
- Verify any data needed from the world is present before calling (e.g. `state.get<T>(key)` at the start)—avoids null/undefined and fails fast.

### Then (verification)

- Confirm the expected state in the UI (e.g. text field contains entered value, error message appears).
- Assert on locators returned by page objects; keep assertions in the step.

### And

Use **And** when chaining multiple steps of the same type. Do not repeat Given/When/Then for each—use And for the second and subsequent ones.

✅ **GOOD** – `Given A` `And B` `When C` `Then D`  
❌ **BAD** – `Given A` `Given B` `When C` `Then D` (redundant keywords)

### Step definitions

Declare each step once, using the keyword that matches its role in the feature: Given for setup, When for actions, Then for verification. Do not register the same step for multiple keywords.

---

## Given steps mould the world

**Given** steps set up state. Invalid or missing data belongs there—clear or modify the data (e.g. `essUser.userRole = ""`).

**Subsequent methods** should adapt: if a field is empty, don't fill it. Do not pass explicit "omit" flags; the data itself carries the intent.

**Verify data before When steps** – When steps should call `state.get<T>(key)` at the start. If data is missing, `WorldState.get` throws a clear error. This fails fast and makes debugging easier.

✅ **GOOD** – Given clears the field; `addUser(user)` skips filling when `user.userRole` is empty  
❌ **BAD** – `addUser(user, omitFields: ["userRole"])`

---

## Empty-field validation scenarios

When validating required-field error messages, use **individual, explicit Given steps**—one per test case. Create user, set state, then mutate the field. Match the pattern in `login-user-test-data-steps.ts`.

✅ **GOOD** – Each Given is a plain async function  
❌ **BAD** – Factory function or mapping object to generate steps

---

## Step file organization

- **Domain folders** – Group by area (e.g. `steps/login/`, `steps/checkout/`).
- **Flow steps** (`{domain}-steps.ts`) – Page navigation, actions, assertions.
- **User test data steps** (`{domain}-user-test-data-steps.ts`) – Set up user credentials in state.
- **Feature-specific steps** (`{feature}-steps.ts`) – Steps for a specific feature within a domain.

---

## Framework independence

Maintain the ability to migrate frameworks by keeping core logic free of framework-specific dependencies.

**Signs your code is migration-ready:**
- Support utilities can be used in any TypeScript project
- Page objects depend only on the driver interface (e.g. Playwright `Page`/`Locator`)
- No Cucumber-specific code outside of step definitions
- World object is not passed to support classes

---

## Code review checklist

Before merging, verify:

- [ ] Step definitions contain only orchestration logic
- [ ] All page interactions are in page objects
- [ ] Support classes do not reference the world object
- [ ] Methods have single responsibilities
- [ ] Locators are maintained in page classes
- [ ] No framework-specific code in support utilities
- [ ] Error messages are meaningful
- [ ] Code follows naming conventions (see PROJECT_STRUCTURE)
