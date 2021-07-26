import { Argv } from "yargs";

export const command = "branch <command>";
export const desc = "Branch commands";
export const builder = function (yargs: Argv): Argv {
  return yargs.commandDir("branch-commands", {
    extensions: ["js"],
  });
};
