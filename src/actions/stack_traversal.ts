#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import prompts from "prompts";
import { ExitFailedError, KilledError } from "../lib/errors";
import { currentBranchPrecondition } from "../lib/preconditions";
import { logInfo } from "../lib/utils";
import Branch from "../wrapper-classes/branch";

export enum TraversalDirection {
	Top = "TOP",
	Bottom = "BOTTOM",
	Next = "NEXT",
	Previous = "PREV",
}

async function getStackBranch(candidates: Branch[]) : Promise<string>{
  return (
    await prompts(
      {
        type: "select",
        name: "branch",
        message: "Multiple branches found at the same level. Select a branch to guide the navigation",
        choices: candidates.map((b) => {
          return {title: b.name, value: b.name, branch: b};
        }),
      },
      {
        onCancel: () => {
          throw new KilledError();
        },
      }
    )
  ).branch;
}

// TODO: Refactor prev and bottom to traverse downstack and support numsteps
function getPrevBranch(currentBranch: Branch): string | undefined {
  const branch = currentBranch.getParentFromMeta();
  return branch?.name;
}

function getBottomBranch(currentBranch: Branch): string | undefined {
  let branch = currentBranch
  let prevBranch = branch.getParentFromMeta();
  let indent = 0;
  while (prevBranch && !prevBranch.isTrunk()){
    logInfo(`${"  ".repeat(indent)}↳(${branch})`);
    branch = prevBranch;
    prevBranch = branch.getParentFromMeta();
    indent ++;
  }
  logInfo(`${"  ".repeat(indent)}↳(${chalk.cyan(branch)})`);

  return branch?.name;
}

async function getNextBranch(
  currentBranch: Branch,
  interactive: boolean,
	numSteps?: number
): Promise<string | undefined> {
	// const candidates = currentBranch.getChildrenFromMeta();
	//
	// if (candidates.length === 0) {
	//   return;
	// }
	// if (candidates.length > 1) {
	//   if (interactive) {
	//     return await getStackBranch(candidates)
	//   } else {
	//     throw new ExitFailedError(
	//       `Cannot get next branch, multiple choices available: [${candidates.join(
	//         ", "
	//       )}]`
	//     );
	//   }
	// } else {
	//   return candidates[0].name;
	// }
	return traverseUpstack(currentBranch, interactive, TraversalDirection.Next, numSteps);
}


async function traverseUpstack(currentBranch: Branch,
	interactive: boolean,
	direction: TraversalDirection.Next | TraversalDirection.Top,
	numSteps?: number
){
	let branch = currentBranch
	let candidates = branch.getChildrenFromMeta();
	let indent = 0

	while (branch && candidates.length) {
		if (candidates.length === 1) {
			logInfo(`${"  ".repeat(indent)}↳(${branch})`);
			branch = candidates[0];
		} else {
			if (interactive) {
				const stack_base_branch = await getStackBranch(candidates);
				branch = await Branch.branchWithName(stack_base_branch)
			} else {
				throw new ExitFailedError(
					`Cannot get next branch, multiple choices available: [${candidates.join(
						", "
					)}]`
				);
			}
		}
		indent++;
		if (direction === TraversalDirection.Next && indent === numSteps) {
			break;
		}
		candidates = branch.getChildrenFromMeta();
	}

	logInfo(`${"  ".repeat(indent)}↳(${chalk.cyan(branch)})`);
	return branch?.name
}

async function getTopBranch(
	currentBranch: Branch,
	interactive: boolean,
): Promise<string | undefined> {
	return await traverseUpstack(currentBranch, interactive, TraversalDirection.Top);
}

export async function nextOrPrevAction(opts: {
  nextOrPrev: "next" | "prev";
  numSteps: number;
  interactive: boolean;
}): Promise<void> {
  // Support stepping over n branches.
  for (let i = 0; i < opts.numSteps; i++) {
    const currentBranch = currentBranchPrecondition();
    const branch =
      opts.nextOrPrev === "next"
        ? await getNextBranch(currentBranch, opts.interactive)
        : getPrevBranch(currentBranch);

    // Print indented branch names to show traversal.
    if (branch && branch !== currentBranch.name) {
      execSync(`git checkout "${branch}"`, { stdio: "ignore" });
      const indent = opts.nextOrPrev === "next" ? i : opts.numSteps - i - 1;
      logInfo(
        `${"  ".repeat(indent)}↳(${
          i === opts.numSteps - 1 ? chalk.cyan(branch) : branch
        })`
      );
    } else {
      return;
    }
  }
}

export async function switchBranchAction(direction: TraversalDirection, opts: {
	numSteps?: number;
	interactive: boolean;
}): Promise<void> {
	const currentBranch = currentBranchPrecondition();
	let nextBranch;
	switch (direction) {
		case TraversalDirection.Bottom: {
		nextBranch = getBottomBranch(currentBranch);
		break;
		}
		case TraversalDirection.Previous: {
			nextBranch = getPrevBranch(currentBranch);
			break;
		}
		case TraversalDirection.Top: {
			nextBranch = await getTopBranch(currentBranch, opts.interactive);
			break;
		}
		case TraversalDirection.Next: {
			nextBranch = await getNextBranch(currentBranch, opts.interactive, opts.numSteps);
			break;
		}
	}
	if (nextBranch && nextBranch != currentBranch.name) {
		execSync(`git checkout "${nextBranch}"`, {stdio: "ignore"});
		logInfo(`Switched to ${nextBranch}`);
	} else {
		logInfo(`Already at the ${direction} branch in the stack. Exiting.`);
	}
}

export async function bottomBranchAction(): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  const bottomBranch = getBottomBranch(currentBranch);
  if (bottomBranch && bottomBranch != currentBranch.name) {
    execSync(`git checkout "${bottomBranch}"`, { stdio: "ignore" });
    logInfo(`Switched to ${bottomBranch}`);
  } else {
    logInfo("Already at the bottom most branch in the stack. Exiting.");
  }
}

export async function topBranchAction(opts: {
  interactive: boolean;
}): Promise<void> {
  const currentBranch = currentBranchPrecondition();
  const topBranch = await getTopBranch(currentBranch, opts.interactive);
  if (topBranch && topBranch !== currentBranch.name) {
    execSync(`git checkout "${topBranch}"`, { stdio: "ignore" });
    logInfo(`Switched to ${topBranch}`);
  } else {
    logInfo("Already at the top most branch in the stack. Exiting.");
  }
}