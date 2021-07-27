import yargs from "yargs";
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
export declare const command = "prev";
export declare const aliases: string[];
export declare const description = "If you're in a stack: Branch A \u2192 Branch B (you are here) \u2192 Branch C. Takes you to the previous branch (Branch A). If there are two parent branches, errors out and tells you the various branches you could go to.";
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
