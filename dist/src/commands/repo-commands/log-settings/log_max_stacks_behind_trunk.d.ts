import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max number of stacks (behind trunk) Graphite log will show.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "max-stacks-behind-trunk";
export declare const description = "Graphite will display up to this many stacks that lag behind trunk. e.g. If this is set to 5, Graphite log will only show the first 5 stacks behind trunk.";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "number";
        readonly alias: "s";
        readonly describe: "Override the max number of stacks (behind trunk) Graphite log will show.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
