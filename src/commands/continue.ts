import { execSync } from "child_process";
import yargs from "yargs";
import { ontoFromCheckpoint } from "../actions/onto";
import { getMostRecentCheckpoint } from "../lib/config/checkpoint_config";
import { PreconditionsFailedError } from "../lib/errors";
import { profile } from "../lib/telemetry";
import { rebaseInProgress } from "../lib/utils/rebase_in_progress";

const args = {
  "no-edit": {
    describe: `Don't edit the commit message for an amended, resolved merge conflict.`,
    demandOption: false,
    type: "boolean",
    alias: "f",
  },
} as const;

type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const command = "continue";
export const canonical = "continue";
export const aliases = [];
export const description =
  "Continues the previous Graphite command if progress was halted by a merge conflict.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const mostRecentCheckpoint = getMostRecentCheckpoint();
    if (mostRecentCheckpoint === undefined) {
      throw new PreconditionsFailedError(`No Graphite command in progress.`);
    }

    if (!rebaseInProgress()) {
      throw new PreconditionsFailedError(`No rebase in progress to continue.`);
    }

    // TODO (nicholasyan): Do a better job here of enforcing that we can continue

    // stdio needs to be 'inherit' here to allow the editor to pop open with
    // the amend message if the 'no-edit' option is false.
    const noEdit = argv["no-edit"];
    execSync(`${noEdit ? "GIT_EDITOR=true" : ""} git rebase --continue`, {
      stdio: "inherit",
    });

    switch (mostRecentCheckpoint.action) {
      case "ONTO":
        await ontoFromCheckpoint(mostRecentCheckpoint.args);
        break;
      default:
        assertUnreachable(mostRecentCheckpoint.action);
        break;
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
