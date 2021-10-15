import { validate } from "../actions/validate";
import { cache } from "../lib/config";
import { RebaseConflictCheckpointT } from "../lib/config/rebase_conflict_checkpoint_config";
import { PreconditionsFailedError, ValidationFailedError } from "../lib/errors";
import {
  branchExistsPrecondition,
  currentBranchPrecondition,
} from "../lib/preconditions";
import {
  checkoutBranch,
  getTrunk,
  logInfo,
  uncommittedChanges,
} from "../lib/utils";
import Branch from "../wrapper-classes/branch";
import { restackBranch } from "./fix";
export async function ontoAction(args: {
  onto: string;
  rebaseConflictCheckpointFollowUps: RebaseConflictCheckpointT["followUpInfo"];
}): Promise<void> {
  if (uncommittedChanges()) {
    throw new PreconditionsFailedError("Cannot fix with uncommitted changes");
  }

  const originalBranch = currentBranchPrecondition();

  await stackOnto({
    currentBranch: originalBranch,
    onto: args.onto,
    rebaseConflictCheckpointFollowUps: args.rebaseConflictCheckpointFollowUps,
  });

  checkoutBranch(originalBranch.name);
}

async function stackOnto(args: {
  currentBranch: Branch;
  onto: string;
  rebaseConflictCheckpointFollowUps: RebaseConflictCheckpointT["followUpInfo"];
}) {
  const onto = args.onto;
  const currentBranch = args.currentBranch;

  branchExistsPrecondition(onto);
  checkBranchCanBeMoved(currentBranch, onto);
  validateStack();

  cache.clearAll();

  // The idea here is that we change the branch's meta parent and then kick
  // of a stack fix rebase, forcibly rebasing the first branch (which we just
  // altered the parent of).
  console.log(`setting ${currentBranch.name} parent to ${onto}`);
  currentBranch.setParentBranchName(onto);

  await restackBranch(currentBranch, {
    forceRestack: true,
    rebaseConflictCheckpoint: {
      baseBranchName: currentBranch.name,
      followUpInfo: args.rebaseConflictCheckpointFollowUps,
    },
  });

  logInfo(`Successfully moved (${currentBranch.name}) onto (${onto})`);
}

function validateStack() {
  try {
    validate("UPSTACK");
  } catch {
    throw new ValidationFailedError(
      `Cannot stack "onto", git branches must match stack.`
    );
  }
}

function checkBranchCanBeMoved(branch: Branch, onto: string) {
  if (branch.name === getTrunk().name) {
    throw new PreconditionsFailedError(
      `Cannot stack (${branch.name}) onto ${onto}, (${branch.name}) is currently set as trunk.`
    );
  }
}
