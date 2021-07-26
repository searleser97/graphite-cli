import yargs from "yargs";

export const command = "stack <command>";
export const desc = "Stack commands";
export const builder = function (yargs: yargs.Argv): yargs.Argv {
  return yargs.commandDir("stack-commands", {
    extensions: ["js"],
  });
};
