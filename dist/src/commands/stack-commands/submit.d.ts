import yargs from "yargs";
export declare const command = "submit";
export declare const description = "Idempotently force push all branches in the current stack to GitHub, creating or updating distinct pull requests for each.";
/**
 * Primary interaction patterns:
 *
 * # (default) allows user to edit PR fields inline and then submits stack as a draft
 * gt stack submit
 *
 * # skips editing PR fields inline, submits stack as a draft
 * gt stack submit --no-edit
 *
 * # allows user to edit PR fields inline, then publishes
 * gt stack submit --no-draft
 *
 * # same as gt stack submit --no-edit
 * gt stack submit --no-interactive
 *
 */
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
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
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
export declare const handler: (argv: argsT) => Promise<void>;
export {};
