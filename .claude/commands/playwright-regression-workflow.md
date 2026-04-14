# Add a Playwright Regression Workflow Job

Add a new Playwright test suite to an existing regression orchestrator workflow, and optionally create a standalone workflow for it.

## Input

The user will describe the test suite they want to add. This could be:

- A Playwright tag (e.g. `@smoke`, `@checkout`, `@login`)
- A spec file or feature area name (e.g. "checkout flow", "user settings")
- A request to "add a workflow for the new X tests"

## Interactive Discovery

Before making changes, gather the information you need by asking the user with `AskUserQuestion`. Follow these steps in order.

### Step 1 — Identify the orchestrator file

Read `.github/workflows/` to list existing workflow files. Look for a file that:
- Has a name suggesting it runs multiple Playwright test suites (e.g. `all-pw-regression-tests.yml`, `pw-orchestrator.yml`)
- Contains multiple jobs that call a shared reusable workflow (uses: `./.github/workflows/...`)

If multiple orchestrators exist, ask the user which one to add to.

### Step 2 — Understand the orchestrator structure

Read the orchestrator file and identify:
- How jobs are grouped (e.g. batches by cron schedule, or a single trigger)
- The reusable workflow each job calls (e.g. `pw-regression-template.yml`)
- The inputs the reusable workflow accepts
- Any list/matrix input that enumerates which suites to run (so you know where to add the new entry)

### Step 3 — Determine the Playwright tag

Ask:

> **What Playwright tag should filter these tests?**
>
> - Suggest a tag based on the user's input
> - Let the user confirm or provide their own

Verify the tag exists in the codebase:

```bash
grep -r "<tag>" tests/ --include="*.spec.ts" -l
```

If no spec files match, warn the user and ask if they want to proceed anyway.

### Step 4 — Determine the kebab-case identifier

Derive a kebab-case identifier from the tag or feature name. This identifier is used for:

- Job ID: `run-<identifier>`
- Suite list entry (if applicable): `<identifier>`
- Report/launch name suffix: `-<identifier>`

Confirm with the user:

> **I'll use `<identifier>` as the identifier. The job will be named `run-<identifier>`. OK?**

### Step 5 — Determine where in the orchestrator to add the job

Show the user the current job groupings (batches, stages, or flat list) and ask where the new job should go. Recommend the group with the fewest jobs to balance load.

### Step 6 — Special options

Ask:

> **Does this test suite need any special configuration?**
>
> - **Single worker** — for tests that must not run in parallel (e.g. tests that modify shared state)
> - **Custom notification channel** — override the default
> - **Default settings** — standard parallel execution

### Step 7 — Standalone workflow

Ask:

> **Do you also want a standalone workflow file for manual or scheduled runs outside the orchestrator?**
>
> - **Yes** — creates `.github/workflows/pw-<identifier>.yml`
> - **No** — only adds to the orchestrator

If yes, ask about cron schedule:

> **What cron schedule for the standalone workflow?** (or "none" for dispatch-only)

## Changes to Make

### A. Update the orchestrator

**File:** the orchestrator identified in Step 1

1. **Add the identifier to any suite list or matrix input** that controls which jobs run (in alphabetical or logical order).

2. **Add a new job block** in the correct group, following the exact pattern of adjacent jobs. Use the reusable workflow call pattern already present in the file. Fill in:
   - Job ID: `run-<identifier>`
   - `if:` condition matching the pattern used by adjacent jobs (cron, dispatch input, etc.)
   - `playwright_tag` (or equivalent input): the tag from Step 3
   - All other inputs: follow adjacent jobs — use `${{ inputs.X || 'default' }}` for every overridable value

   If `workers: '1'` was requested, add it as the last `with:` parameter.

### B. Create standalone workflow (if requested)

**File:** `.github/workflows/pw-<identifier>.yml`

Model the file on an existing standalone workflow in `.github/workflows/`. Fill in:
- `name:` — human-readable name for the workflow
- `on.schedule.cron` — from Step 7 (omit if dispatch-only)
- `on.workflow_dispatch.inputs` — copy the input schema from an existing standalone workflow
- Job: single job calling the same reusable workflow template, with all inputs using `${{ inputs.X || 'default' }}` pattern

## Validation (MANDATORY)

After making changes, verify:

1. **YAML syntax is valid:**

```bash
ruby -ryaml -e "YAML.safe_load(File.read('.github/workflows/FILENAME')); puts 'VALID'"
```

2. **The identifier appears in the suite list/matrix** in the orchestrator (if applicable).

3. **The job `if:` condition uses the correct trigger** (cron expression or dispatch input check) for the chosen group.

4. **The `with:` keys match the reusable workflow's declared inputs** — cross-check against the template workflow file.

5. **Indentation and key ordering match adjacent jobs** in the orchestrator.

## Rules

- ALWAYS use `AskUserQuestion` to gather inputs interactively before making changes.
- ALWAYS read the orchestrator file before modifying it to understand current structure.
- NEVER add a job without also updating any suite list or matrix input that gates which jobs run.
- NEVER hard-code notification channels or report names — always use `${{ inputs.X || 'default' }}` pattern.
- ALWAYS validate YAML syntax after changes.
- ALWAYS match the exact formatting and key ordering of adjacent jobs in the orchestrator.
- If you cannot determine the correct pattern from adjacent jobs, ask the user before proceeding.
