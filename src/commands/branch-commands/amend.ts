import yargs from "yargs";
import { amendAction } from "../../actions/amend";
import { profiledHandler } from "../../lib/telemetry";

const args = {
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

export const command = "amend";
export const description =
  "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).";
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    await amendAction(argv.silent, argv.message);
  });
};
