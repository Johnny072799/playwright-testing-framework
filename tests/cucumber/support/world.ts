import { IWorldOptions, World, setWorldConstructor } from "@cucumber/cucumber";
import type { BrowserContext, Page } from "playwright";
import { WorldState } from "./worldState";

export class CustomWorld extends World {
  page!: Page;
  context!: BrowserContext;
  state: WorldState;

  constructor(options: IWorldOptions) {
    super(options);
    this.state = new WorldState();
  }
}

setWorldConstructor(CustomWorld);

