import yargs from "yargs";
import { repoConfig } from "../../lib/config";
import { profile } from "../../lib/telemetry";
import { logInfo } from "../../lib/utils";

const args = {
  set: {
    demandOption: false,
    default: false,
    type: "string",
    alias: "s",
    describe:
      "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the repo owner's name.",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "owner";
export const canonical = "repo owner";
export const description =
  "The current repo owner's name stored in Graphite. e.g. in 'screenplaydev/graphite-cli', this is 'screenplaydev'.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    if (argv.set) {
      repoConfig.setRepoOwner(argv.set);
    } else {
      logInfo(repoConfig.getRepoOwner());
    }
  });
};
