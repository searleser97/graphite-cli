import yargs from "yargs";
export declare const command = "submit";
export declare const description = "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const builder: {};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
