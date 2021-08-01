import Branch from "../../wrapper-classes/branch";
import { PreconditionsFailedError } from "../errors";
import { uncommittedChanges } from "../utils";

function currentBranchPrecondition(): Branch {
  const branch = Branch.getCurrentBranch();
  if (!branch) {
    throw new PreconditionsFailedError(
      `Cannot find current branch. Please ensure you're running this command atop a checked-out branch.`
    );
  }
  return branch;
}

function branchExistsPrecondition(branchName: string): void {
  if (!Branch.exists(branchName)) {
    throw new PreconditionsFailedError(
      `Cannot find branch named: (${branchName}).`
    );
  }
}

function uncommittedChangesPrecondition(): void {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError(
      `Cannot run with uncommitted changes present, please resolve and then retry.`
    );
  }
}

export {
  currentBranchPrecondition,
  branchExistsPrecondition,
  uncommittedChangesPrecondition,
};
