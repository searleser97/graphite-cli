import yargs from "yargs";
declare const args: {
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The message for the new commit";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
};
export declare const command = "amend";
export declare const description = "Given the current changes, adds it to the current branch (identical to git commit) and restacks anything upstream (see below).";
export declare const builder: {
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "The message for the new commit";
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
export declare const handler: (argv: argsT) => Promise<void>;
export {};
