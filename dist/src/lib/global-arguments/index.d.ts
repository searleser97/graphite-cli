import yargs from "yargs";
declare const globalArgumentsOptions: {
    readonly quiet: {
        readonly alias: "q";
        readonly default: false;
        readonly type: "boolean";
        readonly demandOption: false;
    };
    readonly verify: {
        readonly default: true;
        readonly type: "boolean";
        readonly demandOption: false;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof globalArgumentsOptions>>;
declare function processGlobalArgumentsMiddleware(argv: argsT): void;
declare const globalArgs: {
    quiet: boolean;
    noVerify: boolean;
};
export { globalArgumentsOptions, processGlobalArgumentsMiddleware, globalArgs };
