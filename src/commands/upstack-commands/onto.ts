import yargs from "yargs";
import RestackCommand from "../original-commands/restack";

const args = {
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
  branch: {
    describe: `A branch to restack the current stack onto`,
    demandOption: true,
    optional: false,
    positional: true,
    type: "string",
  },
} as const;

export const command = "onto <branch>";
export const description =
  "Rebase any upstream branches onto the latest commit (HEAD) of the current branch.";
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  await new RestackCommand().execute({
    silent: argv.silent,
    onto: argv.branch,
    _: [""], // filler until we split the restack command
    $0: "", // moar filler
  });
};
