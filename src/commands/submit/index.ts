import chalk from "chalk";
import yargs from "yargs";
import { gpExecSync, logInternalErrorAndExit } from "../../lib/utils";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";
import PrintStacksCommand from "../print-stacks";
import ValidateCommand from "../validate";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  "from-commits": {
    describe: "The name of the target which builds your app for release",
    demandOption: false,
    type: "boolean",
    default: false,
  },
  fill: {
    describe: "Do not prompt for title/body and just use commit info",
    demandOption: false,
    type: "boolean",
    default: false,
    alias: "f",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class SubmitCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    gpExecSync(
      {
        command: `gh --version`,
      },
      (_) => {
        console.log(chalk.red(`Could not find bash tool 'gh', please install`));
        process.exit(1);
      }
    );

    gpExecSync(
      {
        command: `gh auth status`,
      },
      (_) => {
        console.log(
          chalk.red(
            `"gh auth status" indicates that you are not currently authed to GitHub`
          )
        );
        process.exit(1);
      }
    );

    try {
      await new ValidateCommand().executeUnprofiled({ silent: true });
    } catch {
      await new PrintStacksCommand().executeUnprofiled(argv);
      throw new Error(`Validation failed before submitting.`);
    }

    let currentBranch: Branch | undefined | null = Branch.getCurrentBranch();

    const stackOfBranches: Branch[] = [];
    while (
      currentBranch != null &&
      currentBranch != undefined &&
      currentBranch.getParentFromMeta() != undefined // dont put up pr for a base branch like "main"
    ) {
      stackOfBranches.push(currentBranch);
      const parentBranchName: string | undefined =
        currentBranch.getParentFromMeta()?.name;
      if (parentBranchName) {
        currentBranch = await Branch.branchWithName(parentBranchName);
      } else {
        currentBranch = undefined;
      }
    }

    // Create PR's for oldest branches first.
    stackOfBranches.reverse();

    stackOfBranches.forEach((branch, i) => {
      const parentBranch: undefined | Branch =
        i > 0 ? stackOfBranches[i - 1] : undefined;
      gpExecSync(
        {
          command: [
            `gh pr create`,
            `--head ${branch.name}`,
            ...(parentBranch ? [`--base ${parentBranch.name}`] : []),
            ...(argv.fill ? [`-f`] : []),
          ].join(" "),
          options: { stdio: "inherit" },
        },
        (_) => {
          logInternalErrorAndExit(
            `Failed to submit changes for ${branch.name}. Aborting...`
          );
        }
      );
    });
  }
}
