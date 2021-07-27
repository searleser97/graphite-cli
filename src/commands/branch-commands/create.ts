import yargs from "yargs";
import { createBranchAction } from "../../actions/create_branch";
import { profiledHandler } from "../../lib/telemetry";

const args = {
  name: {
    type: "string",
    positional: true,
    demandOption: false,
    optional: true,
    describe: "The name of the target which builds your app for release",
  },
  message: {
    type: "string",
    alias: "m",
    describe: "The message for the new commit",
  },
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "create [name]";
export const description =
  "Takes the current changes and creates a new branch off of whatever branch you were previously working on.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    await createBranchAction({
      silent: argv.silent,
      branchName: argv.name,
      message: argv.message,
    });
  });
};
