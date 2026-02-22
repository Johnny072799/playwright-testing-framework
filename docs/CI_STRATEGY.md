# CI Strategy: Regression & Smoke Tests on GitHub

[← README](../README.md) · [Index](INDEX.md)

This document answers how to run nightly regression and PR smoke tests, and whether it works the same for personal vs. company GitHub accounts.

---

## TL;DR

| Question | Answer |
|----------|--------|
| **1a. Can I setup nightly regression on a personal GitHub account?** | Yes. Scheduled workflows work identically. |
| **1b. Will it work the same for any company using GitHub?** | Yes. Same workflow files; companies add their own repo secrets. |
| **2a. Smoke tests on PRs?** | Yes. Same setup; runs on `pull_request` instead of `schedule`. |

---

## 1. Personal vs. Company GitHub – Same Behavior

GitHub Actions behaves the same whether you use a **personal account** or an **organization**. The workflow files (e.g. `.github/workflows/*.yml`) are identical. The only differences are:

- **Secrets**: Each repo configures its own `BASE_URL`, `USERNAME`, `USER_PASSWORD` (or equivalent) under **Settings → Secrets and variables → Actions**.
- **Billing (private repos only)**:
  - Personal: 2,000 minutes/month free
  - Organizations: 3,000 minutes/month free
  - Public repos: unlimited free minutes
- **Permissions**: Orgs may enforce branch protection or required checks; admins configure which workflows are required for merge.

---

## 2. Nightly Regression Runs (1a, 1b)

### How it works

- A workflow runs on a **schedule** (cron).
- Typical schedule: every night (e.g. `0 6 * * *` = 6:00 UTC).
- Runs `npm run test -- -p regression` to execute all `@regression` scenarios.
- Secrets are provided via GitHub Actions secrets.

### Requirements

1. **Repo secrets** (Settings → Secrets → Actions):
   - `BASE_URL` – App under test
   - `TEST_USERNAME` – Test user (for login scenarios)
   - `TEST_PASSWORD` – Test password

2. **Workflow file**: `.github/workflows/regression-nightly.yml`

### Handoff to any company

When a company forks or adopts this framework:

1. Copy the workflow files into their repo (or they come with the framework).
2. Add their own secrets in their repo Settings.
3. Optionally change the schedule timezone or cron expression.
4. Done. No code changes needed.

---

## 3. Smoke Tests on PRs (2a)

### How it works

- A workflow runs on **pull_request** (and optionally `push` to main).
- Runs `npm run test -- -p smoke` for fast feedback.
- Same secrets; smoke tests are a subset of regression (e.g. 2–5 min vs. 15–30 min).

### Why smoke on PRs

- **Speed**: Smoke runs a small set of critical scenarios.
- **Feedback**: Developers see pass/fail before merge.
- **CI minutes**: Short runs use fewer minutes than full regression on every PR.

### Handoff to any company

Same as regression: add secrets, optionally add branch protection requiring the smoke check to pass before merge. No workflow changes needed.

---

## 4. Recommended Workflow Layout

| Workflow | Trigger | Command | Purpose |
|----------|---------|---------|---------|
| **Smoke** | `pull_request`, `push` to main | `npm run test -- -p smoke` | Fast sanity check on PRs and main |
| **Regression (nightly)** | `schedule` (cron) | `npm run test -- -p regression` | Full suite, catches regressions overnight |

---

## 5. Tuning for Companies

Companies can customize without changing the framework:

| Tuning | Where | Notes |
|--------|-------|-------|
| **Schedule timezone** | Workflow `schedule` | Use UTC; e.g. `0 6 * * *` = 6 AM UTC |
| **Parallel workers** | Workflow env `PARALLEL` | `2` or `4` for faster runs on paid runners |
| **Required checks** | Branch protection | Require "Smoke" to pass before merge |
| **Artifacts retention** | Workflow `upload-artifacts` | Retain screenshots/traces on failure |
| **Self-hosted runners** | `runs-on` | Swap `ubuntu-latest` for company runners if needed |

---

## 6. Quick Start for Your Repo

1. Ensure workflows exist: `.github/workflows/smoke-on-pr.yml` and `regression-nightly.yml`.
2. Add secrets: **Settings → Secrets and variables → Actions** → New repository secret:
   - `BASE_URL`
   - `TEST_USERNAME`
   - `TEST_PASSWORD`
3. Push a PR → smoke runs automatically. Push to main or wait for schedule → regression runs.

---

## 7. Summary

- **Personal GitHub**: Yes, nightly regression and smoke on PRs both work.
- **Company GitHub**: Yes, same workflows; each org/repo adds its own secrets and optional tuning.
- The framework is designed to be **portable**: copy workflows + add secrets = done.
