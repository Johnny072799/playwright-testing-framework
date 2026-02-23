# CI Strategy: Regression & Smoke Tests

[← README](../README.md) · [Index](INDEX.md)

Smoke tests run on every PR; full regression runs nightly. Same workflows and secrets for any GitHub repo.

---

## Workflow layout

| Workflow | Trigger | Command | Purpose |
|----------|---------|---------|---------|
| **Smoke** | `pull_request`, `push` to main | `npm run test -- -p smoke` | Fast sanity check on PRs and main |
| **Regression (nightly)** | `schedule` (cron) | `npm run test -- -p regression` | Full suite, catches regressions overnight |

---

## Setup

1. Workflows: `.github/workflows/smoke-on-pr.yml` and `regression-nightly.yml`
2. Repo secrets: **Settings → Secrets and variables → Actions**
   - `BASE_URL` – App under test
   - `TEST_USERNAME` – Test user (for login scenarios)
   - `TEST_PASSWORD` – Test password
3. Push a PR → smoke runs. Push to main or wait for schedule → regression runs.

---

## Smoke vs regression

- **Smoke** – Small set of critical scenarios (e.g. 2–5 min). Fast feedback before merge.
- **Regression** – Full suite (e.g. 15–30 min). Typical schedule: `0 6 * * *` = 6:00 UTC nightly.

---

## Optional tuning

| Tuning | Where | Notes |
|--------|-------|-------|
| **Schedule** | Workflow `schedule` | Adjust cron (e.g. `0 6 * * *` = 6 AM UTC) |
| **Parallel workers** | Workflow env `PARALLEL` | `2` or `4` for faster runs |
| **Required checks** | Branch protection | Require smoke to pass before merge |

