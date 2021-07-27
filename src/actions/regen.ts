import chalk from "chalk";
import { log } from "../lib/log";
import Branch from "../wrapper-classes/branch";

export async function regenAction(silent: boolean): Promise<void> {
  const branch = Branch.getCurrentBranch();
  if (branch === null) {
    return;
  }

  printBranchNameStack(
    `(Original git infered stack)`,
    branch.stackByTracingGitParents(),
    silent
  );
  printBranchNameStack(
    `(Original graphite recorded stack)`,
    branch.stackByTracingMetaParents(),
    silent
  );

  // Walk the current branch down to the base and create stacks.
  await recursiveFix(branch, silent);

  printBranchNameStack(
    `(New graphite stack)`,
    branch.stackByTracingMetaParents(),
    silent
  );
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

function recursiveFix(branch: Branch, silent: boolean) {
  const gitChildren = branch.getChildrenFromGit();
  // Check if we're at a base branch
  gitChildren.forEach((child) => {
    const oldMetaParent = child.getParentFromMeta();
    if (!oldMetaParent || oldMetaParent.name !== branch.name) {
      log(
        `Updating (${child.name}) branch parent from (${
          oldMetaParent?.name
        }) to (${chalk.green(branch.name)})`,
        { silent }
      ),
        child.setParentBranchName(branch.name);
    }
    recursiveFix(child, silent);
  });
}
