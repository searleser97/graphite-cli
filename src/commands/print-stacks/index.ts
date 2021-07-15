import chalk from "chalk";
import { execSync } from "child_process";
import yargs from "yargs";
import Branch from "../../wrapper-classes/branch";
import AbstractCommand from "../abstract_command";

const args = {} as const;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class PrintStacksCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT) {
    const dag: { [name: string]: string[] } = {};

    const allBranches = await Branch.getAllBranches();
    for (const branch of allBranches) {
      const children = branch.getChildrenFromGit();
      dag[branch.name] = children ? children.map((c) => c.name) : [];
    }

    const currentBranch = await Branch.getCurrentBranch();
    if (currentBranch) {
      console.log(chalk.green(`Current branch: ${currentBranch.name}`));
    }
    dfsPrintBranches({
      currentBranchName: currentBranch.name,
      branchName: currentBranch.getTrunkBranchFromGit().name,
      dag,
      depthIndents: [],
    });
  }
}

function dfsPrintBranches(args: {
  currentBranchName: string;
  branchName: string;
  parentName?: string;
  dag: { [name: string]: string[] };
  depthIndents: number[];
}) {
  const numCommitsSinceParent: number = args.parentName
    ? +execSync(
        `git log --oneline ${args.branchName} ^${args.parentName} | wc -l`
      )
        .toString()
        .trim()
    : 0;
  const numCommitsSinceChild: number = args.parentName
    ? +execSync(
        `git log --oneline ${args.parentName} ^${args.branchName} | wc -l`
      )
        .toString()
        .trim()
    : 0;
  console.log(
    `${args.depthIndents
      .map((length, i) => `${" ".repeat(length)}|`)
      .join("")}${
      numCommitsSinceChild > 0
        ? `[${chalk.red("*".repeat(numCommitsSinceChild))}]`
        : ""
    }->(${
      args.currentBranchName == args.branchName
        ? chalk.green(args.branchName)
        : args.branchName
    })${
      numCommitsSinceParent > 0 ? `[${"*".repeat(numCommitsSinceParent)}]` : ""
    }`
  );
  if (!args.dag[args.branchName]) {
    return;
  }
  args.dag[args.branchName].forEach((childName) =>
    dfsPrintBranches({
      parentName: args.branchName,
      currentBranchName: args.currentBranchName,
      branchName: childName,
      dag: args.dag,
      depthIndents: [
        ...args.depthIndents,
        numCommitsSinceParent +
          args.branchName.length -
          1 +
          (numCommitsSinceParent > 0 ? 2 : 0) +
          4,
      ],
    })
  );
  console.log(
    `${args.depthIndents.map((length, i) => `${" ".repeat(length)}|`).join("")}`
  );
}
