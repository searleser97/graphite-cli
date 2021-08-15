import yargs from "yargs";
declare const args: {
    readonly all: {
        readonly describe: "Show all branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly interactive: {
        readonly describe: "Whether or not to show the interactive branch picker (set to false when using `gp stacks` as part of a shell script).";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "stacks";
export declare const description = "Print stacks.";
export declare const builder: {
    readonly all: {
        readonly describe: "Show all branches.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly interactive: {
        readonly describe: "Whether or not to show the interactive branch picker (set to false when using `gp stacks` as part of a shell script).";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
export declare const handler: (args: argsT) => Promise<void>;
export {};
