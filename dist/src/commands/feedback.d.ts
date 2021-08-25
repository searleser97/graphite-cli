import yargs from "yargs";
declare const args: {
    readonly message: {
        readonly type: "string";
        readonly postitional: true;
        readonly describe: "Postive or constructive feedback for the Graphite team! Jokes are chill too.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export declare const command = "feedback <message>";
export declare const description = "Post a string directly to the maintainers' Slack where they can factor in your feedback, laugh at your jokes, cry at your insults, or test the bounds of Slack injection attacks.";
export declare const builder: {
    readonly message: {
        readonly type: "string";
        readonly postitional: true;
        readonly describe: "Postive or constructive feedback for the Graphite team! Jokes are chill too.";
    };
};
export declare const handler: (argv: argsT) => Promise<void>;
export {};
