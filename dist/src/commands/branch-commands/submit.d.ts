import yargs from "yargs";
export declare const command = "submit";
export declare const description = "Idempotently force push the current branch to GitHub, creating or updating a pull request.";
declare const args: {
    readonly draft: {
        readonly describe: "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.";
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly edit: {
        readonly describe: "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.";
        readonly type: "boolean";
        readonly default: true;
        readonly alias: "e";
    };
};
export declare const builder: {
    readonly draft: {
        readonly describe: "Creates new PRs in draft mode. If --no-interactive is true, this is automatically set to true.";
        readonly type: "boolean";
        readonly alias: "d";
    };
    readonly edit: {
        readonly describe: "Edit PR fields inline. If --no-interactive is true, this is automatically set to false.";
        readonly type: "boolean";
        readonly default: true;
        readonly alias: "e";
    };
};
export declare const aliases: string[];
export declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const handler: (argv: argsT) => Promise<void>;
export {};
