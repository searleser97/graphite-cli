import yargs from "yargs";

export const command = "downstack <command>";
export const desc =
  "Commands that operate upstack (inclusive) from your current branch";
export const aliases = ["ds"];
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir("downstack-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
