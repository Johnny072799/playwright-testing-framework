# Artifacts and Reporting

[← README](../README.md) · [Index](INDEX.md)

When a scenario fails, the framework saves artifacts to help you debug.

## Screenshots

| Property   | Value                                                                 |
|------------|-----------------------------------------------------------------------|
| **Location** | `artifacts/screenshots/`                                            |
| **Format**   | PNG (full-page)                                                      |
| **Filename** | Scenario name, sanitized (e.g. `open_the_homepage_...example_.png`) |

A full-page screenshot of the browser at the moment of failure. Use it to see the UI state when an assertion fails or an element is missing.

**How to use:** Open the `.png` in any image viewer or in the Cucumber report if your reporter shows attachments.

## Playwright traces

| Property   | Value                                |
|------------|--------------------------------------|
| **Location** | `artifacts/traces/`                |
| **Format**   | `.zip` (Playwright trace archive)  |
| **Filename** | Scenario name, sanitized           |

A trace records the test run: screenshots at each action, DOM snapshots, network requests, and a timeline. You can step through and inspect the page at any point.

**How to use:** Open in Playwright's Trace Viewer:

```bash
npx playwright show-trace artifacts/traces/<trace-filename>.zip
```

The Trace Viewer opens in your browser so you can move through the timeline, inspect DOM, and view network activity.

## Cucumber report attachments

Both the screenshot and trace are attached to the failed scenario in the Cucumber report. If your reporter displays attachments (e.g. HTML report or CI output), you can view them there without opening the files directly.
