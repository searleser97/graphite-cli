import yargs from "yargs";
declare const args: {};
export declare const command = "trunk";
export declare const description = "The trunk branch of the current repo, to use as the base of all stacks.";
export declare const builder: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
