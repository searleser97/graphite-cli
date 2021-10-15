import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { logDebug } from "../utils";
import { getRepoRootPath } from "./repo_root_path";

const CONFIG_NAME = ".graphite_checkpoint";
const CURRENT_REPO_CONFIG_PATH = path.join(getRepoRootPath(), CONFIG_NAME);

/**
 * The main idea is that after a merge conflict interrupts the Graphite
 * workflow, when we'd like to resume said workflow, there are 2 things
 * that we broadly need to do:
 *
 * 1) Complete the original stack fix. All of our commands which rebase
 *    run some variation of stack fix and since these operations are
 *    idempotent, we want to restart the stack fix from the original
 *    base branch.
 *
 * 2) Perform any needed follow-up actions. These vary from context to
 *    context and may include checking out a branch, for example.
 *
 * The information we encode at interrupt time represents the minimum
 * amount of information we need to complete these items.
 */
export type RebaseConflictCheckpointT = {
  baseBranchName: string;
  followUpInfo: RebaseConflictFollowUpInfoT;
};

export type RebaseConflictFollowUpInfoT =
  | StackFixFollowUpInfoT
  | DeleteMergedBranchesFollowUpInfoT
  | RepoSyncDeleteMergedBranchesFollowUpInfoT
  | RepoFixDeleteMergedBranchesFollowUpInfoT
  | null;

export type StackFixFollowUpInfoT = {
  action: "STACK_FIX";
  additionalFollowUp: RebaseConflictFollowUpInfoT;
  checkoutBranchName: string;
};

export type DeleteMergedBranchesFollowUpInfoT = {
  action: "DELETE_MERGED_BRANCHES";
  additionalFollowUp: RebaseConflictFollowUpInfoT;
  force: boolean;
  showDeleteProgress: boolean;
};

export type RepoSyncDeleteMergedBranchesFollowUpInfoT = {
  action: "REPO_SYNC_DELETE_MERGED_BRANCHES";
  additionalFollowUp: RebaseConflictFollowUpInfoT;
  resubmit: boolean;
  force: boolean;
  oldBranchName: string;
};

export type RepoFixDeleteMergedBranchesFollowUpInfoT = {
  action: "REPO_FIX_DELETE_MERGED_BRANCHES";
  additionalFollowUp: RebaseConflictFollowUpInfoT;
};

export function recordCheckpoint(checkpoint: RebaseConflictCheckpointT): void {
  if (checkpoint !== null) {
    fs.writeFileSync(
      CURRENT_REPO_CONFIG_PATH,
      JSON.stringify(checkpoint, null, 2)
    );
  }
}

export function getMostRecentCheckpoint(): RebaseConflictCheckpointT | null {
  if (fs.existsSync(CURRENT_REPO_CONFIG_PATH)) {
    const repoConfigRaw = fs.readFileSync(CURRENT_REPO_CONFIG_PATH);
    try {
      return JSON.parse(
        repoConfigRaw.toString().trim()
      ) as RebaseConflictCheckpointT;
    } catch (e) {
      logDebug(chalk.yellow(`Warning: Malformed ${CURRENT_REPO_CONFIG_PATH}`));
    }
  }
  return null;
}
