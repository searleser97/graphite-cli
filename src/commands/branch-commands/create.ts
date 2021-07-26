import yargs from "yargs";
import DiffCommand from "../original-commands/diff";

const args = {
  branch: {
    type: "string",
    postitional: true,
    demand: true,
    describe: "The name of the new branch",
  },
  message: {
    type: "string",
    alias: "m",
    describe: "The message for the new commit",
  },
  silent: {
    describe: `silence output from the command`,
    demandOption: false,
    default: false,
    type: "boolean",
    alias: "s",
  },
} as const;

export const command = "create <branch>";
export const description =
  "Takes the current changes and creates a new branch off of whatever branch you were previously working on.";
export const builder = args;
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export const handler = async (argv: argsT): Promise<void> => {
  await new DiffCommand().execute({
    silent: argv.silent,
    "branch-name": argv.branch,
    message: argv.message,
    _: [""], // filler until we split the restack command
    $0: "", // moar filler
  });
};
