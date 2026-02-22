# CI Configuration

[← README](../README.md) · [Index](INDEX.md)

This repo includes GitHub Actions workflows for smoke (on PRs) and nightly regression. For the full strategy—personal vs. company, handoff, tuning—see [CI_STRATEGY.md](CI_STRATEGY.md).

## Included workflows

| Workflow | File | Trigger |
|----------|------|---------|
| **Smoke** | `.github/workflows/smoke-on-pr.yml` | Every PR and push to main/master |
| **Regression (nightly)** | `.github/workflows/regression-nightly.yml` | 6:00 UTC daily + manual run |

## One-time setup

1. Add repo secrets: **Settings → Secrets and variables → Actions**
   - `BASE_URL` – app under test
   - `TEST_USERNAME` – test user (for login scenarios)
   - `TEST_PASSWORD` – test password
2. Push a PR → smoke runs. Nightly regression runs on schedule (or trigger manually from the Actions tab).

## Commands (for reference)

```bash
npm run test -- -p smoke      # Smoke profile
npm run test -- -p regression # Full regression
```

## Environment variables in CI

Set in the workflow (or as repo vars). Do not commit secrets.

- `BASE_URL` – required
- `USERNAME`, `USER_PASSWORD` – required for login scenarios
- `HEADLESS=true` – typically for CI
- `PARALLEL` – e.g. `2` or `4` for faster runs

## Artifacts

On failure, workflows upload `artifacts/screenshots/` and `artifacts/traces/` so you can download and inspect. See [ARTIFACTS_AND_REPORTING.md](ARTIFACTS_AND_REPORTING.md).
