import yargs from "yargs";
declare const args: {
    readonly name: {
        readonly type: "string";
        readonly positional: true;
        readonly demandOption: false;
        readonly optional: true;
        readonly describe: "The name of the new branch";
    };
    readonly "commit-message": {
        readonly describe: "commit staged changes on the new branch with this message";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: string[];
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
    readonly "commit-message": {
        readonly describe: "commit staged changes on the new branch with this message";
        readonly demandOption: false;
        readonly type: "string";
        readonly alias: "m";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
