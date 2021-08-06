import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly type: "string";
        readonly describe: "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.";
        readonly required: false;
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
export declare const command = "parent";
export declare const description = "Show the parent of your current branch, as recorded in Graphite's stacks. Parent information is stored under `.git/refs/branch-metadata`.";
export declare const builder: {
    readonly set: {
        readonly type: "string";
        readonly describe: "Manually set the stack parent of the current branch. This operation only modifies Graphite metadata and does not rebase any branches.";
        readonly required: false;
    };
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
