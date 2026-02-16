export enum WaitForResult {
  PASS = "PASS",
  RETRY = "RETRY"
}

type WaitForOptions = {
  timeout?: number;
  wait?: number;
  failureMessage?: string;
};

/**
 * Retries a condition until it returns PASS or the timeout is reached.
 */
export async function waitFor(
  condition: () => Promise<WaitForResult>,
  options: WaitForOptions = {}
): Promise<void> {
  const { timeout = 20000, wait: waitMs = 2000, failureMessage = "Condition did not pass within timeout." } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await condition();
    if (result === WaitForResult.PASS) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  throw new Error(failureMessage);
}
