import yargs from "yargs";
declare const args: {};
export declare const command = "log";
export declare const description = "Log all stacks";
export declare const builder: {};
export declare const aliases: string[];
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
