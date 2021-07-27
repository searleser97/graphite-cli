import yargs from "yargs";
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch";
    };
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
export declare const command = "create [name]";
export declare const description = "Creates a new branch stacked off of the current branch and commit staged changes.";
export declare const builder: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch";
    };
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
export declare const handler: (argv: argsT) => Promise<void>;
export {};
