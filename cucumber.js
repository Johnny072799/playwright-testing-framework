const path = require("path");

const projectRoot = __dirname;

module.exports = {
  default: {
    paths: [path.join(projectRoot, "tests/cucumber/features/**/*.feature")],
    require: [
      path.join(projectRoot, "tests/cucumber/support/config.ts"),
      path.join(projectRoot, "tests/cucumber/support/worldState.ts"),
      path.join(projectRoot, "tests/cucumber/support/world.ts"),
      path.join(projectRoot, "tests/cucumber/support/hooks.ts"),
      path.join(projectRoot, "tests/cucumber/steps/example-steps.ts")
    ],
    requireModule: ["ts-node/register/transpile-only"],
    publishQuiet: true,
    format: ["progress"],
    worldParameters: {}
  }
};