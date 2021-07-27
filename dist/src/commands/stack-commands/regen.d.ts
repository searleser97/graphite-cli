import yargs from "yargs";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "regen";
export declare const description = "Trace the current branch through its parents, down to the base branch. Establish dependencies between each branch for later traversal and fixing.";
export declare const builder: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
