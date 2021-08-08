import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "children";
export declare const description = "Show the children of your current branch, as recorded in Graphite's stacks.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
