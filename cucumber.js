require("ts-node/register/transpile-only");

const { cucumberProfiles } = require("./tests/cucumber/cucumber-profiles.ts");

module.exports = cucumberProfiles;