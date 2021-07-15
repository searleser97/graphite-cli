import chalk from "chalk";
import yargs from "yargs";
import { log } from "../../lib/log";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class ValidateCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    const currentBranch = await Branch.getCurrentBranch();
    validateBranch(currentBranch, argv);
    log(`Current stack is valid`, argv);
  }
}

async function validateBranch(branch: Branch, opts: argsT) {
  const metaParent = branch.getParentFromMeta();
  const gitParents = branch.getParentsFromGit();
  const hasGitParent = gitParents && gitParents.length > 0;
  if (hasGitParent && !metaParent) {
    log(
      chalk.yellow(`${branch.name} missing a parent in sd's meta graph`),
      opts
    );
    process.exit(1);
  }
  if (!hasGitParent && metaParent) {
    log(
      chalk.yellow(
        `Unable to find children in git history for ${branch.name}`,
        opts
      )
    );
    process.exit(1);
  }
  if (!hasGitParent && !metaParent) {
    // Assume to be a trunk branch and implicately valid.
    return;
  }
  const gitParentsMissingInMeta = gitParents!.filter(
    (gitChild) => gitChild.name != metaParent!.name
  );
  if (gitParentsMissingInMeta.length > 0) {
    log(
      chalk.yellow(
        `Parent branches ${gitParentsMissingInMeta} not found in sd's meta graph.`
      ),
      opts
    );
    process.exit(1);
  }
  log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, opts);
  validateBranch(metaParent!, opts);
}
