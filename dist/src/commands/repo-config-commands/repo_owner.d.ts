import yargs from "yargs";
declare const args: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the name.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "owner";
export declare const description = "Graphite's conception of the current repo's owner. e.g. in 'screenplaydev/graphite-cli', this is 'screenplaydev'.";
export declare const builder: {
    readonly set: {
        readonly demandOption: false;
        readonly default: false;
        readonly type: "string";
        readonly alias: "s";
        readonly describe: "Override the value of the repo owner's name in the Graphite config. This is expected to match the name of the repo owner on GitHub and should only be set in cases where Graphite is incorrectly inferring the name.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
