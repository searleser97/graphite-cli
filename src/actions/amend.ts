import { fixAction } from "../actions/fix";
import { workingTreeClean } from "../lib/git-utils";
import { gpExecSync, logInfo, logInternalErrorAndExit } from "../lib/utils";

export async function amendAction(
  silent: boolean,
  message?: string
): Promise<void> {
  if (workingTreeClean()) {
    logInfo("No changes to amend.");
    return;
  }

  gpExecSync(
    {
      command: "git add --all",
    },
    () => {
      logInternalErrorAndExit("Failed to add changes. Aborting...");
    }
  );

  gpExecSync(
    {
      command: `git commit -m "${message || "Updates"}"`,
    },
    () => {
      logInternalErrorAndExit("Failed to commit changes. Aborting...");
    }
  );
  // Only restack if working tree is now clean.
  if (workingTreeClean()) {
    await fixAction(silent);
  }
}
