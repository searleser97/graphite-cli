import chalk from "chalk";
import yargs from "yargs";
import { captureState, recreateState } from "../../lib/debug-context";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  recreate: {
    type: "string",
    optional: true,
    describe:
      "Accepts a json block created by `gt feedback state`. Recreates a debug repo in a temp folder with a commit tree matching the state JSON.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "debug-context";
export const description =
  "Print a debug summary of your repo. Useful for creating bug report details.";
export const builder = args;

export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    if (argv.recreate) {
      const dir = recreateState(argv.recreate);
      logInfo(`${chalk.green(dir)}`);
    } else {
      logInfo(captureState());
    }
  });
};
