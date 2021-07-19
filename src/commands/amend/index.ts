import { execSync } from "child_process";
import yargs from "yargs";
import AbstractCommand from "../abstract_command";
import RestackCommand from "../restack";

const args = {
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
type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class AmendCommand extends AbstractCommand<typeof args> {
  static args = args;
  public async _execute(argv: argsT): Promise<void> {
    execSync("git add --all");
    execSync(`git commit -m "${argv.message || "Updates"}"`);
    await new RestackCommand().executeUnprofiled(args);
  }
}
