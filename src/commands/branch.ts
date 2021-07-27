import { Argv } from "yargs";

export const command = "branch <command>";
export const desc = "Branch commands";

export const aliases = ["b"];
export const builder = function (yargs: Argv): Argv {
  return yargs
    .commandDir("branch-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
