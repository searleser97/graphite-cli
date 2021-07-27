import { execSync } from "child_process";
import PrintStacksCommand from "../commands/original-commands/print-stacks";
import { log } from "../lib/log";
import {
  checkoutBranch,
  logErrorAndExit,
  rebaseInProgress,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export async function fixAction(silent: boolean): Promise<void> {
  if (uncommittedChanges()) {
    logErrorAndExit("Cannot restack with uncommitted changes");
  }
  // Print state before
  log(`Before restack:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));

  const originalBranch = Branch.getCurrentBranch();
  if (originalBranch === null) {
    logErrorAndExit(`Not currently on a branch; no target to restack.`);
  }

  for (const child of await originalBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
  checkoutBranch(originalBranch.name);

  // Print state after
  log(`After restack:`, { silent });
  !silent && (await new PrintStacksCommand().executeUnprofiled({ silent }));
}

export async function restackBranch(
  currentBranch: Branch,
  silent: boolean
): Promise<void> {
  if (rebaseInProgress()) {
    logErrorAndExit(
      `Interactive rebase in progress, cannot restack (${currentBranch.name}). Complete the rebase and re-run restack command.`
    );
  }
  const parentBranch = currentBranch.getParentFromMeta();
  if (!parentBranch) {
    logErrorAndExit(
      `Cannot find parent from meta defined stack for (${currentBranch.name}), stopping restack`
    );
  }
  const mergeBase = currentBranch.getMetaMergeBase();
  if (!mergeBase) {
    logErrorAndExit(
      `Cannot find a merge base from meta defined stack for (${currentBranch.name}), stopping restack`
    );
  }

  currentBranch.setMetaPrevRef(currentBranch.getCurrentRef());
  checkoutBranch(currentBranch.name);
  execSync(
    `git rebase --onto ${parentBranch.name} ${mergeBase} ${currentBranch.name}`,
    { stdio: "ignore" }
  );

  for (const child of await currentBranch.getChildrenFromMeta()) {
    await restackBranch(child, silent);
  }
}
