import graphiteCLIRoutes from "@screenplaydev/graphite-cli-routes";
import * as t from "@screenplaydev/retype";
import yargs from "yargs";
import AbstractCommand from "../../../lib/abstract_command";
import Branch from "../../../wrapper-classes/branch";
declare const args: {
    readonly silent: {
        readonly describe: "silence output from the command";
        readonly demandOption: false;
        readonly default: false;
        readonly type: "boolean";
        readonly alias: "s";
    };
    readonly "from-commits": {
        readonly describe: "The name of the target which builds your app for release";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
    };
    readonly fill: {
        readonly describe: "Do not prompt for title/body and just use commit info";
        readonly demandOption: false;
        readonly type: "boolean";
        readonly default: false;
        readonly alias: "f";
    };
};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
declare type TSubmittedPRInfo = t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>;
export default class SubmitCommand extends AbstractCommand<typeof args> {
    static args: {
        readonly silent: {
            readonly describe: "silence output from the command";
            readonly demandOption: false;
            readonly default: false;
            readonly type: "boolean";
            readonly alias: "s";
        };
        readonly "from-commits": {
            readonly describe: "The name of the target which builds your app for release";
            readonly demandOption: false;
            readonly type: "boolean";
            readonly default: false;
        };
        readonly fill: {
            readonly describe: "Do not prompt for title/body and just use commit info";
            readonly demandOption: false;
            readonly type: "boolean";
            readonly default: false;
            readonly alias: "f";
        };
    };
    _execute(argv: argsT): Promise<void>;
    getCLIAuthToken(): string;
    getRepoNameAndOwner(): {
        repoName: string;
        repoOwner: string;
    };
    getDownstackInclusive(topOfStack: Branch): Promise<Branch[]>;
    pushBranchesToRemote(branches: Branch[]): void;
    submitPRsForBranches(args: {
        branches: Branch[];
        cliAuthToken: string;
        repoOwner: string;
        repoName: string;
    }): Promise<TSubmittedPRInfo | null>;
    printSubmittedPRInfo(prs: t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>["prs"]): void;
    saveBranchPRInfo(prs: t.UnwrapSchemaMap<typeof graphiteCLIRoutes.submitPullRequests.response>["prs"]): void;
    assertUnreachable(arg: never): void;
}
export {};
