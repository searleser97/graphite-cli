import yargs from "yargs";
declare const args: {
    readonly all: {
        readonly describe: "stage all changes before committing";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "A new message for the commit";
        readonly demandOption: false;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly describe: "Modify the existing commit message";
        readonly demandOption: false;
        readonly default: true;
    };
    readonly verify: {
        readonly describe: "Run commit hooks";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
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
export declare const command = "amend";
export declare const description = "Create a new commit and fix upstack branches.";
export declare const builder: {
    readonly all: {
        readonly describe: "stage all changes before committing";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly message: {
        readonly type: "string";
        readonly alias: "m";
        readonly describe: "A new message for the commit";
        readonly demandOption: false;
    };
    readonly edit: {
        readonly type: "boolean";
        readonly describe: "Modify the existing commit message";
        readonly demandOption: false;
        readonly default: true;
    };
    readonly verify: {
        readonly describe: "Run commit hooks";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
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
