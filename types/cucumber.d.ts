declare module "@cucumber/cucumber" {
  export function Given(expression: string, implementation: (this: any, ...args: any[]) => Promise<void> | void): void;
  export function Then(expression: string, implementation: (this: any, ...args: any[]) => Promise<void> | void): void;
  export function Before(hook: (this: unknown) => Promise<void> | void): void;
  export function After(hook: (this: unknown, scenario: unknown) => Promise<void> | void): void;
  export function BeforeAll(hook: () => Promise<void> | void): void;
  export function AfterAll(hook: () => Promise<void> | void): void;
  export function setDefaultTimeout(ms: number): void;
  export function setWorldConstructor(ctor: new (options: unknown) => unknown): void;

  export interface IWorldOptions {
    [key: string]: unknown;
  }

  export class World {
    constructor(options: IWorldOptions);
    attach(data: unknown, mediaType?: string): Promise<void>;
  }

  export interface ITestCaseHookParameter {
    result?: { status?: Status };
    pickle: { name: string };
  }

  export enum Status {
    FAILED = "FAILED",
    PASSED = "PASSED",
    SKIPPED = "SKIPPED",
    UNDEFINED = "UNDEFINED",
    AMBIGUOUS = "AMBIGUOUS"
  }
}
