import yargs from "yargs";

export const command = "upstack <command>";
export const desc =
  "Commands that operate upstack (inclusive) from your current branch";
export const aliases = ["us"];
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs
    .commandDir("upstack-commands", {
      extensions: ["js"],
    })
    .strict()
    .demandCommand();
};
