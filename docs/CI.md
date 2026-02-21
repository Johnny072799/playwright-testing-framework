# CI Configuration

[← README](../README.md) · [Index](INDEX.md)

This repo does not include CI config by default. Below is a recommended approach.

## Recommended setup

### Smoke on every PR/commit

Run smoke tests for fast feedback:

```bash
npm run test -- -p smoke
```

### Full regression before merge or nightly

Run the full suite:

```bash
npm run test -- -p regression
```

### Environment variables in CI

Set these in your CI pipeline (do not commit secrets):

- `BASE_URL` – required
- `USERNAME`, `USER_PASSWORD` – required for login scenarios
- `HEADLESS=true` – typically for CI
- `PARALLEL` – e.g. `2` or `4` for faster runs (tune based on runners)

### Artifacts

Configure CI to retain `artifacts/` on failure so you can download screenshots and traces. See [ARTIFACTS_AND_REPORTING.md](ARTIFACTS_AND_REPORTING.md).

### Example (GitHub Actions)

```yaml
- name: Run smoke tests
  run: npm run test -- -p smoke
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    USERNAME: ${{ secrets.TEST_USERNAME }}
    USER_PASSWORD: ${{ secrets.TEST_PASSWORD }}
    HEADLESS: true
```
