import yargs from "yargs";
import AmendCommand from "../original-commands/amend";

export const command = "amend";
export const description =
  "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).";
export const builder = AmendCommand.args;
type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof AmendCommand.args>
>;
export const handler = async (argv: argsT): Promise<void> => {
  await new AmendCommand().execute(argv);
};
