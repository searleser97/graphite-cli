import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "The auth token for the current session";
        readonly demandOption: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class AuthCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly token: {
            readonly type: "string";
            readonly alias: "t";
            readonly describe: "The auth token for the current session";
            readonly demandOption: true;
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export {};
