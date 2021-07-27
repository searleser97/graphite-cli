import yargs from "yargs";
import { regenAction } from "../../actions/regen";
import { profiledHandler } from "../../lib/telemetry";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "regen";
export const description =
  "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and fixing.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profiledHandler(command, async () => {
    await regenAction(argv.silent);
  });
};
