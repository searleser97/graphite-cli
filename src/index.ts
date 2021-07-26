#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import DemoCommand from "./commands/original-commands/demo";
import FeedbackCommand from "./commands/original-commands/feedback";
import FixCommand from "./commands/original-commands/fix";
import PrintStacksCommand from "./commands/original-commands/print-stacks";
import SubmitCommand from "./commands/original-commands/submit";
import SyncCommand from "./commands/original-commands/sync";
import ValidateCommand from "./commands/original-commands/validate";

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .commandDir("commands")
  .command(
    "submit",
    "Experimental: Create PR's for each branch in the current stack",
    SubmitCommand.args,
    async (argv) => {
      await new SubmitCommand().execute(argv);
    }
  )
  .command(
    "stacks",
    "Prints all current stacks.",
    PrintStacksCommand.args,
    async (argv) => {
      await new PrintStacksCommand().execute(argv);
    }
  )
  .command(
    "fix",
    "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and restacking.",
    FixCommand.args,
    async (argv) => {
      await new FixCommand().execute(argv);
    }
  )
  .command(
    "validate",
    "Validates that the gp meta graph matches the current graph of git branches and commits.",
    ValidateCommand.args,
    async (argv) => {
      await new ValidateCommand().execute(argv);
    }
  )
  .command(
    "feedback <message>",
    "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.",
    FeedbackCommand.args,
    async (argv) => {
      await new FeedbackCommand().execute(argv);
    }
  )
  .command(
    "sync",
    "Delete any stacks that have been merged or squashed into your trunk branch, and restack their children recursively.",
    SyncCommand.args,
    async (argv) => {
      await new SyncCommand().execute(argv);
    }
  )
  .command("demo", false, DemoCommand.args, async (argv) => {
    await new DemoCommand().execute(argv);
  })
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
