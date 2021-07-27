import yargs from "yargs";
import RestackCommand from "../original-commands/restack";

export const command = "fix";
export const description =
  "Rebase any upstream branches onto the latest commit (HEAD) of the current branch.";
export const builder = RestackCommand.args;
type argsT = yargs.Arguments<
  yargs.InferredOptionTypes<typeof RestackCommand.args>
>;
export const handler = async (argv: argsT): Promise<void> => {
  await new RestackCommand().execute(argv);
};
