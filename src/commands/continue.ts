import { execSync } from "child_process";
import yargs from "yargs";
import { restackBranch } from "../actions/fix";
import { getMostRecentCheckpoint } from "../lib/config/rebase_conflict_checkpoint_config";
import { PreconditionsFailedError } from "../lib/errors";
import { profile } from "../lib/telemetry";
import { rebaseInProgress } from "../lib/utils/rebase_in_progress";
import Branch from "../wrapper-classes/branch";

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
  "Continues the most-recent Graphite command halted by a merge conflict.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, canonical, async () => {
    const mostRecentCheckpoint = getMostRecentCheckpoint();
    if (mostRecentCheckpoint === null) {
      throw new PreconditionsFailedError(`No Graphite command to continue.`);
    }

    if (rebaseInProgress()) {
      const noEdit = argv["no-edit"];
      execSync(`${noEdit ? "GIT_EDITOR=true" : ""} git rebase --continue`, {
        stdio: "inherit",
      });
    }

    const baseBranch = await Branch.branchWithName(
      mostRecentCheckpoint.baseBranchName
    );

    await restackBranch(baseBranch, {
      rebaseConflictCheckpoint: mostRecentCheckpoint,
    });
  });
};
