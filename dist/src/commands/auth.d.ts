import yargs from "yargs";
declare const args: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "Auth token";
        readonly demandOption: true;
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "auth";
export declare const description = "Associates an auth token with your Graphite CLI. This token is used to associate your CLI with your account, allowing us to create and update your PRs on GitHub, for example. To obtain your CLI token, visit https://app.graphite.com/activate.";
export declare const builder: {
    readonly token: {
        readonly type: "string";
        readonly alias: "t";
        readonly describe: "Auth token";
        readonly demandOption: true;
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
