import yargs from "yargs";
declare const args: {
    readonly all: {
        readonly describe: "Show all branches";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly interactive: {
        readonly describe: "Interactively checkout a different stacked branch";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "stacks";
export declare const description = "Print stacks";
export declare const builder: {
    readonly all: {
        readonly describe: "Show all branches";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "a";
    };
    readonly interactive: {
        readonly describe: "Interactively checkout a different stacked branch";
        readonly demandOption: false;
        readonly default: true;
        readonly type: "boolean";
        readonly alias: "i";
    };
};
export declare const handler: (args: argsT) => Promise<void>;
export {};
