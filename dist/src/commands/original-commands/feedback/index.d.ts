import yargs from "yargs";
import AbstractCommand from "../../../lib/abstract_command";
declare const args: {
    readonly message: {
        readonly type: "string";
        readonly postitional: true;
        readonly describe: "Postive or constructive. Jokes are chill too.";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class FeedbackCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly message: {
            readonly type: "string";
            readonly postitional: true;
            readonly describe: "Postive or constructive. Jokes are chill too.";
        };
    };
    _execute(argv: argsT): Promise<void>;
}
export {};
