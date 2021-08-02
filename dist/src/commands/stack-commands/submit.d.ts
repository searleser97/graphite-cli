import yargs from "yargs";
export declare const command = "submit";
export declare const description = "Experimental: Idempotently force pushes all branches in stack and creates/updates PR's for each.";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
