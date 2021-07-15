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
    const baseBranch = (
      await Branch.getCurrentBranch()
    ).getTrunkBranchFromGit();
    await validateBranch(baseBranch, argv);
    log(`Current stack is valid`, argv);
  }
}

async function validateBranch(branch: Branch, opts: argsT) {
  const metaChildren = await branch.getChildrenFromMeta();
  const gitChildren = branch.getChildrenFromGit();
  const hasGitChildren = gitChildren && gitChildren.length > 0;
  const hasMetaChildren = metaChildren.length > 0;
  if (hasGitChildren && !hasMetaChildren) {
    log(
      chalk.yellow(`${branch.name} missing a child in sd's meta graph`),
      opts
    );
    throw new Error("fail 1");
    // process.exit(1);
  }
  if (!hasGitChildren && hasMetaChildren) {
    log(
      chalk.yellow(`Unable to find children in git history for ${branch.name}`),
      opts
    );
    throw new Error("fail 2");
    // process.exit(1);
  }
  if (!hasGitChildren && !hasMetaChildren) {
    // Assume to be a trunk branch and implicately valid.
    log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, opts);
    return;
  }
  const gitChildrenMissingInMeta = gitChildren!.filter(
    (gitChild) => !metaChildren!.map((b) => b.name).includes(gitChild.name)
  );
  if (gitChildrenMissingInMeta.length > 0) {
    log(
      chalk.yellow(
        `Child branches [${gitChildrenMissingInMeta
          .map((b) => `(${b.name})`)
          .join(", ")}] not found in sd's meta graph.`
      ),
      opts
    );
    throw new Error("fail 3");
    // process.exit(1);
  }
  log(`✅ ${chalk.green(`(${branch.name}) validated`)}`, opts);
  for (const child of metaChildren!) {
    await validateBranch(child, opts);
  }
}
