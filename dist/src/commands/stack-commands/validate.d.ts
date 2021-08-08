import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "validate";
export declare const description = "Validates that the current stack matches git's chain of branches.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
