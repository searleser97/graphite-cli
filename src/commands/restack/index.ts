import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import { log } from "../../lib/log";
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
} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class RestackCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    log(`Before restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));

    const curBranch = await Branch.getCurrentBranch();
    await restackBranch(curBranch, argv);

    log(`After restack:`, argv);
    !argv.silent && (await new PrintStacksCommand().executeUnprofiled(args));
  }
}

export async function restackBranch(currentBranch: Branch, opts: argsT) {
  try {
    await new ValidateCommand().executeUnprofiled({ silent: true });
  } catch (err) {
    log(
      chalk.yellow(
        `Cannot restack, the current graph of git branches does not match sd's meta dag. Please rebase your git branches or call "sd fix" to regenerate sd's meta dag.`
      ),
      opts
    );
    process.exit(1);
  }
  const childBranches = await currentBranch.getChildrenFromMeta();
  if (!childBranches) {
    log(chalk.yellow(`Cannot restack, found no child branches`), opts);
    process.exit(1);
  }
  for (const childBranch of childBranches) {
    execSync(`git checkout ${childBranch.name}`, { stdio: "ignore" });
    execSync(
      `git rebase --onto ${currentBranch.name} $(git merge-base ${childBranch.name} ${currentBranch.name}) -Xtheirs`,
      { stdio: "ignore" }
    );
    await restackBranch(childBranch, opts);
  }
  execSync(`git checkout ${currentBranch.name}`, { stdio: "ignore" });
}
