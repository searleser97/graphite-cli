import yargs from "yargs";
import SubmitCommand from "../original-commands/submit";
export declare const command = "submit";
export declare const description = "Experimental: Create PR's for each branch in the current stack";
export declare const builder: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly "from-commits": {
        readonly describe: "The name of the target which builds your app for release";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
    };
    readonly fill: {
        readonly describe: "Do not prompt for title/body and just use commit info";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof SubmitCommand.args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
