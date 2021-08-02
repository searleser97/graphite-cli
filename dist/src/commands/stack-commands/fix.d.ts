import yargs from "yargs";
export declare const command = "fix";
export declare const description = "Rebase any upstack branches onto the latest commit (HEAD) of the current branch.";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
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
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
