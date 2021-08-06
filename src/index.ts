#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import { fetchUpgradePromptInBackground } from "./lib/telemetry";

fetchUpgradePromptInBackground();
// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .commandDir("commands")
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
