import chalk from "chalk";
import { log } from "../lib/log";
import { currentBranchPrecondition } from "../lib/preconditions";
import { gpExecSync } from "../lib/utils";
import { logWarn } from "../lib/utils/splog";
import { getTrunk } from "../lib/utils/trunk";
import Branch from "../wrapper-classes/branch";

export async function regenAction(silent: boolean): Promise<void> {
  const branch = currentBranchPrecondition();
  const trunk = getTrunk();
  if (trunk.name == branch.name) {
    if (!silent) {
      logWarn(
        `Current branch matches trunk (${getTrunk()}). No stack to regen.`
      );
    }
    return;
  }

  const baseBranch = getStackBaseBranch(branch, trunk);
  console.log(`stack base = ${baseBranch}`);

  printBranchNameStack(
    `(Original git infered stack)`,
    baseBranch.stackByTracingGitParents(),
    silent
  );
  printBranchNameStack(
    `(Original graphite recorded stack)`,
    baseBranch.stackByTracingMetaParents(),
    silent
  );

  // TODO (nicholasyan): this is a short-term band-aid. We need to handle
  // multiple parents in the long-term.
  await recursiveRegen(baseBranch, trunk, silent);

  printBranchNameStack(
    `(New graphite stack)`,
    baseBranch.stackByTracingMetaParents(),
    silent
  );
}

// Returns the first non-trunk base branch. If there is no non-trunk branch
// - the current branch is trunk - we return null.
function getStackBaseBranch(currentBranch: Branch, trunk: Branch): Branch {
  const trunkMergeBase = gpExecSync({
    command: `git merge-base ${getTrunk()} ${currentBranch.name}`,
  })
    .toString()
    .trim();

  let baseBranch: Branch = currentBranch;
  let baseBranchParent = baseBranch.getParentsFromGit()[0]; // TODO: greg - support two parents

  while (
    baseBranchParent !== undefined &&
    baseBranchParent.name !== trunk.name &&
    baseBranchParent.isUpstreamOf(trunkMergeBase)
  ) {
    baseBranch = baseBranchParent;
    baseBranchParent = baseBranch.getParentsFromGit()[0];
  }

  return baseBranch;
}

function recursiveRegen(
  currentBranch: Branch,
  newParent: Branch,
  silent: boolean
) {
  const oldMetaParent = currentBranch.getParentFromMeta();

  // The only time we expect newParent to be undefined is if we're fixing
  // the base branch which is behind trunk.
  log(
    `Updating (${currentBranch.name}) branch parent from (${
      oldMetaParent?.name
    }) to (${chalk.green(newParent.name)})`,
    { silent }
  );
  currentBranch.setParentBranchName(newParent.name);

  const gitChildren = currentBranch.getChildrenFromGit();
  gitChildren.forEach((child) => {
    recursiveRegen(child, currentBranch, silent);
  });
}

function printBranchNameStack(
  message: string,
  names: string[],
  silent: boolean
) {
  log(
    `[${names.map((name) => `(${chalk.green(name)})`).join("->")}] ${message}`,
    { silent }
  );
}
