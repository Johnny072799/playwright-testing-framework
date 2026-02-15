import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout
} from "@cucumber/cucumber";
import { Browser, chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { CustomWorld } from "./world";
import { WorldState } from "./worldState";
import { config } from "./config";

const DEFAULT_STEP_TIMEOUT_MS = 60_000;
const DEFAULT_PLAYWRIGHT_TIMEOUT_MS = 30_000;

let browser: Browser | undefined;

setDefaultTimeout(DEFAULT_STEP_TIMEOUT_MS);

BeforeAll(async function () {
  // Accessing config will throw a clear error if BASE_URL (or other required env vars) are missing.
  // This ensures misconfiguration is caught once before any scenarios run.
  if (!config.baseUrl) {
    throw new Error("BASE_URL is not configured.");
  }

  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    headless: config.headless
  };

  if (config.startMaximized && !config.headless) {
    launchOptions.args = ["--start-maximized"];
  }

  browser = await chromium.launch(launchOptions);
});

Before(async function (this: CustomWorld) {
  if (!browser) {
    throw new Error("Playwright browser was not initialized. Did the BeforeAll hook run?");
  }

  const contextOptions: Parameters<typeof browser.newContext>[0] = {};
  if (config.startMaximized && !config.headless) {
    contextOptions.viewport = null;
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  context.setDefaultTimeout(DEFAULT_PLAYWRIGHT_TIMEOUT_MS);
  page.setDefaultTimeout(DEFAULT_PLAYWRIGHT_TIMEOUT_MS);

  this.context = context;
  this.page = page;
  this.state = new WorldState();

  await context.tracing.start({
    screenshots: true,
    snapshots: true
  });

  // Navigate to the base URL at the start of each scenario (optional, but convenient).
  await this.page.goto(config.baseUrl);
});

After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  if (!this.context || !this.page) {
    return;
  }

  const isFailed = scenario.result?.status === Status.FAILED;

  const artifactsDir = path.join("artifacts");
  const screenshotsDir = path.join(artifactsDir, "screenshots");
  const tracesDir = path.join(artifactsDir, "traces");

  await Promise.all([
    fs.promises.mkdir(screenshotsDir, { recursive: true }),
    fs.promises.mkdir(tracesDir, { recursive: true })
  ]);

  const safeName = scenario.pickle.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

  if (isFailed) {
    const screenshotPath = path.join(screenshotsDir, `${safeName}.png`);
    const screenshot = await this.page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    await this.attach(screenshot, "image/png");

    const tracePath = path.join(tracesDir, `${safeName}.zip`);
    await this.context.tracing.stop({ path: tracePath });

    const traceBuffer = await fs.promises.readFile(tracePath);
    await this.attach(traceBuffer, "application/zip");
  } else {
    await this.context.tracing.stop();
  }

  await this.context.close();
});

AfterAll(async function () {
  if (browser) {
    await browser.close();
    browser = undefined;
  }
});

