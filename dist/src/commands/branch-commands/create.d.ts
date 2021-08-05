import yargs from "yargs";
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly "commit-message": {
        readonly describe: "commit staged changes on the new branch with this message";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly verify: {
        readonly describe: "Run commit hooks";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "create [name]";
export declare const description = "Creates a new branch stacked off of the current branch and commit staged changes. If no branch name is specified but a commit message is passed, create a branch name from the message.";
export declare const builder: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch";
    };
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly "commit-message": {
        readonly describe: "commit staged changes on the new branch with this message";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
    readonly verify: {
        readonly describe: "Run commit hooks";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
