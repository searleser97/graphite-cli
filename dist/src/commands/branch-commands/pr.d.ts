import yargs from "yargs";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const aliases: never[];
export declare const command = "sync";
export declare const description = "Fetch GitHub PR information for the current branch.";
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
