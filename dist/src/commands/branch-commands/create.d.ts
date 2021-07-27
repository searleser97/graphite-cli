import yargs from "yargs";
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the target which builds your app for release";
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
export declare const description = "Takes the current changes and creates a new branch off of whatever branch you were previously working on.";
export declare const builder: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the target which builds your app for release";
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
