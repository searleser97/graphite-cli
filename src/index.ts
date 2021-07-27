#!/usr/bin/env node
import tmp from "tmp";
import yargs from "yargs";
import DemoCommand from "./commands/original-commands/demo";
import PrintStacksCommand from "./commands/original-commands/print-stacks";

// https://www.npmjs.com/package/tmp#graceful-cleanup
tmp.setGracefulCleanup();

yargs
  .commandDir("commands")
  .command(
    "stacks",
    "Prints all current stacks.",
    PrintStacksCommand.args,
    async (argv) => {
      await new PrintStacksCommand().execute(argv);
    }
  )
  .command("demo", false, DemoCommand.args, async (argv) => {
    await new DemoCommand().execute(argv);
  })
  .help()
  .usage(["This CLI helps you manage stacked diffs."].join("\n"))
  .strict()
  .demandCommand().argv;
