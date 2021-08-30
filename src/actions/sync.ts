import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { repoConfig } from "../lib/config";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import {
  cliAuthPrecondition,
  currentBranchPrecondition,
} from "../lib/preconditions";
import {
  checkoutBranch,
  getTrunk,
  gpExecSync,
  logInfo,
  uncommittedChanges,
} from "../lib/utils";
import { logDebug } from "../lib/utils/splog";
import Branch from "../wrapper-classes/branch";
import MetadataRef from "../wrapper-classes/metadata_ref";
import { ontoAction } from "./onto";
import { saveBranchPRInfo, submitPRsForBranches } from "./submit";

export async function syncAction(opts: {
  pull: boolean;
  force: boolean;
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot sync with uncommitted changes");
  }
  const oldBranch = currentBranchPrecondition();
  const trunk = getTrunk().name;
  checkoutBranch(trunk);

  if (opts.pull) {
    gpExecSync({ command: `git pull` }, (err) => {
      checkoutBranch(oldBranch.name);
      throw new ExitFailedError(`Failed to pull trunk ${trunk}`, err);
    });
  }

  await deleteMergedBranches(opts.force);
  if (Branch.exists(oldBranch.name)) {
    checkoutBranch(oldBranch.name);
  } else {
    checkoutBranch(trunk);
  }
  await resubmitBranchesWithNewBases(opts.force);
  cleanDanglingMetadata();
}

async function deleteMergedBranches(force: boolean): Promise<void> {
  const trunkChildren: Branch[] = getTrunk().getChildrenFromMeta();
  do {
    const branch = trunkChildren.pop();
    if (!branch) {
      break;
    }
    const children = branch.getChildrenFromMeta();
    if (!shouldDeleteBranch(branch.name)) {
      continue;
    }
    for (const child of children) {
      checkoutBranch(child.name);
      logInfo(`upstacking (${child.name}) onto (${getTrunk().name})`);
      await ontoAction(getTrunk().name);
      trunkChildren.push(child);
    }
    checkoutBranch(getTrunk().name);
    await deleteBranch({ branchName: branch.name, force });
  } while (trunkChildren.length > 0);
}

function shouldDeleteBranch(branchName: string): boolean {
  const trunk = getTrunk().name;
  const cherryCheckProvesMerged = execSync(
    `mergeBase=$(git merge-base ${trunk} ${branchName}) && git cherry ${trunk} $(git commit-tree $(git rev-parse "${branchName}^{tree}") -p $mergeBase -m _)`
  )
    .toString()
    .trim()
    .startsWith("-");
  if (cherryCheckProvesMerged) {
    return true;
  }
  const diffCheckProvesMerged =
    execSync(`git diff ${branchName} ${trunk} | wc -l`).toString().trim() ===
    "0";
  if (diffCheckProvesMerged) {
    return true;
  }
  return false;
}

async function deleteBranch(opts: { branchName: string; force: boolean }) {
  if (!opts.force) {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `Delete (${chalk.green(
        opts.branchName
      )}), which has been merged into (${getTrunk().name})?`,
      initial: true,
    });
    console.log("RESPONSE...");
    console.log(response.value);
    console.log("^ RESPONSE...");
    if (response.value != true) {
      return;
    }
  }
  logInfo(`Deleting (${chalk.red(opts.branchName)})`);
  execSync(`git branch -D ${opts.branchName}`);
}

function cleanDanglingMetadata(): void {
  const allMetadataRefs = MetadataRef.allMetadataRefs();
  const allBranches = Branch.allBranches();
  allMetadataRefs.forEach((ref) => {
    if (!allBranches.find((b) => b.name === ref._branchName)) {
      logDebug(`Deleting metadata for ${ref._branchName}`);
      ref.delete();
    }
  });
}

async function resubmitBranchesWithNewBases(force: boolean): Promise<void> {
  const needsResubmission: Branch[] = [];
  Branch.allBranches().forEach((b) => {
    const base = b.getPRInfo()?.base;
    if (base && base !== b.getParentFromMeta()?.name) {
      needsResubmission.push(b);
    }
  });
  if (needsResubmission.length === 0) {
    return;
  }
  logInfo(
    [
      `Detected merge bases changes for:`,
      ...needsResubmission.map((b) => `- ${b.name}`),
    ].join("\n")
  );

  // Prompt for resubmission.
  let resubmit: boolean = force;
  if (!force) {
    const response = await prompts({
      type: "confirm",
      name: "value",
      message: `Update remote PR mergebases to match local?`,
      initial: true,
    });
    resubmit = response.value;
  }
  if (resubmit) {
    logInfo(`Updating outstanding PR mergebases...`);
    const cliAuthToken = cliAuthPrecondition();
    const repoName = repoConfig.getRepoName();
    const repoOwner = repoConfig.getRepoOwner();
    const submittedPRInfo = await submitPRsForBranches({
      branches: needsResubmission,
      branchesPushedToRemote: needsResubmission,
      cliAuthToken: cliAuthToken,
      repoOwner: repoOwner,
      repoName: repoName,
      editPRFieldsInline: false,
      createNewPRsAsDraft: false,
    });
    saveBranchPRInfo(submittedPRInfo);
  }
}