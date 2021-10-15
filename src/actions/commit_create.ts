import { execStateConfig } from "../lib/config";
import { ExitFailedError } from "../lib/errors";
import {
  ensureSomeStagedChangesPrecondition,
  uncommittedChangesPrecondition,
} from "../lib/preconditions";
import { gpExecSync, logWarn } from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { fixAction } from "./fix";

export async function commitCreateAction(opts: {
  addAll: boolean;
  message: string | undefined;
}): Promise<void> {
  if (opts.addAll) {
    gpExecSync(
      {
        command: "git add --all",
      },
      (err) => {
        throw new ExitFailedError("Failed to add changes. Aborting...", err);
      }
    );
  }

  ensureSomeStagedChangesPrecondition();

  if (opts.message !== undefined) {
    gpExecSync(
      {
        command: [
          "git commit",
          `-m "${opts.message}"`,
          ...[execStateConfig.noVerify() ? ["--no-verify"] : []],
        ].join(" "),
      },
      (err) => {
        throw new ExitFailedError("Failed to commit changes. Aborting...", err);
      }
    );
  } else {
    gpExecSync(
      {
        command: [
          "git commit",
          ...[execStateConfig.noVerify() ? ["--no-verify"] : []],
        ].join(" "),
        options: {
          stdio: "inherit",
        },
      },
      (err) => {
        throw new ExitFailedError("Failed to commit changes. Aborting...", err);
      }
    );
  }

  try {
    uncommittedChangesPrecondition();

    const currentBranch = Branch.getCurrentBranch();
    if (currentBranch !== null) {
      await fixAction({
        action: "rebase",
        rebaseConflictCheckpoint: {
          baseBranchName: currentBranch.name,
          followUpInfo: [],
        },
      });
    }
  } catch {
    logWarn(
      "Cannot fix upstack automatically, some uncommitted changes remain. Please commit or stash, and then `gt stack fix --rebase`"
    );
  }
}
