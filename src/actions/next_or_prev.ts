#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import { ExitFailedError, PreconditionsFailedError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";

export async function nextOrPrevAction(
  nextOrPrev: "next" | "prev",
  silent: boolean
): Promise<void> {
  const currentBranch = currentBranchPrecondition();

  const candidates =
    nextOrPrev === "next"
      ? await currentBranch.getChildrenFromMeta()
      : currentBranch.getParentFromMeta();

  let branch;

  if (candidates instanceof Array) {
    if (candidates.length === 0) {
      throw new ExitFailedError(`Found no ${nextOrPrev} branch`);
    }
    if (candidates.length > 1) {
      throw new PreconditionsFailedError(
        [
          chalk.yellow(`Found multiple possibilities:`),
          ...candidates.map((candidate) =>
            chalk.yellow(` - ${candidate.name}`)
          ),
        ].join("\n")
      );
    }
    branch = candidates[0];
  } else if (!candidates) {
    throw new ExitFailedError(`Found no ${nextOrPrev} branch`);
  } else {
    branch = candidates;
  }

  const branchName = branch;
  execSync(`git checkout "${branchName.name}"`, { stdio: "ignore" });
  logInfo(branchName.name);
}
