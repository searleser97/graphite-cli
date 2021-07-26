import yargs from "yargs";

export default yargs.command("log", "Log branch", (): void => {
  console.log("hi");
});
