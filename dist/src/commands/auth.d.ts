import yargs from "yargs";
declare const args: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "The auth token for the current session";
        readonly demandOption: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "auth";
export declare const description = "Authenticate current Graphite CLI";
export declare const builder: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "The auth token for the current session";
        readonly demandOption: true;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
