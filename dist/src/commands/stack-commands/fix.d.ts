import yargs from "yargs";
export declare const command = "fix";
export declare const description = "Fix stack by recursively rebasing branches onto their parents, or by regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.";
declare const args: {
    readonly rebase: {
        readonly describe: "Fix stack by recursively rebasing branches onto their parents as defined by Graphite stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly regen: {
        readonly describe: "Regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const builder: {
    readonly rebase: {
        readonly describe: "Fix stack by recursively rebasing branches onto their parents as defined by Graphite stack metadata.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
    readonly regen: {
        readonly describe: "Regenerate Graphite stack metadata by walking the Git commit tree and finding branch parents.";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
    };
};
export declare const aliases: string[];
export declare const handler: (argv: argsT) => Promise<void>;
export {};
