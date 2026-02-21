# Environment Configuration

[← README](../README.md) · [Index](INDEX.md)

## Overview

The framework loads environment variables from `tests/cucumber/env/.env`. It prefers that file, then falls back to a `.env` in the project root. In CI, set vars in the pipeline; the `.env` file is for local development only.

## Setup

Copy the example and edit:

```bash
cp tests/cucumber/env/.env.example tests/cucumber/env/.env
```

Edit `tests/cucumber/env/.env` and set values as needed.

## Variables reference

| Variable        | Required | Description                                                |
|-----------------|----------|------------------------------------------------------------|
| `BASE_URL`      | Yes      | Base URL of the app under test                             |
| `USERNAME`      | No†      | Test user username (required for login scenarios)          |
| `USER_PASSWORD` | No†      | Test user password (required for login scenarios)          |
| `HEADLESS`      | No       | `true` = headless, `false` = visible (default: `true`)     |
| `START_MAXIMIZED` | No     | `true` = maximize when headed (default: `false`)           |
| `PARALLEL`      | No       | Workers for parallel execution (default: `1` = sequential) |

†Required for login scenarios.

## Where it loads

- Config is in `tests/cucumber/support/config.ts`.
- It uses `dotenv` to load from `tests/cucumber/env/.env` when not in CI.
- If `BASE_URL` is missing, it falls back to the project root `.env`.
