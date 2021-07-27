import yargs from "yargs";
declare const args: {
    readonly trunk: {
        readonly type: "string";
        readonly describe: "The name of your trunk branch that stacks get merged into.";
        readonly required: true;
        readonly alias: "t";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly force: {
        readonly describe: "Don't prompt on each branch to confirm deletion.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch before comparison.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "clean";
export declare const description = "Delete any branches that have been merged or squashed into the trunk branch, and restack their upstack branches recursively.";
export declare const builder: {
    readonly trunk: {
        readonly type: "string";
        readonly describe: "The name of your trunk branch that stacks get merged into.";
        readonly required: true;
        readonly alias: "t";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly force: {
        readonly describe: "Don't prompt on each branch to confirm deletion.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch before comparison.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
