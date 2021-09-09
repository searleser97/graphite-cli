import yargs from "yargs";
import { currentBranchPrecondition } from "../../lib/preconditions";
import { syncPRInfoForBranches } from "../../lib/sync/pr_info";
import { profile } from "../../lib/telemetry";
import { getTrunk } from "../../lib/utils";

const args = {
  "pr-number": {
    type: "number",
    positional: true,
    demandOption: true,
    describe: "The PR number associated with the current branch.",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;

export const aliases = [];
export const command = "set-pr [pr-number]";
export const description =
  "Associate the current branch with the provided GitHub PR number for the current repo.";
export const builder = args;
export const handler = async (argv: argsT): Promise<void> => {
  return profile(argv, async () => {
    const branch = currentBranchPrecondition();

    // All branches associated with PRs must have a base; if there is no base
    // detected, we automatically defer to trunk.
    const base = branch.getParentFromMeta()?.name ?? getTrunk().name;

    branch.setPRInfo({
      number: argv["pr-number"],
      base: base,
    });

    await syncPRInfoForBranches([branch]);
  });
};
