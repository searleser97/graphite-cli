import yargs from "yargs";
export declare const command = "fix";
export declare const description = "Rebase any upstream branches onto the latest commit (HEAD) of the current branch.";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly onto: {
        readonly describe: "A branch to restack the current stack onto";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const builder: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly onto: {
        readonly describe: "A branch to restack the current stack onto";
        readonly demandOption: false;
        readonly optional: true;
        readonly type: "string";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
