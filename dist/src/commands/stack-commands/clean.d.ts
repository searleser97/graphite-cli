import yargs from "yargs";
declare const args: {
    readonly force: {
        readonly describe: "Don't prompt you to confirm when a branch will be deleted.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote before searching for stale branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "clean";
export declare const description = "Delete any branches that have been merged or squashed into the trunk branch, and fix their upstack branches recursively.";
export declare const builder: {
    readonly force: {
        readonly describe: "Don't prompt you to confirm when a branch will be deleted.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "f";
    };
    readonly pull: {
        readonly describe: "Pull the trunk branch from remote before searching for stale branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "p";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
