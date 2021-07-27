import yargs from "yargs";

export const command = "upstack <command>";
export const desc =
  "Commands that operate upstack (inclusive) from your current branch";
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir("downstack-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
