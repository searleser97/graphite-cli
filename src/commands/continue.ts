import { execSync } from "child_process";
import yargs from "yargs";
import { deleteMergedBranches } from "../actions/clean_branches";
import {
  fixAction,
  fixFollowUps as stackFixFixFollowUps,
} from "../actions/fix";
import { repoSyncDeleteMergedBranchesFollowUps } from "../actions/sync";
import {
  getMostRecentCheckpoint,
  RebaseConflictFollowUpInfoT,
} from "../lib/config/rebase_conflict_checkpoint_config";
import { PreconditionsFailedError } from "../lib/errors";
import { profile } from "../lib/telemetry";
import { checkoutBranch } from "../lib/utils";
import { rebaseInProgress } from "../lib/utils/rebase_in_progress";
import { repoFixDeleteMergedBranchesMergeConflictFollowUp } from "./repo-commands/fix";

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

    checkoutBranch(mostRecentCheckpoint.baseBranchName);
    await fixAction({
      action: "rebase",
      rebaseConflictCheckpoint: mostRecentCheckpoint,
    });

    await handleFollowUp(mostRecentCheckpoint.followUpInfo);
  });
};

async function handleFollowUp(
  followUpInfo: RebaseConflictFollowUpInfoT
): Promise<void> {
  if (followUpInfo === null) {
    return;
  }

  switch (followUpInfo.action) {
    case "STACK_FIX":
      stackFixFixFollowUps(followUpInfo);
      break;
    case "DELETE_MERGED_BRANCHES":
      await deleteMergedBranches(followUpInfo);
      break;
    case "REPO_SYNC_DELETE_MERGED_BRANCHES":
      await repoSyncDeleteMergedBranchesFollowUps(followUpInfo);
      break;
    case "REPO_FIX_DELETE_MERGED_BRANCHES":
      await repoFixDeleteMergedBranchesMergeConflictFollowUp(followUpInfo);
      break;
    default:
      assertUnreachable(followUpInfo);
      break;
  }

  await handleFollowUp(followUpInfo.additionalFollowUp);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function assertUnreachable(arg: never): void {}
