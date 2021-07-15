import yargs from "yargs";
import { profile } from "../lib/telemetry";

export default abstract class AbstractCommand<
  T extends { [key: string]: yargs.Options }
> {
  abstract _execute(
    argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">
  ): void;

  public async execute(argv: yargs.Arguments<yargs.InferredOptionTypes<T>>) {
    await profile(async () => {
      this._execute(argv);
    });
  }

  public async executeUnprofiled(
    argv: Omit<yargs.Arguments<yargs.InferredOptionTypes<T>>, "$0" | "_">
  ) {
    this._execute(argv);
  }
}
