# Contributing

[← README](../README.md) · [Index](INDEX.md)

## Adding new features and steps

1. **New feature file** – Add `@regression` at the Feature level so scenarios are included in regression runs. See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

2. **New steps** – Place in `steps/` under the appropriate domain folder. Steps stay thin; all locators and logic go in page objects. See [BEST_PRACTICES.md](BEST_PRACTICES.md).

3. **New page objects** – Add under `support/pages/`. Use `common-page.ts` for locators shared across pages. One page per screen.

4. **Naming** – Follow conventions in [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) (kebab-case for files, camelCase for methods, etc.).

5. **Gherkin tables** – Vertically align `|` pipes in Examples. See `.cursor/rules/gherkin-formatting.mdc`.

## Project principles

- Prioritize **maintainability** and **clarity** over cleverness or brevity.
- Write with **handoff in mind**—assume the maintainer is new to the framework.
- Keep patterns **consistent** so new devs can learn once and apply everywhere.
