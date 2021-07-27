import yargs from "yargs";
import AbstractCommand from "../../lib/abstract_command";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
declare const _default: yargs.Argv<{}>;
export default _default;
export declare class LogStackCommand extends AbstractCommand<typeof args> {
    static args: {};
    _execute(argv: argsT): Promise<void>;
}
