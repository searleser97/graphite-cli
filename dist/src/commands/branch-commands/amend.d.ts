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
export declare const description = "Commit staged changes and fix upstack branches.";
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
