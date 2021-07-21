import yargs from "yargs";
import AbstractCommand from "../abstract_command";
declare const args: {
    readonly "dry-run": {
        readonly type: "boolean";
        readonly default: false;
        readonly describe: "List branches that would be deleted";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class SyncCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly "dry-run": {
            readonly type: "boolean";
            readonly default: false;
            readonly describe: "List branches that would be deleted";
        };
        readonly silent: {
            readonly describe: "silence output from the command";
            readonly demandOption: false;
            readonly default: false;
            readonly type: "boolean";
            readonly alias: "s";
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export {};
