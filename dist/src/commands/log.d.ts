import yargs from "yargs";
declare const args: {
    readonly commits: {
        readonly describe: "Show commits in the log output.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "c";
    };
    readonly "on-trunk": {
        readonly describe: "Only show commits on trunk";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "t";
    };
    readonly "behind-trunk": {
        readonly describe: "Only show commits behind trunk";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "b";
    };
};
export declare const command = "log";
export declare const description = "Log all stacks tracked by Graphite.";
export declare const builder: {
    readonly commits: {
        readonly describe: "Show commits in the log output.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "c";
    };
    readonly "on-trunk": {
        readonly describe: "Only show commits on trunk";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "t";
    };
    readonly "behind-trunk": {
        readonly describe: "Only show commits behind trunk";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "b";
    };
};
export declare const aliases: string[];
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
